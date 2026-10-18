import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AccountError,
  AccountProfile,
  LoginCredentials,
  LoginResponse,
  SignupCredentials,
  getAccountProfile,
  loginAccount,
  signupAccount,
} from "@/lib/account";

import { finishGitHub, githubCallbackPath } from "@/lib/github-oauth";

interface AuthContextType {
  user: AccountProfile | null;
  signup: (data: SignupCredentials) => Promise<void>;
  login: (data: LoginCredentials) => Promise<void>;
  completeGitHub: () => Promise<void>;
  logout: () => void;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationKey = useRef(location.key);
  locationKey.current = location.key;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(
    () => !!localStorage.getItem("token") && !!localStorage.getItem("user_id")
  );
  const refreshController = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const hasSession = useRef(false);

  const clearSession = useCallback(
    (forgetStored = true) => {
      generation.current += 1;
      refreshController.current?.abort();
      setUser(null);
      hasSession.current = false;
      setIsLoading(false);
      if (forgetStored) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
      }
      queryClient.clear();
    },
    [queryClient]
  );

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    if (!token || !userId) {
      setIsLoading(false);
      return;
    }
    refreshController.current?.abort();
    const controller = new AbortController();
    refreshController.current = controller;
    const currentGeneration = generation.current;
    if (!hasSession.current) setIsLoading(true);
    try {
      const profile = await getAccountProfile(token, controller.signal);
      if (
        controller.signal.aborted ||
        generation.current !== currentGeneration ||
        localStorage.getItem("token") !== token ||
        localStorage.getItem("user_id") !== userId
      )
        return;
      setUser(profile);
      hasSession.current = true;
    } catch (error) {
      if (
        controller.signal.aborted ||
        generation.current !== currentGeneration ||
        localStorage.getItem("token") !== token ||
        localStorage.getItem("user_id") !== userId
      )
        return;
      if (error instanceof AccountError && [401, 403, 404].includes(error.status)) {
        clearSession();
        // Leave public email links usable even if a stored JWT has expired or was revoked.
        if (
          !["/verify-email", "/forgot-password", "/reset-password", githubCallbackPath].includes(
            window.location.pathname.replace(/\/$/, "")
          )
        ) {
          if (error.code === "email_verification_required")
            navigateRef.current("/verify-email", { replace: true });
          else navigateRef.current("/sign-in", { replace: true });
          toast.error(error.message);
        }
      } else {
        toast.error("Couldn’t load your session. Check your connection or sign in again.");
      }
    } finally {
      if (!controller.signal.aborted && generation.current === currentGeneration)
        setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    // The callback validates its initiating session itself; expired-JWT bootstrap must not erase it.
    if (window.location.pathname !== githubCallbackPath) void refreshUser();
    else setIsLoading(false);
    return () => refreshController.current?.abort();
  }, [refreshUser]);

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== null && event.key !== "token" && event.key !== "user_id") return;
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("user_id");
      const publicPage = [
        githubCallbackPath,
        "/verify-email",
        "/forgot-password",
        "/reset-password",
        "/sign-in",
        "/sign-up",
        "/",
      ].includes(window.location.pathname);
      if (!token || !id) {
        // A token/user-id pair may still be changing in the other tab.
        // Clear local state without deleting that tab’s newly written credentials.
        clearSession(false);
        if (!publicPage) navigateRef.current("/sign-in", { replace: true });
      } else {
        generation.current += 1;
        refreshController.current?.abort();
        hasSession.current = false;
        setUser(null);
        queryClient.clear();
        if (window.location.pathname !== githubCallbackPath) void refreshUser();
        else setIsLoading(false);
        if (!publicPage) navigateRef.current(`/dashboard/${id}`, { replace: true });
      }
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [clearSession, queryClient, refreshUser]);

  const signup = async (data: SignupCredentials) => {
    const currentGeneration = ++generation.current;
    setIsLoading(true);
    try {
      const result = await signupAccount(data);
      if (generation.current !== currentGeneration) return;
      clearSession();
      if (result.verification_required) {
        navigate("/verify-email", {
          state: { email: data.email, delivery: result.verification_delivery },
        });
      } else {
        toast.success("Account created. Sign in to continue.");
        navigate("/sign-in");
      }
    } catch (error) {
      if (generation.current !== currentGeneration) return;
      toast.error(
        error instanceof AccountError
          ? error.message
          : "Couldn’t create your account. Please try again."
      );
    } finally {
      if (generation.current === currentGeneration) setIsLoading(false);
    }
  };

  const establishSession = useCallback(
    (result: LoginResponse) => {
      if (result.user.verification_required && !result.user.email_verified)
        throw new AccountError(
          "Verify your email before signing in.",
          403,
          "email_verification_required"
        );
      clearSession();
      localStorage.setItem("token", result.token);
      localStorage.setItem("user_id", result.user.userId);
      setUser(result.user);
      hasSession.current = true;
      toast.success("Signed in successfully.");
      navigate(`/dashboard/${result.user.userId}`);
      // Login intentionally omits platform membership; load it from the profile endpoint.
      void refreshUser();
    },
    [clearSession, navigate, refreshUser]
  );

  const completeGitHub = async () => {
    const currentGeneration = ++generation.current;
    const routeKey = locationKey.current;
    refreshController.current?.abort();
    try {
      const result = await finishGitHub();
      if (
        generation.current !== currentGeneration ||
        locationKey.current !== routeKey ||
        window.location.pathname !== githubCallbackPath ||
        !result.isCurrentSession()
      )
        throw new AccountError("Your session or page changed. Start GitHub sign-in again.");
      if (result.mode === "link") {
        clearSession();
        navigate("/sign-in", { replace: true });
        toast.success("GitHub connected. Sign in again to continue.");
      } else establishSession(result.login);
    } finally {
      if (generation.current === currentGeneration) setIsLoading(false);
    }
  };

  const login = async (data: LoginCredentials) => {
    const currentGeneration = ++generation.current;
    setIsLoading(true);
    try {
      const result = await loginAccount(data);
      if (generation.current !== currentGeneration) return;
      establishSession(result);
    } catch (error) {
      if (generation.current !== currentGeneration) return;
      if (error instanceof AccountError && error.code === "email_verification_required") {
        clearSession();
        navigate("/verify-email", { state: { email: data.email } });
      } else {
        toast.error(
          error instanceof AccountError ? error.message : "Couldn’t sign in. Please try again."
        );
      }
    } finally {
      if (generation.current === currentGeneration) setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        completeGitHub,
        logout,
        clearSession,
        refreshUser,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

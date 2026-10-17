import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AccountError,
  AccountProfile,
  LoginCredentials,
  SignupCredentials,
  getAccountProfile,
  loginAccount,
  signupAccount,
} from "@/lib/account";

interface AuthContextType {
  user: AccountProfile | null;
  signup: (data: SignupCredentials) => Promise<void>;
  login: (data: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
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

  const clearSession = useCallback(() => {
    generation.current += 1;
    refreshController.current?.abort();
    setUser(null);
    hasSession.current = false;
    setIsLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !localStorage.getItem("user_id")) {
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
      if (controller.signal.aborted || generation.current !== currentGeneration) return;
      setUser(profile);
      hasSession.current = true;
    } catch (error) {
      if (controller.signal.aborted || generation.current !== currentGeneration) return;
      if (error instanceof AccountError && [401, 403, 404].includes(error.status)) {
        clearSession();
        // Leave public email links usable even if a stored JWT has expired or was revoked.
        if (!window.location.pathname.startsWith("/verify-email")) {
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
    void refreshUser();
    return () => refreshController.current?.abort();
  }, [refreshUser]);

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== null && event.key !== "token" && event.key !== "user_id") return;
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("user_id");
      const publicPage = ["/verify-email", "/sign-in", "/sign-up", "/"].includes(
        window.location.pathname
      );
      if (!token || !id) {
        clearSession();
        if (!publicPage) navigateRef.current("/sign-in", { replace: true });
      } else {
        generation.current += 1;
        refreshController.current?.abort();
        hasSession.current = false;
        setUser(null);
        queryClient.clear();
        void refreshUser();
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

  const login = async (data: LoginCredentials) => {
    const currentGeneration = ++generation.current;
    setIsLoading(true);
    try {
      const result = await loginAccount(data);
      if (generation.current !== currentGeneration) return;
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

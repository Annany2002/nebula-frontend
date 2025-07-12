import { url } from "@/App";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Route constants (optional but recommended)
const ROUTES = {
  SIGN_IN: "/sign-in",
  HOME: "/",
  DASHBOARD: (userId: string) => `/dashboard/${userId}`,
};

// Define the shape of the user object
interface User {
  email: string;
  password: string;
  username?: string;
  userId?: string;
  created_at?: string;
}

// Define the shape of the AuthContext value
interface AuthContextType {
  user: User | null;
  signup: (userData: User) => void;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");

    if (!token || !user_id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${url}/api/v1/user/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          toast.error("Session expired, please log in.");
        } else {
          const errorData = await response.json();
          toast.error(
            errorData.error || "Invalid user id or token, please login again"
          );
        }
        navigate(ROUTES.HOME);
        return;
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      toast.error("Invalid user id or token, please login again");
      navigate(ROUTES.SIGN_IN);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [navigate]);

  const signup = async (userData: User) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${url}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to sign up. Please try again.");
        return;
      }

      const result = await response.json();
      localStorage.setItem("user_id", result.user_id);
      toast.success(result.message);
      navigate(ROUTES.SIGN_IN);
    } catch (error) {
      toast.error("Failed to sign up. Please try again.");
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to sign in. Please try again.");
        return;
      }

      const result = await response.json();
      localStorage.setItem("token", result.token);
      localStorage.setItem("user_id", result.user.userId);
      setUser(result.user);
      toast.success(result.message);
      navigate(ROUTES.DASHBOARD(result.user.userId));
    } catch (error) {
      toast.error("Failed to sign in. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate(ROUTES.HOME);
  };

  const value: AuthContextType = {
    user,
    signup,
    login,
    logout,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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
  isLoading: boolean;
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// const api_url = import.meta.env.VITE_BACKEND_URL
// console.log(api_url)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>();
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token") || "";
  const user_id = localStorage.getItem("user_id") || "";

  useEffect(() => {
    const getUserById = async () => {
      if (!user_id || !token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${url}/api/v1/user/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            navigate("/");
            toast.error("Session expired, please log in.");
          } else {
            const errorData = await response.json();
            toast.error(errorData.error || "Failed to fetch user.");
          }
          return;
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        toast.error("Failed to fetch user.");
      } finally {
        setIsLoading(false);
      }
    };
    getUserById();
  }, [user_id, token, navigate]);

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
      toast.success(`${result.message}`);
      navigate("/sign-in");
    } catch (error) {
      toast.error("Failed to sign up. Please try again.");
      console.log("Sign up error:", error);
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
      const result = await response.json();
      localStorage.setItem("token", result.token);
      localStorage.setItem("user_id", result.user.userId);
      toast.success(result.message);
      setUser(result.user);
      navigate(`/dashboard/${result.user.userId}`);
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
    navigate("/");
  };

  const value = { user, signup, login, logout, isLoading };

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

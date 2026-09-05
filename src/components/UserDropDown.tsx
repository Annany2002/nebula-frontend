import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserDropDown() {
  const { user, isLoading, logout } = useAuth();
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (user && user.username) {
      setInitials(user.username.substring(0, 2).toLocaleUpperCase());
    } else {
      setInitials(""); // Handle cases where user or username is undefined
    }
  }, [user]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-8 w-8 rounded-full border border-purple-200/50 dark:border-white/10 bg-purple-500/10 dark:bg-white/5 hover:bg-purple-500/20 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer text-purple-600 dark:text-purple-300 font-semibold text-xs transition-colors"
        >
          {isLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : initials ? initials : "?"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl border border-purple-200/50 dark:border-white/10 bg-white/95 dark:bg-[#0d0c14]/95 backdrop-blur-xl shadow-xl shadow-purple-950/30 p-1.5 z-50"
      >
        <DropdownMenuLabel className="px-2.5 py-1.5 text-xs text-muted-foreground">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-purple-200/30 dark:bg-white/10 my-1" />
        {user && user.username && (
          <div className="px-2.5 py-1 text-xs font-semibold text-gray-900 dark:text-white truncate">
            {user.username}
          </div>
        )}
        <DropdownMenuItem asChild>
          <Link
            to="/profile"
            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors focus:bg-purple-500/10 focus:text-purple-600 dark:focus:bg-white/10 dark:focus:text-purple-300"
          >
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          {isLoading ? (
            <span className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground">
              <Loader className="h-3 w-3 animate-spin" /> Loading...
            </span>
          ) : user && user.userId ? (
            <Link
              to={`/dashboard/${user.userId}`}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors focus:bg-purple-500/10 focus:text-purple-600 dark:focus:bg-white/10 dark:focus:text-purple-300"
            >
              Dashboard
            </Link>
          ) : (
            <span className="px-2.5 py-1.5 text-xs text-muted-foreground">Dashboard</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-purple-200/30 dark:bg-white/10 my-1" />
        <DropdownMenuItem
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 dark:focus:bg-red-500/15 dark:focus:text-red-300"
          onClick={logout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

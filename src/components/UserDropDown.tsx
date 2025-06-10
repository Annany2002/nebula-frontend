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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="p-2 w-fit rounded-full border-[1px] bg-transparent backdrop-blur-sm border-gray-900 dark:bg-slate-800 cursor-pointer text-primary font-semibold">
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : initials ? (
            initials
          ) : (
            "?" // Placeholder if initials are empty (e.g., during initial load or user not logged in)
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-transparent backdrop-blur-sm">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user && user.username && (
          <DropdownMenuItem>{user.username}</DropdownMenuItem>
        )}
        <DropdownMenuItem>
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : user && user.userId ? (
            <Link to={`/dashboard/${user.userId}`}>Dashboard</Link>
          ) : (
            "Dashboard"
          )}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={logout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

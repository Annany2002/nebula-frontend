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

export default function UserDropDown() {
  const { user, isLoading, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="p-2 w-fit rounded-full border border-gray-900 bg-slate-800 cursor-pointer text-primary font-semibold">
          {isLoading === false ? (
            user.username.substring(0, 2).toLocaleUpperCase()
          ) : (
            <Loader className="animate-spin" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{user && user.username}</DropdownMenuItem>
        <DropdownMenuItem>
          {isLoading === false ? (
            <Link to={`/dashboard/${user.userId}`}>Dashboard</Link>
          ) : (
            <Loader className="animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
          Logout
        </DropdownMenuItem>

        {/* <DropdownMenuItem>Subscription</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

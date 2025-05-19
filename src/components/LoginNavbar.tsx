import NebulaLogo from "@/assets/nebula-logo";
import UserDropDown from "./UserDropDown";
import { ThemeToggle } from "./ui/theme-toggle";

export default function LoginNavBar() {
  return (
    <div className="flex p-3 w-full justify-between items-center border-b">
      <NebulaLogo />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserDropDown />
      </div>
    </div>
  );
}

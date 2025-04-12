import NebulaLogo from "@/assets/nebula-logo";
import UserDropDown from "./UserDropDown";

export default function LoginNavBar() {
  return (
    <div className="flex p-3 w-full justify-between items-center border-b">
      <NebulaLogo />
      <UserDropDown />
    </div>
  );
}

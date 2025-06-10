import NebulaLogo from "@/assets/nebula-logo";
import UserDropDown from "./UserDropDown";
import { ThemeToggle } from "./ui/theme-toggle";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ExternalLink, Github } from "lucide-react";

export default function LoginNavBar() {
  return (
    <div className="flex p-[10px] w-full justify-between items-center border-b">
      <NebulaLogo />
      <Link to={"https://nebula-api-docs.vercel.app"} target="_blank">
        <Button
          variant="link"
          size="lg"
          className="dark:text-white text-purple-500"
        >
          View Docs
          <ExternalLink size={12} />
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to={"https://github.com/Annany2002/nebula-backend"}
          target="_blank"
        >
          <Github size={18} className="hover:text-purple-500" />
        </Link>
        <ThemeToggle />
        <UserDropDown />
      </div>
    </div>
  );
}

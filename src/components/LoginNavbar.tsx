import NebulaLogo from "@/assets/nebula-logo";
import UserDropDown from "./UserDropDown";
import { ThemeToggle } from "./ui/theme-toggle";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ExternalLink, Github } from "lucide-react";

export default function LoginNavBar() {
  return (
    <div className="flex p-[10px] w-full justify-between items-center border-b bg-white/40 dark:bg-black/40 backdrop-blur-md border-white/20 shadow-sm sticky top-0 z-50">
      <NebulaLogo />
      <Link to={"https://nebula-api-docs.vercel.app"} target="_blank">
        <Button
          variant="link"
          size="lg"
          className="dark:text-white text-purple-500"
        >
          Docs
          <ExternalLink className="w-6 h-6" />
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

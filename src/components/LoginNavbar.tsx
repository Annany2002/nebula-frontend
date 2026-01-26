import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Github, Menu } from "lucide-react";
import NebulaLogo from "@/assets/nebula-logo";
import UserDropDown from "./UserDropDown";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";

export default function LoginNavBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between rounded-b-xl border border-t-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/20 dark:border-gray-700/50 shadow-sm px-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <NebulaLogo />
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <Link
                        to="https://github.com/Annany2002/nebula-backend"
                        target="_blank"
                      >
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View on GitHub</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Separator orientation="vertical" className="h-6" />

              <ThemeToggle />
              <UserDropDown />
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col gap-4">
                    <Button
                      variant="ghost"
                      className="justify-start gap-3"
                      asChild
                    >
                      <Link
                        to="https://github.com/Annany2002/nebula-backend"
                        target="_blank"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                        <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                      </Link>
                    </Button>
                    <Separator />
                    <div className="px-2">
                      <UserDropDown />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

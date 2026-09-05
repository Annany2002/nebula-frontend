import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Menu } from "lucide-react";
import NebulaLogo from "@/assets/nebula-logo";
import UserDropDown from "./UserDropDown";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";

export default function LoginNavBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b border-purple-200/40 dark:border-white/10 bg-white/50 dark:bg-[#0c0b16]/70 backdrop-blur-xl backdrop-saturate-150 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity"
          aria-label="Nebula Home"
        >
          <NebulaLogo />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-white/5 rounded-full transition-colors"
                    asChild
                  >
                    <a
                      href="https://github.com/Annany2002/nebula-frontend"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View on GitHub</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-5 bg-purple-200/40 dark:bg-white/10" />

            <ThemeToggle />
            <UserDropDown />
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-1.5">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-gray-700 dark:text-zinc-300"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 border-l border-purple-200/50 dark:border-white/10 bg-white/95 dark:bg-[#0c0b16]/95 backdrop-blur-2xl"
              >
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-gray-900 dark:text-white">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  <Button variant="ghost" className="justify-start gap-3 rounded-xl" asChild>
                    <a
                      href="https://github.com/Annany2002/nebula-frontend"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  <Separator className="bg-purple-200/40 dark:bg-white/10" />
                  <div className="px-1">
                    <UserDropDown />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

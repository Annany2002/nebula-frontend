import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github, LoaderCircleIcon, Menu, X, ChevronRight } from "lucide-react";
import NebulaLogo from "@/assets/nebula-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/auth-context";
import UserDropDown from "./UserDropDown";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Code", href: "#code-demo" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "top-3 md:top-4 mx-auto w-[94%] max-w-5xl rounded-full border border-purple-300/40 dark:border-white/15 dark:border-t-white/25 bg-white/40 dark:bg-[#12101e]/45 backdrop-blur-xl backdrop-saturate-150 shadow-xl shadow-purple-500/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)] px-2"
          : "top-0 w-full border-b border-purple-200/30 dark:border-white/10 dark:border-b-white/15 bg-white/20 dark:bg-[#12101e]/30 backdrop-blur-md backdrop-saturate-150 px-4"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-2 md:px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NebulaLogo />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative py-1 text-gray-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-left after:scale-x-0 after:bg-gradient-to-r after:from-purple-600 after:to-indigo-500 after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="https://github.com/Annany2002/nebula-backend"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="p-2 rounded-full text-gray-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-white/5 transition-all"
          >
            <Github className="h-4 w-4" />
          </a>

          <ThemeToggle />

          {user && user.email ? (
            isLoading ? (
              <LoaderCircleIcon className="animate-spin text-purple-600" />
            ) : (
              <UserDropDown />
            )
          ) : (
            <Link to="/sign-up">
              <Button
                size="sm"
                className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full px-4 shadow-sm shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-gray-700 dark:text-zinc-300 rounded-full"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay to dim background and prevent text collision */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm -z-10"
            />

            {/* Elevated Menu Card */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute top-[calc(100%+0.5rem)] left-2 right-2 rounded-2xl bg-white/95 dark:bg-[#0c0c12]/95 backdrop-blur-2xl border border-purple-200/50 dark:border-white/10 shadow-2xl shadow-purple-950/40 p-3 z-50 overflow-hidden"
            >
              <div className="flex flex-col space-y-1">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-white/5 transition-all"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  </a>
                ))}

                <a
                  href="https://github.com/Annany2002/nebula-backend"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-white/5 transition-all"
                >
                  <span className="flex items-center gap-2.5">
                    <Github className="h-4 w-4" /> GitHub
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </a>

                <div className="pt-2 mt-1 border-t border-purple-200/30 dark:border-white/10 flex flex-col gap-2">
                  {user ? (
                    <UserDropDown />
                  ) : (
                    <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-10 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-purple-500/25 transition-all active:scale-[0.99]">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

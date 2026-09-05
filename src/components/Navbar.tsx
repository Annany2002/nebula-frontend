import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github, LoaderCircleIcon, Menu, X, ExternalLink } from "lucide-react";
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
          ? "top-3 md:top-4 mx-auto w-[94%] max-w-5xl rounded-full border border-purple-300/40 dark:border-white/10 bg-white/40 dark:bg-[#09090b]/70 backdrop-blur-xl shadow-xl shadow-purple-500/5 px-2"
          : "top-0 w-full border-b border-purple-200/30 dark:border-white/10 bg-white/20 dark:bg-[#09090b]/50 backdrop-blur-md px-4"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-2 md:px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NebulaLogo />
        </div>

        <nav className="hidden md:flex items-center space-x-1 text-xs font-medium">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-full text-gray-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-white/5 transition-all"
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://nebula-api-docs.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-full text-gray-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-white/5 transition-all flex items-center gap-1"
          >
            Docs <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="https://github.com/Annany2002/nebula-backend"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-white/5 border border-purple-200/30 dark:border-white/10 transition-all"
          >
            <Github size={14} />
            <span>GitHub</span>
          </Link>

          <ThemeToggle />

          {user && user.email ? (
            isLoading ? (
              <LoaderCircleIcon className="animate-spin text-purple-600" />
            ) : (
              <UserDropDown />
            )
          ) : (
            <div className="flex items-center gap-1.5 pl-1">
              <Link to="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold rounded-full hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 dark:hover:bg-white/5"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button
                  size="sm"
                  className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full px-4 shadow-sm shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Button>
              </Link>
            </div>
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
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-3 right-3 rounded-2xl bg-white/90 dark:bg-[#0e0d16]/95 backdrop-blur-2xl border border-purple-200/60 dark:border-white/10 shadow-2xl p-6 z-50"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-gray-800 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 py-1"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="https://nebula-api-docs.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-gray-800 dark:text-zinc-200 hover:text-purple-600 py-1 flex items-center gap-1"
              >
                Documentation <ExternalLink className="h-3 w-3" />
              </a>
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col gap-2">
                {user ? (
                  <UserDropDown />
                ) : (
                  <>
                    <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full text-xs rounded-xl">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

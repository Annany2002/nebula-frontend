import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Github, LoaderCircleIcon, Menu, X } from "lucide-react";
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "top-0 w-full bg-white/80 dark:bg-[#0c0a12]/80 backdrop-blur-lg border-b border-gray-200/60 dark:border-white/5"
          : "top-0 w-full bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <NebulaLogo />

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/Annany2002/nebula-frontend"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>

          <ThemeToggle />

          {user && user.email ? (
            isLoading ? (
              <LoaderCircleIcon className="animate-spin text-purple-500" />
            ) : (
              <UserDropDown />
            )
          ) : (
            <Link to="/sign-up">
              <Button
                size="sm"
                className="text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 h-8 transition-colors"
              >
                Get Started
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 -z-10"
            />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0c0a12] border-b border-gray-200 dark:border-white/10 p-4 space-y-1"
            >
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}

              <a
                href="https://github.com/Annany2002/nebula-frontend"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>

              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                {user ? (
                  <UserDropDown />
                ) : (
                  <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full h-9 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

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
    <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-purple-100/60 dark:border-white/10 bg-white/70 dark:bg-[#09090b]/75 backdrop-blur-md transition-colors">
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NebulaLogo />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-gray-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://nebula-api-docs.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
          >
            Docs <ExternalLink className="h-3 w-3" />
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="https://github.com/Annany2002/nebula-backend"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-purple-200/50 dark:hover:border-white/10 transition-all"
          >
            <Github size={15} />
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
            <div className="flex items-center gap-2">
              <Link to="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button
                  size="sm"
                  className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm shadow-purple-500/20"
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
            className="p-2 text-gray-700 dark:text-zinc-300"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-4 right-4 rounded-2xl bg-white/95 dark:bg-[#0e0d16]/95 backdrop-blur-xl border border-purple-200 dark:border-white/10 shadow-2xl p-6 z-50"
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
                      <Button variant="outline" className="w-full text-xs">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white">
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

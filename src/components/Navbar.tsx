import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github, LoaderCircleIcon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NebulaLogo from "@/assets/nebula-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/auth-context";
import UserDropDown from "./UserDropDown";

const Navbar = () => {
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container max-w-7xl mx-auto px-3 flex items-center justify-between">
        <NebulaLogo />

        {/* Desktop Navigation */}
        <ul className="flex space-x-6">
          {["Use Cases", "Features", "Pricing"].map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-gray-700 hover:text-primary dark:text-white dark:hover:text-primary transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            </motion.li>
          ))}
        </ul>

        {/* Desktop View*/}
        <div className="hidden md:flex md:gap-3 items-center">
          <Link
            to={"https://github.com/Annany2002/nebula-backend"}
            target="_blank"
          >
            <Github size={18} className="hover:text-purple-500" />
          </Link>
          <ThemeToggle />

          {user && user.email ? (
            isLoading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <UserDropDown />
            )
          ) : (
            <Link
              className="text-gray-700 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
              to={"/sign-up"}
            >
              Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button
            className="text-gray-800 dark:text-white px-2 rounded-full"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full mx-6 rounded-md place-items-center left-0 right-0 bg-white shadow-lg overflow-hidden dark:bg-gray-900 dark:border-b dark:border-gray-800"
          >
            <div className="container mx-auto p-6 flex flex-col space-y-4">
              <a
                href="#features"
                className="py-3 px-4 text-gray-800 rounded-lg hover:bg-purple-50 transition-colors dark:text-white dark:hover:bg-purple-900/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="py-3 px-4 text-gray-800 rounded-lg hover:bg-purple-50 transition-colors dark:text-white dark:hover:bg-purple-900/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="py-3 px-4 text-gray-800 rounded-lg hover:bg-purple-50 transition-colors dark:text-white dark:hover:bg-purple-900/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentation
              </a>
              <a
                href="#support"
                className="py-3 px-4 text-gray-800 rounded-lg hover:bg-purple-50 transition-colors dark:text-white dark:hover:bg-purple-900/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </a>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                {user ? (
                  <UserDropDown />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full mb-3 border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:border-purple-700 dark:hover:bg-purple-900/20"
                    >
                      Sign In
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Get Started
                    </Button>
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

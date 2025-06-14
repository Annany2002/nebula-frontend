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
          ? "py-3 backdrop-blur-md shadow-sm border-b"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container max-w-7xl mx-auto px-3 flex items-center justify-between">
        <NebulaLogo />

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6">
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
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={32} /> : <Menu className="w-12 h-12" />}
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
            className="md:hidden absolute top-full mx-6 rounded-md place-items-center left-0 right-0 bg-transparent backdrop-blur-md shadow-lg border border-purple-500 dark:border-gray-500"
          >
            <div className="container mx-auto p-6 flex flex-col space-y-4 items-center">
              <Link to={"https://nebula-api-docs.vercel.app/"} target="_blank">
                <Button
                  size="lg"
                  variant="link"
                  className="text-primary dark:text-white"
                >
                  Docs
                </Button>
              </Link>
              <Link
                to={"https://github.com/Annany2002/nebula-frontend"}
                target="_blank"
              >
                <Button
                  size="lg"
                  variant="link"
                  className="text-primary dark:text-white"
                >
                  Github
                </Button>
              </Link>

              <div className="border-gray-100 dark:border-gray-800">
                {user ? (
                  <UserDropDown />
                ) : (
                  <>
                    <Link to={"/sign-up"}>
                      <Button
                        size="lg"
                        variant="link"
                        className="text-primary dark:text-white"
                      >
                        Sign Up
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

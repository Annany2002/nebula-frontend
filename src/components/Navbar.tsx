import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github, LoaderCircleIcon, Menu, X } from "lucide-react";
import NebulaLogo from "@/assets/nebula-logo";
import { Button } from "@/components/ui/button";
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
      className={`fixed top-6 z-50 w-5/6 lg:w-3/4 place-self-center transition-all duration-300 rounded-3xl py-3 border ${
        scrolled
          ? "backdrop-blur-sm shadow-sm border-purple-600/50"
          : "bg-purple-900/10 border-gray-800"
      }`}
    >
      <div className="flex items-center justify-between px-1 md:px-6">
        <NebulaLogo />

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-5">
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
            className="md:hidden absolute mt-8 mx-6 rounded-md place-items-center left-0 right-0 bg-purple-900/20 backdrop-blur-sm border border-purple-500 dark:border-gray-500 z-50"
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

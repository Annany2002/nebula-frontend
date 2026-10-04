import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Github, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/auth-context";
import UserDropDown from "./UserDropDown";
import LandingBrand from "./landing/LandingBrand";
import { docsUrl } from "@/lib/config";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "Developers", href: "#code-demo" },
  { label: "Use cases", href: "#use-cases" },
];

const Navbar = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 20);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <header
      className={`nbl-nav ${scrolled ? "is-scrolled" : ""} ${mobileMenuOpen ? "is-menu-open" : ""}`}
      style={{ borderRadius: scrolled ? (mobileMenuOpen ? 22 : 32) : 0 }}
    >
      <div className="nbl-container nbl-nav-inner">
        <Link to="/" aria-label="Nebula home">
          <LandingBrand />
        </Link>
        <nav className="nbl-desktop-nav" aria-label="Main navigation">
          {navLinks.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href={docsUrl} target="_blank" rel="noopener noreferrer">
            Docs <ArrowUpRight size={12} />
          </a>
        </nav>
        <div className="nbl-nav-actions">
          <a
            className="nbl-nav-github"
            href="https://github.com/Annany2002/nebula-backend"
            target="_blank"
            rel="noreferrer"
            aria-label="Nebula on GitHub"
          >
            <Github size={18} />
          </a>
          <span className="nbl-theme-toggle">
            <ThemeToggle />
          </span>
          <div className="nbl-nav-account">
            {user ? (
              <UserDropDown />
            ) : (
              <Link className="nbl-button nbl-button-primary nbl-button-small" to="/sign-up">
                Get started <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
          <button
            type="button"
            className="nbl-menu-toggle"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="nbl-mobile-nav"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <svg
              className="nbl-menu-icon"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            key="mobile-navigation"
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            id="nbl-mobile-nav"
            className="nbl-mobile-nav nbl-container"
            aria-label="Mobile navigation"
          >
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
                <ArrowUpRight size={15} />
              </a>
            ))}
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
              <ArrowUpRight size={15} />
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
              FAQ
              <ArrowUpRight size={15} />
            </a>
            {user ? (
              <UserDropDown />
            ) : (
              <Link
                className="nbl-button nbl-button-primary"
                to="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start building free
                <ArrowUpRight size={15} />
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

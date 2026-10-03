import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, GitBranch, Terminal, ArrowUpRight } from "lucide-react";
import { NebulaLogo } from "@/assets/nebula-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import "@/styles/auth.css";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

const AuthLayout = ({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) => (
  <div className="nebula-auth">
    <header className="auth-header">
      <Link to="/" aria-label="Nebula home">
        <NebulaLogo />
      </Link>
      <div>
        <Link className="auth-back" to="/">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to home
        </Link>
        <ThemeToggle />
      </div>
    </header>
    <main className="auth-main">
      <aside className="auth-story" aria-label="About Nebula">
        <div className="auth-orbits" aria-hidden="true">
          <i />
          <i />
          <span>
            <Database size={38} strokeWidth={1.4} />
          </span>
        </div>
        <div className="auth-story-copy">
          <p className="auth-story-label">A workspace for what’s next</p>
          <h2>
            Your next idea.
            <br />
            Your own universe.
          </h2>
          <p>
            Bring your data to life with isolated SQLite databases, a visual Studio, and a REST API.
          </p>
          <div className="auth-capabilities">
            <span>
              <Database size={14} />
              SQLite
            </span>
            <span>
              <GitBranch size={14} />
              Visual schema
            </span>
            <span>
              <Terminal size={14} />
              REST API
            </span>
          </div>
        </div>
        <a
          className="auth-source"
          href="https://github.com/Annany2002/nebula-backend"
          target="_blank"
          rel="noreferrer"
        >
          Open source. Built to be yours.
          <ArrowUpRight size={14} />
        </a>
      </aside>
      <section className="auth-form-panel" aria-labelledby="auth-heading">
        <div className="auth-form-content">
          <div className="auth-form-heading">
            <h1 id="auth-heading">{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          <p className="auth-switch">
            {footerText}{" "}
            <Link to={footerLinkHref}>
              {footerLinkText}
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>
    </main>
    <footer className="auth-footer">
      <span>© {new Date().getFullYear()} Nebula</span>
      <span>Your databases. Your infrastructure.</span>
    </footer>
  </div>
);
export default AuthLayout;

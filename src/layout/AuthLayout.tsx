import { Suspense, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, Database, GitBranch, Terminal, ArrowUpRight, Loader2 } from "lucide-react";
import { NebulaLogo } from "@/assets/nebula-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { preloadAuthPages } from "@/lib/auth-pages";
import "@/styles/auth.css";

const AuthLayout = () => {
  useEffect(() => {
    preloadAuthPages();
  }, []);

  return (
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
              Bring your data to life with isolated SQLite databases, a visual Studio, and a REST
              API.
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
          <Suspense
            fallback={
              <div
                className="auth-form-content flex min-h-[350px] items-center justify-center"
                role="status"
              >
                <Loader2
                  className="h-6 w-6 animate-spin text-primary motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span className="sr-only">Loading form…</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </section>
      </main>
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Nebula</span>
        <span>Your databases. Your infrastructure.</span>
      </footer>
    </div>
  );
};
export default AuthLayout;

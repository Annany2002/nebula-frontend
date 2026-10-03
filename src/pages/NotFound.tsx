import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NebulaLogo } from "@/assets/nebula-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/auth-context";
import "@/styles/not-found.css";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const projectsLink =
    isAuthenticated && user?.userId ? `/dashboard/${encodeURIComponent(user.userId)}` : null;
  const canGoBack = typeof window.history.state?.idx === "number" && window.history.state.idx > 0;

  return (
    <div className="nebula-not-found">
      <header className="not-found-header">
        <Link to="/" aria-label="Nebula home">
          <NebulaLogo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="not-found-main" aria-labelledby="not-found-heading">
        <p className="not-found-code" aria-label="Error 404">
          404
        </p>
        <div className="not-found-content">
          <h1 id="not-found-heading">Page not found.</h1>
          <p className="not-found-description">
            The link may be out of date, or the address may be incorrect.
          </p>
          <div className="not-found-path">
            <span>Requested page</span>
            <code>{location.pathname}</code>
          </div>
          <div className="not-found-actions">
            <Button asChild>
              <Link to={projectsLink || "/"}>
                {projectsLink ? "Back to projects" : "Go to homepage"}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </Button>
            {canGoBack && (
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft size={15} aria-hidden="true" />
                Go back
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

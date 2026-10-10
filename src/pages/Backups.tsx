import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LoginNavBar from "@/components/LoginNavbar";
import ManagedBackups from "@/components/Studio/ManagedBackups";
import { useAuth } from "@/context/auth-context";
import "@/styles/dashboard.css";
import "@/styles/database-exports.css";

export default function Backups() {
  const { user } = useAuth();
  return (
    <div className="nebula-dashboard min-h-screen bg-background text-foreground">
      <LoginNavBar />
      <main className="db-dashboard-main db-export-page">
        <header className="db-page-header">
          <div>
            <p className="db-workspace-label">Your workspace</p>
            <h1>Backups</h1>
          </div>
          <Link
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            to={`/dashboard/${user?.userId ?? ""}`}
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Projects
          </Link>
        </header>
        <ManagedBackups />
      </main>
    </div>
  );
}

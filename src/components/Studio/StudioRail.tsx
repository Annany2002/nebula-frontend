import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Table2,
  Terminal,
  KeyRound,
  Settings,
  Github,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  Database,
} from "lucide-react";
import NebulaLogo from "@/assets/nebula-logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export type StudioTab = "overview" | "editor" | "sql" | "database" | "apikeys" | "settings";
interface StudioRailProps {
  currentTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  dbName: string;
  userId?: string;
}
const navigation = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "editor", label: "Table editor", icon: Table2 },
  { id: "sql", label: "SQL editor", icon: Terminal },
  { id: "database", label: "Database", icon: Database },
  { id: "apikeys", label: "API keys", icon: KeyRound },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export default function StudioRail({ currentTab, onTabChange, dbName, userId }: StudioRailProps) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("nebula_studio_sidebar_collapsed") === "true"
  );
  const dashboardLink = userId ? `/dashboard/${userId}` : "/";
  const toggleCollapse = () => {
    setCollapsed((previous) => {
      localStorage.setItem("nebula_studio_sidebar_collapsed", String(!previous));
      return !previous;
    });
  };
  return (
    <aside className={`studio-rail ${collapsed ? "is-collapsed" : ""}`}>
      <TooltipProvider delayDuration={150}>
        <Link to={dashboardLink} className="studio-brand" aria-label="Back to projects">
          <NebulaLogo imgClassName="w-7 h-7" />
        </Link>
        <Link to={dashboardLink} className="studio-projects-link" aria-label="All projects">
          <ArrowLeft size={15} />
          <span>All projects</span>
        </Link>
        <div className="studio-rail-context">
          <span>WORKSPACE</span>
          <strong title={dbName}>{dbName}</strong>
        </div>
        <nav className="studio-rail-nav" aria-label="Studio navigation">
          {navigation.map(({ id, label, icon: Icon }, index) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onTabChange(id)}
                  className={`studio-nav-item ${index === 4 ? "studio-nav-config" : ""}`}
                  aria-label={label}
                  aria-current={currentTab === id ? "page" : undefined}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <div className="studio-rail-footer">
          <button
            type="button"
            className="studio-collapse"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <ThemeToggle />
          <a
            href="https://github.com/Annany2002/nebula-frontend"
            target="_blank"
            rel="noreferrer"
            aria-label="Nebula on GitHub"
          >
            <Github size={17} />
          </a>
        </div>
      </TooltipProvider>
    </aside>
  );
}

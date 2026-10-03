import { ReactElement, useEffect, useState, useSyncExternalStore } from "react";
import { Portal as TooltipPortal } from "@radix-ui/react-tooltip";
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
  ArrowUpRight,
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

const narrowRailQuery = "(max-width: 760px)";
const subscribeToRailWidth = (onChange: () => void) => {
  const media = window.matchMedia(narrowRailQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const isNarrowRail = () => window.matchMedia(narrowRailQuery).matches;
const serverRailWidth = () => false;

function RailTooltip({
  open,
  onOpenChange,
  label,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  children: ReactElement;
}) {
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {open && (
        <TooltipPortal>
          <TooltipContent side="right" sideOffset={8} className="studio-rail-tooltip">
            {label}
          </TooltipContent>
        </TooltipPortal>
      )}
    </Tooltip>
  );
}

export default function StudioRail({ currentTab, onTabChange, dbName, userId }: StudioRailProps) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("nebula_studio_sidebar_collapsed") === "true"
  );
  const narrow = useSyncExternalStore(subscribeToRailWidth, isNarrowRail, serverRailWidth);
  const compact = collapsed || narrow;
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  useEffect(() => setActiveTooltip(null), [compact]);
  const changeTooltip = (id: string, open: boolean) => {
    setActiveTooltip((previous) => (compact && open ? id : previous === id ? null : previous));
  };
  const dashboardLink = userId ? `/dashboard/${userId}` : "/";
  const toggleCollapse = () => {
    setActiveTooltip(null);
    setCollapsed((previous) => {
      localStorage.setItem("nebula_studio_sidebar_collapsed", String(!previous));
      return !previous;
    });
  };
  return (
    <aside
      className={`studio-rail ${collapsed ? "is-collapsed" : ""}`}
      onPointerLeave={() => setActiveTooltip(null)}
    >
      <TooltipProvider delayDuration={250} skipDelayDuration={0} disableHoverableContent>
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
        <nav id="studio-rail-navigation" className="studio-rail-nav" aria-label="Studio navigation">
          {navigation.map(({ id, label, icon: Icon }, index) => (
            <RailTooltip
              key={id}
              open={compact && activeTooltip === id}
              onOpenChange={(open) => changeTooltip(id, open)}
              label={label}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTooltip(null);
                  onTabChange(id);
                }}
                className={`studio-nav-item ${index === 4 ? "studio-nav-config" : ""}`}
                aria-label={label}
                aria-current={currentTab === id ? "page" : undefined}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            </RailTooltip>
          ))}
        </nav>
        <footer className="studio-rail-footer">
          <div className="studio-rail-appearance">
            <span className="studio-rail-footer-label">Appearance</span>
            <RailTooltip
              open={compact && activeTooltip === "theme"}
              onOpenChange={(open) => changeTooltip("theme", open)}
              label="Toggle theme"
            >
              <span className="studio-rail-theme">
                <ThemeToggle />
              </span>
            </RailTooltip>
          </div>
          <RailTooltip
            open={compact && activeTooltip === "github"}
            onOpenChange={(open) => changeTooltip("github", open)}
            label="GitHub"
          >
            <a
              className="studio-rail-source"
              href="https://github.com/Annany2002/nebula-frontend"
              target="_blank"
              rel="noreferrer"
              aria-label="Nebula on GitHub (opens in a new tab)"
            >
              <Github size={17} />
              <span className="studio-rail-footer-label">GitHub</span>
              <ArrowUpRight size={13} className="studio-rail-external" aria-hidden="true" />
            </a>
          </RailTooltip>
          <RailTooltip
            open={compact && activeTooltip === "collapse"}
            onOpenChange={(open) => changeTooltip("collapse", open)}
            label="Expand sidebar"
          >
            <button
              type="button"
              className="studio-collapse"
              onClick={toggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!compact}
              aria-controls="studio-rail-navigation"
            >
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              <span className="studio-rail-footer-label">Collapse sidebar</span>
            </button>
          </RailTooltip>
        </footer>
      </TooltipProvider>
    </aside>
  );
}

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
import { cn } from "@/lib/utils";

export type StudioTab = "overview" | "editor" | "sql" | "database" | "apikeys" | "settings";

interface StudioRailProps {
  currentTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  dbName: string;
  userId?: string;
}

export default function StudioRail({ currentTab, onTabChange, dbName, userId }: StudioRailProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("nebula_studio_sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("nebula_studio_sidebar_collapsed", String(next));
      return next;
    });
  };

  const coreNavItems = [
    {
      id: "overview" as StudioTab,
      label: "Project Overview",
      icon: Home,
    },
    {
      id: "editor" as StudioTab,
      label: "Table Editor",
      icon: Table2,
    },
    {
      id: "sql" as StudioTab,
      label: "SQL Editor",
      icon: Terminal,
    },
    {
      id: "database" as StudioTab,
      label: "Database",
      icon: Database,
    },
  ];

  const configNavItems = [
    {
      id: "apikeys" as StudioTab,
      label: "API Keys",
      icon: KeyRound,
    },
    {
      id: "settings" as StudioTab,
      label: "Project Settings",
      icon: Settings,
    },
  ];

  const resolvedUserId = userId || localStorage.getItem("user_id") || "";
  const dashboardLink = resolvedUserId ? `/dashboard/${resolvedUserId}` : "/";

  return (
    <aside
      className={cn(
        "flex-shrink-0 bg-white/80 dark:bg-[#0c0b16]/90 backdrop-blur-xl border-r border-purple-200/50 dark:border-purple-500/15 flex flex-col z-30 select-none transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14 items-center py-3" : "w-56 p-3"
      )}
    >
      <TooltipProvider delayDuration={150}>
        {/* Top Header / Branding */}
        {collapsed ? (
          <div className="mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={dashboardLink}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <NebulaLogo showText={false} imgClassName="w-8 h-8" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                <p className="text-xs">Back to Projects</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="mb-4 px-1 space-y-2">
            <div className="flex items-center justify-between">
              <Link
                to={dashboardLink}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity"
              >
                <NebulaLogo showText={false} imgClassName="w-7 h-7" />
                <span className="font-bold text-sm tracking-tight text-foreground font-sans">
                  Nebula
                </span>
              </Link>
            </div>

            {/* Back to all projects link */}
            <Link
              to={dashboardLink}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-purple-500/10 rounded-lg transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium truncate">All Projects</span>
            </Link>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className="flex-1 flex flex-col space-y-1 w-full overflow-y-auto">
          {/* Core Items: Overview, Table Editor, SQL Editor */}
          {coreNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all relative mx-auto my-0.5",
                        isActive
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-purple-500/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {isActive && (
                        <span className="absolute -left-2 top-2.5 bottom-2.5 w-1 bg-purple-500 rounded-r shadow-xs" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    <p className="text-xs font-medium">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left",
                  isActive
                    ? "bg-purple-600/15 text-purple-700 dark:text-purple-300 dark:bg-purple-500/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Section Divider */}
          <div
            className={cn(
              "my-2 border-t border-purple-200/40 dark:border-white/5",
              collapsed ? "mx-1" : "mx-2"
            )}
          />

          {/* Section Label (when expanded) */}
          {!collapsed && (
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold">
              Configuration
            </div>
          )}

          {/* Config Items: API Keys, Project Settings */}
          {configNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all relative mx-auto my-0.5",
                        isActive
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-purple-500/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {isActive && (
                        <span className="absolute -left-2 top-2.5 bottom-2.5 w-1 bg-purple-500 rounded-r shadow-xs" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    <p className="text-xs font-medium">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left",
                  isActive
                    ? "bg-purple-600/15 text-purple-700 dark:text-purple-300 dark:bg-purple-500/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: Collapse Toggle, Theme, GitHub */}
        <div
          className={cn(
            "pt-2 border-t border-purple-200/40 dark:border-white/10 w-full flex items-center",
            collapsed ? "flex-col space-y-2" : "justify-between px-1"
          )}
        >
          {/* Collapse / Expand Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCollapse}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-purple-500/10 transition-colors"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              <p className="text-xs">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme & GitHub */}
          <div className={cn("flex items-center", collapsed ? "flex-col space-y-1" : "gap-1")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 flex items-center justify-center">
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                <p className="text-xs">Toggle Theme</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/Annany2002/nebula-backend"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-purple-500/10 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                <p className="text-xs">GitHub Repository</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </aside>
  );
}

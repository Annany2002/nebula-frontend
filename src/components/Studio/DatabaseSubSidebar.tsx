import {
  Network,
  Table2,
  ListFilter,
  Zap,
  HardDriveDownload,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DatabaseSubTab = "visualizer" | "tables" | "indexes" | "triggers" | "backups";

interface DatabaseSubSidebarProps {
  currentSubTab: DatabaseSubTab;
  onSubTabChange: (tab: DatabaseSubTab) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function DatabaseSubSidebar({
  currentSubTab,
  onSubTabChange,
  collapsed = false,
  onToggleCollapse,
}: DatabaseSubSidebarProps) {
  const managementItems = [
    {
      id: "visualizer" as DatabaseSubTab,
      label: "Schema Visualizer",
      icon: Network,
      badge: "NEW",
    },
    {
      id: "tables" as DatabaseSubTab,
      label: "Tables",
      icon: Table2,
    },
    {
      id: "indexes" as DatabaseSubTab,
      label: "Indexes",
      icon: ListFilter,
    },
    {
      id: "triggers" as DatabaseSubTab,
      label: "Triggers",
      icon: Zap,
    },
  ];

  const platformItems = [
    {
      id: "backups" as DatabaseSubTab,
      label: "Backups & Export",
      icon: HardDriveDownload,
    },
  ];

  if (collapsed) {
    return (
      <div className="w-8 border-r border-purple-200/50 dark:border-purple-500/15 bg-white/80 dark:bg-[#0c0b16]/80 backdrop-blur-xl flex flex-col items-center py-3 z-20 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={onToggleCollapse}
          title="Expand Database navigation"
        >
          <PanelLeftOpen className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="w-56 sm:w-60 border-r border-purple-200/50 dark:border-purple-500/15 bg-white/80 dark:bg-[#0c0b16]/90 backdrop-blur-xl flex flex-col z-20 shrink-0 select-none">
      {/* Top Header */}
      <div className="h-12 border-b border-purple-200/50 dark:border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold tracking-tight text-foreground font-sans uppercase">
            Database
          </span>
          <Badge
            variant="outline"
            className="text-[9px] font-mono px-1 py-0 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20"
          >
            main
          </Badge>
        </div>

        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded text-muted-foreground hover:text-foreground"
            onClick={onToggleCollapse}
            title="Collapse Database navigation"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {/* Section 1: DATABASE MANAGEMENT */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Database Management
          </div>

          {managementItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSubTabChange(item.id)}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-all text-left group",
                  isActive
                    ? "bg-purple-600/15 text-purple-700 dark:text-purple-300 dark:bg-purple-500/20 font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 transition-colors",
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate text-xs">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: PLATFORM */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Platform
          </div>

          {platformItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSubTabChange(item.id)}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-all text-left group",
                  isActive
                    ? "bg-purple-600/15 text-purple-700 dark:text-purple-300 dark:bg-purple-500/20 font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 transition-colors",
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Engine Footer */}
      <div className="p-3 border-t border-purple-200/50 dark:border-white/10 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
        <span>SQLite 3 (WAL)</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Synced</span>
      </div>
    </aside>
  );
}

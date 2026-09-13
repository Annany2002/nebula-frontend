import { useState } from "react";
import {
  Terminal,
  Globe,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableType, DatabaseDetailType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import { useDatabaseAnalytics } from "@/hooks/queries";
import { toast } from "sonner";
import { StudioTab } from "./StudioRail";
import { url } from "@/lib/config";

interface ProjectOverviewProps {
  dbName: string;
  details?: DatabaseDetailType;
  tables: TableType[];
  onNavigateTab: (tab: StudioTab) => void;
  onSelectTable: (tableName: string) => void;
  onOpenCreateTable: () => void;
  onOpenConnect: () => void;
}

export default function ProjectOverview({
  dbName,
  details,
  tables,
  onNavigateTab,
  onSelectTable,
  onOpenCreateTable,
  onOpenConnect,
}: ProjectOverviewProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const { data: analytics } = useDatabaseAnalytics(dbName);

  const totalRecords =
    details?.totalRecords ?? tables.reduce((acc, t) => acc + (t.rowCount ?? 0), 0);

  const projectUrl = `${url}/api/v1/databases/${dbName}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopiedUrl(true);
    toast.success("Project URL copied");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    if (!details?.apiKey) return;
    navigator.clipboard.writeText(details.apiKey);
    setCopiedKey(true);
    toast.success("API key copied");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const advisorIssues = analytics?.advisor || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Top Project Heading & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/40 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">{dbName}</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="h-7 px-2.5 text-xs font-mono gap-1 border-purple-200/40 dark:border-white/10"
          >
            {copiedUrl ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>URL</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConnect}
            className="h-7 px-2.5 text-xs gap-1 border-purple-200/40 dark:border-white/10"
          >
            <Globe className="w-3 h-3 text-purple-500" />
            <span>Connect</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("sql")}
            className="h-7 px-2.5 text-xs gap-1 border-purple-200/40 dark:border-white/10"
          >
            <Terminal className="w-3 h-3 text-purple-500" />
            <span>SQL</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenCreateTable}
            className="h-7 px-2.5 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium gap-1 shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>New Table</span>
          </Button>
        </div>
      </div>

      {/* 4 Core Specifications Tiles (Simple & Mini) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab("editor")}
          className="p-3.5 rounded-xl bg-card/60 border border-purple-200/40 dark:border-white/5 hover:border-purple-500/40 transition-all cursor-pointer"
        >
          <div className="text-xs text-muted-foreground font-medium">Tables</div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">{tables.length}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card/60 border border-purple-200/40 dark:border-white/5">
          <div className="text-xs text-muted-foreground font-medium">Total Records</div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">
            {totalRecords.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card/60 border border-purple-200/40 dark:border-white/5">
          <div className="text-xs text-muted-foreground font-medium">Storage Engine</div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">SQLite 3</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card/60 border border-purple-200/40 dark:border-white/5">
          <div className="text-xs text-muted-foreground font-medium">Created</div>
          <div className="text-sm font-semibold font-mono text-foreground mt-1 truncate">
            {details?.createdAt ? formatDateTime(details.createdAt) : "Recently"}
          </div>
        </div>
      </div>

      {/* Mini Telemetry Status (Only if traffic exists) */}
      {analytics && analytics.totalRequests > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-card/40 border border-purple-200/30 dark:border-white/5 text-xs text-muted-foreground font-mono">
          <span>
            Traffic: <strong className="text-foreground">{analytics.totalRequests}</strong> requests
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {analytics.successRate !== undefined ? analytics.successRate.toFixed(1) : "100.0"}%
            success
          </span>
        </div>
      )}

      {/* Advisory Warnings (Only if issues found) */}
      {advisorIssues.length > 0 && (
        <div className="space-y-2">
          {advisorIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-foreground truncate">{issue.title}</span>
                <span className="text-muted-foreground truncate hidden sm:inline">
                  {issue.description}
                </span>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                {issue.severity}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* API Key (Simple & Mini) */}
      {details?.apiKey && (
        <div className="p-3 rounded-xl bg-card/60 border border-purple-200/40 dark:border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <KeyRound className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-xs font-mono text-muted-foreground shrink-0">API Key:</span>
            <span className="font-mono text-xs text-foreground truncate select-all">
              {showKey ? details.apiKey : "••••••••••••••••••••••••••••••••"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKey(!showKey)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyKey}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {copiedKey ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Tables Section (Simple & Mini) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground">
            Tables ({tables.length})
          </h2>
        </div>

        {tables.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-purple-200/50 dark:border-white/10 text-center space-y-2 bg-card/30">
            <p className="text-xs text-muted-foreground">No tables in this database</p>
            <Button size="sm" variant="outline" onClick={onOpenCreateTable} className="text-xs h-7">
              Create Table
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {tables.map((table) => (
              <div
                key={table.name}
                onClick={() => onSelectTable(table.name)}
                className="group p-3 rounded-xl border border-purple-200/40 dark:border-white/5 bg-card/60 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-foreground truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {table.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {table.rowCount ?? 0} {table.rowCount === 1 ? "row" : "rows"}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

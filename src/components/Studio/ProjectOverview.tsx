import { useState } from "react";
import {
  Table2,
  Database,
  Calendar,
  Layers,
  Terminal,
  Globe,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  Activity,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableType, DatabaseDetailType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import { useDatabaseAnalytics } from "@/hooks/queries";
import { toast } from "sonner";
import { StudioTab } from "./StudioRail";
import { url } from "@/lib/config";
import { cn } from "@/lib/utils";

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

  // Fetch real telemetry and schema advisor data
  const { data: analytics, isLoading: analyticsLoading } = useDatabaseAnalytics(dbName);

  const totalRecords =
    details?.totalRecords ?? tables.reduce((acc, t) => acc + (t.rowCount ?? 0), 0);

  const projectUrl = `${url}/api/v1/databases/${dbName}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopiedUrl(true);
    toast.success("Project URL copied to clipboard");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    if (!details?.apiKey) return;
    navigator.clipboard.writeText(details.apiKey);
    setCopiedKey(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const services = analytics?.services || [];
  const advisorIssues = analytics?.advisor || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Project Heading & Endpoint Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-200/40 dark:border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              {dbName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-mono text-xs text-muted-foreground">{projectUrl}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="h-6 px-2 text-[11px] font-mono gap-1 border-purple-200/40 dark:border-white/10 hover:bg-purple-500/10"
            >
              {copiedUrl ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>Copy</span>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConnect}
            className="h-8 px-3 text-xs gap-1.5 border-purple-200/50 dark:border-white/10 hover:bg-purple-500/10"
          >
            <Globe className="w-3.5 h-3.5 text-purple-500" />
            <span>Connect API</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("sql")}
            className="h-8 px-3 text-xs gap-1.5 border-purple-200/50 dark:border-white/10 hover:bg-purple-500/10"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-500" />
            <span>SQL Editor</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenCreateTable}
            className="h-8 px-3 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium gap-1 shadow-sm shadow-purple-500/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Table</span>
          </Button>
        </div>
      </div>

      {/* 4 Core Specifications Tiles (Real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Tables */}
        <div
          onClick={() => onNavigateTab("editor")}
          className="p-4 rounded-xl bg-card/75 backdrop-blur-xl border border-purple-200/50 dark:border-purple-500/15 hover:border-purple-500/40 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Tables
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Table2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground font-mono">{tables.length}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {tables.length === 1 ? "1 table" : `${tables.length} tables`} configured
            </p>
          </div>
        </div>

        {/* Tile 2: Records */}
        <div className="p-4 rounded-xl bg-card/75 backdrop-blur-xl border border-purple-200/50 dark:border-purple-500/15 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Total Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground font-mono">
              {totalRecords.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Stored rows across all tables
            </p>
          </div>
        </div>

        {/* Tile 3: Storage Engine */}
        <div className="p-4 rounded-xl bg-card/75 backdrop-blur-xl border border-purple-200/50 dark:border-purple-500/15 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Storage Engine
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-foreground font-sans">SQLite 3 (WAL)</div>
            <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
              {details?.filePath || `data/${dbName}.db`}
            </p>
          </div>
        </div>

        {/* Tile 4: Created Date */}
        <div className="p-4 rounded-xl bg-card/75 backdrop-blur-xl border border-purple-200/50 dark:border-purple-500/15 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Created At
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm font-semibold text-foreground font-sans truncate">
              {details?.createdAt ? formatDateTime(details.createdAt) : "Recently created"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              ID #{details?.databaseId ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Real Request Telemetry & Activity Charts (Matching Supabase design) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-foreground">
              {analytics?.totalRequests ?? 0} Total Requests
            </span>
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {analytics?.successRate !== undefined ? analytics.successRate.toFixed(1) : "100.0"}%
              Success Rate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs font-mono text-muted-foreground border-purple-200/40 dark:border-white/10"
            >
              Last 24 hours <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* 4 Service Activity & Histogram Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {services.map((service) => {
            const history = service.history || [];
            const maxReq = Math.max(1, ...history.map((h) => h.requests));

            return (
              <div
                key={service.name}
                className="p-4 rounded-xl bg-card/75 backdrop-blur-xl border border-purple-200/50 dark:border-purple-500/15 flex flex-col justify-between shadow-xs space-y-3"
              >
                {/* Header with Title and Warnings/Errors */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      {service.name}
                    </span>
                    <div className="flex items-center gap-2.5 text-[10px] font-mono">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-foreground font-semibold">{service.warnings}</span>
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-foreground font-semibold">{service.errors}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-2xl font-bold font-mono text-foreground">
                    {service.requests}
                  </div>
                </div>

                {/* Histogram Bar Chart */}
                <div className="h-16 flex items-end gap-1.5 pt-2 border-t border-purple-200/30 dark:border-white/5">
                  {history.length > 0 ? (
                    history.map((bucket, idx) => {
                      const heightPercent = Math.max(
                        8,
                        Math.round((bucket.requests / maxReq) * 100)
                      );
                      const isError = bucket.errors > 0;
                      const isWarning = bucket.warnings > 0 && !isError;

                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col justify-end items-center h-full group/bar relative"
                        >
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={cn(
                              "w-full rounded-xs transition-all duration-300",
                              isError
                                ? "bg-red-500 hover:bg-red-400"
                                : isWarning
                                  ? "bg-amber-500 hover:bg-amber-400"
                                  : "bg-emerald-500 hover:bg-emerald-400"
                            )}
                          />
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-popover text-popover-foreground text-[9px] font-mono px-1.5 py-0.5 rounded shadow border border-border whitespace-nowrap pointer-events-none z-20">
                            {bucket.timestamp}: {bucket.requests} req
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full flex items-center justify-center text-[10px] text-muted-foreground font-mono h-full">
                      <span className="opacity-50">Monitoring traffic...</span>
                    </div>
                  )}
                </div>

                {/* Time Axis Labels */}
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/60 border-t border-purple-200/20 dark:border-white/5 pt-1">
                  <span>24h ago</span>
                  <span>Now</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real SQLite Schema Advisor Section (Matching Supabase design) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-foreground">
              Advisor found {advisorIssues.length}{" "}
              {advisorIssues.length === 1 ? "advisory" : "advisories"}
            </h2>
          </div>

          <Badge
            variant="outline"
            className="text-[10px] font-mono border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10"
          >
            SQLite Engine
          </Badge>
        </div>

        {advisorIssues.length === 0 ? (
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl flex items-center space-x-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">All database checks passed</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Primary keys defined, WAL journal mode active, and SQLite integrity verified.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {advisorIssues.map((issue) => {
              const isCritical = issue.severity === "CRITICAL";
              const isWarning = issue.severity === "WARNING";

              return (
                <div
                  key={issue.id}
                  className={cn(
                    "p-4 rounded-xl backdrop-blur-xl border flex flex-col justify-between space-y-3 transition-all shadow-xs",
                    isCritical
                      ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
                      : isWarning
                        ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                        : "border-purple-200/50 dark:border-purple-500/20 bg-card/75 hover:border-purple-500/40"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {isCritical ? (
                          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                          {issue.category}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-mono px-1.5 py-0",
                          isCritical
                            ? "border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10"
                            : isWarning
                              ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                              : "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                        )}
                      >
                        {issue.severity}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-foreground">{issue.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40">
                    <p className="text-[10px] font-mono text-purple-600 dark:text-purple-300">
                      💡 {issue.suggestion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* API Key & Access Card */}
      {details?.apiKey && (
        <div className="p-4 rounded-xl bg-card/75 backdrop-blur-xl border border-purple-200/50 dark:border-purple-500/15 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground">
                Database API Key
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("apikeys")}
              className="h-6 px-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-500/10 gap-1 font-medium"
            >
              <span>Manage Keys</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-1.5 rounded-lg bg-muted/40 dark:bg-black/30 border border-purple-200/30 dark:border-white/10 font-mono text-xs text-foreground truncate select-all">
              {showKey ? details.apiKey : "•".repeat(32)}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKey(!showKey)}
              className="h-8 px-2.5 border-purple-200/40 dark:border-white/10 hover:bg-purple-500/10"
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyKey}
              className="h-8 px-2.5 border-purple-200/40 dark:border-white/10 hover:bg-purple-500/10 gap-1"
            >
              {copiedKey ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="text-xs">Copy</span>
            </Button>
          </div>
        </div>
      )}

      {/* Tables Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Tables in {dbName}</h2>
            <p className="text-xs text-muted-foreground">
              Select any table to view or edit rows in the Table Editor spreadsheet.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onOpenCreateTable}
            className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Table</span>
          </Button>
        </div>

        {tables.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-purple-200/50 dark:border-purple-500/20 text-center space-y-2 bg-card/50">
            <Table2 className="w-8 h-8 text-purple-500 mx-auto opacity-60" />
            <p className="text-xs text-muted-foreground">No tables found in this database.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenCreateTable}
              className="text-xs h-8 border-purple-200/50 dark:border-white/10"
            >
              Create your first table
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tables.map((table) => (
              <div
                key={table.name}
                onClick={() => onSelectTable(table.name)}
                className="group p-3.5 rounded-xl border border-purple-200/40 dark:border-white/5 bg-card/75 backdrop-blur-xl hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors shrink-0">
                    <Table2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-foreground truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {table.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {table.rowCount ?? 0} {table.rowCount === 1 ? "row" : "rows"}
                      {table.columns?.length ? ` • ${table.columns.length} cols` : ""}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableType, DatabaseDetailType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
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

      {/* 4 Core Specifications Tiles (Real data only) */}
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
            <div className="text-lg font-bold text-foreground font-sans">SQLite 3</div>
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

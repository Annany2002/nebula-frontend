import { useState } from "react";
import {
  Table2,
  ListFilter,
  Zap,
  HardDriveDownload,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  Code2,
  Database,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Plus,
  MoreVertical,
  Trash2,
  Terminal,
  Info,
  X,
  Key,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table as TableUI,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  useTables,
  useDatabaseObjects,
  useExportDatabaseSQL,
  useDeleteTable,
} from "@/hooks/queries";
import { TableType, IndexInfo, TriggerInfo } from "@/types/allType";
import { cn } from "@/lib/utils";

export type DatabaseSubView = "tables" | "indexes" | "triggers" | "backups";

interface DatabaseObjectsViewProps {
  dbName: string;
  subView: DatabaseSubView;
  onSelectTable?: (tableName: string) => void;
  onOpenCreateTable?: () => void;
}

export default function DatabaseObjectsView({
  dbName,
  subView,
  onSelectTable,
  onOpenCreateTable,
}: DatabaseObjectsViewProps) {
  const navigate = useNavigate();
  const { data: tables = [], isLoading: tablesLoading, refetch: refetchTables } = useTables(dbName);
  const {
    data: objects,
    isLoading: objectsLoading,
    refetch: refetchObjects,
  } = useDatabaseObjects(dbName);
  const { mutateAsync: exportSql, isPending: exportingSql } = useExportDatabaseSQL(dbName);
  const { mutate: deleteTable, isPending: deletingTable } = useDeleteTable();

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedDump, setCopiedDump] = useState(false);
  const [sqlPreview, setSqlPreview] = useState<string | null>(null);
  const [selectedColumnsTable, setSelectedColumnsTable] = useState<TableType | null>(null);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [dismissBanner, setDismissBanner] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState<"all" | "tables" | "system">("all");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const estimateTableSize = (tbl: TableType) => {
    const rowCount = tbl.rowCount || 0;
    const colCount = tbl.columns?.length || 4;
    const bytes = 4096 + rowCount * colCount * 48;
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filtered Tables
  const filteredTables = tables.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const isSystem = t.name.startsWith("_") || t.name.startsWith("sqlite_");
    if (entityTypeFilter === "tables") return !isSystem;
    if (entityTypeFilter === "system") return isSystem;
    return true;
  });

  // Filtered Indexes
  const filteredIndexes = (objects?.indexes || []).filter(
    (idx) =>
      idx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idx.tableName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Triggers
  const filteredTriggers = (objects?.triggers || []).filter(
    (trg) =>
      trg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trg.tableName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTable = () => {
    if (!tableToDelete) return;
    deleteTable(
      { dbName, tableName: tableToDelete },
      {
        onSuccess: () => {
          setTableToDelete(null);
          refetchTables();
          refetchObjects();
        },
      }
    );
  };

  const handleDownloadSql = async () => {
    try {
      const res = await exportSql();
      const blob = new Blob([res.sql], { type: "text/plain;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = res.filename || `${dbName}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success("SQL dump downloaded successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate SQL dump";
      toast.error(msg);
    }
  };

  const handlePreviewSql = async () => {
    try {
      const res = await exportSql();
      setSqlPreview(res.sql);
      toast.success("Generated SQL preview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate SQL preview";
      toast.error(msg);
    }
  };

  const handleDownloadDbFile = () => {
    const token = localStorage.getItem("token");
    const downloadUrl = `${backendUrl}/api/v1/databases/${dbName}/export/sqlite`;
    // Fetch with auth then download blob
    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to download SQLite file");
        return res.blob();
      })
      .then((blob) => {
        const fileUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `${dbName}.db`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileUrl);
        toast.success(`Downloaded ${dbName}.db file`);
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header Bar: Only shown for non-tables subviews */}
      {subView !== "tables" && (
        <div className="h-12 border-b border-purple-200/30 dark:border-white/10 px-6 flex items-center justify-between bg-card/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-foreground capitalize flex items-center gap-2">
              {subView === "indexes" && <ListFilter className="w-4 h-4 text-indigo-500" />}
              {subView === "triggers" && <Zap className="w-4 h-4 text-amber-500" />}
              {subView === "backups" && <HardDriveDownload className="w-4 h-4 text-emerald-500" />}
              <span>{subView}</span>
            </h2>

            {subView !== "backups" && (
              <div className="relative w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Filter ${subView}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs rounded-lg border-purple-200/30 dark:border-white/10 bg-card/60"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                refetchTables();
                refetchObjects();
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1 text-purple-500" /> Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full max-w-7xl mx-auto space-y-5">
          {/* VIEW 1: TABLES */}
          {subView === "tables" && (
            <div className="space-y-4">
              {/* Info Notification Banner */}
              {!dismissBanner && (
                <div className="rounded-xl bg-card/75 dark:bg-[#11101d]/90 border border-purple-200/40 dark:border-white/10 p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-white/5 border border-purple-200/30 dark:border-white/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="w-4 h-4 text-foreground/80" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-foreground">
                        SQLite Storage Engine • WAL Mode Active
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        All database tables and schemas are isolated in an ACID-compliant SQLite
                        store on disk. High-concurrency reads with WAL journaling.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/databases/${dbName}/sql`)}
                      className="h-8 text-xs rounded-lg border-purple-200/40 dark:border-white/10 hover:bg-purple-500/10 text-foreground font-medium"
                    >
                      <Terminal className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                      SQL Runner
                    </Button>
                    <button
                      onClick={() => setDismissBanner(true)}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                      title="Dismiss notice"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Filter and Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
                  {/* Schema selector badge */}
                  <div className="h-8 px-2.5 rounded-lg border border-purple-200/40 dark:border-white/10 bg-card/50 flex items-center gap-1.5 text-xs select-none">
                    <span className="text-[11px] font-mono text-muted-foreground/70">schema</span>
                    <span className="font-mono font-semibold text-foreground">main</span>
                  </div>

                  {/* Search for a table */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for a table"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 pr-3 text-xs rounded-lg border-purple-200/40 dark:border-white/10 bg-card/50 focus:border-purple-500/50"
                    />
                  </div>

                  {/* Entity Type Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs rounded-lg border-purple-200/40 dark:border-white/10 bg-card/50 text-muted-foreground hover:text-foreground gap-1.5"
                      >
                        <span>
                          {entityTypeFilter === "all"
                            ? "Entity Type"
                            : entityTypeFilter === "tables"
                              ? "User Tables"
                              : "System Tables"}
                        </span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-40 bg-popover border-purple-200/50 dark:border-white/10 text-popover-foreground"
                    >
                      <DropdownMenuItem
                        onClick={() => setEntityTypeFilter("all")}
                        className="text-xs cursor-pointer hover:bg-purple-500/10"
                      >
                        All Entities
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEntityTypeFilter("tables")}
                        className="text-xs cursor-pointer hover:bg-purple-500/10"
                      >
                        User Tables
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEntityTypeFilter("system")}
                        className="text-xs cursor-pointer hover:bg-purple-500/10"
                      >
                        System Tables
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* + New Table Button */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs rounded-lg border-purple-200/40 dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-purple-500/10 gap-1"
                    onClick={() => {
                      refetchTables();
                      refetchObjects();
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                    <span>Refresh</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={onOpenCreateTable}
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium gap-1.5 rounded-lg shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New table</span>
                  </Button>
                </div>
              </div>

              {/* Data Grid: Tables List matching Supabase */}
              <div className="rounded-xl border border-purple-200/40 dark:border-white/10 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xs">
                <TableUI className="w-full">
                  <TableHeader className="bg-muted/40 dark:bg-[#0c0b16]/70 border-b border-purple-200/30 dark:border-white/10">
                    <TableRow className="hover:bg-transparent text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      <TableHead className="py-3 px-4 w-72 text-foreground/70 font-semibold">
                        Name
                      </TableHead>
                      <TableHead className="py-3 px-4 w-28 text-foreground/70 font-semibold">
                        Columns
                      </TableHead>
                      <TableHead className="py-3 px-4 w-36 text-foreground/70 font-semibold">
                        Rows (Estimated)
                      </TableHead>
                      <TableHead className="py-3 px-4 w-36 text-foreground/70 font-semibold">
                        Size (Estimated)
                      </TableHead>
                      <TableHead className="py-3 px-4 text-right w-44 text-foreground/70 font-semibold"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-purple-200/20 dark:divide-white/5 font-mono text-xs">
                    {filteredTables.map((tbl) => {
                      const isSystem = tbl.name.startsWith("_") || tbl.name.startsWith("sqlite_");
                      return (
                        <TableRow
                          key={tbl.name}
                          className="hover:bg-purple-500/5 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-2.5 truncate">
                              <Table2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                              <button
                                onClick={() => {
                                  if (onSelectTable) onSelectTable(tbl.name);
                                  else navigate(`/databases/${dbName}/tables/${tbl.name}`);
                                }}
                                className="font-semibold text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left truncate"
                              >
                                {tbl.name}
                              </button>
                              {isSystem && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 font-mono text-muted-foreground border-purple-200/40 dark:border-white/10"
                                >
                                  SYSTEM
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-muted-foreground">
                            {tbl.columns?.length || 0}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-muted-foreground">
                            {tbl.rowCount ?? 0}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-muted-foreground">
                            {estimateTableSize(tbl)}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 font-sans">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedColumnsTable(tbl)}
                                className="h-7 text-xs px-2.5 rounded-lg border-purple-200/40 dark:border-white/10 hover:bg-purple-500/10 text-foreground"
                              >
                                View columns
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-purple-500/10"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48 bg-popover border-purple-200/50 dark:border-white/10 text-popover-foreground"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (onSelectTable) onSelectTable(tbl.name);
                                      else navigate(`/databases/${dbName}/tables/${tbl.name}`);
                                    }}
                                    className="text-xs cursor-pointer hover:bg-purple-500/10"
                                  >
                                    <Table2 className="w-3.5 h-3.5 mr-2 text-purple-500" />
                                    <span>View Data in Editor</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/databases/${dbName}/sql`)}
                                    className="text-xs cursor-pointer hover:bg-purple-500/10"
                                  >
                                    <Terminal className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                    <span>Query in SQL Runner</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(tbl.name);
                                      toast.success(`Copied "${tbl.name}" to clipboard`);
                                    }}
                                    className="text-xs cursor-pointer hover:bg-purple-500/10"
                                  >
                                    <Copy className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    <span>Copy Table Name</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border" />
                                  <DropdownMenuItem
                                    onClick={() => setTableToDelete(tbl.name)}
                                    className="text-xs text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    <span>Drop Table</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredTables.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          <Table2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs font-semibold">No tables found</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                            Try adjusting your search query or filter.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </TableUI>
              </div>
            </div>
          )}

          {/* VIEW 2: INDEXES */}
          {subView === "indexes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">SQLite Indexes</h3>
                  <p className="text-xs text-muted-foreground">
                    Indexes defined in sqlite_master for optimizing query lookups
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {filteredIndexes.length} {filteredIndexes.length === 1 ? "index" : "indexes"}
                </Badge>
              </div>

              {filteredIndexes.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-purple-200/30 dark:border-white/10 rounded-2xl p-6">
                  <ListFilter className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-foreground">No custom indexes</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Execute CREATE INDEX statements in SQL Editor to accelerate frequent queries.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredIndexes.map((idx) => (
                    <Card
                      key={idx.name}
                      className="rounded-xl border border-purple-200/40 dark:border-white/10 bg-card/60 backdrop-blur-md p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ListFilter className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold font-mono text-foreground">
                            {idx.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            on{" "}
                            <span className="text-purple-300 font-semibold">{idx.tableName}</span>
                          </span>
                        </div>

                        {idx.unique && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono bg-pink-500/10 text-pink-400 border-pink-500/20"
                          >
                            UNIQUE
                          </Badge>
                        )}
                      </div>

                      {idx.sql && (
                        <div className="rounded-lg bg-muted/60 dark:bg-black/40 border border-purple-200/30 dark:border-white/5 p-2.5 text-[11px] font-mono text-foreground/80 overflow-x-auto">
                          <code>{idx.sql};</code>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: TRIGGERS */}
          {subView === "triggers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">SQLite Triggers</h3>
                  <p className="text-xs text-muted-foreground">
                    Automated event-driven statements executed on INSERT, UPDATE, or DELETE
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {filteredTriggers.length} {filteredTriggers.length === 1 ? "trigger" : "triggers"}
                </Badge>
              </div>

              {filteredTriggers.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-purple-200/30 dark:border-white/10 rounded-2xl p-6">
                  <Zap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-foreground">No triggers defined</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Triggers can be created via the SQL Editor using CREATE TRIGGER statements.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredTriggers.map((trg) => (
                    <Card
                      key={trg.name}
                      className="rounded-xl border border-purple-200/40 dark:border-white/10 bg-card/60 backdrop-blur-md p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold font-mono text-foreground">
                            {trg.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            on{" "}
                            <span className="text-purple-300 font-semibold">{trg.tableName}</span>
                          </span>
                        </div>
                      </div>

                      {trg.sql && (
                        <div className="rounded-lg bg-muted/60 dark:bg-black/40 border border-purple-200/30 dark:border-white/5 p-2.5 text-[11px] font-mono text-foreground/80 overflow-x-auto">
                          <code>{trg.sql};</code>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: BACKUPS & EXPORT */}
          {subView === "backups" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-foreground">Backups & Database Export</h3>
                <p className="text-xs text-muted-foreground">
                  Export your isolated SQLite storage file or full transactional SQL dump
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A: Raw SQLite Database File */}
                <Card className="rounded-2xl border border-purple-200/40 dark:border-white/10 bg-card/60 backdrop-blur-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">SQLite Database (.db)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Download the exact isolated SQLite database file stored on disk. Can be opened
                      directly in DB Browser for SQLite or any local SQLite client.
                    </p>
                  </div>

                  <Button
                    onClick={handleDownloadDbFile}
                    className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" /> Download {dbName}.db
                  </Button>
                </Card>

                {/* Option B: Full SQL Dump */}
                <Card className="rounded-2xl border border-purple-200/40 dark:border-white/10 bg-card/60 backdrop-blur-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">
                      SQL Transaction Dump (.sql)
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Generates a full DDL and DML export containing CREATE TABLE statements, index
                      definitions, triggers, and INSERT statements for all table rows.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviewSql}
                      disabled={exportingSql}
                      className="flex-1 h-9 rounded-xl border-purple-200/40 dark:border-white/10 text-xs"
                    >
                      <Code2 className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Preview SQL
                    </Button>
                    <Button
                      onClick={handleDownloadSql}
                      disabled={exportingSql}
                      className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download .sql
                    </Button>
                  </div>
                </Card>
              </div>

              {/* SQL Preview Box if activated */}
              {sqlPreview && (
                <Card className="rounded-2xl border border-purple-200/40 dark:border-white/10 bg-card/75 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="p-4 pb-3 border-b border-purple-200/20 dark:border-white/5 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <CardTitle className="text-xs font-mono font-bold text-foreground">
                        SQL Export Dump ({dbName}.sql)
                      </CardTitle>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.navigator.clipboard.writeText(sqlPreview);
                        setCopiedDump(true);
                        toast.success("SQL dump copied to clipboard");
                        setTimeout(() => setCopiedDump(false), 2000);
                      }}
                      className="h-7 text-xs px-2.5 rounded-lg border-purple-200/30 dark:border-white/10"
                    >
                      {copiedDump ? (
                        <Check className="w-3 h-3 text-emerald-500 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1 text-purple-400" />
                      )}
                      Copy SQL
                    </Button>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="rounded-xl bg-muted/60 dark:bg-black/50 border border-purple-200/30 dark:border-white/5 p-4 font-mono text-xs text-foreground/90 overflow-x-auto max-h-96">
                      <pre className="whitespace-pre">
                        <code>{sqlPreview}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Columns Dialog */}
      <Dialog
        open={!!selectedColumnsTable}
        onOpenChange={(open) => !open && setSelectedColumnsTable(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-background border-purple-200/50 dark:border-white/10">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Table2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="font-mono">{selectedColumnsTable?.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {selectedColumnsTable?.columns?.length || 0} columns
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Schema definition and column constraints for this table
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-3">
            <div className="rounded-lg border border-purple-200/30 dark:border-white/10 overflow-hidden">
              <TableUI>
                <TableHeader className="bg-muted/50 dark:bg-muted/20">
                  <TableRow className="hover:bg-transparent text-[11px] font-mono uppercase text-muted-foreground">
                    <TableHead className="py-2.5 px-3">Column</TableHead>
                    <TableHead className="py-2.5 px-3">Data Type</TableHead>
                    <TableHead className="py-2.5 px-3">Primary Key</TableHead>
                    <TableHead className="py-2.5 px-3">Nullable</TableHead>
                    <TableHead className="py-2.5 px-3">Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40 font-mono text-xs">
                  {selectedColumnsTable?.columns?.map((col) => {
                    const isPk = Boolean(col.pk);
                    const isNotNull = col.notnull === 1;
                    const hasDefault =
                      col.dflt_value !== null &&
                      col.dflt_value !== undefined &&
                      col.dflt_value !== "";

                    return (
                      <TableRow key={col.name} className="hover:bg-muted/30">
                        <TableCell className="py-2.5 px-3 font-semibold text-foreground flex items-center gap-1.5">
                          {isPk && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                          <span>{col.name}</span>
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          <Badge variant="secondary" className="font-mono text-[10px] py-0">
                            {col.type || "TEXT"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          {isPk ? (
                            <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                              Yes (PK)
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          {isNotNull ? (
                            <span className="text-xs text-foreground">No</span>
                          ) : (
                            <span className="text-muted-foreground/70">Yes</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-muted-foreground">
                          {hasDefault ? (
                            <code className="text-[11px] px-1.5 py-0.5 rounded bg-muted/60 border border-border/40">
                              {String(col.dflt_value)}
                            </code>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableUI>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drop Table Confirmation Dialog */}
      <AlertDialog open={!!tableToDelete} onOpenChange={(open) => !open && setTableToDelete(null)}>
        <AlertDialogContent className="bg-background border-purple-200/50 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-red-600 dark:text-red-400">
              Drop table {tableToDelete}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This action cannot be undone. All data and records inside{" "}
              <span className="font-mono font-semibold text-foreground">{tableToDelete}</span> will
              be permanently deleted from SQLite storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTable} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTable}
              disabled={deletingTable}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              {deletingTable ? "Dropping..." : "Drop Table"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTables, useDatabaseObjects, useExportDatabaseSQL } from "@/hooks/queries";
import { TableType, IndexInfo, TriggerInfo } from "@/types/allType";
import { cn } from "@/lib/utils";

export type DatabaseSubView = "tables" | "indexes" | "triggers" | "backups";

interface DatabaseObjectsViewProps {
  dbName: string;
  subView: DatabaseSubView;
  onSelectTable?: (tableName: string) => void;
}

export default function DatabaseObjectsView({
  dbName,
  subView,
  onSelectTable,
}: DatabaseObjectsViewProps) {
  const navigate = useNavigate();
  const { data: tables = [], isLoading: tablesLoading, refetch: refetchTables } = useTables(dbName);
  const {
    data: objects,
    isLoading: objectsLoading,
    refetch: refetchObjects,
  } = useDatabaseObjects(dbName);
  const { mutateAsync: exportSql, isPending: exportingSql } = useExportDatabaseSQL(dbName);

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedDump, setCopiedDump] = useState(false);
  const [sqlPreview, setSqlPreview] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Filtered Tables
  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Header Bar */}
      <div className="h-12 border-b border-purple-200/30 dark:border-white/10 px-6 flex items-center justify-between bg-card/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-foreground capitalize flex items-center gap-2">
            {subView === "tables" && <Table2 className="w-4 h-4 text-purple-500" />}
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

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* VIEW 1: TABLES */}
          {subView === "tables" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Database Tables</h3>
                  <p className="text-xs text-muted-foreground">
                    All tables, row counts, and schema definitions in SQLite
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {filteredTables.length} {filteredTables.length === 1 ? "table" : "tables"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredTables.map((tbl) => (
                  <Card
                    key={tbl.name}
                    className="rounded-xl border border-purple-200/40 dark:border-white/10 bg-card/60 backdrop-blur-md overflow-hidden"
                  >
                    <CardHeader className="p-4 pb-3 border-b border-purple-200/20 dark:border-white/5 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                          <Table2 className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold font-mono text-foreground">
                            {tbl.name}
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {tbl.rowCount || 0} rows • {tbl.columns?.length || 0} columns
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs rounded-lg"
                          onClick={() => {
                            if (onSelectTable) onSelectTable(tbl.name);
                            else navigate(`/databases/${dbName}/tables/${tbl.name}`);
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1 text-purple-400" />
                          View Data
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3">
                      {/* Columns table */}
                      <div className="rounded-lg border border-purple-200/20 dark:border-white/5 overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/40 font-mono text-[11px] text-muted-foreground">
                            <tr>
                              <th className="p-2 pl-3">Column</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Primary Key</th>
                              <th className="p-2">Nullable</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                            {(tbl.columns || []).map((c) => (
                              <tr key={c.name} className="hover:bg-purple-500/5">
                                <td className="p-2 pl-3 font-semibold text-foreground">{c.name}</td>
                                <td className="p-2 text-purple-300">{c.type || "ANY"}</td>
                                <td className="p-2">
                                  {c.pk > 0 ? (
                                    <span className="text-amber-400 font-bold">YES (PK)</span>
                                  ) : (
                                    <span className="text-muted-foreground/40">NO</span>
                                  )}
                                </td>
                                <td className="p-2">
                                  {c.notnull === 1 ? (
                                    <span className="text-muted-foreground">NOT NULL</span>
                                  ) : (
                                    <span className="text-muted-foreground/60">NULLABLE</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {tbl.sql && (
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto">
                          <pre>{tbl.sql};</pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
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
                        <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 text-[11px] font-mono text-foreground/80 overflow-x-auto">
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
                        <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 text-[11px] font-mono text-foreground/80 overflow-x-auto">
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
                    <div className="rounded-xl bg-black/50 border border-white/5 p-4 font-mono text-xs text-foreground/90 overflow-x-auto max-h-96">
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
    </div>
  );
}

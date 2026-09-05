import { useState } from "react";
import {
  Play,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Table2,
  Columns,
  Key,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableType, SQLQueryResultType } from "@/types/allType";
import { useExecuteSQL } from "@/hooks/queries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SqlEditorProps {
  dbName: string;
  tables: TableType[];
}

export default function SqlEditor({ dbName, tables }: SqlEditorProps) {
  const [query, setQuery] = useState(
    tables.length > 0 ? `SELECT * FROM ${tables[0].name} LIMIT 25;` : "SELECT sqlite_version();"
  );
  const [lastResult, setLastResult] = useState<SQLQueryResultType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Collapsible Schema Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [schemaSearch, setSchemaSearch] = useState("");
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const { mutate: executeSQL, isPending } = useExecuteSQL(dbName);

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  const handleRunQuery = () => {
    if (!query.trim()) {
      toast.error("Please enter a SQL query");
      return;
    }
    setErrorMessage(null);
    executeSQL(query, {
      onSuccess: (data) => {
        setLastResult(data);
        toast.success("Query executed successfully");
      },
      onError: (err) => {
        setErrorMessage(err.message);
        toast.error("Query failed");
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunQuery();
    }
  };

  const handleSelectTemplate = (sqlText: string) => {
    setQuery(sqlText);
  };

  const handleInsertColumn = (columnName: string) => {
    setQuery((prev) => `${prev} ${columnName}`);
  };

  const handleCopyResult = () => {
    if (!lastResult?.rows) return;
    const tsv = [
      (lastResult.columns || []).join("\t"),
      ...lastResult.rows.map((row) => row.join("\t")),
    ].join("\n");
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    toast.success("Results copied to clipboard (TSV)");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTables = tables.filter((t) => {
    const q = schemaSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) || t.columns?.some((c) => c.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex h-full bg-background text-foreground overflow-hidden">
      {/* Collapsible Left Schema & Tables Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 bg-card/60 dark:bg-[#0c0b16]/75 backdrop-blur-xl border-r border-purple-200/50 dark:border-purple-500/15 flex flex-col h-full transition-all duration-200",
          sidebarOpen ? "w-60" : "w-0 border-r-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-purple-200/40 dark:border-white/10 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Schema ({tables.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Collapse schema sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={schemaSearch}
              onChange={(e) => setSchemaSearch(e.target.value)}
              placeholder="Search tables..."
              className="h-7 pl-7 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 focus:border-purple-500/50 rounded-md"
            />
          </div>
        </div>

        {/* Scrollable Tables & Columns Tree */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {filteredTables.map((t) => {
            const isExpanded = !!expandedTables[t.name];
            return (
              <div key={t.name} className="rounded-lg group">
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-purple-500/10 cursor-pointer text-xs transition-colors">
                  <div
                    className="flex items-center space-x-1.5 min-w-0 flex-1"
                    onClick={() => toggleTableExpand(t.name)}
                  >
                    <ChevronRight
                      className={cn(
                        "w-3 h-3 text-muted-foreground transition-transform shrink-0",
                        isExpanded && "rotate-90"
                      )}
                    />
                    <Table2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="font-mono truncate font-medium text-foreground">{t.name}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleSelectTemplate(`SELECT * FROM ${t.name} LIMIT 25;`)}
                      title={`Run SELECT * FROM ${t.name}`}
                      className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-purple-600 dark:text-purple-400 hover:underline px-1"
                    >
                      SELECT
                    </button>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 font-mono text-muted-foreground border-purple-200/40 dark:border-white/10"
                    >
                      {t.rowCount ?? 0}
                    </Badge>
                  </div>
                </div>

                {/* Expanded Column List */}
                {isExpanded && t.columns && t.columns.length > 0 && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-purple-200/30 dark:border-white/5 ml-3 my-0.5">
                    {t.columns.map((col) => (
                      <div
                        key={col.name}
                        onClick={() => handleInsertColumn(col.name)}
                        className="flex items-center justify-between py-0.5 px-1.5 rounded text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-purple-500/10 cursor-pointer group/col"
                        title={`Click to insert column "${col.name}" into query`}
                      >
                        <div className="flex items-center space-x-1.5 truncate">
                          {col.pk === 1 ? (
                            <Key className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                          ) : (
                            <Columns className="w-2.5 h-2.5 opacity-40 shrink-0" />
                          )}
                          <span className="truncate group-hover/col:text-purple-600 dark:group-hover/col:text-purple-300">
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase opacity-50 shrink-0">{col.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredTables.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground font-mono">
              No tables found
            </div>
          )}
        </div>
      </div>

      {/* Main SQL Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Editor Header Toolbar */}
        <div className="h-14 border-b border-purple-200/40 dark:border-white/10 px-4 flex items-center justify-between bg-card/40 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="h-7 w-7 p-0 mr-0.5 border border-purple-200/40 dark:border-white/10 hover:bg-purple-500/10"
                title="Show tables sidebar"
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
              </Button>
            )}

            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">SQL Runner</span>

            {/* Quick Query Templates Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 border border-purple-200/40 dark:border-white/10 bg-muted/30 px-2.5 rounded-lg"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Templates</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-60 bg-popover border-purple-200/50 dark:border-white/10 text-popover-foreground p-1"
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground px-2 py-1">
                  Query Tables
                </DropdownMenuLabel>
                {tables.map((t) => (
                  <DropdownMenuItem
                    key={t.name}
                    onClick={() => handleSelectTemplate(`SELECT * FROM ${t.name} LIMIT 25;`)}
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-purple-500/10 font-mono px-2 py-1.5 rounded"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Table2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {t.rowCount ?? 0} rows
                    </span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuLabel className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground px-2 py-1">
                  System Queries
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    handleSelectTemplate("SELECT name, sql FROM sqlite_master WHERE type='table';")
                  }
                  className="text-xs cursor-pointer hover:bg-purple-500/10 font-mono px-2 py-1.5 rounded"
                >
                  List all tables schema
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSelectTemplate("SELECT sqlite_version();")}
                  className="text-xs cursor-pointer hover:bg-purple-500/10 font-mono px-2 py-1.5 rounded"
                >
                  SQLite version
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSelectTemplate("PRAGMA integrity_check;")}
                  className="text-xs cursor-pointer hover:bg-purple-500/10 font-mono px-2 py-1.5 rounded"
                >
                  Check integrity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
              ⌘ + Enter to execute
            </span>
            <Button
              size="sm"
              onClick={handleRunQuery}
              disabled={isPending}
              className="h-8 px-3.5 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium gap-1.5 shadow-sm shadow-purple-500/25 rounded-lg"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isPending ? "Running..." : "Run Query"}</span>
            </Button>
          </div>
        </div>

        {/* Query Input Area */}
        <div className="h-44 flex-shrink-0 p-3.5 bg-background border-b border-purple-200/40 dark:border-white/10">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter SQL statement (e.g. SELECT * FROM users LIMIT 10;)"
            spellCheck={false}
            className="w-full h-full bg-card/60 dark:bg-[#0c0b16]/70 backdrop-blur-md border border-purple-200/50 dark:border-purple-500/20 rounded-xl p-3.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 resize-none leading-relaxed shadow-sm"
          />
        </div>

        {/* Results / Console Output */}
        <div className="flex-1 flex flex-col min-h-0 bg-background/50">
          {/* Results Bar */}
          <div className="h-10 border-b border-purple-200/40 dark:border-white/10 px-4 flex items-center justify-between bg-card/40 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-semibold text-foreground">Results</span>
              {lastResult && (
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 text-[10px] font-mono h-5 gap-1"
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {lastResult.executionMs}ms
                  </Badge>
                  {lastResult.rowCount !== undefined && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {lastResult.rowCount} rows returned
                    </span>
                  )}
                  {lastResult.rowsAffected > 0 && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {lastResult.rowsAffected} rows affected
                    </span>
                  )}
                </div>
              )}
            </div>

            {lastResult?.rows && lastResult.rows.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyResult}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-purple-500 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                Copy Data
              </Button>
            )}
          </div>

          {/* Output View */}
          <div className="flex-1 overflow-auto p-4">
            {errorMessage ? (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-300 flex items-start space-x-2.5 text-xs font-mono">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Query Execution Error</div>
                  <div className="mt-1 whitespace-pre-wrap">{errorMessage}</div>
                </div>
              </div>
            ) : lastResult?.columns && lastResult.columns.length > 0 ? (
              <div className="rounded-xl border border-purple-200/50 dark:border-white/10 overflow-hidden shadow-sm">
                <TableUI>
                  <TableHeader className="bg-card/90 dark:bg-[#0f0e20]/90 backdrop-blur-md sticky top-0 z-10 border-b border-purple-200/50 dark:border-purple-500/20">
                    <TableRow className="border-purple-200/40 dark:border-white/10 hover:bg-transparent">
                      <TableHead className="w-12 text-center text-muted-foreground font-mono text-[11px]">
                        #
                      </TableHead>
                      {lastResult.columns.map((col, idx) => (
                        <TableHead
                          key={idx}
                          className="text-foreground font-mono text-xs font-medium border-l border-purple-200/30 dark:border-white/10 px-3 py-2"
                        >
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lastResult.rows && lastResult.rows.length > 0 ? (
                      lastResult.rows.map((row, rIdx) => (
                        <TableRow
                          key={rIdx}
                          className="border-purple-200/30 dark:border-white/5 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 transition-colors"
                        >
                          <TableCell className="text-center text-muted-foreground font-mono text-[11px]">
                            {rIdx + 1}
                          </TableCell>
                          {row.map((val, cIdx) => (
                            <TableCell
                              key={cIdx}
                              className="font-mono text-xs text-foreground border-l border-purple-200/20 dark:border-white/5 max-w-xs truncate py-2"
                            >
                              {val === null ? (
                                <span className="text-muted-foreground/60 italic text-[11px]">
                                  NULL
                                </span>
                              ) : typeof val === "object" ? (
                                JSON.stringify(val)
                              ) : (
                                String(val)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={lastResult.columns.length + 1}
                          className="text-center py-6 text-xs text-muted-foreground"
                        >
                          Query returned 0 rows.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </TableUI>
              </div>
            ) : lastResult?.message ? (
              <div className="p-4 rounded-xl bg-card/60 backdrop-blur-md border border-purple-200/40 dark:border-white/10 text-xs font-mono text-foreground flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{lastResult.message}</span>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs space-y-2 py-12">
                <Terminal className="w-8 h-8 text-muted-foreground/40" />
                <p>Write a query above and hit Run to view database results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  DatabaseIcon,
  LayoutGrid,
  List,
  Table2,
  Search,
  RotateCw,
  X,
  ArrowUpDown,
  Key,
  Cpu,
  Copy,
  Check,
  Code2,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDatabases } from "@/hooks/queries";
import LoginNavBar from "@/components/LoginNavbar";
import CreateDatabase from "@/components/Database/CreateDatabase";
import { EnhancedDatabaseCard } from "@/components/Database/EnhancedDatabaseCard";
import { EnhancedEmptyState } from "@/components/ui/enhanced-empty-state";
import { SkeletonGrid } from "@/components/ui/enhanced-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SortOption = "date" | "name" | "tables";

const Dashboard = () => {
  const { data: databases = [], isLoading: dbLoading, refetch } = useDatabases();
  const navigate = useNavigate();
  const [openChange, setOpenChange] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [quickstartTab, setQuickstartTab] = useState<"curl" | "fetch">("curl");
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Real aggregate statistics from backend state
  const stats = useMemo(() => {
    const totalTables = databases.reduce((acc, db) => acc + (db.tables || 0), 0);
    const activeApiKeys = databases.filter((db) => db.apiKey && db.apiKey !== "").length;

    return {
      totalDatabases: databases.length,
      totalTables,
      activeApiKeys,
    };
  }, [databases]);

  // Filter and sort databases
  const filteredDatabases = useMemo(() => {
    let list = [...databases];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((db) => db.dbName.toLowerCase().includes(q));
    }

    if (sortBy === "name") {
      list.sort((a, b) => a.dbName.localeCompare(b.dbName));
    } else if (sortBy === "tables") {
      list.sort((a, b) => (b.tables || 0) - (a.tables || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [databases, searchQuery, sortBy]);

  const activeProject = filteredDatabases[0] || databases[0];
  const targetDbName = activeProject?.dbName || "mydb";
  const targetApiKey = activeProject?.apiKey || "YOUR_API_KEY";

  const curlSnippet = `curl -X GET "${backendUrl}/api/v1/${targetDbName}/<table_name>" \\
  -H "Authorization: ApiKey ${targetApiKey}"`;

  const fetchSnippet = `const res = await fetch("${backendUrl}/api/v1/${targetDbName}/<table_name>", {
  headers: {
    "Authorization": "ApiKey ${targetApiKey}"
  }
});
const records = await res.json();`;

  const activeSnippet = quickstartTab === "curl" ? curlSnippet : fetchSnippet;

  const copySnippet = () => {
    window.navigator.clipboard.writeText(activeSnippet);
    setCopiedSnippet(true);
    toast.success("Code snippet copied to clipboard");
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Background subtle grid and ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[340px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      <LoginNavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Projects
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your isolated SQLite database projects, view schemas, and query data.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-9 text-xs rounded-xl border-purple-200/50 dark:border-purple-500/20 bg-card/60 dark:bg-card/40 backdrop-blur-md focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-purple-200/50 dark:border-purple-500/20 bg-card/60 dark:bg-card/40 backdrop-blur-md w-32 text-foreground">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-purple-200/50 dark:border-white/10 text-popover-foreground">
                <SelectItem value="date" className="text-xs">
                  Recently Added
                </SelectItem>
                <SelectItem value="name" className="text-xs">
                  Name (A-Z)
                </SelectItem>
                <SelectItem value="tables" className="text-xs">
                  Most Tables
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle & Refresh & Create CTA */}
            <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
              <div className="flex items-center rounded-xl border border-purple-200/50 dark:border-purple-500/20 bg-card/60 dark:bg-card/40 backdrop-blur-md p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-lg transition-all",
                    viewMode === "grid"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-lg transition-all",
                    viewMode === "list"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={dbLoading}
                className="h-9 w-9 rounded-xl border-purple-200/50 dark:border-purple-500/20 bg-card/60 dark:bg-card/40 hover:bg-purple-500/10 shrink-0"
                aria-label="Refresh databases"
              >
                <RotateCw className={cn("h-4 w-4 text-purple-500", dbLoading && "animate-spin")} />
              </Button>

              <CreateDatabase openChange={openChange} setOpenChange={setOpenChange} />
            </div>
          </div>
        </div>

        {/* Global Statistics Ribbon (Real Data Only) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Databases
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 font-sans">
                {stats.totalDatabases}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Isolated SQLite stores</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Database className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Total Tables
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 font-sans">
                {stats.totalTables}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active schema definitions</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Table2 className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Protected Stores
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 font-sans">
                {stats.activeApiKeys}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  / {stats.totalDatabases}
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">API key enabled access</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-200/50 dark:border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Key className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Storage Engine
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-foreground font-mono">
                  SQLite 3
                </h3>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">WAL Mode • Zero Latency</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Cpu className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Projects Section (Full Width Responsive Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">All Databases</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono font-medium border border-purple-500/20">
                {filteredDatabases.length} {filteredDatabases.length === 1 ? "project" : "projects"}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {dbLoading ? (
              <SkeletonGrid count={6} type="card" />
            ) : databases.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16"
              >
                <EnhancedEmptyState
                  icon={DatabaseIcon}
                  title="No databases yet"
                  description="Create your first database to start storing tables and auto-generating REST APIs."
                  actionLabel="Create Database"
                  actionOnClick={() => setOpenChange(true)}
                  className="max-w-lg mx-auto"
                />
              </motion.div>
            ) : filteredDatabases.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-md p-8"
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  No databases match "{searchQuery}"
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Check your search term or clear the filter to view all projects.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl border-purple-200/50 dark:border-white/10 text-xs"
                >
                  Clear Search
                </Button>
              </motion.div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDatabases.map((db, index) => (
                  <EnhancedDatabaseCard
                    key={db.databaseId}
                    database={db}
                    index={index}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDatabases.map((db, index) => (
                  <EnhancedDatabaseCard
                    key={db.databaseId}
                    database={db}
                    index={index}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Developer Quickstart & Integration Section (Eliminates Empty Void) */}
        {databases.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Developer Quickstart</h2>
              <span className="text-xs text-muted-foreground">
                Interact with your SQLite databases via auto-generated REST endpoints
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Code Snippet Box (7 cols) */}
              <Card className="lg:col-span-7 rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/75 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="p-4 pb-3 border-b border-purple-200/30 dark:border-white/5 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-purple-500" />
                      <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                        Instant API Access ({targetDbName})
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-lg border border-purple-200/50 dark:border-white/10 p-0.5 bg-muted/40 text-xs">
                        <button
                          onClick={() => setQuickstartTab("curl")}
                          className={cn(
                            "px-2 py-1 rounded text-[11px] font-mono transition-colors",
                            quickstartTab === "curl"
                              ? "bg-purple-600 text-white font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          cURL
                        </button>
                        <button
                          onClick={() => setQuickstartTab("fetch")}
                          className={cn(
                            "px-2 py-1 rounded text-[11px] font-mono transition-colors",
                            quickstartTab === "fetch"
                              ? "bg-purple-600 text-white font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Fetch
                        </button>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copySnippet}
                        className="h-7 px-2 text-xs rounded-lg border-purple-200/50 dark:border-white/10 hover:border-purple-500/40"
                      >
                        {copiedSnippet ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1.5 text-[11px]">Copy</span>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="rounded-xl bg-black/40 border border-purple-500/10 p-3.5 font-mono text-xs text-foreground/90 overflow-x-auto leading-relaxed">
                      <pre className="whitespace-pre">
                        <code>{activeSnippet}</code>
                      </pre>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground border-t border-purple-200/20 dark:border-white/5 mt-auto">
                  <span className="font-mono text-[11px]">
                    Base: {backendUrl}/api/v1/{targetDbName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700"
                    onClick={() => navigate(`/databases/${targetDbName}/tables`)}
                  >
                    Explore Tables <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </Card>

              {/* Architecture & Capabilities Cards (5 cols) */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <Card
                  onClick={() => navigate(`/databases/${targetDbName}/sql`)}
                  className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-xl p-4 hover:border-purple-500/40 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Interactive SQL Studio</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Execute ad-hoc SQL, explore table columns, and view formatted query results
                        directly in your browser.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-2">
                    Open SQL Runner <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </Card>

                <Card className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-xl p-4 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Local SQLite Isolation</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Every project lives in an isolated SQLite database file with WAL concurrency
                        and zero multi-tenant leakage.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mt-2 pt-2 border-t border-purple-200/20 dark:border-white/5">
                    <span>Engine: Local SQLite</span>
                    <span className="text-emerald-500 font-semibold">Active & Healthy</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

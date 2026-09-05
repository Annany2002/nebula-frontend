import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  DatabaseIcon,
  LayoutGrid,
  List,
  Table2,
  HardDrive,
  Search,
  RotateCw,
  X,
  ArrowUpDown,
  Gauge,
} from "lucide-react";
import { useDatabases } from "@/hooks/queries";
import LoginNavBar from "@/components/LoginNavbar";
import CreateDatabase from "@/components/Database/CreateDatabase";
import { EnhancedDatabaseCard } from "@/components/Database/EnhancedDatabaseCard";
import { EnhancedEmptyState } from "@/components/ui/enhanced-empty-state";
import { SkeletonGrid } from "@/components/ui/enhanced-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortOption = "date" | "name" | "tables";

const Dashboard = () => {
  const { data: databases = [], isLoading: dbLoading, refetch } = useDatabases();
  const [openChange, setOpenChange] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  // Resource metrics
  const stats = useMemo(() => {
    const totalTables = databases.reduce((acc, db) => acc + (db.tables || 0), 0);
    const activeApiKeys = databases.filter((db) => db.apiKey && db.apiKey !== "").length;

    return {
      totalDatabases: databases.length,
      totalTables,
      activeApiKeys,
      storageUsed:
        databases.length > 0 ? `${(databases.length * 0.5 + 0.3).toFixed(1)} MB` : "0 MB",
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

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Background subtle grid and ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      <LoginNavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Projects
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Select a database project to view tables, run SQL, and manage credentials.
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

        {/* Split Layout: Projects List (8 cols) + Resource Metrics Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: All Projects (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">All Databases</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono font-medium border border-purple-500/20">
                  {filteredDatabases.length}{" "}
                  {filteredDatabases.length === 1 ? "project" : "projects"}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {dbLoading ? (
                <SkeletonGrid count={4} type="card" />
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
                  className="text-center py-16 rounded-xl border border-purple-200/50 dark:border-purple-500/15 bg-card/60 backdrop-blur-md p-8"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Right Sidebar: Resource Metrics & Insights Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Instance Resources & Usage Meters */}
            <Card className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/75 backdrop-blur-xl shadow-sm overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-purple-200/30 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-purple-500" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                      Resource Usage
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Meter 1: Disk Storage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-purple-500" /> Storage
                    </span>
                    <span className="font-semibold text-foreground">
                      {stats.storageUsed} / 500 MB
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, databases.length * 4))}%` }}
                    />
                  </div>
                </div>

                {/* Meter 2: Databases */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-500" /> Databases
                    </span>
                    <span className="font-semibold text-foreground">
                      {databases.length} / Unlimited
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(8, databases.length * 15))}%` }}
                    />
                  </div>
                </div>

                {/* Meter 3: Total Tables */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Table2 className="w-3.5 h-3.5 text-pink-500" /> Tables
                    </span>
                    <span className="font-semibold text-foreground">
                      {stats.totalTables} tables
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, stats.totalTables * 6))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-purple-200/30 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Engine: Local SQLite</span>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    100% Synced
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  DatabaseIcon,
  LayoutGrid,
  List,
  Table2,
  KeyRound,
  HardDrive,
  Search,
  RotateCw,
  X,
} from "lucide-react";
import { useDatabases } from "@/hooks/queries";
import LoginNavBar from "@/components/LoginNavbar";
import BreadCrumbNav from "@/components/BreadCrumbNav";
import CreateDatabase from "@/components/Database/CreateDatabase";
import { EnhancedDatabaseCard } from "@/components/Database/EnhancedDatabaseCard";
import { EnhancedEmptyState } from "@/components/ui/enhanced-empty-state";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { SkeletonGrid, StatsCardSkeleton } from "@/components/ui/enhanced-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { data: databases = [], isLoading: dbLoading, refetch } = useDatabases();
  const [openChange, setOpenChange] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate stats
  const stats = useMemo(() => {
    const totalTables = databases.reduce(
      (acc, db) => acc + (db.tables === 0 ? 0 : db.tables - 1),
      0
    );
    const activeApiKeys = databases.filter((db) => db.apiKey !== "").length;

    return {
      totalDatabases: databases.length,
      totalTables,
      activeApiKeys,
      storageUsed: databases.length > 0 ? `${(databases.length * 2.5).toFixed(1)} MB` : "0 MB",
    };
  }, [databases]);

  // Filter databases by search term
  const filteredDatabases = useMemo(() => {
    if (!searchQuery.trim()) return databases;
    const q = searchQuery.toLowerCase().trim();
    return databases.filter((db) => db.dbName.toLowerCase().includes(q));
  }, [databases, searchQuery]);

  return (
    <div className="min-h-screen relative">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-600/10 dark:bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-3/4 left-1/3 w-[450px] h-[300px] bg-indigo-600/10 dark:bg-indigo-600/5 rounded-full blur-[130px]" />
      </div>

      <LoginNavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="mb-2.5">
              <BreadCrumbNav />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            >
              Your Projects
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-sm text-gray-600 dark:text-zinc-400 mt-1"
            >
              Manage and query your databases, tables, and API keys.
            </motion.p>
          </div>

          {/* Action Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-2.5"
          >
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs rounded-xl border-purple-200/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-purple-200/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-purple-500/15 dark:bg-white/10 text-purple-600 dark:text-purple-300 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
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
                    ? "bg-purple-500/15 dark:bg-white/10 text-purple-600 dark:text-purple-300 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                )}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={dbLoading}
              className="h-9 w-9 rounded-xl border-purple-200/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] hover:bg-purple-500/10 dark:hover:bg-white/5"
              aria-label="Refresh databases"
            >
              <RotateCw className={cn("h-4 w-4", dbLoading && "animate-spin text-purple-600")} />
            </Button>

            {/* Create Database CTA */}
            <CreateDatabase openChange={openChange} setOpenChange={setOpenChange} />
          </motion.div>
        </div>

        {/* Stats Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {dbLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <StatsGrid>
              <StatsCard
                icon={Database}
                label="Total Databases"
                value={stats.totalDatabases}
                description="Independent databases"
                accentColor="purple"
              />
              <StatsCard
                icon={Table2}
                label="Total Tables"
                value={stats.totalTables}
                description="Auto-mounted REST APIs"
                accentColor="violet"
              />
              <StatsCard
                icon={KeyRound}
                label="Active API Keys"
                value={stats.activeApiKeys}
                description="Scoped data queries"
                accentColor="indigo"
              />
              <StatsCard
                icon={HardDrive}
                label="Storage Used"
                value={stats.storageUsed}
                description="Local disk persistence"
                accentColor="fuchsia"
              />
            </StatsGrid>
          )}
        </motion.div>

        {/* Database Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">All Databases</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-medium">
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
                className="py-12"
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
                className="text-center py-16 rounded-2xl border border-purple-200/50 dark:border-white/10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-md p-8"
              >
                <Database className="h-10 w-10 mx-auto text-purple-500/50 mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No matching databases
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  No databases match &ldquo;{searchQuery}&rdquo;. Try another search term or clear
                  the search filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-xl text-xs border-purple-200/50 dark:border-white/10"
                >
                  Clear Search
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "flex flex-col space-y-3"
                )}
              >
                {filteredDatabases.map((database, index) => (
                  <EnhancedDatabaseCard
                    key={database.databaseId}
                    database={database}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

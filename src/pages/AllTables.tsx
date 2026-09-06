import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, Table2, Columns, BarChart3, Search, RotateCw, X } from "lucide-react";
import { useTables, useDeleteTable } from "@/hooks/queries";
import LoginNavBar from "@/components/LoginNavbar";
import BreadCrumbNav from "@/components/BreadCrumbNav";
import CreateTableSchema from "@/components/Table/CreateTableSchema";
import { EnhancedTableCard } from "@/components/Table/EnhancedTableCard";
import { EnhancedEmptyState } from "@/components/ui/enhanced-empty-state";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { SkeletonGrid, StatsCardSkeleton } from "@/components/ui/enhanced-skeleton";
import { DatabaseApiKey } from "@/components/Database/DatabaseApiKey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AllTables() {
  const { db_name = "" } = useParams();
  const { data: tables = [], isLoading: tableLoading, refetch: refetchTables } = useTables(db_name);
  const { mutate: deleteTableMutation } = useDeleteTable();
  const [openChange, setOpenChange] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate stats
  const stats = useMemo(() => {
    const totalColumns = tables.reduce((acc, table) => acc + table.columns.length, 0);
    const avgColumns = tables.length > 0 ? Math.round(totalColumns / tables.length) : 0;

    return {
      totalTables: tables.length,
      totalColumns,
      avgColumns,
    };
  }, [tables]);

  // Filter tables by search query
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const q = searchQuery.toLowerCase().trim();
    return tables.filter((table) => table.name.toLowerCase().includes(q));
  }, [tables, searchQuery]);

  const deleteTable = (table_name: string) => {
    if (db_name) {
      deleteTableMutation({ dbName: db_name, tableName: table_name });
    }
  };

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="mb-2.5">
              <BreadCrumbNav db_name={db_name} />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            >
              Tables
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-sm text-gray-600 dark:text-zinc-400 mt-1"
            >
              Manage schemas and records for database{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">{db_name}</span>
            </motion.p>
          </div>

          {/* Action Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto"
          >
            {/* Search Input */}
            <div className="relative flex-1 sm:w-52 md:w-60">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-9 text-xs rounded-xl border-purple-200/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md focus:ring-purple-500 w-full"
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

            {/* Action Buttons Group (Never breaks apart) */}
            <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
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

              {/* Refresh button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchTables()}
                disabled={tableLoading}
                className="h-9 w-9 rounded-xl border-purple-200/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] hover:bg-purple-500/10 dark:hover:bg-white/5 shrink-0"
                aria-label="Refresh tables"
              >
                <RotateCw
                  className={cn("h-4 w-4", tableLoading && "animate-spin text-purple-600")}
                />
              </Button>

              {/* Create Table CTA */}
              <CreateTableSchema
                openChange={openChange}
                setOpenChange={setOpenChange}
                db_name={db_name}
              />
            </div>
          </motion.div>
        </div>

        {/* API Key Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <DatabaseApiKey databaseName={db_name} />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {tableLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <StatsGrid className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
              <StatsCard
                icon={Table2}
                label="Total Tables"
                value={stats.totalTables}
                description="Active in database"
                accentColor="purple"
              />
              <StatsCard
                icon={Columns}
                label="Total Columns"
                value={stats.totalColumns}
                description="Across all schemas"
                accentColor="violet"
              />
              <StatsCard
                icon={BarChart3}
                label="Avg Columns/Table"
                value={stats.avgColumns}
                description="Schema density"
                accentColor="indigo"
              />
            </StatsGrid>
          )}
        </motion.div>

        {/* Tables Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">All Tables</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-medium">
                {filteredTables.length} {filteredTables.length === 1 ? "table" : "tables"}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {tableLoading ? (
              <SkeletonGrid count={6} type="table" />
            ) : tables.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8"
              >
                <EnhancedEmptyState
                  icon={Table2}
                  title="No tables yet"
                  description="Create your first table to start storing records and auto-generating REST endpoints."
                  actionLabel="Create Table"
                  actionOnClick={() => setOpenChange(true)}
                  className="max-w-lg mx-auto"
                />
              </motion.div>
            ) : filteredTables.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 rounded-2xl border border-purple-200/50 dark:border-white/10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-md p-8"
              >
                <Table2 className="h-10 w-10 mx-auto text-purple-500/50 mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No matching tables
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  No tables match the query &ldquo;{searchQuery}&rdquo;. Try another search term.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-xl text-xs border-purple-200/50 dark:border-white/10 hover:bg-purple-500/10"
                >
                  Clear search
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  viewMode === "grid"
                    ? "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-3"
                )}
              >
                {filteredTables.map((table, index) => (
                  <EnhancedTableCard
                    key={table.name}
                    table={table}
                    dbName={db_name}
                    onDelete={deleteTable}
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
}

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Table, LayoutGrid, List, Table2, Columns } from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function AllTables() {
  const { db_name } = useParams();
  const {
    data: tables = [],
    isLoading: tableLoading,
    refetch: refetchTables,
  } = useTables(db_name);
  const { mutate: deleteTableMutation, isPending: isDeleting } = useDeleteTable();
  const [openChange, setOpenChange] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const deleteTable = (table_name: string) => {
    if (db_name) {
      deleteTableMutation({ dbName: db_name, tableName: table_name });
    }
  };

  return (
    <div className="min-h-screen">
      <LoginNavBar />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <BreadCrumbNav db_name={db_name} />

        {/* API Key Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DatabaseApiKey databaseName={db_name} />
        </motion.div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold tracking-tight"
            >
              Tables
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Manage tables and records in{" "}
              <span className="font-medium text-primary">{db_name}</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* View toggle */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  viewMode === "grid" && "bg-background shadow-sm"
                )}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  viewMode === "list" && "bg-background shadow-sm"
                )}
                onClick={() => setViewMode("list")}
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
              className="h-9 w-9"
            >
              <motion.div
                animate={tableLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  tableLoading
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : {}
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              </motion.div>
            </Button>

            <CreateTableSchema
              openChange={openChange}
              setOpenChange={setOpenChange}
              db_name={db_name}
            />
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tableLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <StatsCard
                icon={Table2}
                label="Total Tables"
                value={stats.totalTables}
                accentColor="purple"
              />
              <StatsCard
                icon={Columns}
                label="Total Columns"
                value={stats.totalColumns}
                accentColor="violet"
              />
              <StatsCard
                icon={() => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                )}
                label="Avg Columns/Table"
                value={stats.avgColumns}
                accentColor="indigo"
              />
            </div>
          )}
        </motion.div>

        {/* Table Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Tables</h2>
            <span className="text-sm text-muted-foreground">
              {tables.length} {tables.length === 1 ? "table" : "tables"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {tableLoading ? (
              <SkeletonGrid count={6} type="table" />
            ) : tables.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EnhancedEmptyState
                  icon={Table}
                  title="No tables yet"
                  description="Create your first table to start storing data. Tables help you organize and structure your data efficiently."
                  actionLabel="Create Table"
                  actionOnClick={() => setOpenChange(true)}
                  className="max-w-lg mx-auto"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "grid gap-4",
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-w-3xl"
                )}
              >
                {tables.map((table, index) => (
                  <EnhancedTableCard
                    key={table.name}
                    table={table}
                    dbName={db_name || ""}
                    onDelete={deleteTable}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, DatabaseIcon, LayoutGrid, List, Table2 } from "lucide-react";
import { useDatabases } from "@/hooks/queries";
import LoginNavBar from "@/components/LoginNavbar";
import BreadCrumbNav from "@/components/BreadCrumbNav";
import CreateDatabase from "@/components/Database/CreateDatabase";
import { EnhancedDatabaseCard } from "@/components/Database/EnhancedDatabaseCard";
import { EnhancedEmptyState } from "@/components/ui/enhanced-empty-state";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { SkeletonGrid, StatsCardSkeleton } from "@/components/ui/enhanced-skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { data: databases = [], isLoading: dbLoading, refetch } = useDatabases();
  const [openChange, setOpenChange] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      storageUsed: databases.length > 0 ? `${databases.length * 2.5}MB` : "0MB",
    };
  }, [databases]);

  return (
    <div className="min-h-screen">
      <LoginNavBar />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <BreadCrumbNav />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold tracking-tight"
            >
              Your Projects
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              View and manage all your databases in one place.
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
              onClick={() => refetch()}
              disabled={dbLoading}
              className="h-9 w-9"
            >
              <motion.div
                animate={dbLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={dbLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
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

            <CreateDatabase openChange={openChange} setOpenChange={setOpenChange} />
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {dbLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                accentColor="purple"
              />
              <StatsCard
                icon={Table2}
                label="Total Tables"
                value={stats.totalTables}
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
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                )}
                label="Active API Keys"
                value={stats.activeApiKeys}
                accentColor="indigo"
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
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                )}
                label="Storage Used"
                value={stats.storageUsed}
                accentColor="fuchsia"
              />
            </StatsGrid>
          )}
        </motion.div>

        {/* Database Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Databases</h2>
            <span className="text-sm text-muted-foreground">
              {databases.length} {databases.length === 1 ? "project" : "projects"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {dbLoading ? (
              <SkeletonGrid count={6} type="card" />
            ) : databases.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EnhancedEmptyState
                  icon={DatabaseIcon}
                  title="No databases yet"
                  description="Create your first database to start building your application. Your databases will appear here once created."
                  actionLabel="Create Database"
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
                {databases.map((database, index) => (
                  <EnhancedDatabaseCard
                    key={database.databaseId}
                    database={database}
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
};

export default Dashboard;

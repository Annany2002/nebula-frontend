import { useMemo, useState } from "react";
import {
  Database,
  LayoutGrid,
  List,
  Search,
  RotateCw,
  X,
  ArrowUpDown,
  Table2,
  AlertCircle,
} from "lucide-react";
import { useDatabases } from "@/hooks/queries";
import LoginNavBar from "@/components/LoginNavbar";
import CreateDatabase from "@/components/Database/CreateDatabase";
import { EnhancedDatabaseCard } from "@/components/Database/EnhancedDatabaseCard";
import DatabaseQuickstart from "@/components/Dashboard/DatabaseQuickstart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import "@/styles/dashboard.css";

type SortOption = "date" | "name" | "tables";

const Dashboard = () => {
  const { data: databases = [], isLoading, isFetching, isError, refetch } = useDatabases();
  const [openChange, setOpenChange] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  const filteredDatabases = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const list = databases.filter((db) => db.dbName.toLowerCase().includes(query));
    return list.sort((a, b) => {
      if (sortBy === "name") return a.dbName.localeCompare(b.dbName);
      if (sortBy === "tables") return (b.tables || 0) - (a.tables || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [databases, searchQuery, sortBy]);
  const totalTables = databases.reduce((total, db) => total + (db.tables || 0), 0);

  return (
    <div className="nebula-dashboard min-h-screen bg-background text-foreground">
      <LoginNavBar />
      <main className="db-dashboard-main">
        <header className="db-page-header">
          <div>
            <p className="db-workspace-label">Your workspace</p>
            <h1>Projects</h1>
            <p className="db-page-description">Build, explore, and connect your databases.</p>
          </div>
          <CreateDatabase openChange={openChange} setOpenChange={setOpenChange} />
        </header>

        <section aria-labelledby="databases-heading" className="db-projects-section">
          <div className="db-section-heading">
            <h2 id="databases-heading">Databases</h2>
            {!isLoading && !isError && (
              <p className="db-inventory" aria-live="polite">
                <span>
                  <Database size={14} aria-hidden="true" />
                  {databases.length} {databases.length === 1 ? "database" : "databases"}
                </span>
                <span>
                  <Table2 size={14} aria-hidden="true" />
                  {totalTables} {totalTables === 1 ? "table" : "tables"}
                </span>
              </p>
            )}
          </div>
          <div className="db-toolbar">
            <div className="db-search">
              <Search size={17} aria-hidden="true" />
              <Input
                type="search"
                aria-label="Search databases"
                placeholder="Search databases…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery && (
                <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")}>
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="db-toolbar-actions">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="db-sort" aria-label="Sort databases">
                  <ArrowUpDown size={14} aria-hidden="true" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest first</SelectItem>
                  <SelectItem value="name">Name: A–Z</SelectItem>
                  <SelectItem value="tables">Most tables</SelectItem>
                </SelectContent>
              </Select>
              <div className="db-view-toggle" role="group" aria-label="Database layout">
                {(["grid", "list"] as const).map((view) => {
                  const Icon = view === "grid" ? LayoutGrid : List;
                  return (
                    <Button
                      key={view}
                      variant="ghost"
                      size="icon"
                      aria-label={`${view === "grid" ? "Grid" : "List"} view`}
                      aria-pressed={viewMode === view}
                      onClick={() => setViewMode(view)}
                    >
                      <Icon size={17} aria-hidden="true" />
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="db-refresh"
                aria-label="Refresh databases"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                <RotateCw
                  className={cn("h-4 w-4", isFetching && "animate-spin motion-reduce:animate-none")}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
          {searchQuery.trim() && !isLoading && (
            <p className="db-search-summary" role="status">
              {filteredDatabases.length} {filteredDatabases.length === 1 ? "result" : "results"} for
              “{searchQuery.trim()}”
            </p>
          )}
          {isError && (
            <div className="db-fetch-error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <p>We couldn’t refresh your databases. Try again.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                Retry
              </Button>
            </div>
          )}
          {isLoading ? (
            <div className="db-project-grid" role="status" aria-label="Loading databases">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : databases.length === 0 && !isError ? (
            <div className="db-empty-state">
              <Database size={32} aria-hidden="true" />
              <h3>A home for your next idea.</h3>
              <p>Create a database, add your first table, and connect your app.</p>
              <Button onClick={() => setOpenChange(true)}>Create your first database</Button>
            </div>
          ) : filteredDatabases.length === 0 && databases.length > 0 ? (
            <div className="db-empty-state">
              <Search size={28} aria-hidden="true" />
              <h3>No matching databases</h3>
              <p>Try another name or clear the search to see all your projects.</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "db-project-grid" : "db-project-list"}>
              {filteredDatabases.map((database) => (
                <EnhancedDatabaseCard
                  key={database.databaseId}
                  database={database}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </section>
        {databases.length > 0 && <DatabaseQuickstart databases={databases} />}
      </main>
    </div>
  );
};

export default Dashboard;

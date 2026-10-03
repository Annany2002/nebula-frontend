import { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import StudioRail, { StudioTab } from "@/components/Studio/StudioRail";
import StudioTopBar from "@/components/Studio/StudioTopBar";
import ProjectOverview from "@/components/Studio/ProjectOverview";
import TableEditor from "@/components/Studio/TableEditor";
import SqlEditor from "@/components/Studio/SqlEditor";
import ProjectSettings from "@/components/Studio/ProjectSettings";
import DatabaseSubSidebar, { DatabaseSubTab } from "@/components/Studio/DatabaseSubSidebar";
import SchemaVisualizer from "@/components/Studio/SchemaVisualizer";
import DatabaseObjectsView from "@/components/Studio/DatabaseObjectsView";
import ApiKeys from "@/components/Studio/ApiKeys";
import CreateTableSchema from "@/components/Table/CreateTableSchema";
import ConnectModal from "@/components/Studio/ConnectModal";
import { useTables, useDatabaseDetails } from "@/hooks/queries";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import "@/styles/studio.css";

export default function DatabaseStudio() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const db_name = params.db_name || "";
  const matchTable = location.pathname.match(/\/tables\/([^/]+)/);
  const table_name = params.table_name || (matchTable ? matchTable[1] : "");

  const currentTab = useMemo<StudioTab>(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const section = segments[2] || "overview";
    if (section === "overview") return "overview";
    if (section === "visualizer" || section === "database") return "database";
    if (section === "tables") return "editor";
    if (section === "sql") return "sql";
    if (section === "apikeys") return "apikeys";
    if (section === "settings") return "settings";
    return "overview";
  }, [location.pathname]);

  const databaseSubTab = useMemo<DatabaseSubTab>(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const section = segments[2];
    if (section === "visualizer") return "visualizer";
    if (section === "database") {
      const sub = segments[3];
      if (sub === "indexes" || sub === "triggers" || sub === "backups" || sub === "tables") {
        return sub;
      }
      return "visualizer";
    }
    return "visualizer";
  }, [location.pathname]);

  const [subSidebarCollapsed, setSubSidebarCollapsed] = useState(false);
  const [activeTableState, setActiveTableState] = useState<string>("");
  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  // Queries
  const {
    data: tables = [],
    isLoading: tablesLoading,
    isError: tablesError,
    refetch: refetchTables,
  } = useTables(db_name);

  const activeTable = table_name || activeTableState || tables[0]?.name || "";
  const {
    data: dbDetails,
    isError: detailsError,
    refetch: refetchDetails,
  } = useDatabaseDetails(db_name);

  // Handle primary rail tab change
  const handleTabChange = (tab: StudioTab) => {
    if (tab === "overview") {
      navigate(`/databases/${db_name}/overview`);
    } else if (tab === "database") {
      navigate(`/databases/${db_name}/visualizer`);
    } else if (tab === "sql") {
      navigate(`/databases/${db_name}/sql`);
    } else if (tab === "apikeys") {
      navigate(`/databases/${db_name}/apikeys`);
    } else if (tab === "settings") {
      navigate(`/databases/${db_name}/settings`);
    } else if (tab === "editor") {
      const targetTable = activeTable || (tables[0]?.name ?? "");
      if (targetTable) {
        navigate(`/databases/${db_name}/tables/${targetTable}`);
      } else {
        navigate(`/databases/${db_name}/tables`);
      }
    }
  };

  // Handle secondary database sub-sidebar navigation
  const handleSubTabChange = (subTab: DatabaseSubTab) => {
    if (subTab === "visualizer") {
      navigate(`/databases/${db_name}/visualizer`);
    } else {
      navigate(`/databases/${db_name}/database/${subTab}`);
    }
  };

  // Handle table switch in editor
  const handleSelectTable = (tblName: string) => {
    setActiveTableState(tblName);
    navigate(tblName ? `/databases/${db_name}/tables/${tblName}` : `/databases/${db_name}/tables`);
  };

  if (!db_name) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
        No database specified
      </div>
    );
  }

  const currentUserId = user?.userId || localStorage.getItem("user_id") || "";

  return (
    <div className="nebula-studio">
      {/* Primary Sidebar Rail (Leftmost) */}
      <StudioRail
        currentTab={currentTab}
        onTabChange={handleTabChange}
        dbName={db_name}
        userId={currentUserId}
      />

      {/* Main Studio Area */}
      <div className="studio-main">
        {/* Top Header Bar */}
        <StudioTopBar
          dbName={db_name}
          currentTab={currentTab}
          apiKey={dbDetails?.apiKey || ""}
          userId={currentUserId}
        />

        {/* Tab Content Panes */}
        <div className="studio-workspace">
          {currentTab === "database" && (
            <DatabaseSubSidebar
              currentSubTab={databaseSubTab}
              onSubTabChange={handleSubTabChange}
              collapsed={subSidebarCollapsed}
              onToggleCollapse={() => setSubSidebarCollapsed((previous) => !previous)}
            />
          )}
          <main className="studio-content">
            {tablesLoading && tables.length === 0 ? (
              <div className="studio-load-state" role="status" aria-label="Loading database">
                <Loader2 className="w-6 h-6 animate-spin motion-reduce:animate-none text-primary" />
                <p>Loading your database…</p>
              </div>
            ) : tablesError && tables.length === 0 ? (
              <div className="studio-load-state" role="alert">
                <AlertCircle className="text-primary" />
                <h1>We couldn’t load this database.</h1>
                <p>Please try again to load its tables.</p>
                <Button variant="outline" size="sm" onClick={() => refetchTables()}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {currentTab === "overview" && (
                  <ProjectOverview
                    key={db_name}
                    dbName={db_name}
                    details={dbDetails}
                    detailsError={detailsError}
                    onRetryDetails={() => refetchDetails()}
                    tables={tables}
                    onNavigateTab={handleTabChange}
                    onSelectTable={handleSelectTable}
                    onOpenCreateTable={() => setCreateTableOpen(true)}
                    onOpenConnect={() => setConnectOpen(true)}
                  />
                )}

                {/* Database Tab: Either Schema Visualizer or Database Objects View */}
                {currentTab === "database" && (
                  <>
                    {databaseSubTab === "visualizer" ? (
                      <SchemaVisualizer dbName={db_name} onSelectTable={handleSelectTable} />
                    ) : (
                      <DatabaseObjectsView
                        dbName={db_name}
                        subView={databaseSubTab}
                        onSelectTable={handleSelectTable}
                        onOpenCreateTable={() => setCreateTableOpen(true)}
                      />
                    )}
                  </>
                )}

                {currentTab === "editor" && (
                  <TableEditor
                    dbName={db_name}
                    tables={tables}
                    activeTable={activeTable}
                    onSelectTable={handleSelectTable}
                    onOpenCreateTable={() => setCreateTableOpen(true)}
                    onRefetchTables={refetchTables}
                  />
                )}

                {currentTab === "sql" && <SqlEditor dbName={db_name} tables={tables} />}

                {currentTab === "apikeys" && <ApiKeys key={db_name} dbName={db_name} />}

                {currentTab === "settings" && (
                  <ProjectSettings dbName={db_name} details={dbDetails} tables={tables} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Create Table Schema Modal */}
      {createTableOpen && (
        <CreateTableSchema
          db_name={db_name}
          openChange={createTableOpen}
          setOpenChange={setCreateTableOpen}
        />
      )}

      {/* Connect Modal */}
      <ConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        dbName={db_name}
        apiKey={dbDetails?.apiKey || ""}
      />
    </div>
  );
}

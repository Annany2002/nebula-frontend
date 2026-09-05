import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import StudioRail, { StudioTab } from "@/components/Studio/StudioRail";
import StudioTopBar from "@/components/Studio/StudioTopBar";
import ProjectOverview from "@/components/Studio/ProjectOverview";
import TableEditor from "@/components/Studio/TableEditor";
import SqlEditor from "@/components/Studio/SqlEditor";
import ProjectSettings from "@/components/Studio/ProjectSettings";
import DatabaseSubSidebar, { DatabaseSubTab } from "@/components/Studio/DatabaseSubSidebar";
import SchemaVisualizer from "@/components/Studio/SchemaVisualizer";
import DatabaseObjectsView from "@/components/Studio/DatabaseObjectsView";
import { DatabaseApiKey } from "@/components/Database/DatabaseApiKey";
import CreateTableSchema from "@/components/Table/CreateTableSchema";
import { useTables, useDatabaseDetails } from "@/hooks/queries";
import { useAuth } from "@/context/auth-context";

export default function DatabaseStudio() {
  const { db_name = "", table_name = "", sub_tab = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getInitialTab = (): StudioTab => {
    const path = location.pathname;
    if (path.includes("/visualizer") || path.includes("/database")) return "database";
    if (path.includes("/tables")) return "editor";
    if (path.includes("/sql")) return "sql";
    if (path.includes("/apikeys")) return "apikeys";
    if (path.includes("/settings")) return "settings";
    return "overview";
  };

  const getInitialSubTab = (): DatabaseSubTab => {
    const path = location.pathname;
    if (path.includes("/database/indexes")) return "indexes";
    if (path.includes("/database/triggers")) return "triggers";
    if (path.includes("/database/backups")) return "backups";
    if (path.includes("/database/tables")) return "tables";
    return "visualizer";
  };

  const [currentTab, setCurrentTab] = useState<StudioTab>(getInitialTab);
  const [databaseSubTab, setDatabaseSubTab] = useState<DatabaseSubTab>(getInitialSubTab);
  const [subSidebarCollapsed, setSubSidebarCollapsed] = useState(false);
  const [activeTable, setActiveTable] = useState<string>(table_name);
  const [createTableOpen, setCreateTableOpen] = useState(false);

  // Queries
  const {
    data: tables = [],
    isLoading: tablesLoading,
    refetch: refetchTables,
  } = useTables(db_name);

  const { data: dbDetails } = useDatabaseDetails(db_name);

  // Keep tab in sync with location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/visualizer") || path.includes("/database")) {
      setCurrentTab("database");
      if (path.includes("/database/indexes")) setDatabaseSubTab("indexes");
      else if (path.includes("/database/triggers")) setDatabaseSubTab("triggers");
      else if (path.includes("/database/backups")) setDatabaseSubTab("backups");
      else if (path.includes("/database/tables")) setDatabaseSubTab("tables");
      else setDatabaseSubTab("visualizer");
    } else if (path.includes("/tables")) {
      setCurrentTab("editor");
    } else if (path.includes("/sql")) {
      setCurrentTab("sql");
    } else if (path.includes("/apikeys")) {
      setCurrentTab("apikeys");
    } else if (path.includes("/settings")) {
      setCurrentTab("settings");
    } else {
      setCurrentTab("overview");
    }
  }, [location.pathname]);

  // Keep URL and active table in sync
  useEffect(() => {
    if (table_name) {
      setActiveTable(table_name);
      setCurrentTab("editor");
    } else if (tables.length > 0 && !activeTable) {
      setActiveTable(tables[0].name);
    }
  }, [table_name, tables, activeTable]);

  // Handle primary rail tab change
  const handleTabChange = (tab: StudioTab) => {
    setCurrentTab(tab);
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
    setDatabaseSubTab(subTab);
    if (subTab === "visualizer") {
      navigate(`/databases/${db_name}/visualizer`);
    } else {
      navigate(`/databases/${db_name}/database/${subTab}`);
    }
  };

  // Handle table switch in editor
  const handleSelectTable = (tblName: string) => {
    setActiveTable(tblName);
    setCurrentTab("editor");
    navigate(`/databases/${db_name}/tables/${tblName}`);
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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased relative">
      {/* Background ambient cosmic glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Primary Sidebar Rail (Leftmost) */}
      <StudioRail
        currentTab={currentTab}
        onTabChange={handleTabChange}
        dbName={db_name}
        userId={currentUserId}
      />

      {/* Secondary Sub-Sidebar (Active when Database tab is selected) */}
      {currentTab === "database" && (
        <DatabaseSubSidebar
          currentSubTab={databaseSubTab}
          onSubTabChange={handleSubTabChange}
          collapsed={subSidebarCollapsed}
          onToggleCollapse={() => setSubSidebarCollapsed((prev) => !prev)}
        />
      )}

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <StudioTopBar
          dbName={db_name}
          currentTab={currentTab}
          apiKey={dbDetails?.apiKey || ""}
          userId={currentUserId}
        />

        {/* Tab Content Panes */}
        <main className="flex-1 flex overflow-hidden relative">
          {tablesLoading && tables.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-background/50">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <>
              {currentTab === "overview" && (
                <ProjectOverview
                  dbName={db_name}
                  details={dbDetails}
                  tables={tables}
                  onNavigateTab={handleTabChange}
                  onSelectTable={handleSelectTable}
                  onOpenCreateTable={() => setCreateTableOpen(true)}
                  onOpenConnect={() => {
                    const topConnectBtn = document.querySelector(
                      'button[data-connect-trigger="true"]'
                    );
                    if (topConnectBtn) (topConnectBtn as HTMLButtonElement).click();
                  }}
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

              {currentTab === "apikeys" && (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto">
                    <DatabaseApiKey databaseName={db_name} />
                  </div>
                </div>
              )}

              {currentTab === "settings" && (
                <ProjectSettings dbName={db_name} details={dbDetails} tables={tables} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Create Table Schema Modal */}
      {createTableOpen && (
        <CreateTableSchema
          db_name={db_name}
          openChange={createTableOpen}
          setOpenChange={setCreateTableOpen}
        />
      )}
    </div>
  );
}

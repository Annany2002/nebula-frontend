import { useState, useMemo } from "react";
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
import ConnectModal from "@/components/Studio/ConnectModal";
import { useTables, useDatabaseDetails } from "@/hooks/queries";
import { useAuth } from "@/context/auth-context";

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
    refetch: refetchTables,
  } = useTables(db_name);

  const activeTable = table_name || activeTableState || tables[0]?.name || "";
  const { data: dbDetails } = useDatabaseDetails(db_name);

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

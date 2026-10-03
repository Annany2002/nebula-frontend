import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, Database, Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDatabases } from "@/hooks/queries";
import UserDropDown from "@/components/UserDropDown";
import { StudioTab } from "./StudioRail";

interface StudioTopBarProps {
  dbName: string;
  currentTab?: StudioTab;
  onConnect: () => void;
  userId?: string;
}
const tabLabels: Record<StudioTab, string> = {
  overview: "Overview",
  editor: "Table editor",
  database: "Database",
  sql: "SQL editor",
  apikeys: "API keys",
  settings: "Settings",
};
export default function StudioTopBar({
  dbName,
  currentTab = "overview",
  onConnect,
  userId,
}: StudioTopBarProps) {
  const navigate = useNavigate();
  const { data: databases = [], isLoading, isError, refetch } = useDatabases();
  const resolvedUserId = userId || localStorage.getItem("user_id") || "";
  const dashboardLink = resolvedUserId ? `/dashboard/${resolvedUserId}` : "/";
  return (
    <>
      <header className="studio-topbar">
        <div className="studio-breadcrumbs">
          <Link to={dashboardLink} className="studio-topbar-projects">
            Projects
          </Link>
          <span className="studio-topbar-projects" aria-hidden="true">
            /
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="studio-db-switcher"
                aria-label={`Switch database, current ${dbName}`}
              >
                <Database size={15} />
                <span title={dbName}>{dbName}</span>
                <ChevronDown size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Switch database
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoading ? (
                <DropdownMenuItem disabled>Loading databases…</DropdownMenuItem>
              ) : isError ? (
                <DropdownMenuItem onSelect={() => refetch()}>
                  Retry loading databases
                </DropdownMenuItem>
              ) : (
                databases.map((db) => (
                  <DropdownMenuItem
                    key={db.databaseId}
                    onSelect={() => {
                      if (db.dbName !== dbName) navigate(`/databases/${db.dbName}/overview`);
                    }}
                    className="gap-2 text-xs"
                  >
                    <Database size={14} className="shrink-0 text-primary" />
                    <span className="flex-1 truncate">{db.dbName}</span>
                    {db.dbName === dbName && <Check size={14} className="text-primary" />}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={dashboardLink}>Manage projects</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="studio-topbar-section">
            <span aria-hidden="true">/</span>
            {tabLabels[currentTab]}
          </span>
        </div>
        <div className="studio-topbar-actions">
          <Button
            size="sm"
            variant="outline"
            className="studio-connect-button"
            onClick={onConnect}
            aria-label="Connect to database"
          >
            <Globe size={15} />
            <span>Connect</span>
          </Button>
          <UserDropDown />
        </div>
      </header>
    </>
  );
}

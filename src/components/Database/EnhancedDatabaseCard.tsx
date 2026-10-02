import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Copy,
  Database,
  Key,
  MoreHorizontal,
  Table2,
  Trash2,
  Terminal,
  Home,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteDatabase } from "@/hooks/queries";
import { toast } from "sonner";
import type { DataBaseType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import { url } from "@/lib/config";

interface EnhancedDatabaseCardProps {
  database: DataBaseType;
  viewMode?: "grid" | "list";
}

export function EnhancedDatabaseCard({ database, viewMode = "grid" }: EnhancedDatabaseCardProps) {
  const { mutate: deleteDatabase, isPending } = useDeleteDatabase();
  const navigate = useNavigate();
  const basePath = `/databases/${encodeURIComponent(database.dbName)}`;
  const tableCount = database.tables || 0;
  const createdDate = new Date(database.createdAt);
  const validDate = Number.isFinite(createdDate.getTime());
  const createdLabel = validDate
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(createdDate)
    : "Date unavailable";

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Couldn’t copy ${label.toLowerCase()}. Please try again.`);
    }
  };

  return (
    <article
      className={`db-project-card ${viewMode === "list" ? "is-list" : ""}`}
      aria-label={`Database ${database.dbName}`}
    >
      <Link
        className="db-project-link"
        to={`${basePath}/overview`}
        aria-label={`Open ${database.dbName} in Studio`}
      >
        <div className="db-project-identity">
          <span className="db-project-icon">
            <Database size={23} aria-hidden="true" />
          </span>
          <div className="db-project-name">
            <h3 title={database.dbName}>{database.dbName}</h3>
            <span>SQLite database</span>
          </div>
        </div>
        <div className="db-project-details">
          <span>
            <Table2 size={14} aria-hidden="true" />
            {tableCount} {tableCount === 1 ? "table" : "tables"}
          </span>
          <span className="db-project-hint">
            {tableCount === 0 ? "Create your first table" : "Explore your data"}
          </span>
        </div>
        <div className="db-project-footer">
          <span title={formatDateTime(database.createdAt)}>Created {createdLabel}</span>
          <span className="db-open-studio">
            Open Studio <ArrowRight size={15} aria-hidden="true" />
          </span>
        </div>
      </Link>
      <div className="db-project-menu">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              aria-label={`Actions for ${database.dbName}`}
            >
              <MoreHorizontal size={19} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate(`${basePath}/overview`)}>
              <Home size={15} className="mr-2" />
              Overview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`${basePath}/tables`)}>
              <Table2 size={15} className="mr-2" />
              Table editor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`${basePath}/sql`)}>
              <Terminal size={15} className="mr-2" />
              SQL runner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`${basePath}/apikeys`)}>
              <Key size={15} className="mr-2" />
              Manage API keys
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                copy(
                  `${url.replace(/\/$/, "")}/api/v1/${encodeURIComponent(database.dbName)}`,
                  "REST URL"
                )
              }
            >
              <Code2 size={15} className="mr-2" />
              Copy REST URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copy(database.dbName, "Database name")}>
              <Copy size={15} className="mr-2" />
              Copy database name
            </DropdownMenuItem>
            {database.apiKey && (
              <DropdownMenuItem onClick={() => copy(database.apiKey, "API key")}>
                <Key size={15} className="mr-2" />
                Copy API key
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => {
                if (
                  window.confirm(
                    `Delete database "${database.dbName}"? This permanently removes its tables and records.`
                  )
                )
                  deleteDatabase(database.dbName);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={15} className="mr-2" />
              Delete database
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export default EnhancedDatabaseCard;

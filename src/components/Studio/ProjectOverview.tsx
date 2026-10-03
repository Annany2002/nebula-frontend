import { useState } from "react";
import {
  Terminal,
  Globe,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  AlertTriangle,
  Table2,
  Search,
  Network,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableType, DatabaseDetailType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import { useDatabaseAnalytics } from "@/hooks/queries";
import { toast } from "sonner";
import { StudioTab } from "./StudioRail";
import { url } from "@/lib/config";

interface ProjectOverviewProps {
  dbName: string;
  details?: DatabaseDetailType;
  tables: TableType[];
  detailsError?: boolean;
  onRetryDetails?: () => void;
  onNavigateTab: (tab: StudioTab) => void;
  onSelectTable: (tableName: string) => void;
  onOpenCreateTable: () => void;
  onOpenConnect: () => void;
}

export default function ProjectOverview({
  dbName,
  details,
  tables,
  detailsError,
  onRetryDetails,
  onNavigateTab,
  onSelectTable,
  onOpenCreateTable,
  onOpenConnect,
}: ProjectOverviewProps) {
  const [copied, setCopied] = useState<"url" | "key" | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [search, setSearch] = useState("");
  const { data: analytics } = useDatabaseAnalytics(dbName);
  const totalRecords =
    details?.totalRecords ??
    (tables.every((table) => table.rowCount !== undefined)
      ? tables.reduce((total, table) => total + (table.rowCount ?? 0), 0)
      : undefined);
  const projectUrl = `${url}/api/v1/databases/${dbName}`;
  const visibleTables = tables.filter((table) =>
    table.name.toLowerCase().includes(search.toLowerCase())
  );
  const copy = async (text: string, kind: "url" | "key") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      toast.success(kind === "url" ? "API URL copied" : "API key copied");
      setTimeout(() => setCopied((current) => (current === kind ? null : current)), 2000);
    } catch {
      toast.error("Couldn’t copy. Please try again.");
    }
  };
  return (
    <div className="studio-page-scroll">
      <div className="studio-overview">
        <header className="studio-page-heading">
          <div>
            <p className="studio-eyebrow">DATABASE OVERVIEW</p>
            <h1 title={dbName}>{dbName}</h1>
            <p>Your schema, data, and app connections in one place.</p>
          </div>
          <div className="studio-page-actions">
            <Button variant="outline" size="sm" onClick={() => onNavigateTab("sql")}>
              <Terminal size={15} />
              SQL editor
            </Button>
            <Button size="sm" onClick={onOpenCreateTable}>
              <Plus size={15} />
              New table
            </Button>
          </div>
        </header>
        {detailsError && (
          <div className="studio-inline-error" role="alert">
            <span>Database details couldn’t be loaded.</span>
            <button type="button" onClick={onRetryDetails}>
              Retry
            </button>
          </div>
        )}
        <dl className="studio-overview-metrics">
          <div>
            <dt>Tables</dt>
            <dd>{tables.length.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Records</dt>
            <dd>{totalRecords?.toLocaleString() ?? "—"}</dd>
          </div>
          <div>
            <dt>Storage used</dt>
            <dd>{details?.sizeDisplay || "—"}</dd>
          </div>
          <div>
            <dt>Storage engine</dt>
            <dd className="studio-metric-engine">
              <Database size={18} />
              SQLite
            </dd>
          </div>
        </dl>
        <div className="studio-overview-layout">
          <section className="studio-overview-tables" aria-labelledby="overview-tables-heading">
            <div className="studio-section-heading">
              <div>
                <h2 id="overview-tables-heading">
                  Your tables <span>{tables.length}</span>
                </h2>
                <p>Choose a table to explore its records.</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigateTab("database")}
                aria-label="View schema"
              >
                <Network size={15} />
                <span>Schema</span>
              </Button>
            </div>
            {tables.length > 0 ? (
              <>
                <div className="studio-table-search">
                  <Search size={15} />
                  <Input
                    type="search"
                    aria-label="Search tables"
                    placeholder="Find a table…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="studio-overview-table-list">
                  {visibleTables.length ? (
                    visibleTables.map((table) => (
                      <button
                        type="button"
                        key={table.name}
                        onClick={() => onSelectTable(table.name)}
                        className="studio-overview-table"
                        aria-label={`Open ${table.name}`}
                      >
                        <span className="studio-table-icon">
                          <Table2 size={17} />
                        </span>
                        <span className="studio-table-name">
                          <strong title={table.name}>{table.name}</strong>
                          <span>
                            {table.columns.length}{" "}
                            {table.columns.length === 1 ? "column" : "columns"}
                          </span>
                        </span>
                        <span className="studio-table-rows">
                          {table.rowCount === undefined
                            ? "—"
                            : `${table.rowCount.toLocaleString()} ${table.rowCount === 1 ? "row" : "rows"}`}
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    ))
                  ) : (
                    <div className="studio-table-no-results">
                      <p>No tables match “{search}”.</p>
                      <button type="button" onClick={() => setSearch("")}>
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="studio-overview-empty">
                <Table2 size={27} />
                <h3>Start with your first table.</h3>
                <p>Define its columns, then add records or connect your app.</p>
                <Button size="sm" onClick={onOpenCreateTable}>
                  <Plus size={15} />
                  Create table
                </Button>
              </div>
            )}
          </section>
          <aside
            className="studio-overview-connection"
            aria-labelledby="overview-connection-heading"
          >
            <div className="studio-connection-heading">
              <Globe size={18} />
              <h2 id="overview-connection-heading">Connect your app</h2>
            </div>
            <p>Use your database’s REST API from any application.</p>
            <p className="studio-credential-label" id="overview-url-label">
              API base URL
            </p>
            <div className="studio-credential">
              <code aria-labelledby="overview-url-label" title={projectUrl}>
                {projectUrl}
              </code>
              <button
                type="button"
                onClick={() => copy(projectUrl, "url")}
                aria-label={copied === "url" ? "API URL copied" : "Copy API URL"}
              >
                {copied === "url" ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
            {details?.apiKey ? (
              <>
                <p className="studio-credential-label" id="overview-key-label">
                  API key
                </p>
                <div className="studio-credential">
                  <code aria-labelledby="overview-key-label">
                    {showKey ? details.apiKey : "••••••••••••••••••••••••"}
                  </code>
                  <button
                    type="button"
                    onClick={() => setShowKey((value) => !value)}
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                    aria-pressed={showKey}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(details.apiKey, "key")}
                    aria-label={copied === "key" ? "API key copied" : "Copy API key"}
                  >
                    {copied === "key" ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="studio-key-link"
                onClick={() => onNavigateTab("apikeys")}
              >
                <KeyRound size={15} />
                Manage your API keys
                <ArrowRight size={14} />
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="studio-connection-examples"
              onClick={onOpenConnect}
            >
              View connection examples
              <ArrowRight size={15} />
            </Button>
            <dl className="studio-created-at">
              <dt>Created</dt>
              <dd>
                {details?.createdAt ? (
                  <time dateTime={details.createdAt}>{formatDateTime(details.createdAt)}</time>
                ) : (
                  "Date unavailable"
                )}
              </dd>
            </dl>
          </aside>
        </div>
        {analytics && analytics.totalRequests > 0 && (
          <div className="studio-overview-traffic">
            <span>
              API activity <strong>{analytics.totalRequests.toLocaleString()} requests</strong>
            </span>
            {analytics.successRate !== undefined && (
              <span>
                <strong>{analytics.successRate.toFixed(1)}%</strong> successful
              </span>
            )}
            <span>{analytics.timeframe}</span>
          </div>
        )}
        {!!analytics?.advisor?.length && (
          <section className="studio-advisor" aria-labelledby="advisor-heading">
            <h2 id="advisor-heading">Schema advisor</h2>
            {analytics.advisor.map((issue) => (
              <div key={issue.id} className="studio-advisor-issue">
                <AlertTriangle size={17} />
                <div>
                  <h3>
                    {issue.title}
                    <span>{issue.severity}</span>
                  </h3>
                  <p>{issue.description}</p>
                  {issue.suggestion && <p>{issue.suggestion}</p>}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ListFilter,
  Zap,
  RefreshCw,
  Search,
  Terminal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndexInfo, TriggerInfo } from "@/types/allType";
import { useDatabaseObjects, useTables } from "@/hooks/queries";
import "@/styles/database-sql-objects.css";

const uniqueOf = (object: IndexInfo | TriggerInfo) =>
  "unique" in object ? object.unique : undefined;
const indexTypes = [
  { value: "all", label: "All index types" },
  { value: "unique", label: "Unique" },
  { value: "standard", label: "Standard" },
];

export interface DatabaseSqlObjectsProps {
  category: "indexes" | "triggers";
  dbName: string;
  onSelectTable?: (name: string) => void;
}
export default function DatabaseSqlObjects({
  dbName,
  category,
  onSelectTable,
}: DatabaseSqlObjectsProps) {
  const isIndexCatalog = category === "indexes";
  const title = isIndexCatalog ? "Indexes" : "Triggers";
  const singular = isIndexCatalog ? "index" : "trigger";
  const Icon = isIndexCatalog ? ListFilter : Zap;
  const query = useDatabaseObjects(dbName);
  const tables = useTables(dbName);
  const tableNames = useMemo(() => new Set(tables.data?.map((table) => table.name)), [tables.data]);
  const navigate = useNavigate();
  const id = useId();
  const objects = useMemo(() => query.data?.[category] ?? [], [query.data, category]);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ name: string; sql: string } | null>(null);
  const [copyError, setCopyError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const filtered = useMemo(
    () =>
      objects
        .filter((object) => {
          const value = search.trim().toLowerCase();
          return (
            (object.name.toLowerCase().includes(value) ||
              object.tableName.toLowerCase().includes(value)) &&
            (!isIndexCatalog ||
              kind === "all" ||
              (kind === "unique" ? uniqueOf(object) === true : uniqueOf(object) === false))
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [objects, search, kind, isIndexCatalog]
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const copy = async (name: string, sql: string) => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(sql);
      if (!mounted.current) return;
      setCopied({ name, sql });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      if (mounted.current)
        setCopyError("Couldn’t copy SQL. Check clipboard permissions and try again.");
    }
  };
  const openTable = (name: string) => {
    if (onSelectTable) onSelectTable(name);
    else navigate(`/databases/${encodeURIComponent(dbName)}/tables/${encodeURIComponent(name)}`);
  };
  const openSql = () => navigate(`/databases/${encodeURIComponent(dbName)}/sql`);
  const type = (unique: boolean | undefined) =>
    unique === true ? "Unique" : unique === false ? "Standard" : "Type unavailable";
  const target = (name: string) =>
    isIndexCatalog || tableNames.has(name) ? (
      <button
        className="db-objects-table-link"
        title={name}
        aria-label={`Open table ${name}`}
        onClick={() => openTable(name)}
      >
        {name}
      </button>
    ) : (
      <span className="db-objects-target" title={name}>
        {name}
      </span>
    );
  return (
    <section className="db-objects-page">
      <header className="db-objects-heading">
        <div>
          <h1>{title}</h1>
          <p>
            {isIndexCatalog ? "Custom indexes in" : "Triggers in"} <span>{dbName}</span>.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Refresh ${category}`}
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw
              size={14}
              className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={openSql}>
            <Terminal size={14} />
            Open SQL runner
          </Button>
        </div>
      </header>
      <div className="db-objects-body">
        {copyError && (
          <p role="alert" className="db-objects-alert">
            {copyError}
          </p>
        )}
        {query.isError && (
          <div role="alert" className="db-objects-alert">
            <span>
              {query.data
                ? `${title} couldn’t be refreshed. Showing the last loaded version.`
                : `${title} couldn’t be loaded.`}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={query.isFetching}
              onClick={() => query.refetch()}
            >
              Retry
            </Button>
          </div>
        )}
        <div className="db-objects-toolbar">
          <div className="db-objects-search">
            <Search size={15} aria-hidden="true" />
            <Input
              aria-label={`Search ${category} or ${isIndexCatalog ? "tables" : "targets"}`}
              placeholder={`Find ${isIndexCatalog ? "an index or table" : "a trigger or target"}…`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button aria-label={`Clear ${singular} search`} onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>
          {isIndexCatalog && (
            <label className="db-objects-filter">
              <span className="sr-only">Filter index type</span>
              <span className="db-objects-filter-value" aria-hidden="true">
                {indexTypes.find((option) => option.value === kind)?.label}
              </span>
              <select value={kind} onChange={(event) => setKind(event.target.value)}>
                {indexTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
          )}
          {query.data && (
            <span className="db-objects-count">
              {search.trim() || kind !== "all"
                ? `${filtered.length} of ${objects.length}`
                : objects.length}{" "}
              {objects.length === 1 ? singular : category}
            </span>
          )}
        </div>
        {query.isLoading ? (
          <div className="db-objects-loading" aria-busy="true">
            <span className="sr-only">Loading {category}</span>
            {[0, 1, 2].map((number) => (
              <div key={number} className="animate-pulse motion-reduce:animate-none" />
            ))}
          </div>
        ) : !query.data ? (
          <div className="db-objects-state">
            <Icon size={28} />
            <h2>{title} unavailable</h2>
            <p>Retry to load the {category} defined in this database.</p>
          </div>
        ) : !objects.length ? (
          <div className="db-objects-state">
            <Icon size={28} />
            <h2>{isIndexCatalog ? "No custom indexes yet" : "No triggers yet"}</h2>
            <p>
              {isIndexCatalog
                ? "Create an index in the SQL runner for columns you frequently search or sort."
                : "Create a trigger in the SQL runner to run statements automatically when database events occur."}
            </p>
            <Button variant="outline" size="sm" onClick={openSql}>
              <Terminal size={14} />
              Open SQL runner
            </Button>
          </div>
        ) : !filtered.length ? (
          <div className="db-objects-state">
            <Search size={28} />
            <h2>No matching {category}</h2>
            <p>
              Try another {singular} or {isIndexCatalog ? "table" : "target"} name
              {isIndexCatalog ? ", or clear the type filter." : "."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setKind("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="db-objects-catalog">
            <table
              role="table"
              aria-label={isIndexCatalog ? "Custom database indexes" : "Database triggers"}
            >
              <thead>
                <tr>
                  <th scope="col">{isIndexCatalog ? "Index" : "Trigger"}</th>
                  <th scope="col" className="db-objects-desktop">
                    {isIndexCatalog ? "Table" : "Target"}
                  </th>
                  {isIndexCatalog && (
                    <th scope="col" className="db-objects-desktop">
                      Type
                    </th>
                  )}
                  <th scope="col">
                    <span className="sr-only">SQL actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((object, number) => {
                  const open = expanded === object.name;
                  const hasSql = !!object.sql?.trim();
                  const wasCopied = copied?.name === object.name && copied.sql === object.sql;
                  const panelId = `${id}-${singular}-${number}`;
                  return (
                    <Fragment key={object.name}>
                      <tr className="db-objects-row" data-expanded={open}>
                        <td>
                          <div className="db-objects-name">
                            <Icon size={15} />
                            <span title={object.name}>{object.name}</span>
                          </div>
                          <div className="db-objects-mobile-summary">
                            {target(object.tableName)}
                            {isIndexCatalog && <span>{type(uniqueOf(object))}</span>}
                          </div>
                        </td>
                        <td className="db-objects-desktop">{target(object.tableName)}</td>
                        {isIndexCatalog && (
                          <td className="db-objects-desktop">
                            <span
                              className="db-objects-type"
                              data-unique={uniqueOf(object) === true}
                            >
                              {type(uniqueOf(object))}
                            </span>
                          </td>
                        )}
                        <td>
                          <div className="db-objects-actions">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!hasSql}
                              aria-label={
                                wasCopied
                                  ? `SQL copied for ${object.name}`
                                  : `Copy SQL for ${object.name}`
                              }
                              onClick={() => copy(object.name, object.sql)}
                            >
                              {wasCopied ? <Check size={14} /> : <Copy size={14} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`${open ? "Hide" : "View"} SQL for ${object.name}`}
                              aria-expanded={open}
                              aria-controls={open ? panelId : undefined}
                              onClick={() => setExpanded(open ? null : object.name)}
                            >
                              SQL{open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr className="db-objects-definition">
                          <td colSpan={isIndexCatalog ? 4 : 3}>
                            <div
                              id={panelId}
                              role="region"
                              aria-label={`SQL definition for ${object.name}`}
                            >
                              {hasSql ? (
                                <pre
                                  tabIndex={0}
                                  aria-label={`CREATE statement for ${object.name}`}
                                >
                                  <code>{object.sql}</code>
                                </pre>
                              ) : (
                                <p>CREATE statement unavailable.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {query.data && (
          <p className="db-objects-note">
            {isIndexCatalog
              ? "SQLite’s automatic indexes for PRIMARY KEY and UNIQUE constraints are not included here. Manage custom indexes in the SQL runner."
              : "Inspect the CREATE statement for each trigger’s timing, conditions and actions. Manage triggers in the SQL runner."}
          </p>
        )}
        <span className="sr-only" role="status">
          {copied ? `${title} SQL copied to clipboard` : ""}
        </span>
      </div>
    </section>
  );
}

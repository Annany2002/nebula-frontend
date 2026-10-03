import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ListFilter,
  RefreshCw,
  Search,
  Terminal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDatabaseObjects } from "@/hooks/queries";
import "@/styles/database-indexes.css";
interface Props {
  dbName: string;
  onSelectTable?: (name: string) => void;
}
export default function DatabaseIndexes({ dbName, onSelectTable }: Props) {
  const query = useDatabaseObjects(dbName);
  const navigate = useNavigate();
  const id = useId();
  const indexes = useMemo(() => query.data?.indexes ?? [], [query.data]);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ name: string; sql: string } | null>(null);
  const [copyError, setCopyError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const filtered = useMemo(
    () =>
      indexes
        .filter((index) => {
          const value = search.trim().toLowerCase();
          return (
            (index.name.toLowerCase().includes(value) ||
              index.tableName.toLowerCase().includes(value)) &&
            (kind === "all" || (kind === "unique" ? index.unique === true : index.unique === false))
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [indexes, search, kind]
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
  const type = (unique: boolean) =>
    unique === true ? "Unique" : unique === false ? "Standard" : "Type unavailable";
  return (
    <section className="db-indexes-page">
      <header className="db-indexes-heading">
        <div>
          <h1>Indexes</h1>
          <p>
            Custom indexes in <span>{dbName}</span>.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            aria-label="Refresh indexes"
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
      <div className="db-indexes-body">
        {copyError && (
          <p role="alert" className="db-indexes-alert">
            {copyError}
          </p>
        )}
        {query.isError && (
          <div role="alert" className="db-indexes-alert">
            <span>
              {query.data
                ? "Indexes couldn’t be refreshed. Showing the last loaded version."
                : "Indexes couldn’t be loaded."}
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
        <div className="db-indexes-toolbar">
          <div className="db-indexes-search">
            <Search size={15} aria-hidden="true" />
            <Input
              aria-label="Search indexes or tables"
              placeholder="Find an index or table…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button aria-label="Clear index search" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <label>
            <span className="sr-only">Filter index type</span>
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="all">All index types</option>
              <option value="unique">Unique</option>
              <option value="standard">Standard</option>
            </select>
          </label>
          {query.data && (
            <span className="db-indexes-count">
              {search.trim() || kind !== "all"
                ? `${filtered.length} of ${indexes.length}`
                : indexes.length}{" "}
              {indexes.length === 1 ? "index" : "indexes"}
            </span>
          )}
        </div>
        {query.isLoading ? (
          <div className="db-indexes-loading" aria-busy="true">
            <span className="sr-only">Loading indexes</span>
            {[0, 1, 2].map((number) => (
              <div key={number} className="animate-pulse motion-reduce:animate-none" />
            ))}
          </div>
        ) : !query.data ? (
          <div className="db-indexes-state">
            <ListFilter size={28} />
            <h2>Indexes unavailable</h2>
            <p>Retry to load the indexes defined in this database.</p>
          </div>
        ) : !indexes.length ? (
          <div className="db-indexes-state">
            <ListFilter size={28} />
            <h2>No custom indexes yet</h2>
            <p>Create an index in the SQL runner for columns you frequently search or sort.</p>
            <Button variant="outline" size="sm" onClick={openSql}>
              <Terminal size={14} />
              Open SQL runner
            </Button>
          </div>
        ) : !filtered.length ? (
          <div className="db-indexes-state">
            <Search size={28} />
            <h2>No matching indexes</h2>
            <p>Try another index or table name, or clear the type filter.</p>
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
          <div className="db-indexes-catalog">
            <table role="table" aria-label="Custom database indexes">
              <thead>
                <tr>
                  <th scope="col">Index</th>
                  <th scope="col" className="db-indexes-desktop">
                    Table
                  </th>
                  <th scope="col" className="db-indexes-desktop">
                    Type
                  </th>
                  <th scope="col">
                    <span className="sr-only">SQL actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((index, number) => {
                  const open = expanded === index.name;
                  const hasSql = !!index.sql?.trim();
                  const wasCopied = copied?.name === index.name && copied.sql === index.sql;
                  const panelId = `${id}-index-${number}`;
                  return (
                    <Fragment key={index.name}>
                      <tr className="db-indexes-row" data-expanded={open}>
                        <td>
                          <div className="db-indexes-name">
                            <ListFilter size={15} />
                            <span title={index.name}>{index.name}</span>
                          </div>
                          <div className="db-indexes-mobile-summary">
                            <button
                              title={index.tableName}
                              aria-label={`Open table ${index.tableName}`}
                              onClick={() => openTable(index.tableName)}
                            >
                              {index.tableName}
                            </button>
                            <span>{type(index.unique)}</span>
                          </div>
                        </td>
                        <td className="db-indexes-desktop">
                          <button
                            className="db-indexes-table-link"
                            title={index.tableName}
                            onClick={() => openTable(index.tableName)}
                            aria-label={`Open table ${index.tableName}`}
                          >
                            {index.tableName}
                          </button>
                        </td>
                        <td className="db-indexes-desktop">
                          <span className="db-indexes-type" data-unique={index.unique === true}>
                            {type(index.unique)}
                          </span>
                        </td>
                        <td>
                          <div className="db-indexes-actions">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!hasSql}
                              aria-label={
                                wasCopied
                                  ? `SQL copied for ${index.name}`
                                  : `Copy SQL for ${index.name}`
                              }
                              onClick={() => copy(index.name, index.sql)}
                            >
                              {wasCopied ? <Check size={14} /> : <Copy size={14} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`${open ? "Hide" : "View"} SQL for ${index.name}`}
                              aria-expanded={open}
                              aria-controls={open ? panelId : undefined}
                              onClick={() => setExpanded(open ? null : index.name)}
                            >
                              SQL{open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr className="db-indexes-definition">
                          <td colSpan={4}>
                            <div
                              id={panelId}
                              role="region"
                              aria-label={`SQL definition for ${index.name}`}
                            >
                              {hasSql ? (
                                <pre tabIndex={0} aria-label={`CREATE statement for ${index.name}`}>
                                  <code>{index.sql}</code>
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
          <p className="db-indexes-note">
            SQLite’s automatic indexes for PRIMARY KEY and UNIQUE constraints are not included here.
            Manage custom indexes in the SQL runner.
          </p>
        )}
        <span className="sr-only" role="status">
          {copied ? "Index SQL copied to clipboard" : ""}
        </span>
      </div>
    </section>
  );
}

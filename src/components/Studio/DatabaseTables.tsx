import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Check,
  Copy,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTable, useTables } from "@/hooks/queries";
import { TableType } from "@/types/allType";
import "@/styles/database-tables.css";
interface Props {
  dbName: string;
  onSelectTable?: (name: string) => void;
  onOpenCreateTable?: () => void;
}
export default function DatabaseTables({ dbName, onSelectTable, onOpenCreateTable }: Props) {
  const query = useTables(dbName);
  const deletion = useDeleteTable();
  const navigate = useNavigate();
  const id = useId();
  const tables = useMemo(() => query.data ?? [], [query.data]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState("");
  const mounted = useRef(true);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const dropSubmitted = useRef(false);
  const inspector = useRef<HTMLElement>(null);
  const inspectorTrigger = useRef<HTMLButtonElement | null>(null);
  const actionButtons = useRef(new Map<string, HTMLButtonElement>());
  const lastDropTarget = useRef("");
  const refreshButton = useRef<HTMLButtonElement>(null);
  const selected = tables.find((table) => table.name === selectedName);
  const targetExists = tables.some((table) => table.name === dropTarget);
  const filtered = useMemo(
    () =>
      tables
        .filter((table) => {
          const value = search.trim().toLowerCase();
          return [table.name, ...(table.columns ?? []).map((column) => column.name)].some((text) =>
            text.toLowerCase().includes(value)
          );
        })
        .sort((a, b) => {
          if (sort !== "name") {
            if (a.rowCount == null && b.rowCount != null) return 1;
            if (b.rowCount == null && a.rowCount != null) return -1;
            const delta = (a.rowCount ?? 0) - (b.rowCount ?? 0);
            if (delta) return sort === "rows-desc" ? -delta : delta;
          }
          return a.name.localeCompare(b.name);
        }),
    [tables, search, sort]
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(copyTimer.current);
    };
  }, []);
  const copy = async (value: string, field: string) => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(value);
      if (!mounted.current) return;
      toast.success(field.startsWith("name:") ? "Table name copied" : "CREATE statement copied");
      setCopied(field);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      if (mounted.current)
        setCopyError("Couldn’t copy. Check clipboard permissions and try again.");
    }
  };
  const openTable = (name: string) => {
    if (onSelectTable) onSelectTable(name);
    else navigate(`/databases/${encodeURIComponent(dbName)}/tables/${encodeURIComponent(name)}`);
  };
  const showColumns = (table: TableType, button: HTMLButtonElement) => {
    inspectorTrigger.current = button;
    setSelectedName(table.name);
    requestAnimationFrame(() => inspector.current?.focus());
  };
  const closeColumns = () => {
    setSelectedName(null);
    requestAnimationFrame(() =>
      (inspectorTrigger.current?.isConnected
        ? inspectorTrigger.current
        : refreshButton.current
      )?.focus()
    );
  };
  const drop = () => {
    if (
      !dropTarget ||
      !targetExists ||
      confirmation !== dropTarget ||
      deletion.isPending ||
      dropSubmitted.current
    )
      return;
    dropSubmitted.current = true;
    deletion.mutate(
      { dbName, tableName: dropTarget },
      {
        onSuccess: () => {
          if (selectedName === dropTarget) setSelectedName(null);
          setDropTarget(null);
          setConfirmation("");
        },
        onSettled: () => {
          dropSubmitted.current = false;
        },
      }
    );
  };
  return (
    <section className="db-tables-page">
      <header className="db-tables-heading">
        <div>
          <h1>Tables</h1>
          <p>
            Schema and records in <span>{dbName}</span>.
          </p>
        </div>
        <div>
          <Button
            ref={refreshButton}
            variant="outline"
            size="sm"
            aria-label="Refresh tables"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw
              size={14}
              className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""}
            />
            Refresh
          </Button>
          {onOpenCreateTable && (
            <Button size="sm" onClick={onOpenCreateTable}>
              <Plus size={14} />
              New table
            </Button>
          )}
        </div>
      </header>
      <div className="db-tables-body">
        {copyError && (
          <p role="alert" className="db-tables-alert">
            {copyError}
          </p>
        )}
        {query.isError && (
          <div role="alert" className="db-tables-alert">
            <span>
              {query.data
                ? "Tables couldn’t be refreshed. Showing the last loaded version."
                : "Tables couldn’t be loaded."}
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
        <div className="db-tables-toolbar">
          <div className="db-tables-search">
            <Search size={15} aria-hidden="true" />
            <Input
              aria-label="Search tables or columns"
              placeholder="Find a table or column…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button aria-label="Clear table search" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <label className="db-tables-sort">
            <span className="sr-only">Sort tables</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="name">Name: A to Z</option>
              <option value="rows-desc">Most rows first</option>
              <option value="rows-asc">Fewest rows first</option>
            </select>
          </label>
          <span className="db-tables-count">
            {search.trim() ? `${filtered.length} of ${tables.length}` : tables.length}{" "}
            {tables.length === 1 ? "table" : "tables"}
          </span>
        </div>
        {query.isLoading ? (
          <div className="db-tables-loading" aria-busy="true">
            <span className="sr-only">Loading tables</span>
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse motion-reduce:animate-none" />
            ))}
          </div>
        ) : query.data && !tables.length ? (
          <div className="db-tables-state">
            <Table2 size={28} />
            <h2>Create your first table</h2>
            <p>Define columns and a primary key to start storing records.</p>
            {onOpenCreateTable && (
              <Button size="sm" onClick={onOpenCreateTable}>
                <Plus size={14} />
                Create table
              </Button>
            )}
          </div>
        ) : query.data && !filtered.length ? (
          <div className="db-tables-state">
            <Search size={28} />
            <h2>No matching tables</h2>
            <p>Try another table or column name.</p>
            <Button variant="outline" size="sm" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        ) : !query.data ? (
          <div className="db-tables-state">
            <h2>Tables unavailable</h2>
            <p>Retry to load this database’s tables.</p>
          </div>
        ) : (
          <div className={`db-tables-workspace ${selected ? "has-inspector" : ""}`}>
            <div className="db-tables-catalog">
              <table aria-label="Database tables">
                <thead>
                  <tr>
                    <th scope="col">Table</th>
                    <th scope="col" className="db-tables-desktop">
                      Columns
                    </th>
                    <th scope="col" className="db-tables-desktop">
                      Rows
                    </th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((table) => (
                    <tr key={table.name} data-selected={selectedName === table.name}>
                      <td>
                        <div className="db-tables-name">
                          <Table2 size={15} />
                          <button title={table.name} onClick={() => openTable(table.name)}>
                            {table.name}
                          </button>
                        </div>
                        <span className="db-tables-mobile-summary">
                          {Array.isArray(table.columns)
                            ? `${table.columns.length} ${table.columns.length === 1 ? "column" : "columns"}`
                            : "Columns unavailable"}{" "}
                          ·{" "}
                          {table.rowCount == null
                            ? "Rows unavailable"
                            : `${table.rowCount.toLocaleString()} ${table.rowCount === 1 ? "row" : "rows"}`}
                        </span>
                      </td>
                      <td className="db-tables-desktop">
                        {Array.isArray(table.columns) ? table.columns.length : "Unavailable"}
                      </td>
                      <td className="db-tables-desktop">
                        {table.rowCount == null ? "Unavailable" : table.rowCount.toLocaleString()}
                      </td>
                      <td>
                        <div className="db-tables-row-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => showColumns(table, event.currentTarget)}
                            aria-label={`View columns for ${table.name}`}
                            aria-pressed={selectedName === table.name}
                          >
                            Columns
                          </Button>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                ref={(button) => {
                                  if (button) actionButtons.current.set(table.name, button);
                                  else actionButtons.current.delete(table.name);
                                }}
                                aria-label={`Actions for ${table.name}`}
                              >
                                <MoreHorizontal size={15} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => openTable(table.name)}>
                                Open in table editor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  navigate(`/databases/${encodeURIComponent(dbName)}/sql`)
                                }
                              >
                                Open SQL runner
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => copy(table.name, `name:${table.name}`)}
                              >
                                Copy table name
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!table.sql?.trim()}
                                onSelect={() => copy(table.sql, `sql:${table.name}`)}
                              >
                                Copy CREATE statement
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => {
                                  deletion.reset();
                                  setConfirmation("");
                                  lastDropTarget.current = table.name;
                                  setDropTarget(table.name);
                                }}
                              >
                                Drop table
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selected && (
              <aside
                ref={inspector}
                tabIndex={-1}
                className="db-tables-inspector"
                aria-label={`Columns for ${selected.name}`}
              >
                <header>
                  <div>
                    <span>Table schema</span>
                    <h2>{selected.name}</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close column inspector"
                    onClick={closeColumns}
                  >
                    <X size={15} />
                  </Button>
                </header>
                <div className="db-tables-inspector-actions">
                  <Button variant="outline" size="sm" onClick={() => openTable(selected.name)}>
                    Open editor
                    <ArrowUpRight size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!selected.sql?.trim()}
                    onClick={() => copy(selected.sql, `sql:${selected.name}`)}
                  >
                    {copied === `sql:${selected.name}` ? <Check size={13} /> : <Copy size={13} />}
                    {copied === `sql:${selected.name}` ? "Copied" : "Copy SQL"}
                  </Button>
                </div>
                <ul className="db-tables-columns">
                  {selected.columns?.map((column) => (
                    <li key={column.name}>
                      <div>
                        <code>{column.name}</code>
                        <code>{column.type || "ANY"}</code>
                      </div>
                      <div className="db-tables-constraints">
                        {column.pk > 0 && (
                          <span>
                            <KeyRound size={11} />
                            Primary key{column.pk > 1 ? ` (${column.pk})` : ""}
                          </span>
                        )}
                        {column.notnull === 1 && <span>NOT NULL</span>}
                        {column.dflt_value != null && (
                          <span>
                            Default: <code>{String(column.dflt_value) || "Empty string"}</code>
                          </span>
                        )}
                        {!column.pk && !column.notnull && column.dflt_value == null && (
                          <span>No explicit constraints</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {!selected.columns?.length && (
                  <p className="db-tables-inspector-empty">Column information unavailable.</p>
                )}
                <details className="db-tables-ddl">
                  <summary>CREATE statement</summary>
                  {selected.sql?.trim() ? (
                    <pre>
                      <code>{selected.sql}</code>
                    </pre>
                  ) : (
                    <p>Statement unavailable.</p>
                  )}
                </details>
              </aside>
            )}
          </div>
        )}
        <span className="sr-only" role="status">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </div>
      <AlertDialog
        open={!!dropTarget && targetExists}
        onOpenChange={(open) => {
          if (!open && !deletion.isPending && !dropSubmitted.current) setDropTarget(null);
        }}
      >
        <AlertDialogContent
          className="db-tables-drop-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() =>
              (actionButtons.current.get(lastDropTarget.current) ?? refreshButton.current)?.focus()
            );
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Drop {dropTarget}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the table and its records from <strong>{dbName}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              drop();
            }}
          >
            <div className="db-tables-drop-fields">
              <label htmlFor={`${id}-drop`}>Type the table name</label>
              <code>{dropTarget}</code>
              <Input
                id={`${id}-drop`}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={deletion.isPending}
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
              {deletion.isError && (
                <p role="alert">
                  The table couldn’t be dropped. Check the connection and try again.
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletion.isPending}>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={!targetExists || confirmation !== dropTarget || deletion.isPending}
              >
                {deletion.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
                    Dropping…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Drop table
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

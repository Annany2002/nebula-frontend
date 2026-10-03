import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Copy,
  GitBranch,
  GripVertical,
  KeyRound,
  LayoutGrid,
  List,
  Maximize,
  Minus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Table2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSchemaDiagram } from "@/hooks/queries";
import { TableDiagramInfo } from "@/types/allType";
import {
  COLUMN_HEIGHT,
  DiagramView,
  Point,
  TABLE_HEADER_HEIGHT,
  TABLE_WIDTH,
  fitDiagram,
  layoutTables,
  referencedColumn,
  schemaSql,
} from "@/lib/schemaDiagram";
import "@/styles/schema-visualizer.css";

interface Props {
  dbName: string;
  onSelectTable?: (name: string) => void;
  onOpenCreateTable?: () => void;
}
type Gesture =
  | { pointer: number; start: Point; pan: Point; kind: "pan" }
  | { pointer: number; start: Point; position: Point; table: string; kind: "table" };

export default function SchemaVisualizer({ dbName, onSelectTable, onOpenCreateTable }: Props) {
  const query = useSchemaDiagram(dbName);
  const navigate = useNavigate();
  const id = useId().replace(/:/g, "");
  const tables = useMemo(() => query.data?.tables ?? [], [query.data]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"diagram" | "list">(() =>
    window.matchMedia("(max-width: 640px)").matches ? "list" : "diagram"
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [moved, setMoved] = useState<Record<string, Point>>({});
  const [manualView, setManualView] = useState<{ signature: string; view: DiagramView } | null>(
    null
  );
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState("");
  const canvas = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    return tables.filter((table) =>
      [table.name, ...table.columns.flatMap((column) => [column.name, column.type])].some((text) =>
        text.toLowerCase().includes(value)
      )
    );
  }, [tables, search]);
  const initialPositions = useMemo(() => layoutTables(tables), [tables]);
  const positions = useMemo(() => ({ ...initialPositions, ...moved }), [initialPositions, moved]);
  const signature = JSON.stringify([search, filtered.map((table) => table.name), size]);
  const fittedView = useMemo(
    () => fitDiagram(filtered, positions, size),
    [filtered, positions, size]
  );
  const view = manualView?.signature === signature ? manualView.view : fittedView;
  const viewRef = useRef(view);
  viewRef.current = view;
  const signatureRef = useRef(signature);
  signatureRef.current = signature;
  const relations = useMemo(() => {
    const byName = new Map(tables.map((table) => [table.name, table]));
    return tables.flatMap((table) =>
      table.foreignKeys.map((fk, index) => ({
        key: `${table.name}-${index}`,
        from: table.name,
        column: fk.from,
        to: fk.table,
        target: referencedColumn(fk, byName.get(fk.table)),
        onDelete: fk.onDelete || "Unavailable",
        onUpdate: fk.onUpdate || "Unavailable",
      }))
    );
  }, [tables]);
  const sql = schemaSql(tables);
  const visibleNames = new Set(filtered.map((table) => table.name));
  const visibleRelations = relations.filter(
    (relation) => visibleNames.has(relation.from) && visibleNames.has(relation.to)
  );
  const setView = useCallback((next: DiagramView) => {
    viewRef.current = next;
    setManualView({ signature: signatureRef.current, view: next });
  }, []);
  const zoomAt = useCallback(
    (factor: number, point?: Point) => {
      const current = viewRef.current;
      const nextZoom = Math.max(0.1, Math.min(2, current.zoom * factor));
      const anchor = point ?? { x: size.width / 2, y: size.height / 2 };
      setView({
        zoom: nextZoom,
        pan: {
          x: anchor.x - ((anchor.x - current.pan.x) * nextZoom) / current.zoom,
          y: anchor.y - ((anchor.y - current.pan.y) * nextZoom) / current.zoom,
        },
      });
    },
    [setView, size]
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(copyTimer.current);
    };
  }, []);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize((old) =>
        old.width === entry.contentRect.width && old.height === entry.contentRect.height
          ? old
          : { width: entry.contentRect.width, height: entry.contentRect.height }
      )
    );
    observer.observe(element);
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const bounds = element.getBoundingClientRect();
      zoomAt(Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.002), {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", wheel);
      gesture.current = null;
    };
  }, [mode, query.isLoading, query.data, filtered.length, zoomAt]);
  const copy = async (value: string, target: string) => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(value);
      if (!mounted.current) return;
      setCopied(target);
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
  const startGesture = (event: React.PointerEvent, table?: TableDiagramInfo) => {
    if (event.button !== 0 || !canvas.current) return;
    event.preventDefault();
    event.stopPropagation();
    canvas.current.focus({ preventScroll: true });
    canvas.current.setPointerCapture(event.pointerId);
    const start = { x: event.clientX, y: event.clientY };
    gesture.current = table
      ? {
          pointer: event.pointerId,
          kind: "table",
          table: table.name,
          start,
          position: positions[table.name],
        }
      : { pointer: event.pointerId, kind: "pan", start, pan: view.pan };
    setView(view);
    if (table) setSelected(table.name);
  };
  const renderTable = (table: TableDiagramInfo) => (
    <article
      key={table.name}
      className="schema-table"
      data-selected={selected === table.name}
      data-draggable={mode === "diagram"}
      aria-label={`Schema for ${table.name}`}
      onPointerDown={(event) => {
        if (mode !== "diagram" || (event.target as Element).closest("[data-schema-action]")) return;
        startGesture(event, table);
      }}
      style={
        mode === "diagram"
          ? { left: positions[table.name].x, top: positions[table.name].y, width: TABLE_WIDTH }
          : undefined
      }
    >
      <header>
        {mode === "diagram" && (
          <button
            className="schema-drag"
            aria-label={`Move table ${table.name}. Use arrow keys to reposition.`}
            onKeyDown={(event) => {
              const offsets: Record<string, Point> = {
                ArrowLeft: { x: -20, y: 0 },
                ArrowRight: { x: 20, y: 0 },
                ArrowUp: { x: 0, y: -20 },
                ArrowDown: { x: 0, y: 20 },
              };
              const offset = offsets[event.key];
              if (!offset) return;
              event.preventDefault();
              event.stopPropagation();
              setView(view);
              setMoved((old) => ({
                ...old,
                [table.name]: {
                  x: positions[table.name].x + offset.x,
                  y: positions[table.name].y + offset.y,
                },
              }));
            }}
          >
            <GripVertical size={14} />
          </button>
        )}
        <h2>
          <button
            onClick={() => setSelected(selected === table.name ? null : table.name)}
            aria-pressed={selected === table.name}
            title={table.name}
          >
            <Table2 size={14} />
            <span>{table.name}</span>
          </button>
        </h2>
        <button
          className="schema-open"
          data-schema-action=""
          aria-label={`Open ${table.name} in table editor`}
          onClick={() => openTable(table.name)}
        >
          <ArrowUpRight size={15} />
        </button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className="schema-open"
              data-schema-action=""
              aria-label={`Table actions for ${table.name}`}
            >
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" data-schema-action="">
            <DropdownMenuItem
              disabled={!table.sql?.trim()}
              onSelect={() => copy(schemaSql([table]), `table:${table.name}`)}
            >
              {copied === `table:${table.name}` ? "SQL copied" : "Copy table SQL"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => copy(table.name, `name:${table.name}`)}>
              {copied === `name:${table.name}` ? "Name copied" : "Copy table name"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <ul aria-label={`${table.name} columns`}>
        {table.columns.map((column) => {
          const fk = table.foreignKeys.find((foreign) => foreign.from === column.name);
          const target = fk
            ? referencedColumn(
                fk,
                tables.find((other) => other.name === fk.table)
              )
            : null;
          return (
            <li key={column.name}>
              <span className="schema-column-role">
                {column.pk > 0 ? (
                  <KeyRound size={13} aria-label="Primary key" />
                ) : fk ? (
                  <GitBranch size={13} aria-label="Foreign key" />
                ) : (
                  <span aria-hidden="true">·</span>
                )}
              </span>
              <code className="schema-column-name" title={column.name}>
                {column.name}
              </code>
              {column.pk > 0 && fk && <span className="schema-column-fk">FK</span>}
              <span className="schema-column-type" title={column.type || "No type affinity"}>
                {column.type || "ANY"}
              </span>
              {fk && (
                <span className="sr-only">
                  References {fk.table}
                  {target ? `.${target}` : " (target column unavailable)"}.
                </span>
              )}
            </li>
          );
        })}
        {!table.columns.length && <li className="schema-no-columns">No column information</li>}
      </ul>
      {mode === "list" && (
        <footer>
          <span>
            {typeof table.rowCount === "number"
              ? `${table.rowCount.toLocaleString()} rows`
              : "Row count unavailable"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!table.sql?.trim()}
            onClick={() => copy(schemaSql([table]), `table:${table.name}`)}
          >
            {copied === `table:${table.name}` ? <Check size={13} /> : <Copy size={13} />}
            {copied === `table:${table.name}` ? "Copied" : "Copy SQL"}
          </Button>
        </footer>
      )}
    </article>
  );
  return (
    <section className="schema-page">
      <header className="schema-heading">
        <div>
          <h1>Schema visualizer</h1>
          <p>
            {query.data
              ? `${tables.length} ${tables.length === 1 ? "table" : "tables"} · ${relations.length} foreign key ${relations.length === 1 ? "mapping" : "mappings"}`
              : "Tables, columns and relationships"}
          </p>
        </div>
        <div className="schema-heading-actions">
          <Button variant="outline" size="sm" disabled={!sql} onClick={() => copy(sql, "schema")}>
            <span aria-hidden="true">
              {copied === "schema" ? <Check size={14} /> : <Copy size={14} />}
            </span>
            {copied === "schema" ? "Copied" : "Copy schema SQL"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh schema"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw
              size={15}
              className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""}
            />
          </Button>
        </div>
      </header>
      {copyError && (
        <p className="schema-alert" role="alert">
          {copyError}
        </p>
      )}
      {query.isError && (
        <div className="schema-alert" role="alert">
          <span>
            {query.data
              ? "Schema couldn’t be refreshed. Showing the last loaded version."
              : "Schema couldn’t be loaded."}
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
      <div className="schema-toolbar">
        <div className="schema-search">
          <Search size={15} aria-hidden="true" />
          <Input
            aria-label="Search tables and columns"
            placeholder="Find a table or column…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button aria-label="Clear schema search" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="schema-mode" role="group" aria-label="Schema display">
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={mode === "diagram"}
            onClick={() => setMode("diagram")}
          >
            <GitBranch size={14} />
            Diagram
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={mode === "list"}
            onClick={() => setMode("list")}
          >
            <List size={14} />
            List
          </Button>
        </div>
        {mode === "diagram" && (
          <div className="schema-view-controls">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom out"
              disabled={!filtered.length || view.zoom <= 0.1}
              onClick={() => zoomAt(1 / 1.2)}
            >
              <Minus size={14} />
            </Button>
            <output aria-label="Diagram zoom">{Math.round(view.zoom * 100)}%</output>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom in"
              disabled={!filtered.length || view.zoom >= 2}
              onClick={() => zoomAt(1.2)}
            >
              <Plus size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="Show all visible tables without moving them"
              disabled={!filtered.length}
              onClick={() => setView(fittedView)}
            >
              <Maximize size={13} />
              Fit view
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Arrange tables"
              title="Reset table positions to an organized grid and fit the view"
              disabled={!filtered.length}
              onClick={() => {
                setMoved({});
                setView(fitDiagram(filtered, initialPositions, size));
              }}
            >
              <LayoutGrid size={15} />
              Arrange
            </Button>
          </div>
        )}
      </div>
      {query.isLoading ? (
        <div className="schema-state" aria-busy="true">
          <div
            className="schema-skeleton animate-pulse motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p>Loading schema…</p>
        </div>
      ) : !query.data ? (
        <div className="schema-state">
          <Table2 size={28} />
          <h2>Schema unavailable</h2>
          <p>Retry to load your tables and relationships.</p>
        </div>
      ) : !tables.length ? (
        <div className="schema-state">
          <Table2 size={28} />
          <h2>Your schema starts here</h2>
          <p>Create a table to explore its columns and relationships.</p>
          {onOpenCreateTable && (
            <Button size="sm" onClick={onOpenCreateTable}>
              <Plus size={14} />
              Create table
            </Button>
          )}
        </div>
      ) : !filtered.length ? (
        <div className="schema-state">
          <Search size={28} />
          <h2>No matching tables</h2>
          <p>Try another table name, column name or data type.</p>
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </div>
      ) : mode === "list" ? (
        <div className="schema-list">{filtered.map(renderTable)}</div>
      ) : (
        <div
          ref={canvas}
          className="schema-canvas"
          tabIndex={0}
          role="region"
          aria-label="Schema diagram. Drag tables to reposition them, drag the background to pan, scroll to zoom, or use arrow keys and plus or minus."
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest(".schema-table")) return;
            startGesture(event);
          }}
          onPointerMove={(event) => {
            const active = gesture.current;
            if (!active || active.pointer !== event.pointerId) return;
            const delta = { x: event.clientX - active.start.x, y: event.clientY - active.start.y };
            if (active.kind === "pan")
              setView({
                ...viewRef.current,
                pan: { x: active.pan.x + delta.x, y: active.pan.y + delta.y },
              });
            else
              setMoved((old) => ({
                ...old,
                [active.table]: {
                  x: active.position.x + delta.x / viewRef.current.zoom,
                  y: active.position.y + delta.y / viewRef.current.zoom,
                },
              }));
          }}
          onPointerUp={(event) => {
            if (gesture.current?.pointer === event.pointerId) {
              gesture.current = null;
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onLostPointerCapture={() => {
            gesture.current = null;
          }}
          onPointerCancel={() => {
            gesture.current = null;
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const offset: Record<string, Point> = {
              ArrowLeft: { x: 40, y: 0 },
              ArrowRight: { x: -40, y: 0 },
              ArrowUp: { x: 0, y: 40 },
              ArrowDown: { x: 0, y: -40 },
            };
            if (offset[event.key]) {
              event.preventDefault();
              setView({
                ...view,
                pan: { x: view.pan.x + offset[event.key].x, y: view.pan.y + offset[event.key].y },
              });
            } else if (["+", "=", "-"].includes(event.key)) {
              event.preventDefault();
              zoomAt(event.key === "-" ? 1 / 1.2 : 1.2);
            } else if (event.key === "0") {
              event.preventDefault();
              setView(fittedView);
            }
          }}
        >
          <div
            className="schema-world"
            style={{ transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.zoom})` }}
          >
            <svg className="schema-lines" aria-hidden="true">
              <defs>
                <marker
                  id={`${id}-arrow`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {visibleRelations.map((relation) => {
                const source = tables.find((table) => table.name === relation.from)!;
                const target = tables.find((table) => table.name === relation.to)!;
                const fromIndex = source.columns.findIndex(
                  (column) => column.name === relation.column
                );
                const toIndex = target.columns.findIndex(
                  (column) => column.name === relation.target
                );
                if (fromIndex < 0 || toIndex < 0) return null;
                const from = positions[relation.from],
                  to = positions[relation.to];
                const right = to.x > from.x;
                const sx = from.x + (right || source === target ? TABLE_WIDTH : 0),
                  tx = to.x + (right && source !== target ? 0 : TABLE_WIDTH);
                const sy =
                  from.y + TABLE_HEADER_HEIGHT + fromIndex * COLUMN_HEIGHT + COLUMN_HEIGHT / 2;
                const ty = to.y + TABLE_HEADER_HEIGHT + toIndex * COLUMN_HEIGHT + COLUMN_HEIGHT / 2;
                const curve = source === target ? 70 : Math.max(50, Math.abs(tx - sx) / 2);
                const selectedLine = selected === relation.from || selected === relation.to;
                return (
                  <path
                    key={relation.key}
                    data-highlighted={selectedLine}
                    d={`M ${sx} ${sy} C ${sx + (right || source === target ? curve : -curve)} ${sy}, ${tx + (right && source !== target ? -curve : curve)} ${ty}, ${tx} ${ty}`}
                    markerEnd={`url(#${id}-arrow)`}
                  />
                );
              })}
            </svg>
            {filtered.map(renderTable)}
          </div>
        </div>
      )}
      <footer className="schema-footer">
        <div className="schema-legend">
          <span>
            <KeyRound size={12} />
            Primary key
          </span>
          <span>
            <GitBranch size={12} />
            Foreign key
          </span>
          {search.trim() && (
            <span>
              {filtered.length} of {tables.length} tables
            </span>
          )}
        </div>
        {relations.length > 0 && (
          <details className="schema-relations">
            <summary>Relationships ({relations.length})</summary>
            <ul>
              {relations.map((relation) => (
                <li
                  key={relation.key}
                  data-highlighted={selected === relation.from || selected === relation.to}
                >
                  <span>
                    <code>
                      {relation.from}.{relation.column}
                    </code>
                    <span aria-label="references"> → </span>
                    <code>
                      {relation.to}
                      {relation.target ? `.${relation.target}` : " (column unavailable)"}
                    </code>
                  </span>
                  <span>
                    Delete: {relation.onDelete} · Update: {relation.onUpdate}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </footer>
    </section>
  );
}

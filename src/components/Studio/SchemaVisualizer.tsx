import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Copy,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Key,
  Database,
  Hash,
  Sparkles,
  MoreVertical,
  ExternalLink,
  Code2,
  Table2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSchemaDiagram } from "@/hooks/queries";
import { TableDiagramInfo } from "@/types/allType";
import { cn } from "@/lib/utils";

interface SchemaVisualizerProps {
  dbName: string;
  onSelectTable?: (tableName: string) => void;
}

interface TablePosition {
  x: number;
  y: number;
}

const CARD_WIDTH = 260;
const HEADER_HEIGHT = 44;
const ROW_HEIGHT = 28;

export default function SchemaVisualizer({ dbName, onSelectTable }: SchemaVisualizerProps) {
  const navigate = useNavigate();
  const { data: diagram, isLoading } = useSchemaDiagram(dbName);
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Record<string, TablePosition>>({});
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Initialize auto-layout positions for tables
  const autoLayout = useCallback((tables: TableDiagramInfo[]) => {
    const newPos: Record<string, TablePosition> = {};
    const cols = Math.max(1, Math.ceil(Math.sqrt(tables.length)));
    const xSpacing = 360;
    const ySpacing = 320;

    tables.forEach((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      newPos[t.name] = {
        x: 80 + col * xSpacing,
        y: 60 + row * ySpacing,
      };
    });
    setPositions(newPos);
  }, []);

  useEffect(() => {
    if (diagram?.tables && diagram.tables.length > 0) {
      setPositions((prev) => {
        const hasAll = diagram.tables.every((t) => prev[t.name]);
        if (hasAll && Object.keys(prev).length > 0) return prev;
        const initial: Record<string, TablePosition> = {};
        const cols = Math.max(1, Math.ceil(Math.sqrt(diagram.tables.length)));
        const xSpacing = 360;
        const ySpacing = 320;

        diagram.tables.forEach((t, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          initial[t.name] = {
            x: 80 + col * xSpacing,
            y: 60 + row * ySpacing,
          };
        });
        return initial;
      });
    }
  }, [diagram]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingTable) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingTable) {
      setPositions((prev) => ({
        ...prev,
        [draggingTable]: {
          x: (e.clientX - dragOffset.x - pan.x) / zoom,
          y: (e.clientY - dragOffset.y - pan.y) / zoom,
        },
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingTable(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
    setZoom((prev) => Math.min(2, Math.max(0.3, prev * zoomFactor)));
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, z - 0.15));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 60, y: 60 });
  };

  const handleCopySchemaSql = () => {
    if (!diagram?.tables) return;
    const fullSql = diagram.tables.map((t) => t.sql || `-- Table: ${t.name}`).join(";\n\n") + ";";
    window.navigator.clipboard.writeText(fullSql);
    setCopiedSql(true);
    toast.success("Full schema SQL copied to clipboard");
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyTableSql = (table: TableDiagramInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    window.navigator.clipboard.writeText(table.sql + ";");
    toast.success(`SQL for table "${table.name}" copied`);
  };

  // Filtered tables for search
  const filteredTables = useMemo(() => {
    if (!diagram?.tables) return [];
    if (!searchQuery.trim()) return diagram.tables;
    const q = searchQuery.toLowerCase().trim();
    return diagram.tables.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.columns.some((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
    );
  }, [diagram, searchQuery]);

  // Compute foreign key relationship lines between tables
  const relationshipLines = useMemo(() => {
    if (!diagram?.tables) return [];
    const lines: Array<{
      id: string;
      fromTable: string;
      toTable: string;
      fromCol: string;
      toCol: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isHighlighted: boolean;
    }> = [];

    diagram.tables.forEach((t) => {
      const fromPos = positions[t.name];
      if (!fromPos || !t.foreignKeys) return;

      t.foreignKeys.forEach((fk, fkIdx) => {
        const targetTable = diagram.tables.find((tbl) => tbl.name === fk.table);
        const toPos = positions[fk.table];
        if (!targetTable || !toPos) return;

        const fromColIdx = t.columns.findIndex((c) => c.name === fk.from);
        const toColIdx = targetTable.columns.findIndex(
          (c) => c.name === fk.to || (fk.to === "" && c.pk > 0)
        );

        const y1 =
          fromPos.y +
          HEADER_HEIGHT +
          (fromColIdx >= 0 ? fromColIdx : 0) * ROW_HEIGHT +
          ROW_HEIGHT / 2;
        const y2 =
          toPos.y + HEADER_HEIGHT + (toColIdx >= 0 ? toColIdx : 0) * ROW_HEIGHT + ROW_HEIGHT / 2;

        let x1 = fromPos.x + CARD_WIDTH;
        let x2 = toPos.x;

        if (fromPos.x > toPos.x + CARD_WIDTH) {
          x1 = fromPos.x;
          x2 = toPos.x + CARD_WIDTH;
        }

        const isHighlighted =
          hoveredTable === t.name ||
          hoveredTable === fk.table ||
          selectedTable === t.name ||
          selectedTable === fk.table;

        lines.push({
          id: `${t.name}-${fk.table}-${fkIdx}`,
          fromTable: t.name,
          toTable: fk.table,
          fromCol: fk.from,
          toCol: fk.to,
          x1,
          y1,
          x2,
          y2,
          isHighlighted,
        });
      });
    });

    return lines;
  }, [diagram, positions, hoveredTable, selectedTable]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#fbfafd] dark:bg-[#090812] relative text-foreground">
      {/* Top Visualizer Toolbar */}
      <div className="h-12 border-b border-purple-200/50 dark:border-white/10 bg-white/80 dark:bg-[#0d0c18]/90 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          {/* Schema Selector Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-xs font-mono text-purple-700 dark:text-purple-300">
            <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>schema</span>
            <span className="font-bold text-foreground">main</span>
          </div>

          {/* Table Search Input */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Find table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border-purple-200/60 dark:border-white/10 bg-white/70 dark:bg-card/60 backdrop-blur-md text-foreground focus:border-purple-500/50"
            />
          </div>

          <span className="text-[11px] font-mono text-muted-foreground hidden md:inline">
            {diagram?.totalTables || 0} tables • {diagram?.totalForeignKeys || 0} relations
          </span>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopySchemaSql}
            className="h-8 px-2.5 text-xs rounded-lg border-purple-200/60 dark:border-white/10 hover:border-purple-500/40 text-muted-foreground hover:text-foreground bg-white/60 dark:bg-card/40"
          >
            {copiedSql ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
            )}
            <span>Copy as SQL</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => diagram?.tables && autoLayout(diagram.tables)}
            className="h-8 px-2.5 text-xs rounded-lg border-purple-200/60 dark:border-white/10 hover:border-purple-500/40 text-muted-foreground hover:text-foreground bg-white/60 dark:bg-card/40"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
            <span>Auto layout</span>
          </Button>

          {/* Zoom Controls */}
          <div className="flex items-center rounded-lg border border-purple-200/60 dark:border-white/10 bg-white/60 dark:bg-card/40 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded text-muted-foreground hover:text-foreground"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[11px] font-mono px-2 text-muted-foreground min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded text-muted-foreground hover:text-foreground"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded text-muted-foreground hover:text-foreground"
              onClick={handleResetZoom}
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={cn(
          "flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing",
          "bg-[radial-gradient(circle,rgba(147,51,234,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px]"
        )}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              Loading schema visualizer...
            </div>
          </div>
        ) : !diagram?.tables || diagram.tables.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <Table2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No tables found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Create tables in the Table Editor or execute DDL in the SQL Runner to see your schema
              diagram.
            </p>
          </div>
        ) : (
          <div
            className="absolute origin-top-left transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Relationship Connector Lines */}
            <svg
              className="absolute inset-0 pointer-events-none overflow-visible"
              style={{ width: "100%", height: "100%" }}
            >
              <defs>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrow-highlighted"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
                </marker>
              </defs>

              {relationshipLines.map((line) => {
                const dx = Math.abs(line.x2 - line.x1) * 0.5;
                const pathData = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${
                  line.x2 - dx
                } ${line.y2}, ${line.x2} ${line.y2}`;

                return (
                  <g key={line.id}>
                    {/* Shadow/Glow on highlight */}
                    {line.isHighlighted && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="5"
                        strokeOpacity="0.35"
                        strokeLinecap="round"
                      />
                    )}
                    {/* Actual Connector Curve */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={line.isHighlighted ? "#9333ea" : "#94a3b8"}
                      strokeWidth={line.isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={line.isHighlighted ? "none" : "4 2"}
                      markerEnd={
                        line.isHighlighted ? "url(#arrow-highlighted)" : "url(#arrow-default)"
                      }
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Draggable Table Cards */}
            {filteredTables.map((table) => {
              const pos = positions[table.name] || { x: 100, y: 100 };
              const isSelected = selectedTable === table.name;
              const isHovered = hoveredTable === table.name;

              return (
                <div
                  key={table.name}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingTable(table.name);
                    setSelectedTable(table.name);
                    setDragOffset({
                      x: e.clientX - pos.x * zoom - pan.x,
                      y: e.clientY - pos.y * zoom - pan.y,
                    });
                  }}
                  onMouseEnter={() => setHoveredTable(table.name)}
                  onMouseLeave={() => setHoveredTable(null)}
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    width: `${CARD_WIDTH}px`,
                  }}
                  className={cn(
                    "absolute select-none rounded-xl border bg-white dark:bg-[#121124]/95 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-shadow cursor-move overflow-hidden",
                    isSelected
                      ? "border-purple-500 ring-2 ring-purple-500/30 shadow-purple-500/10"
                      : isHovered
                        ? "border-purple-500/60 shadow-md shadow-purple-500/5"
                        : "border-purple-200/60 dark:border-white/10"
                  )}
                >
                  {/* Table Card Header */}
                  <div className="h-11 px-3 border-b border-purple-200/50 dark:border-white/10 bg-purple-50/70 dark:bg-[#16152b] flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Table2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="text-xs font-bold font-mono text-foreground truncate">
                        {table.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono px-1.5 py-0 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20"
                      >
                        {table.rowCount} rows
                      </Badge>

                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl border border-purple-200/50 dark:border-white/10 bg-popover/95 backdrop-blur-xl p-1 z-50 text-xs shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              if (onSelectTable) onSelectTable(table.name);
                              else navigate(`/databases/${dbName}/tables/${table.name}`);
                            }}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2 text-purple-600 dark:text-purple-400" />
                            Open in Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => copyTableSql(table, e)}
                            className="cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5 mr-2 text-indigo-600 dark:text-indigo-400" />
                            Copy CREATE SQL
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border my-1" />
                          <DropdownMenuItem
                            onClick={() => {
                              window.navigator.clipboard.writeText(table.name);
                              toast.success("Table name copied");
                            }}
                            className="cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 mr-2" />
                            Copy Name
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Columns List */}
                  <div className="divide-y divide-purple-100 dark:divide-white/5 py-1">
                    {table.columns.map((col) => {
                      const isPK = col.pk > 0;
                      const isFK = table.foreignKeys?.some((fk) => fk.from === col.name);
                      const isIdentity = isPK && col.type.toLowerCase().includes("int");
                      const isNonNullable = col.notnull === 1;

                      return (
                        <div
                          key={col.name}
                          className={cn(
                            "h-7 px-3 flex items-center justify-between text-xs transition-colors hover:bg-purple-500/10",
                            isPK && "bg-purple-50/50 dark:bg-purple-500/5 font-medium"
                          )}
                        >
                          {/* Column Flags & Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Key / Identity / Nullability Icon */}
                            {isPK ? (
                              <span title="Primary Key">
                                <Key className="w-3 h-3 text-amber-500 shrink-0" />
                              </span>
                            ) : isIdentity ? (
                              <span title="Identity">
                                <Hash className="w-3 h-3 text-indigo-500 shrink-0" />
                              </span>
                            ) : isNonNullable ? (
                              <span
                                className="text-[9px] text-purple-600 dark:text-purple-400 shrink-0 font-mono font-bold"
                                title="Non-Nullable"
                              >
                                ◆
                              </span>
                            ) : (
                              <span
                                className="text-[9px] text-muted-foreground/60 shrink-0 font-mono"
                                title="Nullable"
                              >
                                ◇
                              </span>
                            )}

                            <span
                              className={cn(
                                "font-mono truncate text-[11px]",
                                isPK
                                  ? "text-foreground font-semibold"
                                  : isFK
                                    ? "text-purple-700 dark:text-purple-300 font-medium"
                                    : "text-foreground/90"
                              )}
                            >
                              {col.name}
                            </span>
                          </div>

                          {/* Column Type & FK Indicator */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isFK && (
                              <span
                                className="text-[9px] font-mono px-1 py-0 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                                title="Foreign Key"
                              >
                                FK
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {col.type || "ANY"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-4 px-3.5 py-2 rounded-xl border border-purple-200/50 dark:border-white/10 bg-white/90 dark:bg-[#0d0c18]/90 backdrop-blur-xl text-xs text-muted-foreground shadow-lg">
          <div className="flex items-center gap-1.5">
            <Key className="w-3 h-3 text-amber-500" />
            <span className="text-[11px] text-foreground">Primary key</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-indigo-500" />
            <span className="text-[11px] text-foreground">Identity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-pink-500" />
            <span className="text-[11px] text-foreground">Unique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground/70 font-mono">◇</span>
            <span className="text-[11px] text-foreground">Nullable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">
              ◆
            </span>
            <span className="text-[11px] text-foreground">Non-Nullable</span>
          </div>
        </div>

        {/* Canvas Minimap Viewport */}
        {diagram?.tables && diagram.tables.length > 0 && (
          <div className="absolute bottom-4 right-4 z-20 w-40 h-28 rounded-xl border border-purple-200/50 dark:border-white/10 bg-white/90 dark:bg-[#0d0c18]/90 backdrop-blur-xl p-2 shadow-lg hidden md:flex flex-col justify-between">
            <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Canvas Map</span>
              <span className="font-semibold">{diagram.tables.length} tables</span>
            </div>

            <div className="relative flex-1 rounded bg-slate-100 dark:bg-black/40 border border-purple-100 dark:border-white/5 my-1 overflow-hidden">
              {diagram.tables.map((t) => {
                const pos = positions[t.name] || { x: 0, y: 0 };
                const miniX = Math.min(130, Math.max(2, pos.x * 0.08));
                const miniY = Math.min(60, Math.max(2, pos.y * 0.08));
                return (
                  <div
                    key={t.name}
                    style={{ left: `${miniX}px`, top: `${miniY}px` }}
                    className={cn(
                      "absolute w-4 h-2.5 rounded-xs border",
                      selectedTable === t.name
                        ? "bg-purple-600 border-purple-500"
                        : "bg-purple-500/25 border-purple-500/40"
                    )}
                  />
                );
              })}
            </div>

            <div className="text-[9px] text-muted-foreground/80 font-mono text-center">
              Drag cards to arrange
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

interface RelationshipLine {
  id: string;
  fromTable: string;
  toTable: string;
  fromCol: string;
  toCol: string;
  onDelete: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pathData: string;
  isHighlighted: boolean;
}

const CARD_WIDTH = 260;
const HEADER_HEIGHT = 44;
const ROW_HEIGHT = 28;
const ROW_OFFSET_TOP = 4;

export default function SchemaVisualizer({ dbName, onSelectTable }: SchemaVisualizerProps) {
  const navigate = useNavigate();
  const { data: diagram, isLoading } = useSchemaDiagram(dbName);
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Interactive relationship highlighting
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Compute auto-layout positions for tables
  const computeInitialPositions = useCallback((tablesList?: TableDiagramInfo[]) => {
    if (!tablesList || tablesList.length === 0) return {};
    const cols = Math.max(1, Math.ceil(Math.sqrt(tablesList.length)));
    const xSpacing = 360;
    const ySpacing = 340;
    const initial: Record<string, TablePosition> = {};
    tablesList.forEach((t, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      initial[t.name] = {
        x: 80 + col * xSpacing,
        y: 60 + row * ySpacing,
      };
    });
    return initial;
  }, []);

  const [positions, setPositions] = useState<Record<string, TablePosition>>(() =>
    computeInitialPositions(diagram?.tables)
  );
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const autoLayout = useCallback(
    (tables: TableDiagramInfo[]) => {
      setPositions(computeInitialPositions(tables));
    },
    [computeInitialPositions]
  );

  useEffect(() => {
    if (diagram?.tables && diagram.tables.length > 0) {
      setPositions((prev) => {
        const hasAll = diagram.tables.every((t) => prev[t.name]);
        if (hasAll && Object.keys(prev).length > 0) return prev;
        return computeInitialPositions(diagram.tables);
      });
    }
  }, [diagram, computeInitialPositions]);

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
    const lines: RelationshipLine[] = [];

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

        const safeFromColIdx = fromColIdx >= 0 ? fromColIdx : 0;
        const safeToColIdx = toColIdx >= 0 ? toColIdx : 0;

        const y1 =
          fromPos.y + HEADER_HEIGHT + ROW_OFFSET_TOP + safeFromColIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
        const y2 =
          toPos.y + HEADER_HEIGHT + ROW_OFFSET_TOP + safeToColIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

        let x1: number;
        let x2: number;
        let pathData: string;

        const dxBetweenCards = toPos.x - (fromPos.x + CARD_WIDTH);
        const isTargetToTheRight = dxBetweenCards > 10;
        const isTargetToTheLeft = fromPos.x - (toPos.x + CARD_WIDTH) > 10;

        if (isTargetToTheRight) {
          x1 = fromPos.x + CARD_WIDTH;
          x2 = toPos.x;
          const curvature = Math.max(30, Math.min(160, Math.abs(x2 - x1) * 0.45));
          pathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
        } else if (isTargetToTheLeft) {
          x1 = fromPos.x;
          x2 = toPos.x + CARD_WIDTH;
          const curvature = Math.max(30, Math.min(160, Math.abs(x1 - x2) * 0.45));
          pathData = `M ${x1} ${y1} C ${x1 - curvature} ${y1}, ${x2 + curvature} ${y2}, ${x2} ${y2}`;
        } else {
          x1 = fromPos.x + CARD_WIDTH;
          x2 = toPos.x + CARD_WIDTH;
          const loopOffset = Math.max(50, Math.min(120, Math.abs(y2 - y1) * 0.35));
          pathData = `M ${x1} ${y1} C ${x1 + loopOffset} ${y1}, ${x2 + loopOffset} ${y2}, ${x2} ${y2}`;
        }

        const isHighlighted =
          hoveredTable === t.name ||
          hoveredTable === fk.table ||
          selectedTable === t.name ||
          selectedTable === fk.table;

        lines.push({
          id: `${t.name}-${fk.from}-${fk.table}-${fk.to || "id"}-${fkIdx}`,
          fromTable: t.name,
          toTable: fk.table,
          fromCol: fk.from,
          toCol: fk.to || "id",
          onDelete: fk.onDelete || "CASCADE",
          x1,
          y1,
          x2,
          y2,
          pathData,
          isHighlighted,
        });
      });
    });

    return lines;
  }, [diagram, positions, hoveredTable, selectedTable]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#fbfafd] dark:bg-[#090812] relative text-foreground">
      {/* Visualizer Toolbar */}
      <div className="h-12 border-b border-purple-200/50 dark:border-white/10 bg-white/80 dark:bg-[#0d0c18]/90 backdrop-blur-xl px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-xs font-mono text-purple-700 dark:text-purple-300">
            <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-foreground">Schema Visualizer</span>
          </div>

          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Find table or column..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border-purple-200/60 dark:border-white/10 bg-white/70 dark:bg-card/60 backdrop-blur-md text-foreground focus:border-purple-500/50"
            />
          </div>
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
            <span>Copy SQL</span>
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
              Loading database schema...
            </div>
          </div>
        ) : !diagram?.tables || diagram.tables.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Table2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No tables found</p>
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
              width={8000}
              height={8000}
              className="absolute left-0 top-0 overflow-visible z-10 pointer-events-none"
              style={{ minWidth: 8000, minHeight: 8000 }}
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
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
                </marker>
                <marker
                  id="arrow-highlighted"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
                </marker>
              </defs>

              {relationshipLines.map((line) => (
                <g key={line.id}>
                  {line.isHighlighted && (
                    <path
                      d={line.pathData}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth={5}
                      strokeOpacity={0.35}
                      strokeLinecap="round"
                    />
                  )}
                  <path
                    d={line.pathData}
                    fill="none"
                    stroke={line.isHighlighted ? "#9333ea" : "#8b5cf6"}
                    strokeWidth={line.isHighlighted ? 2.5 : 1.6}
                    strokeDasharray={line.isHighlighted ? "none" : "4 2"}
                    strokeOpacity={line.isHighlighted ? 1 : 0.7}
                    markerEnd={
                      line.isHighlighted ? "url(#arrow-highlighted)" : "url(#arrow-default)"
                    }
                    className="transition-all duration-150"
                  >
                    <title>{`${line.fromTable}.${line.fromCol} → ${line.toTable}.${line.toCol} (${line.onDelete})`}</title>
                  </path>
                  <circle
                    cx={line.x1}
                    cy={line.y1}
                    r={3}
                    fill={line.isHighlighted ? "#9333ea" : "#8b5cf6"}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                </g>
              ))}
            </svg>

            {/* Draggable Table Cards */}
            {filteredTables.map((table, idx) => {
              const pos = positions[table.name] || {
                x: 80 + (idx % Math.max(1, Math.ceil(Math.sqrt(filteredTables.length)))) * 360,
                y:
                  60 +
                  Math.floor(idx / Math.max(1, Math.ceil(Math.sqrt(filteredTables.length)))) * 340,
              };

              const isHovered = hoveredTable === table.name;
              const isSelected = selectedTable === table.name;
              const isConnected = relationshipLines.some(
                (l) => l.isHighlighted && (l.fromTable === table.name || l.toTable === table.name)
              );

              return (
                <div
                  key={table.name}
                  style={{
                    width: CARD_WIDTH,
                    transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                  }}
                  className={cn(
                    "absolute left-0 top-0 select-none rounded-2xl border transition-shadow z-20",
                    "bg-white/95 dark:bg-[#11101d]/95 backdrop-blur-xl shadow-xl",
                    isHovered || isSelected || isConnected
                      ? "border-purple-500 shadow-2xl shadow-purple-500/20 ring-1 ring-purple-500/40"
                      : "border-purple-200/60 dark:border-white/10 hover:border-purple-400/70 dark:hover:border-white/20"
                  )}
                  onMouseEnter={() => setHoveredTable(table.name)}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(table.name)}
                >
                  {/* Card Header (Drag Handle) */}
                  <div
                    onMouseDown={(e) => {
                      if (e.button === 0) {
                        e.stopPropagation();
                        setDraggingTable(table.name);
                        setDragOffset({
                          x: e.clientX - pos.x * zoom - pan.x,
                          y: e.clientY - pos.y * zoom - pan.y,
                        });
                      }
                    }}
                    className={cn(
                      "h-11 px-3 flex items-center justify-between rounded-t-2xl cursor-move border-b",
                      "border-purple-100 dark:border-white/5 bg-purple-500/[0.03] dark:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                        <Table2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-xs font-bold truncate text-foreground">
                        {table.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px] font-mono rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border-none font-normal"
                      >
                        {table.rowCount ?? 0} rows
                      </Badge>

                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
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
                  <div className="divide-y divide-purple-100/70 dark:divide-white/5 py-1">
                    {table.columns.map((col) => {
                      const isPK = col.pk > 0;
                      const fkInfo = table.foreignKeys?.find((fk) => fk.from === col.name);
                      const isFK = !!fkInfo;

                      return (
                        <div
                          key={col.name}
                          className={cn(
                            "h-7 px-3 flex items-center justify-between text-xs transition-colors hover:bg-purple-500/5",
                            isPK && "bg-purple-50/50 dark:bg-purple-500/5 font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isPK && (
                              <span title="Primary Key">
                                <Key className="w-3 h-3 text-amber-500 shrink-0" />
                              </span>
                            )}

                            <span
                              className={cn(
                                "font-mono truncate text-[11px]",
                                isPK ? "text-foreground font-semibold" : "text-foreground/90"
                              )}
                            >
                              {col.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isFK && (
                              <span
                                className="text-[9px] font-mono px-1 py-0 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                                title={
                                  fkInfo
                                    ? `References ${fkInfo.table}.${fkInfo.to || "id"} (${fkInfo.onDelete || "CASCADE"})`
                                    : "Foreign Key"
                                }
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
      </div>
    </div>
  );
}

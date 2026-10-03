import { ForeignKeyInfo, TableDiagramInfo } from "@/types/allType";

export const TABLE_WIDTH = 284;
export const TABLE_HEADER_HEIGHT = 48;
export const COLUMN_HEIGHT = 32;
export type Point = { x: number; y: number };
export type DiagramView = { zoom: number; pan: Point };
export const tableHeight = (table: TableDiagramInfo) =>
  TABLE_HEADER_HEIGHT + Math.max(table.columns.length, 1) * COLUMN_HEIGHT + 9;

export function layoutTables(tables: TableDiagramInfo[]): Record<string, Point> {
  const columns = Math.max(1, Math.ceil(Math.sqrt(tables.length)));
  const positions: Record<string, Point> = Object.create(null);
  let y = 0;
  for (let start = 0; start < tables.length; start += columns) {
    const row = tables.slice(start, start + columns);
    row.forEach((table, index) => {
      positions[table.name] = { x: index * (TABLE_WIDTH + 100), y };
    });
    y += Math.max(...row.map(tableHeight)) + 80;
  }
  return positions;
}

export function fitDiagram(
  tables: TableDiagramInfo[],
  positions: Record<string, Point>,
  size: { width: number; height: number }
): DiagramView {
  if (!tables.length) return { zoom: 1, pan: { x: 24, y: 24 } };
  const left = Math.min(...tables.map((table) => positions[table.name].x));
  const top = Math.min(...tables.map((table) => positions[table.name].y));
  const right = Math.max(...tables.map((table) => positions[table.name].x + TABLE_WIDTH));
  const bottom = Math.max(...tables.map((table) => positions[table.name].y + tableHeight(table)));
  const zoom = Math.min(
    1,
    Math.max(0.1, Math.min((size.width - 48) / (right - left), (size.height - 48) / (bottom - top)))
  );
  return {
    zoom,
    pan: {
      x: (size.width - (right - left) * zoom) / 2 - left * zoom,
      y: (size.height - (bottom - top) * zoom) / 2 - top * zoom,
    },
  };
}

// SQLite omits the target column for REFERENCES table; resolve its ordered primary key.
export function referencedColumn(fk: ForeignKeyInfo, target?: TableDiagramInfo) {
  return (
    fk.to ||
    target?.columns.filter((column) => column.pk > 0).sort((a, b) => a.pk - b.pk)[fk.seq]?.name ||
    null
  );
}

export function schemaSql(tables: TableDiagramInfo[]) {
  return tables
    .map((table) => table.sql?.trim())
    .filter(Boolean)
    .map((sql) => `${sql.replace(/;+\s*$/, "")};`)
    .join("\n\n");
}

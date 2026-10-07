import { CreateTriggerPayload, TableType } from "@/types/allType";

export const isReservedTriggerName = (name: string) => /^(sqlite_|_nebula_)/i.test(name);
const shadowSuffixes = [
  "content",
  "segments",
  "segdir",
  "docsize",
  "stat",
  "data",
  "idx",
  "config",
];

export function isVirtualTriggerTarget(name: string, tables: TableType[]) {
  return tables.some(
    (table) =>
      /^CREATE\s+VIRTUAL\s+TABLE/i.test(table.sql ?? "") &&
      (name === table.name || shadowSuffixes.some((suffix) => name === `${table.name}_${suffix}`))
  );
}

export function triggerTables(tables: TableType[]) {
  return tables.filter(
    (table) =>
      !isReservedTriggerName(table.name) &&
      (!table.type || table.type === "table") &&
      !isVirtualTriggerTarget(table.name, tables)
  );
}

export const sqlBytes = (value: string) => new TextEncoder().encode(value).length;
const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

export function triggerSQL(payload: CreateTriggerPayload) {
  let header = `CREATE TRIGGER ${quote(payload.name || "trigger_name")} ${payload.timing ?? "AFTER"} ${payload.event}`;
  if (payload.event === "UPDATE" && payload.update_of?.length)
    header += ` OF ${payload.update_of.map(quote).join(", ")}`;
  header += ` ON ${quote(payload.table_name)}`;
  if (payload.when?.trim()) header += `\nWHEN (${payload.when}\n)`;
  return `${header}\nBEGIN\n${payload.body || "  -- Add your SQL actions here."}\nEND;`;
}

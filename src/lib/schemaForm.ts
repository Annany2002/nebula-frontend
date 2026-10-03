export const COLUMN_TYPES = ["TEXT", "INTEGER", "REAL", "NUMERIC", "BOOLEAN", "DATETIME", "BLOB"];
export const DELETE_ACTIONS = ["NO ACTION", "RESTRICT", "CASCADE", "SET NULL"];

export function identifierError(value: string, label: string): string | null {
  const name = value.trim();
  if (!name) return `${label} is required.`;
  if (name.length > 64) return `${label} must be 64 characters or fewer.`;
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name))
    return `${label} must start with a letter or underscore and contain only letters, numbers, and underscores.`;
  return null;
}
export function columnNameError(value: string, existing: string[] = []): string | null {
  const error = identifierError(value, "Column name");
  if (error) return error;
  const name = value.trim().toLowerCase();
  if (name === "id" || name === "created_at")
    return `${value.trim()} is a protected system column.`;
  if (existing.some((item) => item.toLowerCase() === name))
    return `A column named ${value.trim()} already exists.`;
  return null;
}
export function tableNameError(value: string, existing: string[] = []): string | null {
  const error = identifierError(value, "Table name");
  if (error) return error;
  if (value.trim().toLowerCase().startsWith("sqlite_"))
    return "Names beginning with sqlite_ are reserved by SQLite.";
  if (existing.some((item) => item.toLowerCase() === value.trim().toLowerCase()))
    return `A table named ${value.trim()} already exists.`;
  return null;
}

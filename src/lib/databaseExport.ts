import { url } from "@/lib/config";

export interface SqlExport {
  sql: string;
  filename: string;
}

async function requestExport(dbName: string, format: "sql" | "sqlite", signal?: AbortSignal) {
  if (!dbName) throw new Error("Database name required.");
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Sign in again to export your database.");
  const response = await fetch(
    `${url}/api/v1/databases/${encodeURIComponent(dbName)}/export/${format}`,
    { headers: { Authorization: `Bearer ${token}` }, signal }
  );
  if (!response.ok)
    throw new Error(
      `Couldn’t generate the ${format === "sql" ? "SQL" : "SQLite"} export. Try again.`
    );
  return response;
}

export async function fetchSqlExport(dbName: string, signal?: AbortSignal): Promise<SqlExport> {
  const response = await requestExport(dbName, "sql", signal);
  const result = await response.json();
  if (!result || typeof result.sql !== "string" || !result.sql.trim()) {
    throw new Error("The server returned an incomplete SQL export. Try again.");
  }
  return {
    sql: result.sql,
    filename:
      typeof result.filename === "string" && result.filename.trim()
        ? result.filename
        : `${dbName}.sql`,
  };
}

export async function fetchSqliteExport(dbName: string, signal?: AbortSignal): Promise<Blob> {
  const response = await requestExport(dbName, "sqlite", signal);
  const file = await response.blob();
  const signature = new TextDecoder().decode(await file.slice(0, 16).arrayBuffer());
  if (signature !== "SQLite format 3\0") {
    throw new Error("The server returned an invalid SQLite file. Try again.");
  }
  return file;
}

export function downloadExport(file: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}

import { url } from "@/lib/config";

export const MAX_SQLITE_IMPORT_BYTES = 64 * 1024 * 1024;

export interface SQLiteImportResponse {
  message: string;
  db_name: string;
  size_bytes: number;
}

export interface SQLiteImportProgress {
  phase: "uploading" | "processing";
  percent: number | null;
}

export class SQLiteImportError extends Error {
  constructor(
    message: string,
    readonly outcomeUnknown = false
  ) {
    super(message);
    this.name = "SQLiteImportError";
  }
}

export function suggestedDatabaseName(filename: string) {
  return (
    filename
      .replace(/\.(db|sqlite|sqlite3)$/i, "")
      .replace(/[^a-zA-Z0-9_]+/g, "_")
      .slice(0, 64) || "imported_db"
  );
}

export async function validateSQLiteFile(file: File) {
  if (file.size > MAX_SQLITE_IMPORT_BYTES) {
    throw new SQLiteImportError("Choose a SQLite snapshot no larger than 64 MiB.");
  }
  if (file.size < 512) {
    throw new SQLiteImportError("This file is too small to be a SQLite snapshot.");
  }
  let header: ArrayBuffer;
  try {
    header = await file.slice(0, 16).arrayBuffer();
  } catch {
    throw new SQLiteImportError("This file couldn’t be read. Choose it again.");
  }
  if (new TextDecoder().decode(header) !== "SQLite format 3\0") {
    throw new SQLiteImportError(
      "Choose a SQLite database file. SQL dumps and archives aren’t supported."
    );
  }
}

interface SQLiteImportRequest {
  file: File;
  dbName: string;
  token: string | null;
  signal: AbortSignal;
  onProgress: (progress: SQLiteImportProgress) => void;
}

// XHR supplies upload progress. The browser sets the multipart boundary, and
// this write is never retried: a lost response can conceal a completed import.
export function uploadSQLiteDatabase({
  file,
  dbName,
  token,
  signal,
  onProgress,
}: SQLiteImportRequest): Promise<SQLiteImportResponse> {
  if (!token) return Promise.reject(new SQLiteImportError("Sign in again to import a database."));
  if (signal.aborted)
    return Promise.reject(new SQLiteImportError("Import stopped before uploading."));
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(dbName)) {
    return Promise.reject(
      new SQLiteImportError("Use 1–64 letters, numbers or underscores for the database name.")
    );
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    let settled = false;
    const finish = (result: SQLiteImportResponse | SQLiteImportError) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", abort);
      xhr.upload.onprogress = null;
      xhr.upload.onload = null;
      if (result instanceof SQLiteImportError) reject(result);
      else resolve(result);
    };
    xhr.open("POST", `${url}/api/v1/databases/import/sqlite`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.timeout = 75_000;
    xhr.upload.onprogress = (event) => {
      const percent = event.lengthComputable
        ? Math.min(100, Math.floor((event.loaded / event.total) * 100))
        : null;
      onProgress({ phase: percent === 100 ? "processing" : "uploading", percent });
    };
    xhr.upload.onload = () => onProgress({ phase: "processing", percent: 100 });
    xhr.onerror = () =>
      finish(
        new SQLiteImportError(
          "The import response couldn’t be confirmed. Check your databases before trying again.",
          true
        )
      );
    xhr.ontimeout = () =>
      finish(
        new SQLiteImportError(
          "The import timed out. Check your databases before trying again.",
          true
        )
      );
    xhr.onabort = () =>
      finish(
        new SQLiteImportError(
          "Import stopped. The server may already have created the database. Check your databases before trying again.",
          true
        )
      );
    xhr.onload = () => {
      let data: unknown;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      const body = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
      if (
        xhr.status === 201 &&
        body?.db_name === dbName &&
        body.size_bytes === file.size &&
        typeof body.message === "string" &&
        body.message.trim()
      ) {
        finish({ message: body.message, db_name: dbName, size_bytes: file.size });
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        finish(
          new SQLiteImportError(
            "The server’s response was incomplete. Check your databases before trying again.",
            true
          )
        );
        return;
      }
      const messages: Record<number, string> = {
        401: "Sign in again to import a database.",
        403: "Your session cannot import databases. Sign in again.",
        404: "This server doesn’t support SQLite imports yet.",
        405: "This server doesn’t support SQLite imports yet.",
        409: "A database or file with this name already exists. Choose a different name.",
        413: "Choose a SQLite snapshot no larger than 64 MiB.",
        503: "Database import is busy. Try again shortly.",
      };
      const unknown =
        xhr.status === 408 || (xhr.status >= 500 && xhr.status !== 503) || xhr.status === 0;
      const serverMessage =
        typeof body?.error === "string" && body.error.trim() ? body.error : null;
      finish(
        new SQLiteImportError(
          messages[xhr.status] ||
            (unknown
              ? "The import couldn’t be confirmed. Check your databases before trying again."
              : serverMessage ||
                "The snapshot couldn’t be imported. Check the file and try again."),
          unknown
        )
      );
    };
    signal.addEventListener("abort", abort, { once: true });
    const form = new FormData();
    form.append("db_name", dbName);
    form.append("file", file);
    onProgress({ phase: "uploading", percent: 0 });
    try {
      xhr.send(form);
    } catch {
      finish(
        new SQLiteImportError("The upload couldn’t start. Check your connection and try again.")
      );
    }
  });
}

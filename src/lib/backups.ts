import { z } from "zod";
import { url } from "@/lib/config";

export const MAX_BACKUP_BYTES = 64 * 1024 * 1024;
export const backupIdSchema = z
  .string()
  .uuid()
  .refine((id) => id === id.toLowerCase() && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(id));
export const databaseNameSchema = z.string().regex(/^[a-zA-Z0-9_]{1,64}$/);
const backupSchema = z
  .object({
    backup_id: backupIdSchema,
    db_name: databaseNameSchema,
    status: z.enum(["creating", "ready", "deleting"]),
    size_bytes: z.number().int().min(0).max(MAX_BACKUP_BYTES),
    sha256: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (backup) =>
      backup.status !== "ready" ||
      (backup.size_bytes >= 512 && /^[a-f0-9]{64}$/.test(backup.sha256))
  );
export type DatabaseBackup = z.infer<typeof backupSchema>;
const envelopeSchema = z.object({ backup: backupSchema });
const listSchema = z.object({
  backups: z.array(backupSchema).max(100),
  pagination: z.object({
    total: z.number().int().nonnegative(),
    limit: z.number().int().min(1).max(100),
    offset: z.number().int().min(0).max(1_000_000),
  }),
});

export class BackupError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    readonly code = "",
    readonly outcomeUnknown = false
  ) {
    super(message);
    this.name = "BackupError";
  }
}

// Keep the deadline active until the body has been consumed, not just headers.
async function request<T>(
  path: string,
  options: RequestInit,
  consume: (response: Response, signal: AbortSignal) => Promise<T>
) {
  const token = localStorage.getItem("token");
  if (!token) throw new BackupError("Sign in again to manage backups.", 401);
  const controller = new AbortController();
  const abort = () => controller.abort();
  const signal = options.signal;
  if (signal?.aborted) throw new BackupError("Request stopped before sending.");
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 60_000);
  const write = options.method === "POST" || options.method === "DELETE";
  try {
    const response = await fetch(`${url}/api/v1/${path}`, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const code = typeof body?.code === "string" ? body.code : "";
      const messages: Record<string, string> = {
        invalid_backup_request:
          "This database or request couldn’t pass snapshot validation. Check its schema and integrity before trying again.",
        backup_not_found:
          "The backup or source database is no longer available. Refresh your projects and backup history.",
        backup_quota_exceeded:
          "Your account has reached its backup count or storage limit. Download and delete an older backup before creating another.",
        backup_busy: "Backup processing is busy. Check the request status before retrying.",
        backup_unavailable:
          "This backup is missing or failed its integrity check. Choose another backup.",
        backup_id_conflict:
          "This backup request ID is already reserved. Refresh the history before creating another backup.",
        database_exists: "A database or file with this name already exists. Choose another name.",
        snapshot_too_large: "This database exceeds the 64 MiB snapshot limit.",
      };
      const unknown = write && (response.status === 408 || response.status >= 500);
      const message =
        response.status === 401 || response.status === 403
          ? "Sign in again with the database owner's account to manage backups."
          : response.status === 404 && code !== "backup_not_found"
            ? "Saved backups require an updated Nebula server. On-demand exports are still available below."
            : messages[code] ||
              (unknown
                ? "The server response couldn’t be confirmed. Check the request status before retrying."
                : response.status === 429
                  ? "Too many requests. Wait a moment and try again."
                  : "This backup request couldn’t be completed. Refresh and try again.");
      throw new BackupError(message, response.status, code, unknown);
    }
    return await consume(response, controller.signal);
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError(
      write
        ? "This request couldn’t be confirmed. The server may have completed it. Check its status before retrying."
        : "This request couldn’t be completed. Check your connection and try again.",
      0,
      "",
      write
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
    controller.abort();
  }
}

async function parse<T>(response: Response, schema: z.ZodType<T>, write = false): Promise<T> {
  const result = schema.safeParse(await response.json().catch(() => null));
  if (!result.success)
    throw new BackupError(
      "The server returned an incomplete response. Refresh before retrying.",
      response.status,
      "invalid_response",
      write
    );
  return result.data;
}

export function listBackups(dbName: string | undefined, offset: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: "10", offset: String(offset) });
  if (dbName) params.set("db_name", dbName);
  return request(`backups?${params}`, { signal }, async (response) => {
    const data = await parse(response, listSchema);
    if (
      data.pagination.limit !== 10 ||
      data.pagination.offset !== offset ||
      (dbName && data.backups.some((backup) => backup.db_name !== dbName))
    )
      throw new BackupError("The server returned an inconsistent backup history.");
    return data;
  });
}

export function getBackup(id: string, signal?: AbortSignal) {
  return request(`backups/${encodeURIComponent(id)}`, { signal }, async (response) => {
    const { backup } = await parse(response, envelopeSchema);
    if (backup.backup_id !== id) throw new BackupError("The server returned a different backup.");
    return backup;
  });
}

export function getBackupDatabaseNames(signal?: AbortSignal) {
  return request("databases", { signal }, async (response) => {
    const data = await parse(
      response,
      z.object({ databases: z.array(z.object({ dbName: databaseNameSchema })) })
    );
    return data.databases.map((database) => database.dbName);
  });
}

export function createBackup(dbName: string, id: string, signal?: AbortSignal) {
  return request(
    `databases/${encodeURIComponent(dbName)}/backups`,
    { method: "POST", body: JSON.stringify({ backup_id: id }), signal },
    async (response) => {
      const { backup } = await parse(response, envelopeSchema, true);
      if (
        ![200, 201].includes(response.status) ||
        backup.backup_id !== id ||
        backup.db_name !== dbName ||
        backup.status !== "ready"
      )
        throw new BackupError(
          "The saved backup couldn’t be confirmed. Check its status before retrying.",
          response.status,
          "invalid_response",
          true
        );
      return backup;
    }
  );
}

export function restoreBackup(backup: DatabaseBackup, dbName: string, signal?: AbortSignal) {
  return request(
    `backups/${backup.backup_id}/restore`,
    { method: "POST", body: JSON.stringify({ db_name: dbName }), signal },
    async (response) => {
      const result = await parse(
        response,
        z.object({
          message: z.string().min(1),
          backup_id: backupIdSchema,
          db_name: databaseNameSchema,
          size_bytes: z.number().int(),
        }),
        true
      );
      if (
        response.status !== 201 ||
        result.backup_id !== backup.backup_id ||
        result.db_name !== dbName ||
        result.size_bytes !== backup.size_bytes
      )
        throw new BackupError(
          "The restore couldn’t be confirmed. Check your databases before retrying.",
          response.status,
          "invalid_response",
          true
        );
      return result;
    }
  );
}

export function deleteBackup(id: string, signal?: AbortSignal) {
  return request(`backups/${id}`, { method: "DELETE", signal }, async (response) => {
    if (response.status !== 204)
      throw new BackupError(
        "Deletion couldn’t be confirmed. Check the request status.",
        response.status,
        "invalid_response",
        true
      );
  });
}

export function downloadBackup(backup: DatabaseBackup, signal?: AbortSignal) {
  return request(
    `backups/${backup.backup_id}/download`,
    { signal },
    async (response, activeSignal) => {
      if (Number(response.headers.get("Content-Length")) !== backup.size_bytes || !response.body)
        throw new BackupError("The download size doesn’t match this backup.");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > backup.size_bytes || size > MAX_BACKUP_BYTES)
            throw new BackupError("The download exceeds this backup's recorded size.");
          chunks.push(new Uint8Array(value));
        }
      } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
      const file = new Blob(chunks, { type: "application/octet-stream" });
      if (
        size !== backup.size_bytes ||
        new TextDecoder().decode(await file.slice(0, 16).arrayBuffer()) !== "SQLite format 3\0"
      )
        throw new BackupError("The server returned an incomplete or invalid SQLite backup.");
      if (crypto.subtle) {
        const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        const hash = Array.from(new Uint8Array(digest), (byte) =>
          byte.toString(16).padStart(2, "0")
        ).join("");
        if (hash !== backup.sha256)
          throw new BackupError("The download failed its integrity check. No file was saved.");
      }
      if (activeSignal.aborted) throw new BackupError("The download was cancelled.");
      return file;
    }
  );
}

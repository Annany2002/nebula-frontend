import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { url } from "@/lib/config";
import {
  BackupError,
  DatabaseBackup,
  backupIdSchema,
  createBackup,
  databaseNameSchema,
  deleteBackup,
  downloadBackup,
  getBackup,
  getBackupDatabaseNames,
  listBackups,
  restoreBackup,
} from "@/lib/backups";
import { downloadExport } from "@/lib/databaseExport";

const intentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("create"), id: backupIdSchema }),
  z.object({ kind: z.literal("delete"), id: backupIdSchema }),
  z.object({ kind: z.literal("restore"), id: backupIdSchema, name: databaseNameSchema }),
]);
type Intent = z.infer<typeof intentSchema>;
const failureMessage = (error: unknown) =>
  error instanceof Error ? error.message : "This request couldn’t be completed. Try again.";

export function useBackups(dbName: string | undefined, offset: number) {
  const client = useQueryClient();
  const owner = localStorage.getItem("user_id");
  const storageKey = `nebula:backup-request:v1:${url}:${owner}:${dbName ?? "*"}`;
  const [initial] = useState(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return { intent: stored ? intentSchema.parse(JSON.parse(stored)) : null, error: "" };
    } catch {
      return {
        intent: null,
        error:
          "Your saved request state couldn’t be read. Enable session storage and reload before managing backups.",
      };
    }
  });
  const [intent, setIntent] = useState<Intent | null>(initial.intent);
  const [error, setError] = useState(initial.error);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [destination, setDestination] = useState("");
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const journal = useRef(intent);
  const history = useQuery({
    queryKey: ["backups", owner, dbName, offset],
    queryFn: ({ signal }) => listBackups(dbName, offset, signal),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.backups.some((backup) => backup.status !== "ready") ? 5000 : false,
    refetchIntervalInBackground: false,
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
    };
  }, []);

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["backups", owner] });
    void client.invalidateQueries({ queryKey: ["databases"] });
  };
  const saveIntent = (next: Intent | null) => {
    // Persist before sending a write. A remount must not silently replace an
    // unconfirmed request with a new backup ID or restore destination.
    try {
      if (next) sessionStorage.setItem(storageKey, JSON.stringify(next));
      else sessionStorage.removeItem(storageKey);
    } catch {
      throw new Error(
        "Request state couldn’t be saved. Enable session storage before managing backups."
      );
    }
    journal.current = next;
    if (mounted.current) {
      setIntent(next);
      setCanRetry(false);
    }
  };
  const run = async <T>(
    label: string,
    task: (signal: AbortSignal) => Promise<T>,
    refreshAfter = true
  ) => {
    if (request.current || initial.error) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(label);
    setError("");
    setStatus("");
    try {
      return await task(controller.signal);
    } catch (failure) {
      if (mounted.current) setError(failureMessage(failure));
    } finally {
      request.current = null;
      if (refreshAfter) refresh();
      if (mounted.current) setBusy(null);
    }
  };

  const perform = async (next: Intent, signal: AbortSignal) => {
    saveIntent(next);
    try {
      if (next.kind === "create") {
        if (!dbName) throw new BackupError("Choose a database before creating a backup.");
        await createBackup(dbName, next.id, signal);
      } else if (next.kind === "delete") await deleteBackup(next.id, signal);
      else {
        // Read current metadata instead of trusting a stale row's size.
        const backup = await getBackup(next.id, signal);
        if (backup.status !== "ready")
          throw new BackupError("This backup is still processing. Refresh before restoring.");
        await restoreBackup(backup, next.name, signal);
      }
    } catch (failure) {
      if (failure instanceof BackupError && !failure.outcomeUnknown) saveIntent(null);
      throw failure;
    }
    saveIntent(null);
    if (mounted.current) {
      setStatus(
        next.kind === "create"
          ? "Backup saved."
          : next.kind === "delete"
            ? "Backup deleted."
            : `Restored into ${next.name}.`
      );
      if (next.kind === "restore") setDestination(next.name);
    }
    return true;
  };

  const create = () =>
    run("Creating backup…", async (signal) => {
      if (journal.current || !dbName) return;
      if (!crypto.randomUUID)
        throw new Error("Use a secure browser connection to create a backup.");
      await perform({ kind: "create", id: crypto.randomUUID() }, signal);
    });
  const restore = (id: string, name: string) =>
    run("Restoring backup…", async (signal) => {
      if (journal.current) return;
      if (!databaseNameSchema.safeParse(name).success)
        throw new Error("Use 1–64 letters, numbers or underscores.");
      return perform({ kind: "restore", id, name }, signal);
    });
  const remove = (id: string) =>
    run("Deleting backup…", async (signal) => {
      if (journal.current) return;
      return perform({ kind: "delete", id }, signal);
    });
  const download = (backup: DatabaseBackup) =>
    run(
      "Preparing download…",
      async (signal) => {
        const file = await downloadBackup(backup, signal);
        if (mounted.current && !signal.aborted) {
          downloadExport(file, `${backup.db_name}-${backup.backup_id}.db`);
          setStatus("Download started.");
        }
      },
      false
    );
  const check = () =>
    run("Checking request…", async (signal) => {
      const current = journal.current;
      if (!current) return;
      if (current.kind === "restore") {
        // Inventory is read directly: cached data cannot settle an uncertain write.
        const names = await getBackupDatabaseNames(signal);
        if (!mounted.current) return;
        if (names.includes(current.name)) {
          saveIntent(null);
          setDestination(current.name);
          setStatus(`A database named ${current.name} exists. Open it to inspect the result.`);
        } else {
          setCanRetry(true);
          setStatus(`No database named ${current.name} was found. You can retry the same restore.`);
        }
        return;
      }
      let backup: DatabaseBackup;
      try {
        backup = await getBackup(current.id, signal);
      } catch (failure) {
        if (
          !(failure instanceof BackupError) ||
          failure.status !== 404 ||
          failure.code !== "backup_not_found"
        )
          throw failure;
        if (!mounted.current) return;
        if (current.kind === "delete") {
          saveIntent(null);
          setStatus("This backup is no longer listed.");
        } else {
          setCanRetry(true);
          setStatus("No saved backup was found. You can retry the same request safely.");
        }
        return;
      }
      if (!mounted.current) return;
      if (current.kind === "create" && backup.db_name !== dbName)
        throw new Error(
          "This request belongs to a different database. Contact your server administrator."
        );
      if (current.kind === "create" && backup.status === "ready") {
        saveIntent(null);
        setStatus("Your backup was saved successfully.");
      } else if (current.kind === "delete" && backup.status !== "creating") {
        setCanRetry(true);
        setStatus("The backup is still listed. You can retry deletion.");
      } else setStatus("The server is still processing this request. Check again shortly.");
    });
  const retry = () =>
    run("Retrying request…", async (signal) => {
      const current = journal.current;
      if (current && canRetry) {
        setCanRetry(false);
        return perform(current, signal);
      }
    });

  return {
    history,
    intent,
    busy,
    error,
    status,
    canRetry,
    destination,
    blocked: !!busy || !!intent || !!initial.error,
    create,
    restore,
    remove,
    download,
    check,
    retry,
    cancel: () => request.current?.abort(),
  };
}

import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ArrowUpRight,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBackups } from "@/hooks/useBackups";
import { useDatabases } from "@/hooks/queries";
import { DatabaseBackup, databaseNameSchema } from "@/lib/backups";
import "@/styles/managed-backups.css";

const timestamp = (backup: DatabaseBackup) =>
  new Date(backup.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KiB`
    : `${(bytes / (1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 2 })} MiB`;

export default function ManagedBackups({ dbName }: { dbName?: string }) {
  const id = useId();
  const [offset, setOffset] = useState(0);
  const operations = useBackups(dbName, offset);
  const { history, blocked, busy, intent } = operations;
  const databases = useDatabases();
  const sourceExists = dbName ? databases.data?.some((db) => db.dbName === dbName) : false;
  const [restoring, setRestoring] = useState<DatabaseBackup | null>(null);
  const [deleting, setDeleting] = useState<DatabaseBackup | null>(null);
  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const restoreTrigger = useRef<HTMLButtonElement | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trimmed = name.trim();
  const duplicate = databases.data?.some((db) => db.dbName === trimmed);
  const nameError =
    trimmed && !databaseNameSchema.safeParse(trimmed).success
      ? "Use 1–64 letters, numbers or underscores."
      : duplicate
        ? "This database name is already in use."
        : "";
  const total = history.data?.pagination.total ?? 0;
  const backups = history.data?.backups ?? [];
  const closeRestore = () => {
    setRestoring(null);
    restoreTrigger.current?.focus();
  };

  return (
    <section className="db-backups" aria-labelledby={`${id}-title`}>
      <div className="db-backups-heading">
        <div>
          <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>
            Saved backups
          </h2>
          <p>
            {dbName
              ? "Keep a snapshot now, restore into a new database later."
              : "Restore or download snapshots from all your projects, including deleted databases."}
          </p>
        </div>
        <div className="db-export-actions">
          <Button
            variant="outline"
            disabled={!!busy || history.isFetching}
            onClick={() => void history.refetch()}
            aria-label="Refresh backup history"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </Button>
          {dbName && (
            <Button
              disabled={blocked || !history.isSuccess || sourceExists === false}
              onClick={() => {
                setOffset(0);
                void operations.create();
              }}
            >
              <Plus size={14} aria-hidden="true" />
              Create backup
            </Button>
          )}
        </div>
      </div>
      <p className="db-backups-policy">
        Stored on this server. Download a copy for safekeeping. Up to 64 MiB per snapshot and 20
        backups per account, within 256 MiB of storage.
      </p>
      {dbName && sourceExists === false && (
        <p className="db-export-status">
          The source database is no longer in your projects. Saved backups can still be downloaded
          or restored.
        </p>
      )}
      {operations.error && !deleting && (
        <p className="db-export-error" role="alert">
          {operations.error}
        </p>
      )}
      {busy && (
        <div className="db-backups-progress" role="status">
          <Loader2
            size={15}
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span>{busy}</span>
          <Button variant="ghost" onClick={operations.cancel}>
            Stop waiting
          </Button>
        </div>
      )}
      {intent && !busy && (
        <div className="db-backups-recovery" role="status">
          <div>
            <strong>
              Confirm your last{" "}
              {intent.kind === "create"
                ? "backup"
                : intent.kind === "restore"
                  ? "restore"
                  : "deletion"}{" "}
              request
            </strong>
            <p>
              The server may have completed it.{" "}
              {intent.kind === "restore"
                ? `Destination: ${intent.name}.`
                : `Request: ${intent.id.slice(0, 8)}.`}
            </p>
          </div>
          <div className="db-export-actions">
            <Button variant="outline" onClick={() => void operations.check()}>
              Check request status
            </Button>
            {operations.canRetry && (
              <Button onClick={() => void operations.retry()}>Retry same request</Button>
            )}
          </div>
        </div>
      )}
      <p className="db-export-status" role="status">
        {operations.status}
      </p>
      {operations.destination && (
        <Link
          className="db-backups-destination"
          to={`/databases/${encodeURIComponent(operations.destination)}/overview`}
        >
          Open {operations.destination}
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      )}

      {restoring && (
        <form
          className="db-backups-restore"
          aria-labelledby={`${id}-restore-title`}
          onSubmit={async (event) => {
            event.preventDefault();
            if (!trimmed || nameError || blocked) return;
            const success = await operations.restore(restoring.backup_id, trimmed);
            if (success) closeRestore();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !busy && !intent) {
              event.preventDefault();
              closeRestore();
            }
          }}
        >
          <div className="db-backups-heading">
            <div>
              <h3 id={`${id}-restore-title`}>Restore backup</h3>
              <p>
                {timestamp(restoring)} · {sizeLabel(restoring.size_bytes)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close restore"
              disabled={!!busy || !!intent}
              onClick={closeRestore}
            >
              <X size={16} />
            </Button>
          </div>
          <p>
            Creates a new database with this snapshot's schema and records. Account credentials and
            API keys aren’t copied.
          </p>
          <label htmlFor={`${id}-name`}>New database name</label>
          <div className="db-backups-restore-controls">
            <Input
              ref={nameRef}
              id={`${id}-name`}
              value={name}
              maxLength={64}
              autoComplete="off"
              spellCheck={false}
              disabled={blocked}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={!!nameError}
              aria-describedby={`${id}-name-help${nameError ? ` ${id}-name-error` : ""}`}
            />
            <Button type="submit" disabled={blocked || !trimmed || !!nameError}>
              Restore into new database
            </Button>
          </div>
          <p id={`${id}-name-help`}>
            1–64 letters, numbers or underscores. Choose a name that isn’t in use.
          </p>
          {nameError && (
            <p id={`${id}-name-error`} className="db-export-error" role="alert">
              {nameError}
            </p>
          )}
        </form>
      )}

      {history.isPending ? (
        <div className="db-backups-skeleton" role="status" aria-label="Loading backups">
          <div />
          <div />
          <div />
        </div>
      ) : history.isError ? (
        <div className="db-backups-empty" role="alert">
          <p>{history.error.message}</p>
          <Button
            variant="outline"
            disabled={history.isFetching}
            onClick={() => void history.refetch()}
          >
            Retry history
          </Button>
        </div>
      ) : backups.length === 0 ? (
        <div className="db-backups-empty">
          <Archive size={22} aria-hidden="true" />
          <h3>{total ? "No backups on this page" : "No saved backups yet"}</h3>
          <p>
            {total
              ? "Return to the first page to view current backups."
              : dbName
                ? "Create a backup to preserve this database's current schema and records."
                : "Create a backup from a database's Backups & export page."}
          </p>
          {offset > 0 && (
            <Button variant="outline" onClick={() => setOffset(0)}>
              First page
            </Button>
          )}
        </div>
      ) : (
        <ul className="db-backups-list" aria-label="Saved database backups">
          {backups.map((backup) => (
            <li key={backup.backup_id}>
              <div className="db-backups-details">
                <time dateTime={backup.created_at}>{timestamp(backup)}</time>
                {!dbName && (
                  <strong className="text-xs font-medium break-all">{backup.db_name}</strong>
                )}
                <span>
                  <code title={backup.backup_id}>{backup.backup_id.slice(0, 8)}</code> ·{" "}
                  {backup.status === "ready" ? sizeLabel(backup.size_bytes) : "Size pending"}
                </span>
                {backup.status === "ready" && (
                  <code className="db-backups-checksum" title={`SHA-256: ${backup.sha256}`}>
                    SHA-256 {backup.sha256.slice(0, 12)}…
                  </code>
                )}
              </div>
              <span className={`db-backups-state is-${backup.status}`}>
                {backup.status === "ready"
                  ? "Ready"
                  : backup.status === "creating"
                    ? "Creating…"
                    : "Deleting…"}
              </span>
              <div className="db-export-actions">
                <Button
                  variant="outline"
                  disabled={!!busy || backup.status !== "ready"}
                  onClick={() => void operations.download(backup)}
                  aria-label={`Download backup ${backup.backup_id.slice(0, 8)}`}
                >
                  <Download size={14} aria-hidden="true" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  disabled={blocked || backup.status !== "ready"}
                  onClick={(event) => {
                    restoreTrigger.current = event.currentTarget;
                    setRestoring(backup);
                    setName(`${backup.db_name.slice(0, 55)}_restored`);
                    requestAnimationFrame(() => nameRef.current?.focus());
                  }}
                  aria-label={`Restore backup ${backup.backup_id.slice(0, 8)}`}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={blocked || backup.status !== "ready"}
                  aria-label={`Delete backup ${backup.backup_id.slice(0, 8)}`}
                  onClick={(event) => {
                    deleteTrigger.current = event.currentTarget;
                    setDeleting(backup);
                  }}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {total > 0 && (
        <div className="db-backups-pagination">
          <span>
            {backups.length
              ? `${offset + 1}–${offset + backups.length} of ${total}`
              : `${total} saved backups`}
          </span>
          <div className="db-export-actions">
            <Button
              variant="outline"
              disabled={offset === 0 || history.isFetching}
              onClick={() => setOffset(Math.max(0, offset - 10))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={offset + 10 >= total || history.isFetching}
              onClick={() => setOffset(offset + 10)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <AlertDialogContent
          className="max-w-[calc(100vw-2rem)] sm:max-w-md motion-reduce:animate-none"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (deleteTrigger.current?.isConnected && !deleteTrigger.current.disabled)
              deleteTrigger.current.focus();
            else headingRef.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved backup?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting &&
                `${deleting.db_name} · ${timestamp(deleting)} · ${deleting.backup_id.slice(0, 8)}.`}{" "}
              This permanently removes the saved snapshot. Your live database stays unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {operations.error && (
            <p className="text-sm text-destructive" role="alert">
              {operations.error}
            </p>
          )}
          {intent && !busy && (
            <p className="text-sm text-muted-foreground">
              Close this dialog and check the request status before retrying.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (busy) operations.cancel();
                setDeleting(null);
              }}
            >
              {busy ? "Stop waiting" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={blocked}
              onClick={async (event) => {
                event.preventDefault();
                if (deleting && (await operations.remove(deleting.backup_id))) {
                  deleteTrigger.current = null;
                  setDeleting(null);
                }
              }}
            >
              {busy ? "Deleting…" : "Delete backup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

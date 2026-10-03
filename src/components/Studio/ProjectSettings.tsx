import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, Download, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteDatabase } from "@/hooks/queries";
import { useAuth } from "@/context/auth-context";
import { DatabaseDetailType, TableType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import "@/styles/settings.css";

interface ProjectSettingsProps {
  dbName: string;
  details?: DatabaseDetailType;
  detailsLoading: boolean;
  detailsError: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  tables: TableType[];
}
function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** unit).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${["B", "KB", "MB", "GB"][unit]}`;
}
export default function ProjectSettings({
  dbName,
  details,
  detailsLoading,
  detailsError,
  refreshing,
  onRefresh,
  tables,
}: ProjectSettingsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = useId();
  const deletion = useDeleteDatabase();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [copied, setCopied] = useState<{ field: "name" | "id"; value: string } | null>(null);
  const [copyError, setCopyError] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const deleteTrigger = useRef<HTMLButtonElement>(null);
  const deleteSubmitted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(copyTimer.current);
    };
  }, []);
  const createdAt = formatDateTime(details?.createdAt);
  const knownRows = tables.every((table) => typeof table.rowCount === "number");
  const recordCount =
    details?.totalRecords ??
    (knownRows ? tables.reduce((sum, table) => sum + (table.rowCount ?? 0), 0) : null);
  const size =
    details?.sizeDisplay ||
    (typeof details?.sizeBytes === "number" &&
    Number.isFinite(details.sizeBytes) &&
    details.sizeBytes >= 0
      ? fileSize(details.sizeBytes)
      : "Unavailable");
  const databaseId = details?.databaseId == null ? "Unavailable" : String(details.databaseId);
  const copy = async (value: string, field: "name" | "id") => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(value);
      if (!mounted.current) return;
      setCopied({ field, value });
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      if (mounted.current)
        setCopyError("Couldn’t copy. Select the value and copy it manually, or try again.");
    }
  };
  const handleDelete = () => {
    if (confirmation !== dbName || deletion.isPending || deleteSubmitted.current) return;
    deleteSubmitted.current = true;
    deletion.mutate(dbName, {
      onSuccess: () => {
        setDeleteOpen(false);
        const userId = user?.userId || localStorage.getItem("user_id");
        navigate(userId ? `/dashboard/${userId}` : "/", { replace: true });
      },
      onSettled: () => {
        deleteSubmitted.current = false;
      },
    });
  };
  const value = (content: React.ReactNode) =>
    detailsLoading ? (
      <span
        className="settings-value-skeleton animate-pulse motion-reduce:animate-none"
        aria-hidden="true"
      />
    ) : (
      content
    );
  return (
    <div className="settings-page">
      <header className="settings-heading">
        <div>
          <h1>Settings</h1>
          <p>
            Database details and lifecycle for <span>{dbName}</span>.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing || deletion.isPending}
          aria-label="Refresh database details"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin motion-reduce:animate-none" : ""}
          />
          <span>Refresh</span>
        </Button>
      </header>
      <div className="settings-body">
        {detailsError && (
          <div className="settings-refresh-error" role="alert">
            <p>
              {details
                ? "Database details couldn’t be refreshed. Showing the last loaded information."
                : "Some database details couldn’t be loaded."}
            </p>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
              Retry
            </Button>
          </div>
        )}
        <section className="settings-section" aria-labelledby="settings-general-heading">
          <div className="settings-section-intro">
            <h2 id="settings-general-heading">General</h2>
            <p>Identifiers for this database.</p>
          </div>
          <dl className="settings-detail-list">
            <div>
              <dt>Database name</dt>
              <dd>
                <code>{dbName}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    copied?.field === "name" && copied.value === dbName
                      ? "Database name copied"
                      : "Copy database name"
                  }
                  onClick={() => copy(dbName, "name")}
                >
                  {copied?.field === "name" && copied.value === dbName ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </dd>
            </div>
            <div>
              <dt>Database ID</dt>
              <dd>
                {value(
                  <>
                    <code>{databaseId}</code>
                    {details?.databaseId != null && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          copied?.field === "id" && copied.value === databaseId
                            ? "Database ID copied"
                            : "Copy database ID"
                        }
                        onClick={() => copy(databaseId, "id")}
                      >
                        {copied?.field === "id" && copied.value === databaseId ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    )}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>
                {value(
                  createdAt ? (
                    <time dateTime={details?.createdAt}>{createdAt}</time>
                  ) : (
                    "Date unavailable"
                  )
                )}
              </dd>
            </div>
          </dl>
        </section>
        {copyError && (
          <p className="settings-copy-error" role="alert">
            {copyError}
          </p>
        )}
        <section className="settings-section" aria-labelledby="settings-storage-heading">
          <div className="settings-section-intro">
            <h2 id="settings-storage-heading">Storage</h2>
            <p>Current database size and contents.</p>
          </div>
          <dl className="settings-detail-list">
            <div>
              <dt>Engine</dt>
              <dd>SQLite</dd>
            </div>
            <div>
              <dt>File size</dt>
              <dd>{value(size)}</dd>
            </div>
            <div>
              <dt>Tables</dt>
              <dd>{(details?.tables ?? tables.length).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Records</dt>
              <dd>{value(recordCount == null ? "Unavailable" : recordCount.toLocaleString())}</dd>
            </div>
          </dl>
        </section>
        <section
          className="settings-section settings-delete-section"
          aria-labelledby="settings-delete-heading"
        >
          <div className="settings-section-intro">
            <h2 id="settings-delete-heading">Delete database</h2>
            <p>This action is permanent.</p>
          </div>
          <div className="settings-delete-content">
            <h3>Remove {dbName}</h3>
            <p>
              Delete this database, all of its tables and records, and its API key. Export a copy
              first if you need to keep the data.
            </p>
            <div className="settings-delete-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/databases/${encodeURIComponent(dbName)}/database/backups`)
                }
              >
                <Download size={14} />
                Export a copy
              </Button>
              <Button
                ref={deleteTrigger}
                variant="outline"
                size="sm"
                className="settings-delete-button"
                onClick={() => {
                  deletion.reset();
                  setConfirmation("");
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={14} />
                Delete database
              </Button>
            </div>
          </div>
        </section>
        <span className="sr-only" role="status">
          {detailsLoading ? "Loading database details" : copied ? "Copied to clipboard" : ""}
        </span>
      </div>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deletion.isPending) setDeleteOpen(open);
        }}
      >
        <AlertDialogContent
          className="settings-delete-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            deleteTrigger.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {dbName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the database, its tables and records, and its API key. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            <div className="settings-delete-fields">
              <label htmlFor={`${id}-confirmation`}>Type the database name</label>
              <p id={`${id}-hint`}>
                Enter <code>{dbName}</code> exactly to confirm.
              </p>
              <Input
                id={`${id}-confirmation`}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={deletion.isPending}
                aria-describedby={`${id}-hint`}
                placeholder={dbName}
              />
              {deletion.isError && (
                <p className="settings-delete-error" role="alert">
                  {deletion.error.message} Check your connection, then try again.
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline" disabled={deletion.isPending}>
                  Cancel
                </Button>
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={confirmation !== dbName || deletion.isPending}
              >
                {deletion.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
                    Deleting…
                  </>
                ) : (
                  "Delete database"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

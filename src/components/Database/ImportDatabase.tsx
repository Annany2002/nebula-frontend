import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Database,
  FileCheck2,
  Loader2,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImportDatabase } from "@/hooks/useImportDatabase";
import {
  suggestedDatabaseName,
  validateSQLiteFile,
  SQLiteImportError,
  SQLiteImportProgress,
} from "@/lib/sqliteImport";
import "@/styles/database-import.css";

interface Props {
  existingNames: string[];
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
  onRefresh: () => Promise<boolean>;
}

export default function ImportDatabase({ existingNames, onClose, onBusyChange, onRefresh }: Props) {
  const id = useId();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useImportDatabase();
  const [file, setFile] = useState<File | null>(null);
  const [fileState, setFileState] = useState<"empty" | "checking" | "ready" | "invalid">("empty");
  const [fileError, setFileError] = useState("");
  const [name, setName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [requestError, setRequestError] = useState<SQLiteImportError | null>(null);
  const [progress, setProgress] = useState<SQLiteImportProgress>({
    phase: "uploading",
    percent: 0,
  });
  const [createdName, setCreatedName] = useState("");
  const [checkingDatabases, setCheckingDatabases] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const browseRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const selection = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const busy = isPending || checkingDatabases;
  const trimmedName = name.trim();
  const duplicate = existingNames.some(
    (existing) => existing.toLowerCase() === trimmedName.toLowerCase()
  );
  const nameError =
    trimmedName && !/^[a-zA-Z0-9_]{1,64}$/.test(trimmedName)
      ? "Use letters, numbers and underscores only."
      : duplicate
        ? "A database with this name already exists. Choose a different name."
        : "";

  useEffect(() => {
    mounted.current = true;
    browseRef.current?.focus();
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const chooseFile = async (files: File[]) => {
    if (busy) return;
    const current = ++selection.current;
    setDragging(false);
    if (!files.length) return;
    const chosen = files[0];
    setFile(chosen);
    setFileError("");
    if (!requestError?.outcomeUnknown) setRequestError(null);
    setFileState("checking");
    if (!name.trim()) setName(suggestedDatabaseName(chosen.name));
    try {
      if (files.length !== 1) throw new SQLiteImportError("Choose one SQLite snapshot at a time.");
      await validateSQLiteFile(chosen);
      if (mounted.current && current === selection.current) setFileState("ready");
    } catch (error) {
      if (!mounted.current || current !== selection.current) return;
      setFileState("invalid");
      setFileError(error instanceof Error ? error.message : "This file couldn’t be checked.");
    }
  };

  const removeFile = () => {
    selection.current++;
    setFile(null);
    setFileState("empty");
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
    browseRef.current?.focus();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !file ||
      fileState !== "ready" ||
      !trimmedName ||
      nameError ||
      busy ||
      controller.current ||
      requestError?.outcomeUnknown
    )
      return;
    const abortController = new AbortController();
    controller.current = abortController;
    onBusyChange(true);
    setDragging(false);
    setRequestError(null);
    setProgress({ phase: "uploading", percent: 0 });
    requestAnimationFrame(() => cancelRef.current?.focus());
    try {
      const result = await mutateAsync({
        file,
        dbName: trimmedName,
        signal: abortController.signal,
        onProgress: (next) => {
          if (mounted.current) setProgress(next);
        },
      });
      if (!mounted.current) return;
      setCreatedName(result.db_name);
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch (error) {
      if (!mounted.current) return;
      setRequestError(
        error instanceof SQLiteImportError
          ? error
          : new SQLiteImportError(
              "The import couldn’t be confirmed. Check your databases before trying again.",
              true
            )
      );
      requestAnimationFrame(() => statusRef.current?.focus());
    } finally {
      controller.current = null;
      if (mounted.current) onBusyChange(false);
    }
  };

  const checkDatabases = async () => {
    setCheckingDatabases(true);
    onBusyChange(true);
    try {
      const refreshed = await onRefresh();
      if (mounted.current && refreshed) {
        setRequestError(null);
        requestAnimationFrame(() => nameRef.current?.focus());
      }
    } catch {
      if (mounted.current)
        setRequestError(
          new SQLiteImportError(
            "Your databases couldn’t be refreshed. Check again before retrying the import.",
            true
          )
        );
    } finally {
      if (mounted.current) {
        setCheckingDatabases(false);
        onBusyChange(false);
      }
    }
  };

  return (
    <section
      id="database-import"
      className="db-import-panel"
      aria-labelledby={`${id}-title`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="db-import-heading">
        <div>
          <h2 id={`${id}-title`}>{createdName ? "Database imported" : "Import a database"}</h2>
          <p>
            {createdName
              ? "Your snapshot is ready to explore."
              : "Bring a SQLite snapshot into a new project."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Close import"
          disabled={busy}
          onClick={onClose}
        >
          <X size={17} aria-hidden="true" />
        </Button>
      </div>
      {createdName ? (
        <div className="db-import-success" ref={statusRef} tabIndex={-1} role="status">
          <Check size={21} aria-hidden="true" />
          <div>
            <strong>{createdName}</strong>
            <p>Tables, records and database objects are preserved.</p>
          </div>
          <Button
            onClick={() => navigate(`/databases/${encodeURIComponent(createdName)}/overview`)}
          >
            Open database <ArrowUpRight size={16} aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="db-import-fields">
            <div>
              <label className="db-import-label" htmlFor={`${id}-file`}>
                SQLite snapshot
              </label>
              <input
                ref={inputRef}
                id={`${id}-file`}
                className="sr-only"
                type="file"
                tabIndex={-1}
                accept=".db,.sqlite,.sqlite3,application/vnd.sqlite3,application/x-sqlite3"
                disabled={busy}
                aria-describedby={`${id}-file-help${fileError ? ` ${id}-file-error` : ""}`}
                aria-invalid={!!fileError}
                onChange={(event) => {
                  void chooseFile(Array.from(event.target.files || []));
                  event.target.value = "";
                }}
              />
              <div
                className={`db-import-dropzone${dragging ? " is-dragging" : ""}${fileError ? " is-invalid" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!busy) setDragging(true);
                }}
                onDragLeave={(event) => {
                  if (
                    !(event.relatedTarget instanceof Node) ||
                    !event.currentTarget.contains(event.relatedTarget)
                  )
                    setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  void chooseFile(Array.from(event.dataTransfer.files));
                }}
              >
                {file ? (
                  <FileCheck2 size={22} aria-hidden="true" />
                ) : (
                  <Upload size={22} aria-hidden="true" />
                )}
                <div className="db-import-file-info">
                  {file ? (
                    <>
                      <strong title={file.name}>{file.name}</strong>
                      <span>
                        {(file.size / (1024 * 1024)).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        MiB{fileState === "checking" ? " · Checking file…" : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>Drop your snapshot here</strong>
                      <span>Or choose a file from your device.</span>
                    </>
                  )}
                </div>
                {file ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove selected file"
                    disabled={busy}
                    onClick={removeFile}
                  >
                    <X size={16} aria-hidden="true" />
                  </Button>
                ) : null}
                <Button
                  ref={browseRef}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                >
                  {file ? "Change file" : "Choose file"}
                </Button>
              </div>
              <p id={`${id}-file-help`} className="db-import-help">
                Standalone SQLite file, up to 64 MiB. SQL dumps aren’t supported.
              </p>
              {fileError && (
                <p id={`${id}-file-error`} className="db-import-field-error" role="alert">
                  {fileError}
                </p>
              )}
            </div>
            <div className="db-import-name">
              <label className="db-import-label" htmlFor={`${id}-name`}>
                New database name
              </label>
              <Input
                ref={nameRef}
                id={`${id}-name`}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (!requestError?.outcomeUnknown) setRequestError(null);
                }}
                placeholder="e.g. restored_project"
                maxLength={64}
                disabled={busy}
                aria-invalid={!!nameError}
                aria-describedby={`${id}-name-help${nameError ? ` ${id}-name-error` : ""}`}
                autoComplete="off"
                spellCheck={false}
              />
              <p id={`${id}-name-help`} className="db-import-help">
                1–64 letters, numbers or underscores. Existing databases stay unchanged.
              </p>
              {nameError && (
                <p id={`${id}-name-error`} className="db-import-field-error" role="alert">
                  {nameError}
                </p>
              )}
            </div>
          </div>
          {isPending && (
            <div className="db-import-progress" role="status" aria-live="polite">
              <div>
                <span>
                  {progress.phase === "uploading"
                    ? "Uploading snapshot…"
                    : "Checking and importing snapshot…"}
                </span>
                <span>
                  {progress.phase === "uploading" && progress.percent !== null
                    ? `${progress.percent}%`
                    : "Keep this page open"}
                </span>
              </div>
              <progress
                max={100}
                value={
                  progress.phase === "uploading" && progress.percent !== null
                    ? progress.percent
                    : undefined
                }
                aria-label={
                  progress.phase === "uploading"
                    ? "Snapshot upload progress"
                    : "Processing snapshot"
                }
              />
            </div>
          )}
          {requestError && (
            <div className="db-import-request-error" ref={statusRef} tabIndex={-1} role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <p>{requestError.message}</p>
              {requestError.outcomeUnknown && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={checkingDatabases}
                  onClick={() => void checkDatabases()}
                >
                  {checkingDatabases ? "Checking…" : "Check databases"}
                </Button>
              )}
            </div>
          )}
          <div className="db-import-footer">
            <p>
              <Database size={15} aria-hidden="true" />
              For live databases, use a snapshot export.
            </p>
            <div>
              <Button
                ref={cancelRef}
                type="button"
                variant="ghost"
                onClick={() => (isPending ? controller.current?.abort() : onClose())}
                disabled={checkingDatabases}
              >
                {isPending ? "Cancel import" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={
                  busy ||
                  fileState !== "ready" ||
                  !trimmedName ||
                  !!nameError ||
                  !!requestError?.outcomeUnknown
                }
              >
                {isPending ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Importing…
                  </>
                ) : (
                  "Import database"
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

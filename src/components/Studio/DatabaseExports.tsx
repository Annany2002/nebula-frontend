import { useEffect, useRef, useState } from "react";
import { Check, Code2, Copy, Database, Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadExport, fetchSqlExport, fetchSqliteExport, SqlExport } from "@/lib/databaseExport";
import "@/styles/database-exports.css";

type ExportAction = "sqlite" | "sql" | "preview";
type Preview = SqlExport & { generatedAt: Date; size: number };
const previewLimit = 60000;
const sqlFile = (sql: string) => new Blob([sql], { type: "text/plain;charset=utf-8" });
const fileSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function DatabaseExports({ dbName }: { dbName: string }) {
  const [pending, setPending] = useState<ExportAction | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [copyError, setCopyError] = useState("");
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const previewButton = useRef<HTMLButtonElement>(null);
  const activePreview = useRef<Preview | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
      clearTimeout(copyTimer.current);
    };
  }, []);

  const startDownload = (file: Blob, filename: string) => {
    downloadExport(file, filename);
    setStatus(`Download started: ${filename}`);
  };
  const generate = async (action: ExportAction) => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(action);
    setError("");
    setStatus("");
    try {
      if (action === "sqlite") {
        const file = await fetchSqliteExport(dbName, controller.signal);
        if (!controller.signal.aborted && mounted.current) startDownload(file, `${dbName}.db`);
      } else {
        const result = await fetchSqlExport(dbName, controller.signal);
        if (controller.signal.aborted || !mounted.current) return;
        if (action === "sql") startDownload(sqlFile(result.sql), result.filename);
        else {
          const next = { ...result, generatedAt: new Date(), size: sqlFile(result.sql).size };
          activePreview.current = next;
          setPreview(next);
          setCopyError("");
          setCopied(false);
          clearTimeout(copyTimer.current);
          setStatus("SQL preview ready.");
        }
      }
    } catch (failure) {
      if (!controller.signal.aborted && mounted.current) {
        setError(
          failure instanceof Error ? failure.message : "Couldn’t export this database. Try again."
        );
      }
    } finally {
      if (request.current === controller) request.current = null;
      if (mounted.current) setPending(null);
    }
  };
  const copy = async () => {
    const current = preview;
    if (!current || copying) return;
    setCopying(true);
    setCopyError("");
    try {
      await navigator.clipboard.writeText(current.sql);
      if (!mounted.current || activePreview.current !== current) return;
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      if (mounted.current && activePreview.current === current)
        setCopyError("Couldn’t copy SQL. Check clipboard permissions and try again.");
    } finally {
      if (mounted.current) setCopying(false);
    }
  };
  const closePreview = () => {
    activePreview.current = null;
    setPreview(null);
    setCopyError("");
    setCopied(false);
    setStatus("");
    clearTimeout(copyTimer.current);
    previewButton.current?.focus();
  };
  const busy = pending !== null;
  const spinner = <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />;

  return (
    <section className="db-export-page">
      <header className="db-export-heading">
        <h1>Backups &amp; export</h1>
        <p>
          Download a snapshot of <span>{dbName}</span>.
        </p>
      </header>
      <div className="db-export-body">
        {error && (
          <p role="alert" className="db-export-error">
            {error}
          </p>
        )}
        <section
          className="db-export-formats"
          aria-labelledby="db-export-formats-title"
          aria-busy={busy}
        >
          <h2 id="db-export-formats-title">Export formats</h2>
          <div className="db-export-format">
            <Database size={20} aria-hidden="true" />
            <div className="db-export-description">
              <h3>
                SQLite file <span>.db</span>
              </h3>
              <p>
                A consistent database snapshot with your schema and records, ready to open in a
                SQLite tool.
              </p>
              <code title={`${dbName}.db`}>{dbName}.db</code>
            </div>
            <Button disabled={busy} onClick={() => generate("sqlite")} aria-label="Download SQLite">
              {pending === "sqlite" ? spinner : <Download size={14} />}
              {pending === "sqlite" ? "Preparing…" : "Download SQLite"}
            </Button>
          </div>
          <div className="db-export-format">
            <Code2 size={20} aria-hidden="true" />
            <div className="db-export-description">
              <h3>
                SQL dump <span>.sql</span>
              </h3>
              <p>
                Table definitions and records, with custom indexes, views and triggers. Inspect the
                statements before saving.
              </p>
              <code title={`${dbName}.sql`}>{dbName}.sql</code>
            </div>
            <div className="db-export-actions">
              <Button
                ref={previewButton}
                variant="outline"
                disabled={busy}
                onClick={() => generate("preview")}
                aria-label="Preview SQL"
              >
                {pending === "preview" ? spinner : <Code2 size={14} />}
                {pending === "preview"
                  ? "Generating…"
                  : preview
                    ? "Refresh preview"
                    : "Preview SQL"}
              </Button>
              <Button disabled={busy} onClick={() => generate("sql")} aria-label="Download SQL">
                {pending === "sql" ? spinner : <Download size={14} />}
                {pending === "sql" ? "Preparing…" : "Download SQL"}
              </Button>
            </div>
          </div>
        </section>
        <p role="status" className="db-export-status">
          {status}
        </p>
        {preview && (
          <section
            className="db-export-preview"
            aria-label="SQL export preview"
            aria-busy={pending === "preview"}
          >
            <header>
              <div className="db-export-preview-title">
                <h2 title={preview.filename}>{preview.filename}</h2>
                <p>
                  {fileSize(preview.size)} · Generated{" "}
                  <time dateTime={preview.generatedAt.toISOString()}>
                    {preview.generatedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </p>
              </div>
              <div className="db-export-actions">
                <Button
                  variant="outline"
                  disabled={copying || busy}
                  onClick={copy}
                  aria-label={copied ? "SQL copied" : "Copy SQL"}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy SQL"}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => startDownload(sqlFile(preview.sql), preview.filename)}
                >
                  <Download size={14} />
                  Save preview
                </Button>
              </div>
              <Button
                className="db-export-close"
                variant="ghost"
                size="icon"
                disabled={busy}
                onClick={closePreview}
                aria-label="Close SQL preview"
              >
                <X size={16} />
              </Button>
            </header>
            {copyError && (
              <p role="alert" className="db-export-error">
                {copyError}
              </p>
            )}
            <pre tabIndex={0} aria-label="SQL export statements">
              <code>{preview.sql.slice(0, previewLimit)}</code>
            </pre>
            {preview.sql.length > previewLimit && (
              <p className="db-export-truncated">
                Preview truncated. Copy or save the preview to get the complete SQL export.
              </p>
            )}
            <span role="status" className="sr-only">
              {copied ? "SQL export copied to clipboard." : ""}
            </span>
          </section>
        )}
        <aside className="db-export-note">
          <h2>Keep a copy</h2>
          <p>
            Exports are generated on demand. Store your downloaded files in your own backup storage,
            and use a SQLite client to restore them.
          </p>
        </aside>
      </div>
    </section>
  );
}

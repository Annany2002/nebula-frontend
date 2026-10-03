import { useEffect, useRef, useState } from "react";
import { Loader2, PanelRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableType } from "@/types/allType";
import { useExecuteSQL } from "@/hooks/queries";
import { toast } from "sonner";
import SchemaBrowser from "./SQL/SchemaBrowser";
import QueryResults, { QueryRun } from "./SQL/QueryResults";
import "@/styles/sql-editor.css";

interface SqlEditorProps {
  dbName: string;
  tables: TableType[];
}

const selectQuery = (table: string) => `SELECT * FROM "${table.replace(/"/g, '""')}" LIMIT 25;`;
const tsvCell = (value: unknown) => {
  const text =
    value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export default function SqlEditor({ dbName, tables }: SqlEditorProps) {
  const [query, setQuery] = useState(() =>
    tables.length ? selectQuery(tables[0].name) : "SELECT sqlite_version();"
  );
  const [run, setRun] = useState<QueryRun | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(
    () => window.matchMedia("(min-width: 1100px)").matches
  );
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);
  const runNumberRef = useRef(0);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    },
    []
  );
  const { mutate: executeSQL, isPending } = useExecuteSQL(dbName);
  const lines = query.split("\n").length;

  const handleRunQuery = () => {
    if (runningRef.current) return;
    const submittedQuery = query.trim();
    if (!submittedQuery) {
      toast.error("Enter a SQL query first.");
      editorRef.current?.focus();
      return;
    }
    runningRef.current = true;
    runNumberRef.current += 1;
    setRun(null);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    setCopied(false);
    executeSQL(submittedQuery, {
      onSuccess: (data) => setRun({ kind: "success", query: submittedQuery, data }),
      onError: (error) => setRun({ kind: "error", query: submittedQuery, message: error.message }),
      onSettled: () => {
        runningRef.current = false;
      },
    });
  };
  const handleUseTable = (name: string) => {
    setQuery(selectQuery(name));
    editorRef.current?.focus();
    editorRef.current?.scrollTo(0, 0);
    if (gutterRef.current) gutterRef.current.scrollTop = 0;
  };
  const handleCopy = async () => {
    if (run?.kind !== "success" || !run.data.rows?.length || isCopying) return;
    const currentRun = runNumberRef.current;
    const text = [run.data.columns ?? [], ...run.data.rows]
      .map((row) => row.map(tsvCell).join("\t"))
      .join("\n");
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      if (currentRun === runNumberRef.current) {
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        setCopied(true);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
      }
      toast.success("Results copied as TSV.");
    } catch {
      toast.error("Couldn’t copy results. Please try again.");
    } finally {
      setIsCopying(false);
    }
  };
  return (
    <div className="sql-workspace">
      <header className="sql-page-heading">
        <div>
          <h1>SQL editor</h1>
          <p>Write a query. Explore your data.</p>
        </div>
        <div className="sql-page-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSchemaOpen((previous) => !previous)}
            aria-expanded={schemaOpen}
            aria-controls="sql-schema-panel"
            aria-label={schemaOpen ? "Hide schema browser" : "Show schema browser"}
          >
            <PanelRight size={15} />
            <span>Schema</span>
          </Button>
          <Button
            size="sm"
            onClick={handleRunQuery}
            disabled={isPending || !query.trim()}
            aria-label={isPending ? "Running query" : "Run query"}
          >
            {isPending ? (
              <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
            ) : (
              <Play size={14} />
            )}
            <span>{isPending ? "Running…" : "Run query"}</span>
          </Button>
        </div>
      </header>
      <div className="sql-workspace-body">
        <div className="sql-main-panels">
          <section className="sql-query-pane" aria-labelledby="sql-query-label">
            <div className="sql-query-heading">
              <label id="sql-query-label" htmlFor="sql-query-input">
                Query
              </label>
              <span id="sql-query-shortcut">
                <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd> to run
              </span>
            </div>
            <div className="sql-code-editor">
              <div className="sql-line-numbers" ref={gutterRef} aria-hidden="true">
                {Array.from({ length: lines }, (_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>
              <textarea
                id="sql-query-input"
                ref={editorRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    if (!event.repeat) handleRunQuery();
                  }
                }}
                onScroll={(event) => {
                  if (gutterRef.current)
                    gutterRef.current.scrollTop = event.currentTarget.scrollTop;
                }}
                aria-describedby="sql-query-shortcut"
                placeholder="SELECT * FROM your_table LIMIT 25;"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
              />
            </div>
            <div className="sql-query-footer">
              <span>SQLite</span>
              <span>
                {lines} {lines === 1 ? "line" : "lines"}
              </span>
            </div>
          </section>
          <QueryResults
            run={run}
            isRunning={isPending}
            editorChanged={!!run && run.query !== query.trim()}
            onCopy={handleCopy}
            copied={copied}
            isCopying={isCopying}
          />
        </div>
        <aside
          id="sql-schema-panel"
          className="sql-schema-panel"
          aria-label="Database schema"
          hidden={!schemaOpen}
        >
          <SchemaBrowser tables={tables} onUseTable={handleUseTable} />
        </aside>
      </div>
    </div>
  );
}

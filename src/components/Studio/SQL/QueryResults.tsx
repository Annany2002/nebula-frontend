import { memo } from "react";
import { AlertCircle, Check, CheckCircle2, Clock3, Copy, Loader2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SQLQueryResultType } from "@/types/allType";

export type QueryRun =
  | { kind: "success"; query: string; data: SQLQueryResultType }
  | { kind: "error"; query: string; message: string };

interface QueryResultsProps {
  run: QueryRun | null;
  isRunning: boolean;
  editorChanged: boolean;
  copied: boolean;
  isCopying: boolean;
  onCopy: () => void;
}

function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function QueryResults({
  run,
  isRunning,
  editorChanged,
  copied,
  isCopying,
  onCopy,
}: QueryResultsProps) {
  const result = run?.kind === "success" ? run.data : null;
  const hasColumns = !!result?.columns?.length;
  return (
    <section className="sql-results" aria-labelledby="sql-results-heading" aria-busy={isRunning}>
      <header className="sql-results-heading">
        <div className="sql-results-title">
          <h2 id="sql-results-heading">Results</h2>
          {result && (
            <span className="sql-execution-time">
              <Clock3 size={12} />
              {result.executionMs} ms
            </span>
          )}
        </div>
        {result?.rows?.length ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            disabled={isCopying}
            aria-label={copied ? "Results copied" : "Copy results"}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : isCopying ? "Copying…" : "Copy results"}</span>
          </Button>
        ) : null}
      </header>
      {result && (
        <div className="sql-result-summary">
          <span role="status">
            <CheckCircle2 size={13} />
            {hasColumns
              ? `${result.rowCount.toLocaleString()} ${result.rowCount === 1 ? "row" : "rows"} returned`
              : `${result.rowsAffected.toLocaleString()} ${result.rowsAffected === 1 ? "row" : "rows"} affected`}
          </span>
          <span>Last executed query</span>
        </div>
      )}
      {editorChanged && result && (
        <p className="sql-results-changed">
          The editor has changed. Run again to update these results.
        </p>
      )}
      <div className="sql-results-output">
        {isRunning ? (
          <div className="sql-output-state" role="status">
            <Loader2 size={24} className="animate-spin motion-reduce:animate-none" />
            <h3>Running your query…</h3>
            <p>Results will appear here when it finishes.</p>
          </div>
        ) : run?.kind === "error" ? (
          <div className="sql-query-error" role="alert">
            <AlertCircle size={18} />
            <div>
              <h3>Query couldn’t be executed.</h3>
              <p>{run.message}</p>
              <span>Check your statement and run it again.</span>
            </div>
          </div>
        ) : hasColumns && result ? (
          <table className="sql-result-table">
            <caption className="sr-only">Results for {run?.query}</caption>
            <thead>
              <tr>
                <th scope="col" className="sql-row-number">
                  #
                </th>
                {result.columns?.map((column, index) => (
                  <th scope="col" key={index}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows?.length ? (
                result.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="sql-row-number">{rowIndex + 1}</td>
                    {row.map((value, columnIndex) => (
                      <td key={columnIndex}>
                        {value === null ? <span className="sql-null">NULL</span> : cellText(value)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={(result.columns?.length ?? 0) + 1} className="sql-zero-rows">
                    No rows matched this query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : result ? (
          <div className="sql-output-state sql-statement-success">
            <CheckCircle2 size={25} />
            <h3>Statement completed.</h3>
            <p>
              {result.message ||
                `${result.rowsAffected.toLocaleString()} ${result.rowsAffected === 1 ? "row" : "rows"} affected.`}
            </p>
          </div>
        ) : (
          <div className="sql-output-state">
            <Terminal size={29} />
            <h3>Your results will appear here.</h3>
            <p>Start with a SELECT query from the schema browser.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(QueryResults);

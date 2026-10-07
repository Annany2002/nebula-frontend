import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Code2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTrigger, useTables } from "@/hooks/queries";
import { CreateTriggerPayload, TriggerEvent, TriggerTiming } from "@/types/allType";
import { isReservedTriggerName, sqlBytes, triggerSQL, triggerTables } from "./triggerManagement";
import "@/styles/trigger-management.css";

export default function CreateTriggerForm({
  dbName,
  onClose,
  onRefresh,
}: {
  dbName: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const id = useId();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const tables = useTables(dbName);
  const create = useCreateTrigger(dbName);
  const [name, setName] = useState("");
  const [tableName, setTableName] = useState("");
  const [event, setEvent] = useState<TriggerEvent>("INSERT");
  const [timing, setTiming] = useState<TriggerTiming>("AFTER");
  const [updateOf, setUpdateOf] = useState<string[]>([]);
  const [when, setWhen] = useState("");
  const [body, setBody] = useState("");
  const eligible = triggerTables(tables.data ?? []);
  const table = eligible.find((item) => item.name === tableName);
  const validName = /^[a-zA-Z0-9_]{1,64}$/.test(name) && !isReservedTriggerName(name);
  const bodyBytes = sqlBytes(body),
    whenBytes = sqlBytes(when);
  const validBody = !!body.trim() && bodyBytes <= 65536 && !body.includes("\0");
  const validWhen = whenBytes <= 8192 && !when.includes("\0");
  const payload: CreateTriggerPayload = {
    name,
    table_name: tableName,
    timing,
    event,
    body,
    ...(when.trim() ? { when } : {}),
    ...(event === "UPDATE" && updateOf.length ? { update_of: updateOf } : {}),
  };
  const withinRequestLimit = sqlBytes(JSON.stringify(payload)) <= 131072;
  const canSubmit =
    validName &&
    !!table &&
    validBody &&
    validWhen &&
    withinRequestLimit &&
    !tables.isError &&
    updateOf.every((column) => table.columns.some((item) => item.name === column));
  const references =
    event === "INSERT"
      ? "NEW.column"
      : event === "DELETE"
        ? "OLD.column"
        : "OLD.column and NEW.column";
  return (
    <form
      className="trigger-create-form"
      aria-labelledby={`${id}-heading`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit || create.isPending) return;
        try {
          await create.mutateAsync(payload);
          if (!mounted.current) return;
          toast.success(`Trigger ${name} created`);
          onClose();
        } catch {
          /* Keep the definition and show the mutation error. */
        }
      }}
    >
      <div className="trigger-create-heading">
        <h2 id={`${id}-heading`}>Create trigger</h2>
        <p>Run SQL automatically when a row is inserted, updated or deleted.</p>
      </div>
      {tables.isLoading ? (
        <p role="status">Loading tables…</p>
      ) : tables.isError ? (
        <div role="alert" className="db-objects-alert">
          Tables couldn’t be loaded.
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={tables.isFetching}
            onClick={() => tables.refetch()}
          >
            Retry tables
          </Button>
        </div>
      ) : !eligible.length ? (
        <p>
          No ordinary tables are available. Create a table first; views and virtual tables aren’t
          supported by this builder.
        </p>
      ) : (
        <div className="trigger-create-layout">
          <fieldset disabled={create.isPending} className="trigger-create-fields">
            <div className="trigger-create-basics">
              <div>
                <label htmlFor={`${id}-name`}>Trigger name</label>
                <Input
                  id={`${id}-name`}
                  autoFocus
                  value={name}
                  maxLength={64}
                  placeholder="audit_order_status"
                  aria-describedby={`${id}-name-help`}
                  aria-invalid={!!name && !validName}
                  onChange={(e) => {
                    setName(e.target.value);
                    create.reset();
                  }}
                />
                <p id={`${id}-name-help`}>
                  1–64 letters, numbers or underscores. Reserved prefixes: sqlite_, _nebula_.
                </p>
              </div>
              <div>
                <label htmlFor={`${id}-table`}>Table</label>
                <Select
                  value={tableName}
                  disabled={create.isPending}
                  onValueChange={(value) => {
                    setTableName(value);
                    setUpdateOf([]);
                    create.reset();
                  }}
                >
                  <SelectTrigger id={`${id}-table`}>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligible.map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor={`${id}-event`}>Event</label>
                <Select
                  value={event}
                  disabled={create.isPending}
                  onValueChange={(value: TriggerEvent) => {
                    setEvent(value);
                    setUpdateOf([]);
                    create.reset();
                  }}
                >
                  <SelectTrigger id={`${id}-event`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSERT">Insert</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor={`${id}-timing`}>Timing</label>
                <Select
                  value={timing}
                  disabled={create.isPending}
                  onValueChange={(value: TriggerTiming) => {
                    setTiming(value);
                    create.reset();
                  }}
                >
                  <SelectTrigger id={`${id}-timing`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AFTER">After</SelectItem>
                    <SelectItem value="BEFORE">Before</SelectItem>
                  </SelectContent>
                </Select>
                <p>After is recommended for actions; Before can reject invalid writes.</p>
              </div>
            </div>
            {table && event === "UPDATE" && (
              <fieldset className="trigger-update-columns">
                <legend>
                  Update columns <span>Optional</span>
                </legend>
                <p>
                  Fire when a selected column is included in an update. Leave all unchecked for any
                  column.
                </p>
                <div className="index-column-options">
                  {table.columns.map((column, number) => (
                    <label key={column.name} htmlFor={`${id}-column-${number}`}>
                      <Checkbox
                        id={`${id}-column-${number}`}
                        checked={updateOf.includes(column.name)}
                        disabled={
                          create.isPending ||
                          (!updateOf.includes(column.name) && updateOf.length >= 64)
                        }
                        onCheckedChange={(checked) => {
                          setUpdateOf((current) =>
                            checked === true
                              ? [...current, column.name]
                              : current.filter((item) => item !== column.name)
                          );
                          create.reset();
                        }}
                      />
                      <span>{column.name}</span>
                      <small>{column.type}</small>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <div className="trigger-create-condition">
              <label htmlFor={`${id}-when`}>
                Condition <span>Optional</span>
              </label>
              <Textarea
                id={`${id}-when`}
                rows={2}
                value={when}
                spellCheck={false}
                autoComplete="off"
                placeholder={
                  event === "UPDATE"
                    ? "NEW.status IS NOT OLD.status"
                    : event === "INSERT"
                      ? "NEW.status = 'pending'"
                      : "OLD.status = 'pending'"
                }
                aria-describedby={`${id}-when-help`}
                aria-invalid={!validWhen}
                onChange={(e) => {
                  setWhen(e.target.value);
                  create.reset();
                }}
              />
              <p id={`${id}-when-help`}>
                {validWhen
                  ? "Leave empty to run on every matching row. Limit: 8 KiB."
                  : "The condition must be within 8 KiB and contain no NUL characters."}
              </p>
            </div>
            <div className="trigger-create-body">
              <label htmlFor={`${id}-body`}>SQL actions</label>
              <Textarea
                id={`${id}-body`}
                rows={7}
                value={body}
                spellCheck={false}
                autoComplete="off"
                placeholder={`INSERT INTO audit_log (record_id) VALUES (${event === "DELETE" ? "OLD" : "NEW"}.id);`}
                aria-describedby={`${id}-body-help`}
                aria-invalid={!!body && !validBody}
                onChange={(e) => {
                  setBody(e.target.value);
                  create.reset();
                }}
              />
              <p id={`${id}-body-help`}>
                {bodyBytes > 65536 || body.includes("\0")
                  ? "Actions must be within 64 KiB and contain no NUL characters."
                  : `Use ${references}. End each statement with a semicolon; omit the BEGIN/END wrapper.`}
              </p>
              {table && (
                <details className="trigger-column-reference">
                  <summary>Table columns ({table.columns.length})</summary>
                  <ul>
                    {table.columns.map((column) => (
                      <li key={column.name}>
                        <code>{column.name}</code>
                        <span>{column.type}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </fieldset>
          <section className="trigger-create-preview" aria-labelledby={`${id}-preview-heading`}>
            <h3 id={`${id}-preview-heading`}>
              <Code2 size={14} aria-hidden="true" /> SQL preview
            </h3>
            <pre tabIndex={0} aria-label="Trigger SQL preview">
              <code>
                {table ? triggerSQL(payload) : "Select a table to preview the trigger definition."}
              </code>
            </pre>
            <p>
              Creation checks the definition without running its actions. The trigger runs on future
              matching writes.
            </p>
          </section>
        </div>
      )}
      {!withinRequestLimit && (
        <p className="db-objects-alert" role="alert">
          The encoded definition exceeds the 128 KiB request limit.
        </p>
      )}
      {create.isError && (
        <div role="alert" className="db-objects-alert">
          <span>{create.error.message}</span>
          <Button type="button" size="sm" variant="outline" onClick={onRefresh}>
            Refresh catalog
          </Button>
        </div>
      )}
      <div className="trigger-create-footer">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={create.isPending}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!canSubmit || create.isPending}>
          {create.isPending && (
            <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
          )}
          {create.isPending ? "Creating…" : "Create trigger"}
        </Button>
      </div>
    </form>
  );
}

import { useId, useRef, useState } from "react";
import { Plus, Lock, KeyRound, Trash2, Pencil, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlterTablePayload, TableColumnType } from "@/types/allType";
import { useAlterTable, useTables } from "@/hooks/queries";
import { COLUMN_TYPES, columnNameError, tableNameError } from "@/lib/schemaForm";
import SchemaSelect from "./SchemaSelect";
import "@/styles/schema-dialog.css";

interface ManageSchemaModalProps {
  dbName: string;
  tableName: string;
  columns: TableColumnType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableRenamed?: (newTableName: string) => void;
}
type Editing = { kind: "rename" | "drop"; column: string } | { kind: "add" | "table" } | null;

export default function ManageSchemaModal({
  dbName,
  tableName,
  columns,
  open,
  onOpenChange,
  onTableRenamed,
}: ManageSchemaModalProps) {
  const mutation = useAlterTable();
  const { data: tables = [] } = useTables(dbName);
  const [editing, setEditing] = useState<Editing>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("TEXT");
  const [defaultValue, setDefaultValue] = useState("");
  const [notNull, setNotNull] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const busy = useRef(false);
  const opener = useRef(document.activeElement as HTMLElement | null);
  const formId = useId();
  const nameId = `${formId}-name`;
  const errorId = `${formId}-error`;
  const pending = mutation.isPending;
  const reset = () => {
    setEditing(null);
    setName("");
    setType("TEXT");
    setDefaultValue("");
    setNotNull(false);
    setError("");
    mutation.reset();
  };
  const close = (next: boolean) => {
    if (!busy.current) {
      if (!next) reset();
      onOpenChange(next);
    }
  };
  const start = (next: Editing, value = "") => {
    reset();
    setStatus("");
    setEditing(next);
    setName(value);
    requestAnimationFrame(() =>
      document.getElementById(next?.kind === "drop" ? `${formId}-cancel-drop` : nameId)?.focus()
    );
  };
  const cancel = () => {
    const target =
      editing?.kind === "rename" || editing?.kind === "drop"
        ? `${formId}-${editing.kind}-${editing.column}`
        : `${formId}-${editing?.kind}`;
    reset();
    requestAnimationFrame(() => document.getElementById(target)?.focus());
  };
  const reject = (message: string) => {
    setError(message);
    document.getElementById(nameId)?.focus();
  };
  const apply = (payload: AlterTablePayload, message: string, afterSuccess?: () => void) => {
    if (busy.current) return;
    busy.current = true;
    setError("");
    setStatus("");
    mutation.mutate(
      { dbName, tableName, payload },
      {
        onSuccess: () => {
          busy.current = false;
          const nextFocus =
            editing?.kind === "add"
              ? `${formId}-add`
              : editing?.kind === "rename"
                ? `${formId}-rename-${name.trim()}`
                : `${formId}-done`;
          reset();
          setStatus(message);
          requestAnimationFrame(() => document.getElementById(nextFocus)?.focus());
          afterSuccess?.();
        },
        onSettled: () => {
          busy.current = false;
        },
      }
    );
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current || !editing || editing.kind === "drop") return;
    const trimmed = name.trim();
    if (editing.kind === "table") {
      const problem = tableNameError(
        name,
        tables.map((table) => table.name || table.tbl_name)
      );
      if (problem) return reject(problem);
      apply(
        { action: "rename_table", new_table_name: trimmed },
        `Table renamed to ${trimmed}.`,
        () => {
          onOpenChange(false);
          onTableRenamed?.(trimmed);
        }
      );
      return;
    }
    const problem = columnNameError(
      name,
      columns.map((column) => column.name)
    );
    if (problem) return reject(problem);
    if (editing.kind === "rename") {
      apply(
        { action: "rename_column", old_name: editing.column, new_name: trimmed },
        `Column renamed to ${trimmed}.`
      );
    } else {
      if (notNull && (!defaultValue.trim() || /^null$/i.test(defaultValue.trim()))) {
        setError("A non-NULL default is required for a NOT NULL column.");
        document.getElementById(`${formId}-default`)?.focus();
        return;
      }
      apply(
        {
          action: "add_column",
          column: {
            name: trimmed,
            type,
            not_null: notNull,
            ...(defaultValue.trim() ? { default_value: defaultValue.trim() } : {}),
          },
        },
        `Column ${trimmed} added.`
      );
    }
  };
  const feedback = error || (mutation.isError ? mutation.error.message : "");
  return (
    <Dialog open={open} onOpenChange={close}>
      {open && (
        <DialogContent
          className="schema-dialog schema-manage-dialog"
          closeDisabled={pending}
          onEscapeKeyDown={(event) => {
            if (busy.current) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy.current) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected) opener.current.focus();
          }}
        >
          <DialogHeader className="schema-dialog-heading">
            <DialogTitle>
              Edit schema <span className="schema-title-name">{tableName}</span>
            </DialogTitle>
            <DialogDescription>
              Add, rename, or remove columns in <strong>{dbName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="schema-body" aria-busy={pending}>
            <fieldset disabled={pending}>
              <div className="schema-section-title">
                <h2>
                  Columns <span>{columns.length}</span>
                </h2>
                {editing?.kind !== "add" && (
                  <Button
                    id={`${formId}-add`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => start({ kind: "add" })}
                  >
                    <Plus size={14} />
                    Add column
                  </Button>
                )}
              </div>
              <div className="schema-existing-columns">
                {columns.map((column) => {
                  const protectedColumn = ["id", "created_at"].includes(column.name.toLowerCase());
                  const active =
                    editing &&
                    (editing.kind === "rename" || editing.kind === "drop") &&
                    editing.column === column.name;
                  return (
                    <div className="schema-existing-row" key={column.name}>
                      <div className="schema-existing-summary">
                        <div className="schema-column-details">
                          <code title={column.name}>{column.name}</code>
                          <span>
                            {column.type}
                            {column.pk > 0 && (
                              <>
                                {" "}
                                · <KeyRound size={11} aria-hidden="true" />
                                Primary key
                              </>
                            )}
                            {column.notnull > 0 && " · NOT NULL"}
                          </span>
                          {column.dflt_value !== null && column.dflt_value !== undefined && (
                            <span
                              className="schema-column-default"
                              title={String(column.dflt_value)}
                            >
                              Default: <code>{String(column.dflt_value)}</code>
                            </span>
                          )}
                        </div>
                        {protectedColumn ? (
                          <span className="schema-protected">
                            <Lock size={12} />
                            System
                          </span>
                        ) : (
                          <div className="schema-existing-actions">
                            <Button
                              id={`${formId}-rename-${column.name}`}
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Rename ${column.name}`}
                              aria-expanded={active && editing.kind === "rename" ? true : false}
                              onClick={() =>
                                start({ kind: "rename", column: column.name }, column.name)
                              }
                            >
                              <Pencil size={13} />
                              <span>Rename</span>
                            </Button>
                            <Button
                              id={`${formId}-drop-${column.name}`}
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${column.name}`}
                              disabled={column.pk > 0}
                              title={
                                column.pk > 0 ? "Primary key columns cannot be removed" : undefined
                              }
                              onClick={() => start({ kind: "drop", column: column.name })}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                      {active && editing.kind === "rename" && (
                        <form className="schema-inline-form" onSubmit={submit} noValidate>
                          <div className="schema-field">
                            <Label htmlFor={nameId}>New column name</Label>
                            <Input
                              id={nameId}
                              value={name}
                              onChange={(event) => {
                                setName(event.target.value);
                                setError("");
                              }}
                              autoComplete="off"
                              aria-invalid={!!feedback}
                              aria-describedby={feedback ? errorId : undefined}
                            />
                          </div>
                          <div className="schema-form-actions">
                            <Button type="button" variant="outline" onClick={cancel}>
                              Cancel
                            </Button>
                            <Button type="submit">{pending ? "Renaming…" : "Rename column"}</Button>
                          </div>
                        </form>
                      )}
                      {active && editing.kind === "drop" && (
                        <div className="schema-drop-confirmation">
                          <p>
                            <AlertTriangle size={14} />
                            Remove <strong>{column.name}</strong>?
                          </p>
                          <span>
                            This permanently deletes the column and its values from every row. This
                            cannot be undone.
                          </span>
                          <div className="schema-form-actions">
                            <Button
                              id={`${formId}-cancel-drop`}
                              type="button"
                              variant="outline"
                              onClick={cancel}
                            >
                              Keep column
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() =>
                                apply(
                                  { action: "drop_column", column_name: column.name },
                                  `Column ${column.name} removed.`
                                )
                              }
                            >
                              {pending ? "Removing…" : "Remove column"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {editing?.kind === "add" && (
                <section className="schema-add-form">
                  <h2>Add column</h2>
                  <form onSubmit={submit} noValidate>
                    <div className="schema-form-grid">
                      <div className="schema-field">
                        <Label htmlFor={nameId}>Column name</Label>
                        <Input
                          id={nameId}
                          value={name}
                          onChange={(event) => {
                            setName(event.target.value);
                            setError("");
                          }}
                          placeholder="e.g. status"
                          autoComplete="off"
                          aria-invalid={!!feedback}
                          aria-describedby={feedback ? errorId : undefined}
                        />
                      </div>
                      <div className="schema-field">
                        <Label htmlFor={`${formId}-type`}>Type</Label>
                        <SchemaSelect
                          id={`${formId}-type`}
                          value={type}
                          onChange={(event) => setType(event.target.value)}
                        >
                          {COLUMN_TYPES.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </SchemaSelect>
                      </div>
                      <div className="schema-field">
                        <Label htmlFor={`${formId}-default`}>
                          Default value {notNull ? "(required)" : "(optional)"}
                        </Label>
                        <Input
                          id={`${formId}-default`}
                          value={defaultValue}
                          onChange={(event) => {
                            setDefaultValue(event.target.value);
                            setError("");
                          }}
                          placeholder={type === "TEXT" ? "'active'" : "0"}
                          autoComplete="off"
                          aria-describedby={`${formId}-default-hint`}
                        />
                        <p id={`${formId}-default-hint`} className="schema-hint">
                          Use a SQL literal, such as <code>'active'</code> or <code>0</code>. Text
                          needs single quotes.
                        </p>
                      </div>
                      <label className="schema-checkbox">
                        <input
                          type="checkbox"
                          checked={notNull}
                          onChange={(event) => setNotNull(event.target.checked)}
                        />
                        <span>
                          NOT NULL<small>Every row must have a value.</small>
                        </span>
                      </label>
                    </div>
                    <div className="schema-form-actions">
                      <Button type="button" variant="outline" onClick={cancel}>
                        Cancel
                      </Button>
                      <Button type="submit">{pending ? "Adding…" : "Add column"}</Button>
                    </div>
                  </form>
                </section>
              )}
              <section className="schema-table-name">
                <div>
                  <h2>Table name</h2>
                  <code>{tableName}</code>
                </div>
                {editing?.kind !== "table" && (
                  <Button
                    id={`${formId}-table`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => start({ kind: "table" }, tableName)}
                  >
                    Rename table
                  </Button>
                )}
                {editing?.kind === "table" && (
                  <form className="schema-inline-form" onSubmit={submit} noValidate>
                    <div className="schema-field">
                      <Label htmlFor={nameId}>New table name</Label>
                      <Input
                        id={nameId}
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                          setError("");
                        }}
                        autoComplete="off"
                        aria-invalid={!!feedback}
                        aria-describedby={feedback ? errorId : undefined}
                      />
                      <p className="schema-hint">
                        Update app requests that use the current table name.
                      </p>
                    </div>
                    <div className="schema-form-actions">
                      <Button type="button" variant="outline" onClick={cancel}>
                        Cancel
                      </Button>
                      <Button type="submit">{pending ? "Renaming…" : "Rename table"}</Button>
                    </div>
                  </form>
                )}
              </section>
            </fieldset>
          </div>
          <footer className="schema-footer">
            {feedback && (
              <p role="alert" id={errorId} className="schema-error">
                {feedback}
              </p>
            )}
            <p role="status" className="schema-status">
              {status}
            </p>
            <span>
              {pending
                ? "Applying your change…"
                : "Changes are applied immediately. System columns are protected."}
            </span>
            <Button
              id={`${formId}-done`}
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => close(false)}
            >
              Done
            </Button>
          </footer>
        </DialogContent>
      )}
    </Dialog>
  );
}

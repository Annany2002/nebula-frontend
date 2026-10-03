import { Dispatch, SetStateAction, useId, useRef, useState } from "react";
import { Plus, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateTable, useTables } from "@/hooks/queries";
import { ColumnDefinitionType } from "@/types/allType";
import { COLUMN_TYPES, DELETE_ACTIONS, columnNameError, tableNameError } from "@/lib/schemaForm";
import SchemaSelect from "./SchemaSelect";
import "@/styles/schema-dialog.css";

type DraftColumn = ColumnDefinitionType & { draftId: string };
const newColumn = (): DraftColumn => ({ draftId: crypto.randomUUID(), name: "", type: "TEXT" });

export default function CreateTableSchema({
  db_name,
  openChange,
  setOpenChange,
  showTrigger = true,
}: {
  db_name: string;
  openChange: boolean;
  setOpenChange: Dispatch<SetStateAction<boolean>>;
  showTrigger?: boolean;
}) {
  const mutation = useCreateTable();
  const tablesQuery = useTables(db_name);
  const tables = tablesQuery.data ?? [];
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<DraftColumn[]>(() => [newColumn()]);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const busy = useRef(false);
  const opener = useRef(document.activeElement as HTMLElement | null);
  const formId = useId();
  const tableNameId = `${formId}-table-name`;
  const errorId = `${formId}-error`;
  const pending = mutation.isPending;
  const reset = () => {
    setTableName("");
    setColumns([newColumn()]);
    setError(null);
    mutation.reset();
  };
  const changeOpen = (open: boolean) => {
    if (busy.current) return;
    if (open) opener.current = document.activeElement as HTMLElement;
    else reset();
    setOpenChange(open);
  };
  const update = (draftId: string, patch: Partial<DraftColumn>) => {
    setColumns((previous) =>
      previous.map((column) => (column.draftId === draftId ? { ...column, ...patch } : column))
    );
    setError(null);
    mutation.reset();
  };
  const reject = (message: string, field?: string) => {
    setError({ message, field });
    if (field) document.getElementById(field)?.focus();
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    const tableError = tableNameError(
      tableName,
      tables.map((table) => table.name || table.tbl_name)
    );
    if (tableError) return reject(tableError, tableNameId);
    const names: string[] = [];
    for (const column of columns) {
      const field = `${formId}-${column.draftId}-name`;
      const nameError = columnNameError(column.name, names);
      if (nameError) return reject(nameError, field);
      names.push(column.name.trim());
      if (column.foreign_key) {
        const target = tables.find(
          (table) => (table.name || table.tbl_name) === column.foreign_key!.target_table
        );
        if (!target?.columns?.some((item) => item.name === column.foreign_key!.target_column))
          return reject(
            `Choose an existing reference table and column for ${column.name.trim()}.`,
            `${formId}-${column.draftId}-target`
          );
      }
    }
    setError(null);
    busy.current = true;
    mutation.mutate(
      {
        dbName: db_name,
        tableName: tableName.trim(),
        schema: columns.map(({ name, type, foreign_key }) => ({
          name: name.trim(),
          type,
          ...(foreign_key ? { foreign_key } : {}),
        })),
      },
      {
        onSuccess: () => {
          busy.current = false;
          reset();
          setOpenChange(false);
        },
        onSettled: () => {
          busy.current = false;
        },
      }
    );
  };
  const addColumn = () => {
    const column = newColumn();
    setColumns((previous) => [...previous, column]);
    requestAnimationFrame(() =>
      document.getElementById(`${formId}-${column.draftId}-name`)?.focus()
    );
  };
  return (
    <Dialog open={openChange} onOpenChange={changeOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus size={15} />
            New table
          </Button>
        </DialogTrigger>
      )}
      {openChange && (
        <DialogContent
          className="schema-dialog"
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
            <DialogTitle>Create table</DialogTitle>
            <DialogDescription>
              Define columns and relationships in <strong>{db_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="schema-form" noValidate aria-busy={pending}>
            <div className="schema-body">
              <fieldset disabled={pending}>
                <div className="schema-field">
                  <Label htmlFor={tableNameId}>Table name</Label>
                  <Input
                    id={tableNameId}
                    value={tableName}
                    onChange={(event) => {
                      setTableName(event.target.value);
                      setError(null);
                      mutation.reset();
                    }}
                    placeholder="e.g. orders"
                    autoComplete="off"
                    aria-invalid={error?.field === tableNameId}
                    aria-describedby={error?.field === tableNameId ? errorId : undefined}
                  />
                  <p className="schema-hint">
                    Letters, numbers, and underscores. Up to 64 characters.
                  </p>
                </div>
                <div className="schema-system-columns">
                  <span>Added automatically</span>
                  <code>
                    id <small>INTEGER · Primary key</small>
                  </code>
                  <code>
                    created_at <small>TIMESTAMP</small>
                  </code>
                </div>
                <div className="schema-section-title">
                  <h2>Columns</h2>
                  <span>
                    {columns.length} custom {columns.length === 1 ? "column" : "columns"}
                  </span>
                </div>
                <div className="schema-draft-columns">
                  {columns.map((column, index) => {
                    const id = `${formId}-${column.draftId}`;
                    const reference = column.foreign_key;
                    const target = tables.find(
                      (table) => (table.name || table.tbl_name) === reference?.target_table
                    );
                    return (
                      <div className="schema-draft-row" key={column.draftId}>
                        <div className="schema-draft-fields">
                          <span className="schema-column-number" aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="schema-field">
                            <Label htmlFor={`${id}-name`}>Column name</Label>
                            <Input
                              id={`${id}-name`}
                              value={column.name}
                              onChange={(event) =>
                                update(column.draftId, { name: event.target.value })
                              }
                              placeholder="e.g. customer_id"
                              autoComplete="off"
                              aria-invalid={error?.field === `${id}-name`}
                              aria-describedby={error?.field === `${id}-name` ? errorId : undefined}
                            />
                          </div>
                          <div className="schema-field schema-type">
                            <Label htmlFor={`${id}-type`}>Type</Label>
                            <SchemaSelect
                              id={`${id}-type`}
                              value={column.type}
                              onChange={(event) =>
                                update(column.draftId, { type: event.target.value })
                              }
                            >
                              {COLUMN_TYPES.map((type) => (
                                <option key={type}>{type}</option>
                              ))}
                            </SchemaSelect>
                          </div>
                          <div className="schema-row-actions">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`${reference ? "Remove" : "Add"} relationship for column ${index + 1}`}
                              aria-pressed={!!reference}
                              disabled={
                                !reference && !tables.some((table) => table.columns?.length)
                              }
                              onClick={() => {
                                const table = tables.find((item) => item.columns?.length);
                                const targetColumn =
                                  table?.columns.find((item) => item.pk > 0) ?? table?.columns[0];
                                update(column.draftId, {
                                  foreign_key: reference
                                    ? undefined
                                    : {
                                        target_table: table?.name || table?.tbl_name || "",
                                        target_column: targetColumn?.name || "",
                                        on_delete: "CASCADE",
                                      },
                                });
                              }}
                            >
                              <Link2 size={15} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove column ${index + 1}`}
                              disabled={columns.length === 1}
                              onClick={() => {
                                setColumns((previous) =>
                                  previous.filter((item) => item.draftId !== column.draftId)
                                );
                                setError(null);
                                requestAnimationFrame(() =>
                                  document
                                    .getElementById(
                                      `${formId}-${columns[index - 1]?.draftId ?? columns[index + 1]?.draftId}-name`
                                    )
                                    ?.focus()
                                );
                              }}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </div>
                        {reference && (
                          <div className="schema-reference">
                            <div className="schema-field">
                              <Label htmlFor={`${id}-target`}>References table</Label>
                              <SchemaSelect
                                id={`${id}-target`}
                                value={reference.target_table}
                                onChange={(event) => {
                                  const selected = tables.find(
                                    (table) => (table.name || table.tbl_name) === event.target.value
                                  );
                                  const primary =
                                    selected?.columns?.find((item) => item.pk > 0) ??
                                    selected?.columns?.[0];
                                  update(column.draftId, {
                                    foreign_key: {
                                      ...reference,
                                      target_table: event.target.value,
                                      target_column: primary?.name ?? "",
                                    },
                                  });
                                }}
                              >
                                {tables.map((table) => (
                                  <option
                                    key={table.name || table.tbl_name}
                                    value={table.name || table.tbl_name}
                                  >
                                    {table.name || table.tbl_name}
                                  </option>
                                ))}
                              </SchemaSelect>
                            </div>
                            <div className="schema-field">
                              <Label htmlFor={`${id}-target-column`}>Reference column</Label>
                              <SchemaSelect
                                id={`${id}-target-column`}
                                value={reference.target_column}
                                disabled={!target?.columns?.length}
                                onChange={(event) =>
                                  update(column.draftId, {
                                    foreign_key: {
                                      ...reference,
                                      target_column: event.target.value,
                                    },
                                  })
                                }
                              >
                                {!target?.columns?.length && (
                                  <option value="">No columns available</option>
                                )}
                                {target?.columns?.map((item) => (
                                  <option key={item.name} value={item.name}>
                                    {item.name}
                                    {item.pk > 0 ? " (primary key)" : ""}
                                  </option>
                                ))}
                              </SchemaSelect>
                            </div>
                            <div className="schema-field">
                              <Label htmlFor={`${id}-delete`}>On delete</Label>
                              <SchemaSelect
                                id={`${id}-delete`}
                                value={reference.on_delete}
                                onChange={(event) =>
                                  update(column.draftId, {
                                    foreign_key: { ...reference, on_delete: event.target.value },
                                  })
                                }
                              >
                                {DELETE_ACTIONS.map((action) => (
                                  <option key={action}>{action}</option>
                                ))}
                              </SchemaSelect>
                            </div>
                            <p className="schema-hint">
                              Reference a primary key or a unique column.
                              {reference.on_delete === "CASCADE"
                                ? " Deleting the referenced row also deletes related rows in this table."
                                : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="schema-add-column"
                  onClick={addColumn}
                >
                  <Plus size={14} />
                  Add column
                </Button>
                {tablesQuery.isError && (
                  <p className="schema-hint">
                    Reference tables couldn’t be refreshed.{" "}
                    <button type="button" onClick={() => tablesQuery.refetch()}>
                      Try again
                    </button>
                  </p>
                )}
                {!tables.length && !tablesQuery.isPending && !tablesQuery.isError && (
                  <p className="schema-hint">
                    Relationships become available after you create your first table.
                  </p>
                )}
              </fieldset>
            </div>
            <footer className="schema-footer">
              {(error || mutation.isError) && (
                <p id={errorId} role="alert" className="schema-error">
                  {error?.message || mutation.error?.message}
                </p>
              )}
              <span>
                {pending ? "Creating your table…" : "At least one custom column is required."}
              </span>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => changeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating…" : "Create table"}
                </Button>
              </div>
            </footer>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

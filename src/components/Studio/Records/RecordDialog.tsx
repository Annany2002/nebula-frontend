import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecordSchemaType, TableType } from "@/types/allType";
import { useCreateRecord, useUpdateRecord } from "@/hooks/queries";
interface RecordDialogProps {
  dbName: string;
  table: TableType;
  record?: RecordSchemaType;
  primaryKey: string;
  onClose: () => void;
  onSaved: () => void;
}
function valueText(value: unknown, type: string) {
  if (value == null) return "";
  if (type.toUpperCase() === "BOOLEAN")
    return value === true || value === 1
      ? "true"
      : value === false || value === 0
        ? "false"
        : String(value);
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
export default function RecordDialog({
  dbName,
  table,
  record,
  primaryKey,
  onClose,
  onSaved,
}: RecordDialogProps) {
  const id = useId();
  const editing = !!record;
  const fields = table.columns.filter((column) =>
    editing
      ? !column.pk && column.name.toLowerCase() !== "created_at"
      : !(column.name.toLowerCase() === "created_at" && column.dflt_value != null)
  );
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((column) => [column.name, valueText(record?.[column.name], column.type)])
    )
  );
  const [nulls, setNulls] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      fields.map((column) => [column.name, editing && record?.[column.name] === null])
    )
  );
  const [validationError, setValidationError] = useState("");
  const create = useCreateRecord();
  const update = useUpdateRecord();
  const mutation = editing ? update : create;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;
    setValidationError("");
    const data: RecordSchemaType = {};
    for (const column of fields) {
      const name = column.name,
        type = column.type.toUpperCase(),
        value = values[name] ?? "";
      const autoPrimaryKey =
        column.pk > 0 && type === "INTEGER" && !/WITHOUT\s+ROWID/i.test(table.sql);
      const required =
        (!!column.notnull || !!column.pk) && column.dflt_value == null && !autoPrimaryKey;
      if (!editing && !nulls[name] && value === "") {
        if (required) {
          setValidationError(`${name} is required.`);
          return;
        }
        continue;
      }
      let parsed: unknown = nulls[name] ? null : value;
      if (
        !nulls[name] &&
        (type === "INTEGER" || /^(REAL|DECIMAL|NUMERIC|FLOAT|DOUBLE)/.test(type))
      ) {
        if (
          value.trim() === "" ||
          !Number.isFinite(Number(value)) ||
          (type === "INTEGER" && !Number.isInteger(Number(value)))
        ) {
          setValidationError(
            `${name} needs ${type === "INTEGER" ? "a whole number" : "a number"}. Use NULL for an empty value.`
          );
          return;
        }
        parsed = Number(value);
      } else if (!nulls[name] && type === "BOOLEAN") {
        if (value !== "true" && value !== "false") {
          setValidationError(`Choose true or false for ${name}, or use NULL.`);
          return;
        }
        parsed = value === "true";
      }
      if (
        !editing ||
        nulls[name] !== (record?.[name] === null) ||
        value !== valueText(record?.[name], column.type)
      )
        data[name] = parsed;
    }
    if (!Object.keys(data).length) {
      if (editing) {
        onClose();
        return;
      }
      setValidationError("Enter at least one value to insert a row.");
      return;
    }
    const callbacks = {
      onSuccess: () => {
        onSaved();
        onClose();
      },
    };
    if (editing)
      update.mutate(
        { dbName, tableName: table.name, recordId: record[primaryKey] as string | number, data },
        callbacks
      );
    else create.mutate({ dbName, tableName: table.name, data }, callbacks);
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="table-record-dialog">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit row" : "Insert row"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Update row ${String(record[primaryKey])} in ${table.name}.`
              : `Add a record to ${table.name}. Blank fields use database defaults.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate>
          <div className="table-record-fields">
            {fields.map((column, index) => {
              const inputId = `${id}-${index}`,
                type = column.type.toUpperCase();
              const allowNull = !column.notnull && !column.pk;
              return (
                <div key={column.name} className="table-record-field">
                  <div className="table-record-field-heading">
                    <label htmlFor={inputId}>
                      {column.name}
                      <span>
                        {type || "ANY"}
                        {column.pk ? " · PRIMARY KEY" : ""}
                      </span>
                    </label>
                    {allowNull && (
                      <label className="table-record-null">
                        <input
                          type="checkbox"
                          aria-label={`Set ${column.name} to NULL`}
                          checked={!!nulls[column.name]}
                          disabled={mutation.isPending}
                          onChange={(event) =>
                            setNulls((previous) => ({
                              ...previous,
                              [column.name]: event.target.checked,
                            }))
                          }
                        />
                        NULL
                      </label>
                    )}
                  </div>
                  {type === "BOOLEAN" ? (
                    <select
                      id={inputId}
                      value={values[column.name]}
                      disabled={mutation.isPending || nulls[column.name]}
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [column.name]: event.target.value,
                        }))
                      }
                    >
                      <option value="">{editing ? "Choose a value" : "Use default"}</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <Input
                      id={inputId}
                      type={
                        type === "INTEGER" || /^(REAL|DECIMAL|NUMERIC|FLOAT|DOUBLE)/.test(type)
                          ? "number"
                          : "text"
                      }
                      step={type === "INTEGER" ? 1 : "any"}
                      value={values[column.name]}
                      disabled={mutation.isPending || nulls[column.name]}
                      autoComplete="off"
                      placeholder={
                        column.pk && type === "INTEGER" && !/WITHOUT\s+ROWID/i.test(table.sql)
                          ? "Auto-generated if left blank"
                          : "Enter a value"
                      }
                      onChange={(event) =>
                        setValues((previous) => ({
                          ...previous,
                          [column.name]: event.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              );
            })}
            {!fields.length && (
              <p className="table-record-no-fields">This table has no editable columns.</p>
            )}
          </div>
          {(validationError || mutation.isError) && (
            <p className="table-record-error" role="alert">
              {validationError || mutation.error?.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !fields.length}>
              {mutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
                  Saving…
                </>
              ) : editing ? (
                "Save changes"
              ) : (
                "Insert row"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

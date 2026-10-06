import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateIndex, useTables } from "@/hooks/queries";
import { toast } from "sonner";
import { isProtectedIndexTarget } from "./indexManagement";

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

export default function CreateIndexForm({
  dbName,
  onClose,
}: {
  dbName: string;
  onClose: () => void;
}) {
  const id = useId();
  const tables = useTables(dbName);
  const create = useCreateIndex(dbName);
  const [name, setName] = useState("");
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [unique, setUnique] = useState(false);
  const virtualTables =
    tables.data?.filter((table) => /^CREATE\s+VIRTUAL\s+TABLE/i.test(table.sql ?? "")) ?? [];
  const eligibleTables =
    tables.data?.filter(
      (table) =>
        !isProtectedIndexTarget(table.name) &&
        !virtualTables.some(
          (virtual) =>
            table.name === virtual.name ||
            ["content", "segments", "segdir", "docsize", "stat", "data", "idx", "config"].some(
              (suffix) => table.name === `${virtual.name}_${suffix}`
            )
        )
    ) ?? [];
  const table = eligibleTables.find((item) => item.name === tableName);
  const validName = /^[a-zA-Z0-9_]{1,64}$/.test(name) && !isProtectedIndexTarget(name);
  const canSubmit =
    validName &&
    !!table &&
    columns.length > 0 &&
    columns.length <= 64 &&
    columns.every((column) => table.columns.some((item) => item.name === column)) &&
    !tables.isError;
  const sql =
    table && columns.length
      ? `CREATE ${unique ? "UNIQUE " : ""}INDEX ${quote(name || "index_name")} ON ${quote(table.name)} (${columns.map(quote).join(", ")});`
      : "Select a table and columns to preview the SQL.";
  const move = (position: number, direction: number) =>
    setColumns((current) => {
      const next = [...current];
      [next[position], next[position + direction]] = [next[position + direction], next[position]];
      return next;
    });
  return (
    <form
      className="index-create-form"
      aria-labelledby={`${id}-heading`}
      onSubmit={async (event) => {
        event.preventDefault();
        if (!canSubmit || create.isPending) return;
        try {
          await create.mutateAsync({ name, table_name: tableName, columns, unique });
          toast.success(`Index ${name} created`);
          onClose();
        } catch {
          /* The mutation error is shown below without discarding the form. */
        }
      }}
    >
      <div className="index-create-heading">
        <h2 id={`${id}-heading`}>Create index</h2>
        <p>Speed up lookups on one or more columns. Column order matters for composite indexes.</p>
      </div>
      {tables.isLoading ? (
        <p role="status">Loading tables…</p>
      ) : tables.isError ? (
        <div role="alert" className="db-objects-alert">
          Tables couldn’t be loaded.{" "}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => tables.refetch()}
            disabled={tables.isFetching}
          >
            Retry tables
          </Button>
        </div>
      ) : !eligibleTables.length ? (
        <p>
          No ordinary tables are available. Create a table first; internal and virtual tables cannot
          be indexed here.
        </p>
      ) : (
        <fieldset disabled={create.isPending} className="index-create-fields">
          <div className="index-create-basics">
            <div>
              <label htmlFor={`${id}-name`}>Index name</label>
              <Input
                id={`${id}-name`}
                autoFocus
                value={name}
                maxLength={64}
                placeholder="idx_orders_customer"
                aria-describedby={`${id}-name-help`}
                aria-invalid={!!name && !validName}
                onChange={(event) => {
                  setName(event.target.value);
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
                onValueChange={(value) => {
                  setTableName(value);
                  setColumns([]);
                  create.reset();
                }}
                disabled={create.isPending}
              >
                <SelectTrigger id={`${id}-table`}>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTables.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {table && (
            <fieldset className="index-create-columns">
              <legend>Columns</legend>
              <p>Select columns in index order. Use the arrows to change their order.</p>
              <div className="index-column-options">
                {table.columns.map((column, number) => (
                  <label key={column.name} htmlFor={`${id}-column-${number}`}>
                    <Checkbox
                      id={`${id}-column-${number}`}
                      checked={columns.includes(column.name)}
                      disabled={
                        create.isPending || (!columns.includes(column.name) && columns.length >= 64)
                      }
                      onCheckedChange={(checked) => {
                        setColumns((current) =>
                          checked
                            ? [...current, column.name]
                            : current.filter((name) => name !== column.name)
                        );
                        create.reset();
                      }}
                    />
                    <span>{column.name}</span>
                    <small>{column.type}</small>
                  </label>
                ))}
              </div>
              {columns.length > 0 && (
                <ol className="index-column-order" aria-label="Index column order">
                  {columns.map((column, position) => (
                    <li key={column}>
                      <span>
                        {position + 1}. {column}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        aria-label={`Move ${column} earlier`}
                        disabled={create.isPending || position === 0}
                        onClick={() => move(position, -1)}
                      >
                        <ArrowUp size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        aria-label={`Move ${column} later`}
                        disabled={create.isPending || position === columns.length - 1}
                        onClick={() => move(position, 1)}
                      >
                        <ArrowDown size={14} />
                      </Button>
                    </li>
                  ))}
                </ol>
              )}
            </fieldset>
          )}
          <div className="index-create-unique">
            <Checkbox
              id={`${id}-unique`}
              checked={unique}
              disabled={create.isPending}
              onCheckedChange={(checked) => {
                setUnique(checked === true);
                create.reset();
              }}
            />
            <div>
              <label htmlFor={`${id}-unique`}>Unique index</label>
              <p>
                Reject duplicate values for these columns. Creation fails if existing rows violate
                uniqueness.
              </p>
            </div>
          </div>
        </fieldset>
      )}
      <div className="index-create-preview">
        <span>SQL preview</span>
        <pre tabIndex={0} aria-label="Index SQL preview">
          <code>{sql}</code>
        </pre>
      </div>
      {create.isError && (
        <p role="alert" className="db-objects-alert">
          {create.error.message}
        </p>
      )}
      <div className="index-create-footer">
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
          {create.isPending ? "Creating…" : "Create index"}
        </Button>
      </div>
    </form>
  );
}

import { ArrowDown, ArrowUp, Edit2, KeyRound, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecordSchemaType, TableColumnType } from "@/types/allType";
interface RecordsGridProps {
  columns: TableColumnType[];
  records: RecordSchemaType[];
  offset: number;
  loading: boolean;
  sortColumn: string;
  sortOrder: "asc" | "desc";
  primaryKey?: string;
  onSort: (column: string) => void;
  onEdit: (record: RecordSchemaType) => void;
  onDelete: (id: string | number) => void;
}
export default function RecordsGrid({
  columns,
  records,
  offset,
  loading,
  sortColumn,
  sortOrder,
  primaryKey,
  onSort,
  onEdit,
  onDelete,
}: RecordsGridProps) {
  return (
    <table className="record-data-table" aria-busy={loading}>
      <caption className="sr-only">Table records. Use a column heading to sort.</caption>
      <colgroup>
        <col style={{ width: 44 }} />
        {columns.map((column) => (
          <col key={column.name} style={{ width: column.pk ? 140 : 220 }} />
        ))}
        <col style={{ width: 76 }} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="record-row-number">
            #
          </th>
          {columns.map((column) => (
            <th
              scope="col"
              key={column.name}
              aria-sort={
                column.name === sortColumn
                  ? sortOrder === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <button
                type="button"
                onClick={() => onSort(column.name)}
                aria-label={`Sort by ${column.name}`}
              >
                <span>
                  <strong>
                    {column.pk > 0 && <KeyRound size={12} aria-label="Primary key" />}
                    {column.name}
                  </strong>
                  <small>{column.type || "ANY"}</small>
                </span>
                {column.name === sortColumn &&
                  (sortOrder === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
              </button>
            </th>
          ))}
          <th scope="col" className="record-row-actions">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {loading
          ? Array.from({ length: 8 }, (_, index) => (
              <tr key={index}>
                <td className="record-row-number">{offset + index + 1}</td>
                {columns.map((column) => (
                  <td key={column.name}>
                    <span className="record-cell-skeleton animate-pulse motion-reduce:animate-none" />
                  </td>
                ))}
                <td className="record-row-actions" />
              </tr>
            ))
          : records.map((record, index) => {
              const id = primaryKey ? record[primaryKey] : undefined;
              const editable = typeof id === "number" || (typeof id === "string" && id !== "");
              return (
                <tr key={editable ? String(id) : index}>
                  <td className="record-row-number">{offset + index + 1}</td>
                  {columns.map((column) => {
                    const value = record[column.name];
                    const text =
                      value == null
                        ? null
                        : typeof value === "object"
                          ? JSON.stringify(value)
                          : column.type.toUpperCase() === "BOOLEAN"
                            ? value === true || value === 1
                              ? "true"
                              : value === false || value === 0
                                ? "false"
                                : String(value)
                            : String(value);
                    return (
                      <td key={column.name}>
                        {text === null ? (
                          <span className="record-null">NULL</span>
                        ) : (
                          <span>{text}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="record-row-actions">
                    {editable ? (
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button type="button" aria-label={`Actions for row ${String(id)}`}>
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onEdit(record)} className="gap-2">
                            <Edit2 size={14} />
                            Edit row
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => onDelete(id as string | number)}
                            className="gap-2 text-destructive"
                          >
                            <Trash2 size={14} />
                            Delete row
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="record-read-only">Read only</span>
                    )}
                  </td>
                </tr>
              );
            })}
      </tbody>
    </table>
  );
}

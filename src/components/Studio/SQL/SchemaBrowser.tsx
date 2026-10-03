import { useId, useState } from "react";
import { ArrowUpRight, ChevronRight, Columns3, KeyRound, Search, Table2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TableType } from "@/types/allType";

interface SchemaBrowserProps {
  tables: TableType[];
  onUseTable: (name: string) => void;
}

export default function SchemaBrowser({ tables, onUseTable }: SchemaBrowserProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const id = useId();
  const needle = search.trim().toLowerCase();
  const visibleTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(needle) ||
      table.columns.some((column) => column.name.toLowerCase().includes(needle))
  );

  return (
    <div className="sql-schema-browser">
      <header className="sql-schema-heading">
        <h2>Schema</h2>
        <span>
          {tables.length} {tables.length === 1 ? "table" : "tables"}
        </span>
      </header>
      <div className="sql-schema-search">
        <Search size={14} aria-hidden="true" />
        <Input
          type="search"
          aria-label="Search schema"
          placeholder="Find a table or column…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="sql-schema-list">
        {visibleTables.map((table, index) => {
          const open = !!expanded[table.name];
          const columnsId = `${id}-${index}`;
          return (
            <div className="sql-schema-table" key={table.name}>
              <div className="sql-schema-table-heading">
                <button
                  type="button"
                  className="sql-schema-disclosure"
                  aria-expanded={open}
                  aria-controls={columnsId}
                  aria-label={`Columns in ${table.name}`}
                  onClick={() =>
                    setExpanded((previous) => ({
                      ...previous,
                      [table.name]: !previous[table.name],
                    }))
                  }
                >
                  <ChevronRight size={13} aria-hidden="true" />
                  <Table2 size={15} aria-hidden="true" />
                  <span title={table.name}>{table.name}</span>
                </button>
                <button
                  type="button"
                  className="sql-schema-select"
                  onClick={() => onUseTable(table.name)}
                  aria-label={`Use SELECT query for ${table.name}`}
                  title={`Use SELECT query for ${table.name}`}
                >
                  <ArrowUpRight size={15} />
                </button>
              </div>
              <ul id={columnsId} className="sql-schema-columns" hidden={!open}>
                {table.columns.map((column) => (
                  <li key={column.name}>
                    {column.pk ? (
                      <KeyRound size={12} aria-label="Primary key" />
                    ) : (
                      <Columns3 size={12} aria-hidden="true" />
                    )}
                    <span title={column.name}>{column.name}</span>
                    <span title={column.type}>{column.type || "ANY"}</span>
                  </li>
                ))}
                {!table.columns.length && <li>No column details available.</li>}
              </ul>
            </div>
          );
        })}
        {!visibleTables.length && (
          <div className="sql-schema-empty">
            <Table2 size={22} aria-hidden="true" />
            <p>{tables.length ? "No matching tables or columns." : "No tables yet."}</p>
            {tables.length ? (
              <button type="button" onClick={() => setSearch("")}>
                Clear search
              </button>
            ) : (
              <span>Create a table in Overview or with a SQL statement.</span>
            )}
          </div>
        )}
      </div>
      <p className="sql-schema-hint">
        <ArrowUpRight size={13} aria-hidden="true" />
        Use a table to start a SELECT query.
      </p>
    </div>
  );
}

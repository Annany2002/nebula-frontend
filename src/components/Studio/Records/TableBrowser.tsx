import { useState } from "react";
import { MoreHorizontal, Plus, Search, Table2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableType } from "@/types/allType";
interface TableBrowserProps {
  tables: TableType[];
  activeTable: string;
  onSelect: (name: string) => void;
  onCreate: () => void;
  onDelete: (name: string) => void;
}
export default function TableBrowser({
  tables,
  activeTable,
  onSelect,
  onCreate,
  onDelete,
}: TableBrowserProps) {
  const [search, setSearch] = useState("");
  const visible = tables.filter((table) =>
    table.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  return (
    <div className="record-table-browser">
      <header>
        <h2>
          Tables <span>{tables.length}</span>
        </h2>
        <Button variant="ghost" size="icon" onClick={onCreate} aria-label="Create table">
          <Plus size={16} />
        </Button>
      </header>
      <div className="record-table-search">
        <Search size={14} />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search tables"
          placeholder="Find a table…"
        />
      </div>
      <nav aria-label="Table navigation">
        {visible.map((table) => (
          <div className="record-table-item" key={table.name}>
            <button
              type="button"
              onClick={() => onSelect(table.name)}
              aria-current={activeTable === table.name ? "page" : undefined}
              aria-label={`Open table ${table.name}`}
            >
              <Table2 size={15} />
              <span title={table.name}>{table.name}</span>
              <small>{table.rowCount?.toLocaleString() ?? "—"}</small>
            </button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="record-table-menu"
                  aria-label={`Actions for table ${table.name}`}
                >
                  <MoreHorizontal size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => onDelete(table.name)}
                  className="text-destructive gap-2"
                >
                  <Trash2 size={14} />
                  Delete table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </nav>
      {!visible.length && (
        <div className="record-browser-empty">
          <p>{tables.length ? "No matching tables." : "No tables yet."}</p>
          {tables.length ? (
            <button type="button" onClick={() => setSearch("")}>
              Clear search
            </button>
          ) : (
            <Button variant="outline" size="sm" onClick={onCreate}>
              Create table
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

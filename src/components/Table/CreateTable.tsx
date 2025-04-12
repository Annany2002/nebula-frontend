import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { useState } from "react";
import { TableColumnType } from "@/types/allType";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { url } from "@/App";
import { useRefetch } from "@/hooks/use-refetch";

export default function CreateSchema({ db_name }: { db_name: string }) {
  const { token } = useRefetch();
  const [open, setOpen] = useState(false);
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<TableColumnType[]>([
    { name: "", type: "TEXT" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddColumn = () => {
    setColumns([...columns, { name: "", type: "TEXT" }]);
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length <= 1) return;

    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };

  const handleColumnChange = (
    index: number,
    field: "name" | "type",
    value: string
  ) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableName.trim()) {
      toast.error("Table name is required");
      return;
    }

    const validColumns = columns.filter((col) => col.name.trim() !== "");

    if (validColumns.length === 0) {
      toast.error("At least one column with a name is required");
      return;
    }

    try {
      setIsLoading(true);
      const ok = await createTable(token, db_name, tableName, validColumns);
      if (ok) {
        toast.success(`Table '${tableName}' created successfully`);
        setTableName("");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Failed to create table. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Table Schema</DialogTitle>
          <DialogDescription>
            Define a new table schema in the {db_name} database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="users"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Columns</Label>
              <div className="space-y-2">
                {columns.map((column, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={column.name}
                      onChange={(e) =>
                        handleColumnChange(index, "name", e.target.value)
                      }
                      placeholder="Column name"
                      className="flex-1"
                      disabled={index === 0 && column.name === "id"}
                    />
                    <select
                      value={column.type}
                      onChange={(e) =>
                        handleColumnChange(index, "type", e.target.value)
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={index === 0 && column.name === "id"}
                    >
                      <option value="TEXT">TEXT</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DECIMAL">DECIMAL</option>
                      <option value="UUID">UUID</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveColumn(index)}
                      disabled={index === 0 || isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddColumn}
                className="mt-2"
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Column
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function createTable(
  token: string,
  db_name: string,
  table_name: string,
  columns: TableColumnType[]
): Promise<boolean> {
  const response = await fetch(`${url}/api/v1/databases/${db_name}/schema`, {
    method: "POST",
    body: JSON.stringify({ table_name, columns }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    toast.error("Table or columns must contain only aplhabets");
    return false;
  }
  await response.json();
  return true;
}

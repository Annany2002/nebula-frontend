import { useState } from "react";
import {
  Columns3,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Key,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Clock,
  Settings2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TableColumnType } from "@/types/allType";
import { useAlterTable } from "@/hooks/queries";
import { toast } from "sonner";

const COLUMN_TYPES = [
  { label: "TEXT (Strings, Text)", value: "TEXT" },
  { label: "INTEGER (Whole Numbers)", value: "INTEGER" },
  { label: "REAL (Floating Point)", value: "REAL" },
  { label: "BOOLEAN (True / False)", value: "BOOLEAN" },
  { label: "DATETIME (Timestamps)", value: "DATETIME" },
  { label: "BLOB (Binary Data)", value: "BLOB" },
];

interface ManageSchemaModalProps {
  dbName: string;
  tableName: string;
  columns: TableColumnType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableRenamed?: (newTableName: string) => void;
}

export default function ManageSchemaModal({
  dbName,
  tableName,
  columns,
  open,
  onOpenChange,
  onTableRenamed,
}: ManageSchemaModalProps) {
  const { mutate: alterTable, isPending } = useAlterTable();

  // Add Column Form State
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("TEXT");
  const [newColDefault, setNewColDefault] = useState("");
  const [newColNotNull, setNewColNotNull] = useState(false);

  // Rename Column State
  const [renamingCol, setRenamingCol] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Drop Column Confirmation State
  const [dropTargetCol, setDropTargetCol] = useState<string | null>(null);

  // Rename Table State
  const [newTableName, setNewTableName] = useState("");
  const [isRenamingTable, setIsRenamingTable] = useState(false);

  // Handlers
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newColName.trim();
    if (!trimmedName) {
      toast.error("Column name is required");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedName)) {
      toast.error("Column name must be alphanumeric and underscore only");
      return;
    }
    if (trimmedName.toLowerCase() === "id" || trimmedName.toLowerCase() === "created_at") {
      toast.error(`Column name '${trimmedName}' is reserved`);
      return;
    }
    if (newColNotNull && !newColDefault.trim()) {
      toast.error("A default value is required when adding a NOT NULL column");
      return;
    }

    alterTable(
      {
        dbName,
        tableName,
        payload: {
          action: "add_column",
          column: {
            name: trimmedName,
            type: newColType,
            default_value: newColDefault.trim() ? newColDefault.trim() : undefined,
            not_null: newColNotNull,
          },
        },
      },
      {
        onSuccess: () => {
          setNewColName("");
          setNewColDefault("");
          setNewColNotNull(false);
        },
      }
    );
  };

  const handleStartRename = (colName: string) => {
    setRenamingCol(colName);
    setRenameValue(colName);
  };

  const handleConfirmRename = (oldName: string) => {
    const trimmedNew = renameValue.trim();
    if (!trimmedNew || trimmedNew === oldName) {
      setRenamingCol(null);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedNew)) {
      toast.error("Column name must be alphanumeric and underscore only");
      return;
    }

    alterTable(
      {
        dbName,
        tableName,
        payload: {
          action: "rename_column",
          old_name: oldName,
          new_name: trimmedNew,
        },
      },
      {
        onSuccess: () => {
          setRenamingCol(null);
          setRenameValue("");
        },
      }
    );
  };

  const handleConfirmDrop = (colName: string) => {
    alterTable(
      {
        dbName,
        tableName,
        payload: {
          action: "drop_column",
          column_name: colName,
        },
      },
      {
        onSuccess: () => {
          setDropTargetCol(null);
        },
      }
    );
  };

  const handleRenameTable = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTable = newTableName.trim();
    if (!trimmedTable || trimmedTable === tableName) {
      setIsRenamingTable(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedTable)) {
      toast.error("Table name must be alphanumeric and underscore only");
      return;
    }

    alterTable(
      {
        dbName,
        tableName,
        payload: {
          action: "rename_table",
          new_table_name: trimmedTable,
        },
      },
      {
        onSuccess: () => {
          setIsRenamingTable(false);
          setNewTableName("");
          onTableRenamed?.(trimmedTable);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 bg-card border-purple-200/40 dark:border-white/10 text-card-foreground shadow-2xl rounded-xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-purple-200/30 dark:border-white/10 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                <Columns3 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>Manage Schema:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">
                    {tableName}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Evolve table structure: add, rename, or remove columns safely.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Columns Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Existing Columns ({columns.length})
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                System columns are protected
              </span>
            </div>

            <div className="border border-purple-200/40 dark:border-white/10 rounded-lg divide-y divide-purple-200/30 dark:divide-white/5 bg-background/50 overflow-hidden">
              {columns.map((col) => {
                const isSystemCol =
                  col.name.toLowerCase() === "id" || col.name.toLowerCase() === "created_at";
                const isRenaming = renamingCol === col.name;
                const isPendingDrop = dropTargetCol === col.name;

                return (
                  <div
                    key={col.name}
                    className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {col.pk === 1 ? (
                        <Key className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      ) : col.name.toLowerCase() === "created_at" ? (
                        <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-purple-500/60 flex-shrink-0" />
                      )}

                      {isRenaming ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="h-7 text-xs font-mono w-40 bg-background"
                            autoFocus
                            disabled={isPending}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleConfirmRename(col.name)}
                            disabled={isPending}
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                            title="Save rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRenamingCol(null)}
                            disabled={isPending}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-mono text-xs font-semibold text-foreground truncate">
                            {col.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono px-1.5 py-0 h-4.5 bg-muted/50 border-purple-200/40 dark:border-white/10"
                          >
                            {col.type}
                          </Badge>
                          {col.pk === 1 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono px-1.5 py-0 h-4.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            >
                              PK
                            </Badge>
                          )}
                          {col.notnull === 1 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono px-1.5 py-0 h-4.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            >
                              NOT NULL
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {isSystemCol ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] gap-1 px-2 py-0.5 bg-muted text-muted-foreground font-mono"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          System
                        </Badge>
                      ) : (
                        <>
                          {!isRenaming && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartRename(col.name)}
                              disabled={isPending}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Rename column"
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Rename
                            </Button>
                          )}

                          {isPendingDrop ? (
                            <div className="flex items-center space-x-1 bg-red-500/10 p-1 rounded-md border border-red-500/20">
                              <span className="text-[10px] text-red-500 font-medium px-1">
                                Drop column?
                              </span>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleConfirmDrop(col.name)}
                                disabled={isPending}
                                className="h-6 px-2 text-[10px] bg-red-600 hover:bg-red-700"
                              >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDropTargetCol(null)}
                                disabled={isPending}
                                className="h-6 px-1.5 text-[10px]"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDropTargetCol(col.name)}
                              disabled={isPending}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              title="Drop column"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Column Section */}
          <div className="space-y-3 pt-3 border-t border-purple-200/30 dark:border-white/10">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Add New Column</span>
            </Label>

            <form
              onSubmit={handleAddColumn}
              className="p-4 rounded-lg bg-muted/20 border border-purple-200/30 dark:border-white/10 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Column Name</Label>
                  <Input
                    placeholder="e.g. status, bio, rating"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="h-8 text-xs font-mono bg-background"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Data Type</Label>
                  <Select value={newColType} onValueChange={setNewColType} disabled={isPending}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs font-mono">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Default Value {newColNotNull && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    placeholder={newColType === "TEXT" ? "'active'" : "0"}
                    value={newColDefault}
                    onChange={(e) => setNewColDefault(e.target.value)}
                    className="h-8 text-xs font-mono bg-background"
                    disabled={isPending}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <Checkbox
                    id="not-null-check"
                    checked={newColNotNull}
                    onCheckedChange={(checked) => setNewColNotNull(!!checked)}
                    disabled={isPending}
                  />
                  <Label
                    htmlFor="not-null-check"
                    className="text-xs font-medium cursor-pointer select-none"
                  >
                    NOT NULL constraint
                  </Label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || !newColName.trim()}
                  className="h-8 px-4 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium gap-1.5 shadow-sm rounded-lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Column</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Rename Table Section */}
          <div className="space-y-3 pt-3 border-t border-purple-200/30 dark:border-white/10">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Rename Table</span>
              </Label>
              {!isRenamingTable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsRenamingTable(true);
                    setNewTableName(tableName);
                  }}
                  className="h-7 px-2.5 text-xs border-purple-200/40 dark:border-white/10"
                >
                  Change name
                </Button>
              )}
            </div>

            {isRenamingTable && (
              <form
                onSubmit={handleRenameTable}
                className="p-3.5 rounded-lg bg-muted/20 border border-purple-200/30 dark:border-white/10 flex items-center gap-3"
              >
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">New Table Name</Label>
                  <Input
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="h-8 text-xs font-mono bg-background"
                    disabled={isPending}
                    autoFocus
                  />
                </div>
                <div className="flex items-center space-x-1.5 pt-4">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      isPending || !newTableName.trim() || newTableName.trim() === tableName
                    }
                    className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsRenamingTable(false)}
                    disabled={isPending}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

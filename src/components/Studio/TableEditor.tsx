import { useState, useMemo } from "react";
import {
  Table2,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  Key,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableType, RecordsQueryParams } from "@/types/allType";
import { useRecords, useDeleteRecord, useDeleteTable } from "@/hooks/queries";
import CreateRecord from "@/components/Table/CreateRecord";
import EditRecord from "@/components/Table/EditRecord";
import { cn } from "@/lib/utils";

interface TableEditorProps {
  dbName: string;
  tables: TableType[];
  activeTable?: string;
  onSelectTable: (tableName: string) => void;
  onOpenCreateTable: () => void;
  onRefetchTables: () => void;
}

export default function TableEditor({
  dbName,
  tables,
  activeTable,
  onSelectTable,
  onOpenCreateTable,
  onRefetchTables,
}: TableEditorProps) {
  const currentTableName = activeTable || (tables.length > 0 ? tables[0].name : "");

  // Table search filter for left sub-sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tableSearch, setTableSearch] = useState("");

  // Record data grid pagination & sorting
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [rowSearch, setRowSearch] = useState("");

  // Record Modals
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [editRecordOpen, setEditRecordOpen] = useState(false);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<Record<string, any> | null>(
    null
  );

  // Queries & Mutations
  const queryParams: RecordsQueryParams = useMemo(
    () => ({
      limit: pageSize,
      offset: currentPage * pageSize,
      sort: sortColumn,
      order: sortOrder,
    }),
    [pageSize, currentPage, sortColumn, sortOrder]
  );

  const {
    data: recordsData,
    isLoading: recordsLoading,
    refetch: refetchRecords,
  } = useRecords(dbName, currentTableName, queryParams);

  const { mutate: deleteRecordMutation } = useDeleteRecord();
  const { mutate: deleteTableMutation } = useDeleteTable();

  const currentTable = useMemo(
    () => tables.find((t) => t.name === currentTableName),
    [tables, currentTableName]
  );

  const filteredTables = useMemo(() => {
    if (!tableSearch.trim()) return tables;
    const q = tableSearch.toLowerCase().trim();
    return tables.filter((t) => t.name.toLowerCase().includes(q));
  }, [tables, tableSearch]);

  const records = useMemo(() => recordsData?.records || [], [recordsData?.records]);
  const pagination = useMemo(
    () => recordsData?.pagination || { total: 0, limit: pageSize, offset: 0 },
    [recordsData?.pagination, pageSize]
  );
  const totalRecords = currentTable?.rowCount ?? pagination.total;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Client-side row filter
  const displayedRecords = useMemo(() => {
    if (!rowSearch.trim()) return records;
    const q = rowSearch.toLowerCase().trim();
    return records.filter((rec) =>
      Object.values(rec).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [records, rowSearch]);

  const handleDeleteRecord = (recordId: string | number) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteRecordMutation(
        { dbName, tableName: currentTableName, recordId },
        {
          onSuccess: () => {
            refetchRecords();
            onRefetchTables();
          },
        }
      );
    }
  };

  const handleDeleteTable = (tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(`Are you sure you want to drop table "${tableName}"? This action cannot be undone.`)
    ) {
      deleteTableMutation(
        { dbName, tableName },
        {
          onSuccess: () => {
            onRefetchTables();
            if (currentTableName === tableName && tables.length > 1) {
              const remaining = tables.filter((t) => t.name !== tableName);
              if (remaining.length > 0) onSelectTable(remaining[0].name);
            }
          },
        }
      );
    }
  };

  const handleEditRecord = (record: Record<string, any>) => {
    setSelectedRecordForEdit(record);
    setEditRecordOpen(true);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-background text-foreground">
      {/* Secondary Left Sidebar: Table Switcher Pane */}
      <div
        className={cn(
          "flex-shrink-0 bg-card/60 dark:bg-[#0c0b16]/75 backdrop-blur-xl border-r border-purple-200/50 dark:border-purple-500/15 flex flex-col h-full transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0 border-r-0 overflow-hidden"
        )}
      >
        {/* Sub-sidebar Header */}
        <div className="p-3.5 border-b border-purple-200/40 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Tables ({tables.length})
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenCreateTable}
                className="h-6 px-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-500/10 gap-1 rounded-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                title="Collapse tables sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Table Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter tables..."
              className="h-7 pl-8 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 rounded-md"
            />
          </div>
        </div>

        {/* Tables List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTables.map((table) => {
            const isActive = table.name === currentTableName;
            return (
              <div
                key={table.name}
                onClick={() => onSelectTable(table.name)}
                className={cn(
                  "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all relative",
                  isActive
                    ? "bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-purple-500/5 dark:hover:bg-purple-500/10"
                )}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Table2
                    className={cn(
                      "w-3.5 h-3.5 flex-shrink-0",
                      isActive ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
                    )}
                  />
                  <span className="truncate">{table.name}</span>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-4 font-mono",
                      isActive
                        ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
                        : "bg-muted/60 text-muted-foreground border-purple-200/30 dark:border-white/10"
                    )}
                  >
                    {table.rowCount ?? 0}
                  </Badge>
                  <button
                    onClick={(e) => handleDeleteTable(table.name, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5 rounded transition-opacity"
                    title="Drop table"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-purple-600 dark:bg-purple-400 rounded-r shadow-sm" />
                )}
              </div>
            );
          })}

          {filteredTables.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-xs">No tables found</div>
          )}
        </div>
      </div>

      {/* Main Panel: Spreadsheet Data Grid */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-background/50">
        {currentTable ? (
          <>
            {/* Table Toolbar Header */}
            <div className="h-14 border-b border-purple-200/40 dark:border-white/10 px-4 flex items-center justify-between bg-card/40 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                {!sidebarOpen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="h-7 w-7 p-0 mr-1 border border-purple-200/40 dark:border-white/10 hover:bg-purple-500/10"
                    title="Show tables sidebar"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5" />
                  </Button>
                )}
                <div className="flex items-center space-x-1.5 font-mono text-xs">
                  <Table2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-foreground">{currentTableName}</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 text-[11px] font-mono h-5"
                >
                  {totalRecords} rows
                </Badge>
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center space-x-2">
                {/* Search in Rows */}
                <div className="relative hidden sm:block">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={rowSearch}
                    onChange={(e) => setRowSearch(e.target.value)}
                    placeholder="Filter rows..."
                    className="h-8 w-44 pl-8 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 focus:border-purple-500/50 rounded-lg"
                  />
                </div>

                {/* Sort Selector */}
                <Select value={sortColumn} onValueChange={(val) => setSortColumn(val)}>
                  <SelectTrigger className="h-8 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 text-foreground w-28 rounded-lg">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-purple-200/50 dark:border-white/10 text-popover-foreground">
                    {currentTable.columns.map((col) => (
                      <SelectItem key={col.name} value={col.name} className="text-xs">
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-8 px-2 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 text-foreground hover:bg-muted rounded-lg"
                  title={`Sort ${sortOrder.toUpperCase()}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </Button>

                {/* Refresh */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchRecords();
                    onRefetchTables();
                  }}
                  className="h-8 px-2 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 text-foreground hover:bg-muted rounded-lg"
                  title="Refresh records"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", recordsLoading && "animate-spin")} />
                </Button>

                {/* Insert Row Button */}
                <Button
                  size="sm"
                  onClick={() => setCreateRecordOpen(true)}
                  className="h-8 px-3 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium gap-1 shadow-sm shadow-purple-500/25 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert row</span>
                </Button>
              </div>
            </div>

            {/* Spreadsheet Table View */}
            <div className="flex-1 overflow-auto">
              <TableUI>
                <TableHeader className="bg-card/90 dark:bg-[#0f0e20]/90 backdrop-blur-md sticky top-0 z-10 border-b border-purple-200/50 dark:border-purple-500/20">
                  <TableRow className="border-purple-200/40 dark:border-white/10 hover:bg-transparent">
                    <TableHead className="w-12 text-center text-muted-foreground font-mono text-[11px] select-none">
                      #
                    </TableHead>
                    {currentTable.columns.map((col) => (
                      <TableHead
                        key={col.name}
                        className="text-foreground font-mono text-xs font-medium border-l border-purple-200/30 dark:border-white/10 px-3 py-2 min-w-[140px]"
                      >
                        <div className="flex items-center justify-between space-x-1.5">
                          <span className="truncate font-semibold">{col.name}</span>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {col.pk === 1 && (
                              <span title="Primary Key">
                                <Key className="w-3 h-3 text-amber-500" />
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300">
                              {col.type}
                            </span>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-20 text-center text-muted-foreground font-mono text-xs border-l border-purple-200/30 dark:border-white/10">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recordsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={currentTable.columns.length + 2}
                        className="text-center py-16 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
                          <span className="text-xs">Loading table records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : displayedRecords.length > 0 ? (
                    displayedRecords.map((record, rIdx) => {
                      const recordId = (record.id ??
                        record[currentTable.columns[0]?.name] ??
                        rIdx) as string | number;
                      return (
                        <TableRow
                          key={String(recordId)}
                          className="border-purple-200/30 dark:border-white/5 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 transition-colors group"
                        >
                          <TableCell className="text-center text-muted-foreground font-mono text-[11px] py-2">
                            {currentPage * pageSize + rIdx + 1}
                          </TableCell>

                          {currentTable.columns.map((col) => {
                            const val = record[col.name];
                            return (
                              <TableCell
                                key={col.name}
                                className="font-mono text-xs text-foreground border-l border-purple-200/20 dark:border-white/5 px-3 py-2 max-w-xs truncate"
                              >
                                {val === null || val === undefined ? (
                                  <span className="text-muted-foreground/60 italic text-[11px]">
                                    NULL
                                  </span>
                                ) : typeof val === "boolean" ? (
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                                      val
                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {String(val)}
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </TableCell>
                            );
                          })}

                          <TableCell className="text-center border-l border-purple-200/20 dark:border-white/5 py-1.5">
                            <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRecord(record)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10"
                                title="Edit record"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecord(recordId)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                title="Delete record"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={currentTable.columns.length + 2}
                        className="text-center py-16 text-muted-foreground text-xs"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Layers className="w-8 h-8 text-muted-foreground/40" />
                          <p>No records found in table "{currentTableName}".</p>
                          <Button
                            size="sm"
                            onClick={() => setCreateRecordOpen(true)}
                            className="mt-2 h-7 text-xs bg-purple-600 hover:bg-purple-500 text-white"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Insert First Record
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </TableUI>
            </div>

            {/* Grid Pagination Footer */}
            <div className="h-11 border-t border-purple-200/40 dark:border-white/10 px-4 flex items-center justify-between bg-card/60 backdrop-blur-md flex-shrink-0 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span>
                  Showing{" "}
                  <strong className="text-foreground">
                    {totalRecords > 0 ? currentPage * pageSize + 1 : 0}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-foreground">
                    {Math.min((currentPage + 1) * pageSize, totalRecords)}
                  </strong>{" "}
                  of <strong className="text-foreground">{totalRecords}</strong> records
                </span>

                <div className="flex items-center space-x-1.5 ml-4">
                  <span className="text-muted-foreground text-[11px]">Rows:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger className="h-6 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 w-16 rounded">
                      <SelectValue placeholder="25" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-purple-200/50 dark:border-white/10">
                      {[10, 25, 50, 100].map((size) => (
                        <SelectItem key={size} value={String(size)} className="text-xs">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Page navigation */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="h-6 px-2 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 text-foreground disabled:opacity-40 rounded"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-6 px-2 text-xs bg-muted/40 border-purple-200/40 dark:border-white/10 text-foreground disabled:opacity-40 rounded"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
            <Table2 className="w-10 h-10 text-muted-foreground/40" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No tables selected</h3>
              <p className="text-xs text-muted-foreground">
                Select a table from the sidebar or create a new table schema.
              </p>
            </div>
            <Button
              size="sm"
              onClick={onOpenCreateTable}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 shadow-sm shadow-purple-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Table</span>
            </Button>
          </div>
        )}
      </div>

      {/* Insert Record Modal */}
      {createRecordOpen && (
        <CreateRecord
          db_name={dbName}
          table_name={currentTableName}
          open={createRecordOpen}
          setOpen={setCreateRecordOpen}
        />
      )}

      {/* Edit Record Modal */}
      {editRecordOpen && selectedRecordForEdit && (
        <EditRecord
          db_name={dbName}
          table_name={currentTableName}
          record_id={String(
            selectedRecordForEdit.id ?? selectedRecordForEdit[currentTable?.columns[0]?.name || ""]
          )}
          record={selectedRecordForEdit}
          open={editRecordOpen}
          setOpen={setEditRecordOpen}
        />
      )}
    </div>
  );
}

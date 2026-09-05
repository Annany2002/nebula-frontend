import { Dispatch, SetStateAction, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  LoaderCircle,
  RefreshCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDateTime } from "@/lib/formatDate";
import BreadCrumbNav from "@/components/BreadCrumbNav";
import LoginNavBar from "@/components/LoginNavbar";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRecords, useDeleteRecord, useTableSchema } from "@/hooks/queries";
import CreateRecord from "@/components/Table/CreateRecord";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import EditRecord from "@/components/Table/EditRecord";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordsQueryParams } from "@/types/allType";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function SingleTable() {
  const { pathname } = useLocation();
  const db_name = pathname.split("/")[2];
  const table_name = pathname.split("/")[4];

  // Pagination state
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);

  // Sorting state
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Search state (client-side for now as backup)
  const [searchTerm, setSearchTerm] = useState("");

  // Build query params
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
  } = useRecords(db_name, table_name, queryParams);

  const { data: schema } = useTableSchema(db_name, table_name);
  const { mutate: deleteRecordMutation } = useDeleteRecord();

  const [open, setOpen] = useState(false);

  // Memoize records to prevent dependency issues
  const records = useMemo(() => recordsData?.records || [], [recordsData?.records]);
  const pagination = useMemo(
    () => recordsData?.pagination || { total: 0, limit: pageSize, offset: 0 },
    [recordsData?.pagination, pageSize]
  );
  const totalRecords = pagination.total;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Get table fields from schema or first record
  const tableFields = useMemo(() => {
    if (schema && Array.isArray(schema)) {
      return schema.map((col: { name: string }) => col.name);
    }
    if (records.length > 0) {
      return Object.keys(records[0]);
    }
    return [];
  }, [schema, records]);

  // Client-side search filter (backup when server doesn't support it)
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    return records.filter((record) =>
      Object.values(record).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [records, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
    setCurrentPage(0); // Reset to first page on sort change
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(0); // Reset to first page on page size change
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const deleteRecord = (record_id: number) => {
    deleteRecordMutation({ dbName: db_name, tableName: table_name, recordId: record_id });
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <div className="min-h-screen space-y-6">
      <LoginNavBar />
      <div className="px-3">
        <BreadCrumbNav db_name={db_name} table_name={table_name} />
      </div>

      <div className="flex flex-col gap-1 px-3">
        <span className="text-3xl text-primary font-semibold">{table_name}</span>
        <span className="text-muted-foreground text-sm">
          View and manage records in this table.
        </span>
      </div>

      {/* Controls row */}
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search records..."
            className="max-w-xs bg-transparent"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="text-sm text-muted-foreground">{totalRecords} total records</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <RefreshCcw
            onClick={() => refetchRecords()}
            className={`cursor-pointer ${recordsLoading && "animate-spin"}`}
            size={20}
          />
          <CreateRecord db_name={db_name} table_name={table_name} open={open} setOpen={setOpen} />
        </div>
      </div>

      {/* Table content */}
      {records.length === 0 && !recordsLoading ? (
        <EmptyRecord setOpen={setOpen} />
      ) : (
        <div className="rounded-md border mx-3">
          {recordsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoaderCircle className="animate-spin h-8 w-8" />
            </div>
          ) : (
            <>
              <TableUI>
                <TableHeader>
                  <TableRow>
                    {tableFields.map((field) => (
                      <TableHead
                        key={field}
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort(field)}
                      >
                        <div className="flex items-center">
                          {field}
                          {getSortIcon(field)}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableFields.length + 1} className="h-24 text-center">
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record, idx) => (
                      <TableRow key={record.id?.toString() || idx}>
                        {tableFields.map((column) => (
                          <TableCell key={`${record.id}-${column}`}>
                            {column === "created_at" || column === "updated_at"
                              ? formatDateTime(record[column] as string)
                              : record[column]?.toString() || "—"}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <EditRecord db_name={db_name} table_name={table_name} record={record} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteRecord(record.id as number)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableUI>

              {/* Pagination controls */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <span className="text-sm text-muted-foreground">
                  Showing {pagination.offset + 1} to{" "}
                  {Math.min(pagination.offset + records.length, totalRecords)} of {totalRecords}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm px-2">
                    Page {currentPage + 1} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyRecord({ setOpen }: { setOpen: Dispatch<SetStateAction<boolean>> }) {
  return (
    <div className="pt-16">
      <EmptyState
        icon={FileText}
        title="No records yet"
        description="Create your first record to start storing data."
        actionLabel="Create Record"
        actionOnClick={() => setOpen(true)}
        className="mx-auto max-w-md"
      />
    </div>
  );
}

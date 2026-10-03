import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Loader2,
  PanelLeft,
  Plus,
  RefreshCw,
  Search,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TableType, RecordSchemaType } from "@/types/allType";
import { useRecords, useDeleteRecord, useDeleteTable } from "@/hooks/queries";
import ManageSchemaModal from "@/components/Table/ManageSchemaModal";
import TableBrowser from "./Records/TableBrowser";
import RecordsGrid from "./Records/RecordsGrid";
import RecordDialog from "./Records/RecordDialog";
import "@/styles/table-editor.css";

interface TableEditorProps {
  dbName: string;
  tables: TableType[];
  activeTable?: string;
  onSelectTable: (name: string) => void;
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
  const [browserOpen, setBrowserOpen] = useState(
    () => window.matchMedia("(min-width:1100px)").matches
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const deleteTable = useDeleteTable();
  const table = activeTable ? tables.find((item) => item.name === activeTable) : tables[0];
  const toggleBrowser = (
    <Button
      size="sm"
      variant="outline"
      aria-label={browserOpen ? "Hide table browser" : "Show table browser"}
      aria-expanded={browserOpen}
      aria-controls="record-table-browser"
      onClick={() => setBrowserOpen((previous) => !previous)}
      className="record-browser-toggle"
    >
      <PanelLeft size={15} />
      <span>Tables</span>
    </Button>
  );
  const handleDeleteTable = () => {
    if (!deleteTarget || deleteTable.isPending) return;
    const target = deleteTarget;
    deleteTable.mutate(
      { dbName, tableName: target },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          onRefetchTables();
          if (table?.name === target)
            onSelectTable(tables.find((item) => item.name !== target)?.name ?? "");
        },
      }
    );
  };
  return (
    <div className="table-editor">
      <aside id="record-table-browser" className="record-table-sidebar" hidden={!browserOpen}>
        <TableBrowser
          tables={tables}
          activeTable={table?.name ?? ""}
          onSelect={onSelectTable}
          onCreate={onOpenCreateTable}
          onDelete={(name) => {
            deleteTable.reset();
            setDeleteTarget(name);
          }}
        />
      </aside>
      {table ? (
        <TableRecords
          key={`${dbName}/${table.name}`}
          dbName={dbName}
          table={table}
          browserToggle={toggleBrowser}
          onRefetchTables={onRefetchTables}
          onSelectTable={onSelectTable}
        />
      ) : (
        <div className="table-editor-main">
          <header className="record-page-heading">
            <div>
              <h1>Table editor</h1>
              <p>Explore and manage your records.</p>
            </div>
            <div className="record-page-actions">
              {toggleBrowser}
              <Button size="sm" onClick={onOpenCreateTable}>
                <Plus size={15} />
                New table
              </Button>
            </div>
          </header>
          <div className="record-page-state">
            <Table2 size={29} />
            <h2>{tables.length ? "Table not found." : "Create your first table."}</h2>
            <p>
              {tables.length
                ? "Choose an available table to view its records."
                : "Define your columns, then add records or connect your app."}
            </p>
            <Button
              size="sm"
              onClick={() => (tables.length ? onSelectTable(tables[0].name) : onOpenCreateTable())}
            >
              {tables.length ? "Open a table" : "Create table"}
            </Button>
          </div>
        </div>
      )}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteTable.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="table-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete table {deleteTarget}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the table and all of its records. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTable.isError && (
            <p role="alert" className="text-sm text-destructive">
              {deleteTable.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTable.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeleteTable();
              }}
              disabled={deleteTable.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteTable.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
                  Deleting…
                </>
              ) : (
                "Delete table"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TableRecordsProps {
  dbName: string;
  table: TableType;
  browserToggle: React.ReactNode;
  onRefetchTables: () => void;
  onSelectTable: (name: string) => void;
}
function TableRecords({
  dbName,
  table,
  browserToggle,
  onRefetchTables,
  onSelectTable,
}: TableRecordsProps) {
  const keys = table.columns.filter((column) => column.pk > 0);
  const primaryKey = keys.length === 1 ? keys[0] : undefined;
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [sortColumn, setSortColumn] = useState(
    () => primaryKey?.name ?? table.columns[0]?.name ?? "id"
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [recordForm, setRecordForm] = useState<{ record?: RecordSchemaType } | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const effectiveSort = table.columns.some((column) => column.name === sortColumn)
    ? sortColumn
    : (primaryKey?.name ?? table.columns[0]?.name ?? "id");
  const { data, isLoading, isFetching, isError, refetch } = useRecords(dbName, table.name, {
    limit: pageSize,
    offset: page * pageSize,
    sort: effectiveSort,
    order,
  });
  const deleteRecord = useDeleteRecord();
  const records = data?.records ?? [];
  const total = data?.pagination.total ?? table.rowCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const needle = search.trim().toLowerCase();
  const visible = needle
    ? records.filter((record) =>
        Object.values(record).some((value) =>
          (typeof value === "object" ? JSON.stringify(value) : String(value))
            .toLowerCase()
            .includes(needle)
        )
      )
    : records;
  useEffect(() => {
    if (data && !isFetching && page >= totalPages) setPage(totalPages - 1);
  }, [data, isFetching, page, totalPages]);
  const refresh = () => {
    refetch();
    onRefetchTables();
  };
  const sort = (column: string) => {
    if (column === effectiveSort) setOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    else {
      setSortColumn(column);
      setOrder("asc");
    }
    setPage(0);
  };
  const removeRecord = () => {
    if (deleteId === null || deleteRecord.isPending) return;
    deleteRecord.mutate(
      { dbName, tableName: table.name, recordId: deleteId },
      {
        onSuccess: () => {
          setDeleteId(null);
          setPage((previous) =>
            Math.min(previous, Math.max(0, Math.ceil((total - 1) / pageSize) - 1))
          );
          onRefetchTables();
        },
      }
    );
  };
  return (
    <div className="table-editor-main">
      <header className="record-page-heading">
        <div>
          <h1 title={table.name}>{table.name}</h1>
          <p>
            {table.columns.length} {table.columns.length === 1 ? "column" : "columns"}
            <span aria-hidden="true"> · </span>
            {isLoading
              ? "Loading records…"
              : isError && !data
                ? "Records unavailable"
                : `${total.toLocaleString()} ${total === 1 ? "record" : "records"}`}
          </p>
        </div>
        <div className="record-page-actions">
          {browserToggle}
          <Button
            variant="outline"
            size="sm"
            aria-label="Edit schema"
            className="record-schema-button"
            onClick={() => setSchemaOpen(true)}
          >
            <Columns3 size={15} />
            <span>Edit schema</span>
          </Button>
          <Button size="sm" onClick={() => setRecordForm({})} disabled={!primaryKey}>
            <Plus size={15} />
            Insert row
          </Button>
        </div>
      </header>
      <div className="record-toolbar">
        <div className="record-search">
          <Search size={14} />
          <Input
            type="search"
            aria-label="Search rows on this page"
            placeholder="Search this page…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="record-sort">
          <label htmlFor="record-sort-column">Sort by</label>
          <span className="record-sort-control">
            <span className="record-sort-value" aria-hidden="true">
              {effectiveSort}
            </span>
            <select
              id="record-sort-column"
              value={effectiveSort}
              aria-label="Sort records by"
              onChange={(event) => {
                setSortColumn(event.target.value);
                setPage(0);
              }}
            >
              {table.columns.map((column) => (
                <option key={column.name} value={column.name}>
                  {column.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setOrder((previous) => (previous === "asc" ? "desc" : "asc"));
            setPage(0);
          }}
          aria-label={`Sort ${order === "asc" ? "descending" : "ascending"}`}
          title={`Current order: ${order === "asc" ? "ascending" : "descending"}`}
        >
          {order === "asc" ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={refresh}
          disabled={isFetching}
          aria-label="Refresh records"
        >
          <RefreshCw
            size={15}
            className={isFetching ? "animate-spin motion-reduce:animate-none" : ""}
          />
        </Button>
      </div>
      {!primaryKey && (
        <p className="record-capability-note">
          Editing, inserting, and deleting rows requires a single primary key. Use the SQL editor
          for this table.
        </p>
      )}
      {isError && data && (
        <div className="record-refresh-error" role="alert">
          <span>Records couldn’t be refreshed. Showing the last loaded page.</span>
          <button type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}
      <div
        className="record-grid-scroll"
        tabIndex={0}
        role="region"
        aria-label={`Records in ${table.name}`}
      >
        {isError && !data ? (
          <div className="record-page-state" role="alert">
            <AlertCircle size={26} />
            <h2>We couldn’t load these records.</h2>
            <p>Try again to view this table’s data.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading || visible.length ? (
          <>
            <RecordsGrid
              columns={table.columns}
              records={visible}
              offset={page * pageSize}
              loading={isLoading}
              sortColumn={effectiveSort}
              sortOrder={order}
              primaryKey={primaryKey?.name}
              onSort={sort}
              onEdit={(record) => setRecordForm({ record })}
              onDelete={(id) => {
                deleteRecord.reset();
                setDeleteId(id);
              }}
            />
            {isLoading && (
              <span className="sr-only" role="status">
                Loading records
              </span>
            )}
          </>
        ) : (
          <div className="record-page-state">
            <Table2 size={27} />
            <h2>{needle ? "No matches on this page." : "No records yet."}</h2>
            <p>
              {needle
                ? "Search checks the rows on the current page."
                : "Add the first row to bring this table to life."}
            </p>
            {needle ? (
              <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : (
              <Button size="sm" disabled={!primaryKey} onClick={() => setRecordForm({})}>
                <Plus size={15} />
                Insert first row
              </Button>
            )}
          </div>
        )}
      </div>
      <footer className="record-pagination">
        <p>
          {isLoading
            ? "Loading records…"
            : isError && !data
              ? "Records unavailable"
              : needle
                ? `${visible.length} ${visible.length === 1 ? "match" : "matches"} on this page`
                : `${records.length ? page * pageSize + 1 : 0}–${Math.min(page * pageSize + records.length, total)} of ${total.toLocaleString()} records`}
        </p>
        <div className="record-pagination-controls">
          <label>
            Rows{" "}
            <select
              value={pageSize}
              aria-label="Rows per page"
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={isFetching || page === 0 || (isError && !data)}
              onClick={() => setPage((previous) => Math.max(0, previous - 1))}
            >
              <ChevronLeft size={15} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={isFetching || page >= totalPages - 1 || (isError && !data)}
              onClick={() => setPage((previous) => previous + 1)}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </footer>
      {recordForm && primaryKey && (
        <RecordDialog
          dbName={dbName}
          table={table}
          record={recordForm.record}
          primaryKey={primaryKey.name}
          onClose={() => setRecordForm(null)}
          onSaved={() => {
            onRefetchTables();
          }}
        />
      )}
      {schemaOpen && (
        <ManageSchemaModal
          dbName={dbName}
          tableName={table.name}
          columns={table.columns}
          open
          onOpenChange={setSchemaOpen}
          onTableRenamed={(name) => {
            onSelectTable(name);
            onRefetchTables();
          }}
        />
      )}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open && !deleteRecord.isPending) setDeleteId(null);
        }}
      >
        <AlertDialogContent className="table-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete row {String(deleteId)}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes this record from {table.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteRecord.isError && (
            <p className="text-sm text-destructive" role="alert">
              {deleteRecord.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRecord.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteRecord.isPending}
              onClick={(event) => {
                event.preventDefault();
                removeRecord();
              }}
            >
              {deleteRecord.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
                  Deleting…
                </>
              ) : (
                "Delete row"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

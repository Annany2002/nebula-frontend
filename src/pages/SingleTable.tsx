import { useLocation, useParams } from "react-router-dom";
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
import { Edit2, FileText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRefetch } from "@/hooks/use-refetch";
import { url } from "../App";
import CreateRecord from "@/components/Table/CreateRecord";
import { RecordSchemaType } from "@/types/allType";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

export default function SingleTable() {
  const { pathname } = useLocation();
  const [records, setRecords] = useState<RecordSchemaType[]>([]);
  const [tableFields, setTableFields] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useRefetch();
  const db_name = pathname.split("/")[2];
  const table_name = pathname.split("/")[4];

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;

    return Object.values(record).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const deleteRecord = async (id: number) => {
    try {
      const response = await fetch(
        `${url}/api/v1/databases/${db_name}/tables/${table_name}/records/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 204) {
        toast.success(`Record with id ${id} deleted successfully`);
      }
    } catch (error) {
      toast.error(`Error in deleting record ${id}`);
    }
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(
          `${url}/api/v1/databases/${db_name}/tables/${table_name}/records`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setRecords(data);
        if (data.length > 0) {
          setTableFields(Object.keys(data[0]));
        }
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch records:", error);
      }
    };
    fetchRecords();
  }, [db_name, table_name]);

  return (
    <div className="min-h-screen bg-transparent space-y-6">
      <LoginNavBar />
      <div className="px-3">
        <BreadCrumbNav
          db_name={pathname.split("/")[2]}
          table_name={pathname.split("/")[4]}
        />
      </div>

      <div className="flex flex-col gap-1 px-3">
        <span className="text-3xl text-primary font-semibold">
          {pathname.split("/")[4]}
        </span>
        <span className="text-muted-foreground text-sm">
          View and manage records in this table.
        </span>
      </div>
      <div className="flex justify-between px-4">
        <Input
          type="search"
          placeholder="Search records..."
          className="max-w-xs"
          value={searchTerm}
          onChange={handleSearch}
        />
        <CreateRecord
          db_name={db_name}
          table_name={table_name}
          open={open}
          setOpen={setOpen}
        />
      </div>
      {records.length === 0 ? (
        <div className="mt-16">
          <EmptyState
            icon={FileText}
            title="No records yet"
            description="Create your first record to start storing data."
            actionLabel="Create Record"
            actionOnClick={() => setOpen(true)}
            className="mx-auto max-w-md"
          />
        </div>
      ) : (
        <div className="rounded-md border px-3">
          <TableUI>
            <TableHeader>
              <TableRow>
                {tableFields.length > 0 &&
                  tableFields.map((field) => (
                    <TableHead key={field}>{field}</TableHead>
                  ))}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={records.length + 1}
                    className="h-24 text-center"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record, _) => (
                  <TableRow key={_}>
                    {Object.keys(record).map((column) => (
                      <TableCell key={`${record.id}-${column}`}>
                        {record[column]?.toString() || "—"}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteRecord(record.id)}
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
        </div>
      )}
    </div>
  );
}

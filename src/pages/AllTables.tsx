import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useRefetch } from "@/hooks/use-refetch";
import { url } from "@/App";
import LoginNavBar from "@/components/LoginNavbar";
import BreadCrumbNav from "@/components/BreadCrumbNav";
import CreateTableSchema from "@/components/Table/CreateTableSchema";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  LoaderCircleIcon,
  RefreshCcw,
  Table,
  TableIcon,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatDate";
import { DatabaseApiKey } from "@/components/Database/DatabaseApiKey";
import { EmptyState } from "@/components/ui/empty-state";

export default function AllTables() {
  const { db_name } = useParams();
  const { token, refetchTables, tables, tableLoading, setTables } =
    useRefetch();
  const [isLoading, setIsLoading] = useState(false);
  const [openChange, setOpenChange] = useState(false);

  useEffect(() => {
    refetchTables(db_name);
  }, [openChange]);

  const deleteTable = async (table_name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${url}/api/v1/databases/${db_name}/tables/${table_name}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success(`Table ${table_name} deleted successfully`);
        setTables(tables.filter((table) => table.name !== table_name));
        await refetchTables(db_name);
      }
    } catch (error) {
      toast.error("Error deleting table");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent space-y-6">
      <LoginNavBar />
      <div className="px-3">
        <BreadCrumbNav db_name={db_name} />
      </div>
      <div className="px-3">
        <DatabaseApiKey databaseName={db_name} />
      </div>
      <div className="mt-4 px-4 flex justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-3xl text-primary font-semibold">
            Your Tables
          </span>
          <span className="text-muted-foreground text-sm">
            Manage tables and records in your database.
          </span>
        </div>

        <div className="flex gap-6 items-center">
          <RefreshCcw
            size={20}
            onClick={() => refetchTables(db_name)}
            className={`cursor-pointer ${tableLoading && "animate-spin"}`}
          />
          <CreateTableSchema
            openChange={openChange}
            setOpenChange={setOpenChange}
            db_name={db_name}
          />
        </div>
      </div>
      {isLoading ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : (
        <div className="space-y-4 px-4">
          {(!tables || tables.length === 0) && (
            <NoTables setOpenChange={setOpenChange} />
          )}
          {tableLoading ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            tables.map((table, _) => (
              <Card
                key={_}
                className="overflow-hidden bg-transparent backdrop-blur-sm"
              >
                <CardHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TableIcon className="h-5 w-5 text-primary" />
                      <Link
                        to={`/databases/${db_name}/tables/${table.name}`}
                        className="font-medium text-primary hover:underline hover:underline-offset-2"
                      >
                        {table.name}
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => deleteTable(table.name)}
                    >
                      <Trash2 className="h-12 w-12 " color="red" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-sm font-medium">Schema</h3>
                  <ScrollArea className="h-24 rounded border p-2">
                    <div className="space-y-1">
                      {table.columns.map((column, _) => (
                        <div
                          key={_}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-mono">{column.name}</span>
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs"
                          >
                            {column.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Created at {formatDateTime(table.createdAt)}
                  </p>
                </CardContent>
                <CardFooter className="border-t p-2">
                  <div className="flex w-full items-center justify-center">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs bg-transparent text-primary"
                      asChild
                    >
                      <Link to={`/databases/${db_name}/tables/${table.name}`}>
                        View Records
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function NoTables({
  setOpenChange,
}: {
  setOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <EmptyState
      icon={Table}
      title="No tables yet"
      description="Create your first table to get started."
      actionLabel="Create Table"
      actionOnClick={() => setOpenChange(true)}
      className="mx-auto max-w-md mt-16"
    />
  );
}

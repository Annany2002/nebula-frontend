import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRefetch } from "@/hooks/use-refetch";
import { url } from "@/App";
import LoginNavBar from "@/components/LoginNavbar";
import BreadCrumbNav from "@/components/BreadCrumbNav";
import CreateSchema from "@/components/Table/CreateTable";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { LoaderCircleIcon, TableIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatDate";
import { toast } from "sonner";

export default function AllTables() {
  const { db_name } = useParams();
  const { token, refetchTables, tables } = useRefetch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refetchTables(db_name);
  }, []);

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
      <div className="mt-4 px-4 flex justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-3xl text-primary font-semibold">
            Your Tables
          </span>
          <span className="text-muted-foreground text-sm">
            Manage tables and records in your database.
          </span>
        </div>

        <CreateSchema db_name={db_name} />
      </div>
      {isLoading ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : (
        <div className="space-y-4 px-4">
          {tables.map((table, _) => (
            <Card key={_} className="overflow-hidden">
              <CardHeader className="bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TableIcon className="h-5 w-5 text-primary" />
                    <Link
                      to={`/databases/${db_name}/tables/${table.name}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {table.name}
                    </Link>
                  </div>
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
              <CardFooter className="border-t bg-muted/50 p-2">
                <div className="flex w-full items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-xs" asChild>
                    <Link to={`/databases/${db_name}/tables/${table.name}`}>
                      View Records
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteTable(table.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

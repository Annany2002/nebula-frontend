import { Database as DatabaseIcon, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRefetch } from "@/hooks/use-refetch";
import { url } from "@/App";
import { toast } from "sonner";
import { DataBaseType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";

export function DatabaseCard({ database }: { database: DataBaseType }) {
  const { refetchDb, token } = useRefetch();

  const deleteProject = async () => {
    try {
      const response = await fetch(
        `${url}/api/v1/databases/${database.dbName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        await refetchDb();
        toast.success(`Project ${database.dbName} successfully deleted`);
      }
    } catch (error) {
      toast.error("Error in deleting database");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 p-4">
        <div className="flex items-center space-x-2">
          <DatabaseIcon className="h-5 w-5 text-primary" />
          <Link
            to={`/databases/${database.dbName}/tables`}
            className="font-medium text-primary hover:underline"
          >
            {database.dbName}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">
          <p>
            <span className="text-primary pr-1">
              {database.tables === 0 ? 0 : database.tables - 1}
            </span>
            Tables
          </p>
          <p className="mt-1 font-semibold">
            Created at {formatDateTime(database.createdAt)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-2">
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link to={`/databases/${database.dbName}/tables`}>View Tables</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={deleteProject}
            size="icon"
            className="h-8 w-8 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

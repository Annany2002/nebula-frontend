import { TableIcon, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";

interface TableColumn {
  name: string;
  type: string;
}

interface Table {
  id: string;
  name: string;
  database_id: string;
  columns: TableColumn[];
  records_count?: number;
  created_at: string;
}

export default function TableCard(table: Table) {
  const databaseName = "e";
  return (
    <Card key={table.id} className="overflow-hidden">
      <CardHeader className="bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TableIcon className="h-5 w-5 text-primary" />
            <Link
              to={`/databases/${databaseName}/tables/${table.name}`}
              className="font-medium text-primary hover:underline"
            >
              {table.name}
            </Link>
          </div>
          <Badge variant="outline" className="ml-2">
            {table.records_count} records
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="mb-2 text-sm font-medium">Schema</h3>
        <ScrollArea className="h-24 rounded border p-2">
          <div className="space-y-1">
            {table.columns.map((column) => (
              <div
                key={column.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono">{column.name}</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {column.type}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="mt-3 text-xs text-muted-foreground">
          Created Today
          {/* {formatDistanceToNow(new Date(table.created_at), {
            addSuffix: true,
          })} */}
        </p>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-2">
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link to={`/databases/${databaseName}/tables/${table.name}`}>
              View Records
            </Link>
          </Button>
          <Button
            variant="ghost"
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

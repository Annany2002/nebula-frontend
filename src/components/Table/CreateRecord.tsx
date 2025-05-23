import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { url } from "@/App";
import { useRefetch } from "@/hooks/use-refetch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { formatDateForDateTimeLocal } from "@/lib/utils";

export default function CreateRecord({
  db_name,
  table_name,
  open,
  setOpen,
}: {
  db_name: string;
  table_name: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { token } = useRefetch();
  const [recordSchema, setRecordSchema] = useState<Record<string, any>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currDate = formatDateForDateTimeLocal(new Date());

  const form = useForm<Record<string, any>>({
    defaultValues: recordSchema.reduce((acc, column) => {
      acc[column.name] = column.type === "BOOLEAN" ? false : "";
      return acc;
    }, {} as Record<string, any>),
  });

  const onSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // Convert values based on column types
      const formattedData = recordSchema.reduce((acc, column) => {
        const value = data[column.name];

        if (column.type === "INTEGER" && value) {
          acc[column.name] = parseInt(value, 10);
        } else if (column.type === "DECIMAL" && value) {
          acc[column.name] = parseFloat(value);
        } else if (column.type === "BOOLEAN" && typeof value === "string") {
          acc[column.name] = value.toLowerCase() === "true";
        } else {
          acc[column.name] = value;
        }

        return acc;
      }, {} as Record<string, any>);

      await fetch(
        `${url}/api/v1/databases/${db_name}/tables/${table_name}/records`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputType = (columnType: string) => {
    switch (columnType) {
      case "INTEGER":
        return "number";
      case "DECIMAL":
        return "number";
      case "BOOLEAN":
        return "checkbox";
      case "DATE":
        return "date";
      case "TIMESTAMP":
        return "datetime-local";
      default:
        return "text";
    }
  };

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch(
          `${url}/api/v1/databases/${db_name}/tables/${table_name}/schema`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setRecordSchema(data.schema);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSchema();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Record</DialogTitle>
          <DialogDescription>
            Create a new record in the {table_name} table.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[40vh] overflow-y-auto space-y-4 px-1">
              {recordSchema
                .filter((record) => record.name !== "id")
                .map((record, _) => (
                  <FormField
                    key={_}
                    control={form.control}
                    name={record.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{record.name}</FormLabel>
                        <FormControl>
                          <Input
                            type={getInputType(record.type)}
                            placeholder={
                              record.name === "created_at"
                                ? currDate
                                : `Enter ${record.name}`
                            }
                            {...field}
                            disabled={record.name === "created_at"}
                            value={
                              record.name === "created_at"
                                ? currDate
                                : field.value
                            }
                            checked={
                              record.type === "BOOLEAN"
                                ? field.value
                                : undefined
                            }
                            onChange={(e) => {
                              if (record.type === "BOOLEAN") {
                                field.onChange(e.target.checked);
                              } else {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Record"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

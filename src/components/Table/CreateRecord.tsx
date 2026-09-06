import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

import { useCreateRecord, useTableSchema } from "@/hooks/queries";
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
  const { mutate: createRecord, isPending: isSubmitting } = useCreateRecord();
  const { data: recordSchema = [] } = useTableSchema(db_name, table_name);

  const currDate = formatDateForDateTimeLocal(new Date());

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const form = useForm<Record<string, any>>({
    defaultValues: {},
  });

  // Update form default values when schema loads
  useEffect(() => {
    const schemaList: any[] = Array.isArray(recordSchema) ? recordSchema : [];
    if (schemaList.length > 0) {
      const defaults = schemaList.reduce((acc: any, column: any) => {
        acc[column.name] = column.type === "BOOLEAN" ? false : "";
        return acc;
      }, {});
      form.reset(defaults);
    }
  }, [recordSchema, form]);

  const onSubmit = (data: Record<string, any>) => {
    // Convert values based on column types
    const schemaList: any[] = Array.isArray(recordSchema) ? recordSchema : [];
    const formattedData = schemaList.reduce((acc: any, column: any) => {
      const value = data[column.name];

      if (column.type === "INTEGER" && value) {
        acc[column.name] = parseInt(value, 10);
      } else if (column.type === "DECIMAL" && value) {
        acc[column.name] = parseFloat(value);
      } else if (column.type === "BOOLEAN") {
        // Handle boolean properly (sometimes string "true" comes from inputs)
        if (typeof value === "string") acc[column.name] = value.toLowerCase() === "true";
        else acc[column.name] = Boolean(value);
      } else {
        acc[column.name] = value;
      }

      return acc;
    }, {});

    createRecord(
      { dbName: db_name, tableName: table_name, data: formattedData },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
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
          <DialogDescription>Create a new record in the {table_name} table.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[40vh] overflow-y-auto space-y-4 px-1">
              {Array.isArray(recordSchema) &&
                recordSchema
                  .filter((record: any) => record.name !== "id")
                  .map((record: any, _: number) => (
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
                                record.name === "created_at" ? currDate : `Enter ${record.name}`
                              }
                              {...field}
                              disabled={record.name === "created_at"}
                              value={record.name === "created_at" ? currDate : field.value}
                              checked={record.type === "BOOLEAN" ? field.value : undefined}
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

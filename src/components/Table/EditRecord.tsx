import { Dispatch, SetStateAction, useState } from "react";
import { Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { url } from "@/App";
import { useUpdateRecord } from "@/hooks/queries";
import { RecordSchemaType } from "@/types/allType";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";

export default function EditRecord({
  record,
  db_name,
  table_name,
}: {
  record: RecordSchemaType;
  db_name: string;
  table_name: string;
}) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const form = useForm<Record<string, any>>({
    defaultValues: record,
  });
  const [open, setOpen] = useState(false);

  const { mutate: updateRecord, isPending } = useUpdateRecord();

  const onSubmit = (data: Record<string, any>) => {
    const parsedData: Record<string, any> = {};

    for (const key in data) {
      const originalValue = record[key];

      if (typeof originalValue === "number") {
        parsedData[key] = Number(data[key]);
      } else if (typeof originalValue === "boolean") {
        parsedData[key] = data[key] === "true" || data[key] === true;
      } else {
        parsedData[key] = data[key];
      }
    }

    updateRecord(
      {
        dbName: db_name,
        tableName: table_name,
        recordId: record.id,
        data: parsedData,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
  };

  const getInputType = (columnType: string) => {
    switch (columnType?.toUpperCase()) {
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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editing record with ID: {record.id}</DialogTitle>
          <DialogDescription>Edit the values you want to change.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[40vh] overflow-y-auto space-y-4 px-1">
              {Object.entries(record)
                .filter(([k, v]) => k !== "created_at" && k !== "id")
                .map(([key, value]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          <Input
                            type={getInputType(key)}
                            placeholder={`Enter ${key}`}
                            defaultValue={value}
                            {...field}
                            checked={record.type === "BOOLEAN" ? field.value === true : undefined}
                            onChange={(e) => {
                              if (record.type === "BOOLEAN") {
                                field.onChange(e.target.checked);
                              } else {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

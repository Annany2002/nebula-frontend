import { Dispatch, SetStateAction, useState } from "react";
import { Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
  record_id,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: {
  record: RecordSchemaType;
  db_name: string;
  table_name: string;
  record_id?: string | number;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const form = useForm<Record<string, any>>({
    defaultValues: record,
  });
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(val);
    } else {
      setInternalOpen(val);
    }
  };

  const { mutate: updateRecord } = useUpdateRecord();

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

    const resolvedRecordId = (record.id ?? record_id) as string | number;

    updateRecord(
      {
        dbName: db_name,
        tableName: table_name,
        recordId: resolvedRecordId,
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
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editing record with ID: {String(record.id ?? record_id ?? "")}</DialogTitle>
          <DialogDescription>Edit the values you want to change.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[40vh] overflow-y-auto space-y-4 px-1">
              {Object.entries(record)
                .filter(([k]) => k !== "created_at" && k !== "id")
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
                            defaultValue={
                              value !== undefined && value !== null ? String(value) : ""
                            }
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Edit2 } from "lucide-react";
import { RecordSchemaType } from "@/types/allType";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Dispatch, SetStateAction } from "react";
import { useRefetch } from "@/hooks/use-refetch";
import { url } from "@/App";
import { toast } from "sonner";

export default function EditRecord({
  record,
  setOpen,
  db_name,
  table_name,
}: {
  record: RecordSchemaType;
  db_name: string;
  table_name: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const form = useForm<Record<string, any>>({
    defaultValues: record,
  });
  const { token } = useRefetch();

  const onSubmit = async (data: Record<string, any>) => {
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

    try {
      const response = await fetch(
        `${url}/api/v1/databases/${db_name}/tables/${table_name}/records/${record.id}`,
        {
          method: "PUT",
          body: JSON.stringify(parsedData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      if (response.ok) {
        form.reset();
        setOpen(false);
        toast.success(`Record with id ${record.id} edited successfully`);
      }
    } catch (error) {
      console.log(error);
    }
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

  console.log("Current Record:", record);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editing record with ID: {record.id}</DialogTitle>
          <DialogDescription>
            Edit the values you want to change.
          </DialogDescription>
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

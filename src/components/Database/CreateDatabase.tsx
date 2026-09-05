import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useCreateDatabase } from "@/hooks/queries";
import { Plus } from "lucide-react";

export default function CreateDatabase({
  openChange,
  setOpenChange,
}: {
  openChange: boolean;
  setOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const { mutate: createDb, isPending } = useCreateDatabase();
  const [projectName, setProjectName] = useState<string>("");

  const createDatabase = () => {
    createDb(projectName, {
      onSuccess: () => setOpenChange(false),
      onError: (error) => {
        // Error handling is mostly done in mutation onError, but we can do extra here if needed
      },
    });
  };

  return (
    <Dialog open={openChange} onOpenChange={setOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex gap-1 items-center">
          <Plus />
          <span>New</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your new project</DialogTitle>
          <DialogDescription>
            <span className="text-red-500 font-medium">Use a unique name for your project</span>, so
            choose your project name wisely. The project name is same as the underlying database
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 w-full justify-between items-center space-x-2">
          <Input
            type="text"
            placeholder="Project Name"
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Button disabled={isPending} onClick={createDatabase} type="submit">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

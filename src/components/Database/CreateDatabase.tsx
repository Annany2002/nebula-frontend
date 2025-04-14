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
import { url } from "@/App";
import { toast } from "sonner";
import { useRefetch } from "@/hooks/use-refetch";
import { Plus } from "lucide-react";

export default function CreateDatabase({
  openChange,
  setOpenChange,
}: {
  openChange: boolean;
  setOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");
  const { token, setDatabases } = useRefetch();

  const createDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/api/v1/databases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ db_name: projectName }),
      });
      if (response.status === 409) {
        toast.error(`Project with ${projectName} already exists`);
      } else if (response.status === 201) {
        await response.json();
        setDatabases((prevDb) =>
          prevDb.filter((db) => db.dbName !== projectName)
        );
        toast.success("Project Created Successfully");
        setOpenChange(false);
      }
    } catch (error) {
      toast.error("Some error occured");
    } finally {
      setIsLoading(false);
    }
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
            <span className="text-red-500 font-medium">
              Use a unique name for your project
            </span>
            , so choose your project name wisely. The project name is same as
            the underlying database
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 w-full justify-between items-center space-x-2">
          <Input
            type="text"
            placeholder="Project Name"
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Button disabled={isLoading} onClick={createDatabase} type="submit">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "../ui/input";
import { useCreateDatabase } from "@/hooks/queries";
import { Plus, Database, Loader2 } from "lucide-react";

export default function CreateDatabase({
  openChange,
  setOpenChange,
}: {
  openChange: boolean;
  setOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const { mutate: createDb, isPending } = useCreateDatabase();
  const [projectName, setProjectName] = useState<string>("");

  const createDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    createDb(projectName.trim(), {
      onSuccess: () => {
        setProjectName("");
        setOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={openChange} onOpenChange={setOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          <span>New Database</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border border-purple-200/50 dark:border-white/10 bg-white/95 dark:bg-[#0d0c14]/95 backdrop-blur-2xl shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Create Database
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                Spins up an isolated physical database file instantly.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={createDatabase} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              Database Name
            </label>
            <Input
              type="text"
              value={projectName}
              placeholder="e.g. production_db, analytics_store"
              className="rounded-xl border-purple-200/50 dark:border-white/10 bg-white/50 dark:bg-black/40 focus:ring-purple-500 h-10 text-sm font-mono"
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Alphanumeric characters and underscores recommended.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-xs"
              onClick={() => setOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !projectName.trim()}
              className="rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25 px-5 h-9"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Creating...
                </>
              ) : (
                "Create Database"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

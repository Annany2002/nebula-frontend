import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDropIndex } from "@/hooks/queries";
import { IndexInfo } from "@/types/allType";

export default function DropIndexDialog({
  dbName,
  index,
  onClose,
  onRefresh,
}: {
  dbName: string;
  index: IndexInfo;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const id = useId();
  const [confirmation, setConfirmation] = useState("");
  const drop = useDropIndex(dbName);
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !drop.isPending) onClose();
      }}
    >
      <AlertDialogContent
        className="max-w-[calc(100vw-32px)] sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (drop.isPending) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("index-create-trigger")?.focus();
        }}
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (confirmation !== index.name || drop.isPending) return;
            try {
              await drop.mutateAsync(index.name);
              toast.success(`Index ${index.name} dropped`);
              onClose();
            } catch {
              /* Preserve the confirmation and show the server error. */
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Drop index?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <span className="break-all font-mono text-foreground">{index.name}</span> from{" "}
              <span className="break-all font-mono text-foreground">{index.tableName}</span>. Table
              records will be kept. Queries that use this index may become slower.
              {index.unique &&
                " This also removes the uniqueness constraint enforced by this index."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label htmlFor={id} className="text-sm">
              Type the index name to confirm
            </label>
            <Input
              id={id}
              autoFocus
              value={confirmation}
              disabled={drop.isPending}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
            />
          </div>
          {drop.isError && (
            <div role="alert" className="space-y-2 text-sm text-destructive">
              <p>{drop.error.message}</p>
              <Button type="button" size="sm" variant="outline" onClick={onRefresh}>
                Refresh catalog
              </Button>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={drop.isPending}>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={confirmation !== index.name || drop.isPending}
            >
              {drop.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin motion-reduce:animate-none" />
              )}
              {drop.isPending ? "Dropping…" : "Drop index"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

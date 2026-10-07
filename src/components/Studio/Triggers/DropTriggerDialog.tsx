import { useEffect, useId, useRef, useState } from "react";
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
import { useDropTrigger } from "@/hooks/queries";
import { TriggerInfo } from "@/types/allType";

export default function DropTriggerDialog({
  dbName,
  trigger,
  onClose,
  onRefresh,
  returnFocusTo,
}: {
  dbName: string;
  trigger: TriggerInfo;
  onClose: () => void;
  onRefresh: () => void;
  returnFocusTo: HTMLElement | null;
}) {
  const id = useId();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [confirmation, setConfirmation] = useState("");
  const drop = useDropTrigger(dbName);
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !drop.isPending) onClose();
      }}
    >
      <AlertDialogContent
        className="max-w-[calc(100vw-32px)] sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          if (drop.isPending) e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          (returnFocusTo?.isConnected
            ? returnFocusTo
            : document.getElementById("trigger-create-trigger")
          )?.focus();
        }}
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (confirmation !== trigger.name || drop.isPending) return;
            try {
              await drop.mutateAsync(trigger.name);
              if (!mounted.current) return;
              toast.success(`Trigger ${trigger.name} dropped`);
              onClose();
            } catch {
              /* Preserve confirmation and show the server error. */
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Drop trigger?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <span className="break-all font-mono text-foreground">{trigger.name}</span>{" "}
              from <span className="break-all font-mono text-foreground">{trigger.tableName}</span>.
              Existing records will be kept. Future writes will stop running this trigger’s actions,
              including any validation or audit logging it provides.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label htmlFor={id} className="text-sm">
              Type the trigger name to confirm
            </label>
            <Input
              id={id}
              autoFocus
              autoComplete="off"
              value={confirmation}
              disabled={drop.isPending}
              onChange={(e) => setConfirmation(e.target.value)}
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
              disabled={confirmation !== trigger.name || drop.isPending}
            >
              {drop.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin motion-reduce:animate-none" />
              )}
              {drop.isPending ? "Dropping…" : "Drop trigger"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

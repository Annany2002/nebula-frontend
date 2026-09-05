import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database,
  HardDrive,
  Table2,
  Calendar,
  Layers,
  AlertTriangle,
  Trash2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDeleteDatabase } from "@/hooks/queries";
import { useAuth } from "@/context/auth-context";
import { DatabaseDetailType, TableType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";

interface ProjectSettingsProps {
  dbName: string;
  details?: DatabaseDetailType;
  tables: TableType[];
}

export default function ProjectSettings({ dbName, details, tables }: ProjectSettingsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: deleteDb, isPending: isDeleting } = useDeleteDatabase();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const handleDelete = () => {
    if (confirmInput !== dbName) return;
    deleteDb(dbName, {
      onSuccess: () => {
        setDeleteOpen(false);
        const currentUserId = user?.userId || localStorage.getItem("user_id");
        navigate(currentUserId ? `/dashboard/${currentUserId}` : "/");
      },
    });
  };

  const totalRows = tables.reduce((acc, t) => acc + (t.rowCount || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Project Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">
            General configuration, storage engine metrics, and database lifecycle settings.
          </p>
        </div>

        {/* Database Information Card */}
        <Card className="rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/80 backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-sm font-bold">General Information</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              >
                Active
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Project identifiers and database configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-white/[0.02] border border-purple-200/40 dark:border-white/5 space-y-1">
                <span className="text-muted-foreground font-mono text-[11px]">Database Name</span>
                <p className="font-mono font-semibold text-foreground">{dbName}</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-white/[0.02] border border-purple-200/40 dark:border-white/5 space-y-1">
                <span className="text-muted-foreground font-mono text-[11px]">Storage Engine</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  <span>Isolated SQLite 3 (WAL Mode)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-white/[0.02] border border-purple-200/40 dark:border-white/5 space-y-1">
                <span className="text-muted-foreground font-mono text-[11px]">
                  Tables & Records
                </span>
                <div className="flex items-center gap-2 font-mono font-semibold text-foreground">
                  <Table2 className="w-3.5 h-3.5 text-purple-500" />
                  <span>
                    {tables.length} tables • {totalRows} records
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-white/[0.02] border border-purple-200/40 dark:border-white/5 space-y-1">
                <span className="text-muted-foreground font-mono text-[11px]">Created At</span>
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span>
                    {details?.createdAt ? formatDateTime(details.createdAt) : "Recently created"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="rounded-2xl border border-red-500/30 dark:border-red-500/20 bg-red-500/[0.02] backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <CardTitle className="text-sm font-bold text-red-600 dark:text-red-400">
                Danger Zone
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Destructive actions for this project database. Proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <div>
                <p className="text-xs font-semibold text-foreground">Delete this database</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Permanently remove the SQLite file, all tables, schemas, and records. This action
                  cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirmInput("");
                  setDeleteOpen(true);
                }}
                className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white font-medium shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-red-500/30">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">Delete Database</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              This action is permanent and irreversible. Type{" "}
              <span className="font-mono font-bold text-foreground">{dbName}</span> to confirm
              deletion.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={dbName}
              className="font-mono text-xs h-9 border-red-500/30 focus:border-red-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={confirmInput !== dbName || isDeleting}
              onClick={handleDelete}
              className="text-xs h-8 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

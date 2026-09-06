import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Database as DatabaseIcon,
  Key,
  MoreVertical,
  Table2,
  Trash2,
  Terminal,
  Home,
  Check,
  Code2,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteDatabase } from "@/hooks/queries";
import { toast } from "sonner";
import { DataBaseType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";

interface EnhancedDatabaseCardProps {
  database: DataBaseType;
  index?: number;
  viewMode?: "grid" | "list";
}

export function EnhancedDatabaseCard({
  database,
  index = 0,
  viewMode = "grid",
}: EnhancedDatabaseCardProps) {
  const { mutate: deleteDatabase } = useDeleteDatabase();
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const tableCount = database.tables || 0;
  const hasApiKey = Boolean(database?.apiKey && database.apiKey !== "");
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const deleteProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete database "${database.dbName}"?`)) {
      deleteDatabase(database.dbName);
    }
  };

  const copyDbName = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.navigator.clipboard.writeText(database.dbName);
    toast.success("Database name copied");
  };

  const copyApiKey = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!database.apiKey) return;
    window.navigator.clipboard.writeText(database.apiKey);
    toast.success("API key copied to clipboard");
  };

  const copyApiEndpoint = (e: React.MouseEvent) => {
    e.stopPropagation();
    const endpoint = `${backendUrl}/api/v1/${database.dbName}`;
    window.navigator.clipboard.writeText(endpoint);
    setCopiedEndpoint(true);
    toast.success(`REST endpoint copied: ${endpoint}`);
    setTimeout(() => setCopiedEndpoint(false), 1800);
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        onClick={() => navigate(`/databases/${database.dbName}/overview`)}
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-purple-200/50 dark:border-purple-500/15 bg-card/75 backdrop-blur-xl hover:border-purple-500/40 hover:shadow-md hover:shadow-purple-500/5 transition-all gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
            <DatabaseIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                {database.dbName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-600 dark:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                SQLite WAL
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
              {tableCount} {tableCount === 1 ? "table" : "tables"} • Created{" "}
              {formatDateTime(database.createdAt)}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 self-end sm:self-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="hidden sm:flex items-center gap-1 mr-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs rounded-lg border-purple-200/50 dark:border-white/10 hover:border-purple-500/40"
              onClick={() => navigate(`/databases/${database.dbName}/tables`)}
            >
              <Table2 className="h-3 w-3 mr-1 text-purple-500" /> Tables
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs rounded-lg border-purple-200/50 dark:border-white/10 hover:border-purple-500/40"
              onClick={() => navigate(`/databases/${database.dbName}/sql`)}
            >
              <Terminal className="h-3 w-3 mr-1 text-indigo-500" /> SQL
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-500/10 font-medium"
            onClick={() => navigate(`/databases/${database.dbName}/overview`)}
          >
            Open <ArrowRight className="h-3 w-3 ml-1" />
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl border border-purple-200/50 dark:border-white/10 bg-popover/95 backdrop-blur-xl shadow-xl p-1 z-50"
            >
              <DropdownMenuItem
                onClick={() => navigate(`/databases/${database.dbName}/overview`)}
                className="text-xs cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 mr-2" /> Project Overview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/databases/${database.dbName}/tables`)}
                className="text-xs cursor-pointer"
              >
                <Table2 className="h-3.5 w-3.5 mr-2" /> Table Editor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/databases/${database.dbName}/sql`)}
                className="text-xs cursor-pointer"
              >
                <Terminal className="h-3.5 w-3.5 mr-2" /> SQL Runner
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem onClick={copyApiEndpoint} className="text-xs cursor-pointer">
                <Code2 className="h-3.5 w-3.5 mr-2" /> Copy REST URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyDbName} className="text-xs cursor-pointer">
                <Copy className="h-3.5 w-3.5 mr-2" /> Copy DB Name
              </DropdownMenuItem>
              {hasApiKey && (
                <DropdownMenuItem onClick={copyApiKey} className="text-xs cursor-pointer">
                  <Key className="h-3.5 w-3.5 mr-2" /> Copy API Key
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuItem
                onClick={deleteProject}
                className="text-xs cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
    >
      <Card
        onClick={() => navigate(`/databases/${database.dbName}/overview`)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-purple-200/50 dark:border-purple-500/15 bg-card/75 backdrop-blur-xl hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all p-5 flex flex-col justify-between min-h-[190px]"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shadow-xs">
                <DatabaseIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                    {database.dbName}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 px-1.5 py-0"
                  >
                    SQLite WAL
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {tableCount} {tableCount === 1 ? "table" : "tables"}
                  </span>
                  {hasApiKey && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Key className="h-2.5 w-2.5" /> API Key
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 rounded-xl border border-purple-200/50 dark:border-white/10 bg-popover/95 backdrop-blur-xl shadow-xl p-1 z-50"
                >
                  <DropdownMenuItem
                    onClick={() => navigate(`/databases/${database.dbName}/overview`)}
                    className="text-xs cursor-pointer"
                  >
                    <Home className="h-3.5 w-3.5 mr-2" /> Project Overview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(`/databases/${database.dbName}/tables`)}
                    className="text-xs cursor-pointer"
                  >
                    <Table2 className="h-3.5 w-3.5 mr-2" /> Table Editor
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(`/databases/${database.dbName}/sql`)}
                    className="text-xs cursor-pointer"
                  >
                    <Terminal className="h-3.5 w-3.5 mr-2" /> SQL Runner
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem onClick={copyApiEndpoint} className="text-xs cursor-pointer">
                    <Code2 className="h-3.5 w-3.5 mr-2" /> Copy REST URL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyDbName} className="text-xs cursor-pointer">
                    <Copy className="h-3.5 w-3.5 mr-2" /> Copy DB Name
                  </DropdownMenuItem>
                  {hasApiKey && (
                    <DropdownMenuItem onClick={copyApiKey} className="text-xs cursor-pointer">
                      <Key className="h-3.5 w-3.5 mr-2" /> Copy API Key
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem
                    onClick={deleteProject}
                    className="text-xs cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2.5 rounded-lg border-purple-200/50 dark:border-white/10 hover:border-purple-500/40 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(`/databases/${database.dbName}/tables`)}
            >
              <Table2 className="h-3 w-3 mr-1 text-purple-500" /> Tables
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2.5 rounded-lg border-purple-200/50 dark:border-white/10 hover:border-purple-500/40 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(`/databases/${database.dbName}/sql`)}
            >
              <Terminal className="h-3 w-3 mr-1 text-indigo-500" /> SQL
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2.5 rounded-lg border-purple-200/50 dark:border-white/10 hover:border-purple-500/40 text-muted-foreground hover:text-foreground ml-auto"
              onClick={copyApiEndpoint}
              title="Copy REST API Base URL"
            >
              {copiedEndpoint ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Code2 className="h-3 w-3 text-pink-500" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-4 border-t border-purple-200/30 dark:border-white/5 text-xs text-muted-foreground font-mono">
          <span className="text-[11px]">{formatDateTime(database.createdAt)}</span>
          <span className="text-purple-600 dark:text-purple-400 font-sans font-medium text-xs flex items-center group-hover:translate-x-0.5 transition-transform">
            Open Studio <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

export default EnhancedDatabaseCard;

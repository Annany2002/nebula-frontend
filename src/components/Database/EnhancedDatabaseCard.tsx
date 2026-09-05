import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Database as DatabaseIcon,
  Eye,
  EyeOff,
  Key,
  MoreVertical,
  Table2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeleteDatabase } from "@/hooks/queries";
import { toast } from "sonner";
import { DataBaseType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

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
  const [showKey, setShowKey] = useState(false);
  const navigate = useNavigate();

  const tableCount = database.tables === 0 ? 0 : database.tables - 1;
  const hasApiKey = database?.apiKey !== "";

  const deleteProject = () => {
    deleteDatabase(database.dbName);
  };

  const copyDbName = () => {
    window.navigator.clipboard.writeText(database.dbName);
    toast.success("Database name copied");
  };

  const copyApiKey = () => {
    window.navigator.clipboard.writeText(database.apiKey);
    toast.success("API key copied to clipboard");
  };

  const maskedKey = database.apiKey
    ? `${database.apiKey.slice(0, 6)}${"•".repeat(16)}${database.apiKey.slice(-4)}`
    : "";

  // List View Layout
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.03 }}
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-purple-200/50 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl hover:border-purple-400/60 dark:hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 transition-all gap-4"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
            <DatabaseIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/databases/${database.dbName}/tables`}
                className="font-bold text-sm text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 transition-colors truncate"
              >
                {database.dbName}
              </Link>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
              Created {formatDateTime(database.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-300">
            <Table2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>{tableCount} tables</span>
          </div>

          <Badge
            variant={hasApiKey ? "default" : "secondary"}
            className={cn(
              "text-[10px] font-mono px-2 py-0.5",
              hasApiKey
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
            )}
          >
            {hasApiKey ? "API Key Active" : "No Key"}
          </Badge>

          <Button
            size="sm"
            variant="outline"
            className="rounded-xl h-8 px-3 text-xs border-purple-200/50 dark:border-white/10 hover:bg-purple-500/10 dark:hover:bg-white/5"
            onClick={() => navigate(`/databases/${database.dbName}/tables`)}
          >
            Open <ArrowRight className="h-3 w-3 ml-1" />
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border border-purple-200/50 dark:border-white/10 bg-white/95 dark:bg-[#0d0c14]/95 backdrop-blur-xl shadow-xl p-1 z-50"
            >
              <DropdownMenuItem onClick={copyDbName} className="text-xs rounded-lg cursor-pointer">
                Copy Name
              </DropdownMenuItem>
              {hasApiKey && (
                <DropdownMenuItem
                  onClick={copyApiKey}
                  className="text-xs rounded-lg cursor-pointer"
                >
                  Copy API Key
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-purple-200/40 dark:border-white/10 my-1" />
              <DropdownMenuItem
                onClick={deleteProject}
                className="text-xs rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  // Grid View Layout (Bento Card)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-purple-200/50 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl hover:border-purple-400/60 dark:hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-purple-950/20 transition-all duration-300">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-300">
                <DatabaseIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Link
                  to={`/databases/${database.dbName}/tables`}
                  className="font-bold text-base text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 transition-colors block truncate"
                >
                  {database.dbName}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-mono">
                    {formatDateTime(database.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 rounded-xl border border-purple-200/50 dark:border-white/10 bg-white/95 dark:bg-[#0d0c14]/95 backdrop-blur-xl shadow-xl p-1.5 z-50"
              >
                <DropdownMenuItem
                  onClick={() => navigate(`/databases/${database.dbName}/tables`)}
                  className="text-xs rounded-lg cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2 opacity-60" /> Open Tables
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={copyDbName}
                  className="text-xs rounded-lg cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 mr-2 opacity-60" /> Copy DB Name
                </DropdownMenuItem>
                {hasApiKey && (
                  <DropdownMenuItem
                    onClick={copyApiKey}
                    className="text-xs rounded-lg cursor-pointer"
                  >
                    <Key className="h-3.5 w-3.5 mr-2 opacity-60" /> Copy API Key
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-purple-200/40 dark:border-white/10 my-1" />
                <DropdownMenuItem
                  onClick={deleteProject}
                  className="text-xs rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Database
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-1 space-y-4">
          {/* Metrics Pills */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <div className="p-2.5 rounded-xl border border-purple-200/40 dark:border-white/[0.06] bg-purple-500/[0.04] dark:bg-white/[0.02] flex items-center gap-2.5">
              <Table2 className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                  Tables
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-xs">{tableCount}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-purple-200/40 dark:border-white/[0.06] bg-purple-500/[0.04] dark:bg-white/[0.02] flex items-center gap-2.5">
              <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                  API Key
                </p>
                <span
                  className={cn(
                    "text-[10px] font-semibold block truncate",
                    hasApiKey ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                  )}
                >
                  {hasApiKey ? "Configured" : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Masked API Key Row */}
          {hasApiKey && (
            <div className="rounded-xl border border-purple-200/40 dark:border-white/[0.06] bg-white/20 dark:bg-black/30 p-2.5 flex items-center justify-between gap-2">
              <code className="text-[11px] font-mono text-gray-600 dark:text-zinc-300 truncate">
                {showKey ? database.apiKey : maskedKey}
              </code>
              <div className="flex items-center gap-1 shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-lg text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{showKey ? "Hide" : "Show"}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-lg text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                        onClick={copyApiKey}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy API Key</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Action CTA */}
          <Button
            asChild
            variant="ghost"
            className="w-full justify-between rounded-xl h-10 px-3 text-xs font-semibold hover:bg-purple-500/10 dark:hover:bg-white/5 text-gray-800 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-300 transition-colors group/btn"
          >
            <Link to={`/databases/${database.dbName}/tables`}>
              <span>Manage Tables</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default EnhancedDatabaseCard;

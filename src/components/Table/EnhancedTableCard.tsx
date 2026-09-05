import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Columns,
  Copy,
  ExternalLink,
  Key,
  MoreVertical,
  Table2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EnhancedTableCardProps {
  table: TableType;
  dbName: string;
  onDelete: (tableName: string) => void;
  index?: number;
  viewMode?: "grid" | "list";
}

const typeColors: Record<string, string> = {
  INTEGER: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  TEXT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  REAL: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  BLOB: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  BOOLEAN: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  UUID: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  DECIMAL: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  TIMESTAMP: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

export function EnhancedTableCard({
  table,
  dbName,
  onDelete,
  index = 0,
  viewMode = "grid",
}: EnhancedTableCardProps) {
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    const upperType = type.toUpperCase();
    return (
      typeColors[upperType] || "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
    );
  };

  const copyTableName = () => {
    window.navigator.clipboard.writeText(table.name);
    toast.success("Table name copied");
  };

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
            <Table2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/databases/${dbName}/tables/${table.name}`}
                className="font-bold text-sm text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 transition-colors truncate"
              >
                {table.name}
              </Link>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-medium">
                {table.columns.length} {table.columns.length === 1 ? "column" : "columns"}
              </span>
            </div>
            {formatDateTime(table.createdAt) ? (
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                Created {formatDateTime(table.createdAt)}
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono">
                {table.columns.some((c) => c.pk === 1) ? "Primary key: id" : "Auto-indexed"}
              </p>
            )}
          </div>
        </div>

        {/* Column schema preview pills in list view */}
        <div className="hidden md:flex items-center gap-1.5 overflow-hidden max-w-sm">
          {table.columns.slice(0, 3).map((col, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className={cn("text-[10px] font-mono border py-0.5 px-1.5", getTypeColor(col.type))}
            >
              {col.name}
            </Badge>
          ))}
          {table.columns.length > 3 && (
            <span className="text-[11px] text-gray-400 font-mono">
              +{table.columns.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl h-8 px-3 text-xs border-purple-200/50 dark:border-white/10 hover:bg-purple-500/10 dark:hover:bg-white/5"
            onClick={() => navigate(`/databases/${dbName}/tables/${table.name}`)}
          >
            View Records <ArrowRight className="h-3 w-3 ml-1" />
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
              <DropdownMenuItem
                onClick={() => navigate(`/databases/${dbName}/tables/${table.name}`)}
                className="text-xs rounded-lg cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-2 opacity-60" /> View Records
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={copyTableName}
                className="text-xs rounded-lg cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 mr-2 opacity-60" /> Copy Name
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-purple-200/40 dark:border-white/10 my-1" />
              <DropdownMenuItem
                onClick={() => onDelete(table.name)}
                className="text-xs rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Table
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
                <Table2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Link
                  to={`/databases/${dbName}/tables/${table.name}`}
                  className="font-bold text-base text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 transition-colors block truncate"
                >
                  {table.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <Columns className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-mono">
                    {table.columns.length} columns
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
                  onClick={() => navigate(`/databases/${dbName}/tables/${table.name}`)}
                  className="text-xs rounded-lg cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2 opacity-60" /> View Records
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={copyTableName}
                  className="text-xs rounded-lg cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 mr-2 opacity-60" /> Copy Name
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-purple-200/40 dark:border-white/10 my-1" />
                <DropdownMenuItem
                  onClick={() => onDelete(table.name)}
                  className="text-xs rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-1 space-y-4">
          {/* Schema preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Column Schema
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {table.columns.length} defined
              </span>
            </div>
            <ScrollArea className="h-[120px] rounded-xl border border-purple-200/40 dark:border-white/[0.06] bg-white/30 dark:bg-black/20 p-2">
              <div className="space-y-1.5">
                {table.columns.map((column, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-purple-500/5 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {column.pk === 1 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex h-4 w-4 items-center justify-center rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                                <Key className="h-2.5 w-2.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Primary Key</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="font-mono text-xs text-gray-800 dark:text-zinc-200 truncate">
                        {column.name}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-mono text-[10px] border px-1.5 py-0.5",
                        getTypeColor(column.type)
                      )}
                    >
                      {column.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Table metadata footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 pt-1 border-t border-purple-200/30 dark:border-white/[0.05]">
            <span className="text-[11px]">
              {formatDateTime(table.createdAt)
                ? `Created ${formatDateTime(table.createdAt)}`
                : `${table.columns.length} ${table.columns.length === 1 ? "column" : "columns"}`}
            </span>
            <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
              {table.columns.some((c) => c.pk === 1) ? "PK: id" : "Auto-indexed"}
            </span>
          </div>

          {/* Action button */}
          <Button
            asChild
            variant="ghost"
            className="w-full justify-between rounded-xl h-10 px-3 text-xs font-semibold hover:bg-purple-500/10 dark:hover:bg-white/5 text-gray-800 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-300 transition-colors group/btn"
          >
            <Link to={`/databases/${dbName}/tables/${table.name}`}>
              <span>View Records</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default EnhancedTableCard;

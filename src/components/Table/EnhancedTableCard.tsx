import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Columns, MoreVertical, Table as TableIcon, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface EnhancedTableCardProps {
  table: TableType;
  dbName: string;
  onDelete: (tableName: string) => void;
  index?: number;
}

const typeColors: Record<string, string> = {
  INTEGER: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  TEXT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  REAL: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  BLOB: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  BOOLEAN: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
};

export function EnhancedTableCard({ table, dbName, onDelete, index = 0 }: EnhancedTableCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    const upperType = type.toUpperCase();
    return (
      typeColors[upperType] || "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-900/60 dark:to-gray-900/40",
          "backdrop-blur-md border-white/20 dark:border-gray-700/50",
          "hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30",
          "hover:-translate-y-1"
        )}
      >
        {/* Gradient overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          )}
        />

        <CardHeader className="relative border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-colors duration-300">
                <TableIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <Link
                  to={`/databases/${dbName}/tables/${table.name}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors group-hover:text-primary"
                >
                  {table.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <Columns className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {table.columns.length} columns
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/databases/${dbName}/tables/${table.name}`)}
                >
                  View Records
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(table.name)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative p-4 space-y-4">
          {/* Schema preview */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Schema
            </h4>
            <ScrollArea className="h-[120px] rounded-lg border border-border/50 bg-muted/20 p-2">
              <div className="space-y-1.5">
                {table.columns.map((column, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.03 }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {column.pk === 1 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex h-4 w-4 items-center justify-center rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                </svg>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Primary Key</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="font-mono text-sm">{column.name}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn("font-mono text-xs border", getTypeColor(column.type))}
                    >
                      {column.type}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Created date */}
          <p className="text-xs text-muted-foreground">Created {formatDateTime(table.createdAt)}</p>

          {/* Action button */}
          <Button
            asChild
            variant="ghost"
            className="w-full justify-between group/btn hover:bg-primary/10"
          >
            <Link to={`/databases/${dbName}/tables/${table.name}`}>
              <span>View Records</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteDatabase } from "@/hooks/queries";
import { toast } from "sonner";
import { DataBaseType } from "@/types/allType";
import { formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

interface EnhancedDatabaseCardProps {
  database: DataBaseType;
  index?: number;
}

export function EnhancedDatabaseCard({ database, index = 0 }: EnhancedDatabaseCardProps) {
  const { mutate: deleteDatabase } = useDeleteDatabase();
  const [showKey, setShowKey] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const tableCount = database.tables === 0 ? 0 : database.tables - 1;
  const hasApiKey = database?.apiKey !== "";

  const deleteProject = () => {
    deleteDatabase(database.dbName);
  };

  const copyApiKey = () => {
    window.navigator.clipboard.writeText(database.apiKey);
    toast.success("API key copied to clipboard");
  };

  const maskedKey = database.apiKey
    ? `${database.apiKey.slice(0, 8)}${"•".repeat(20)}${database.apiKey.slice(-4)}`
    : "";

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

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100"
          animate={isHovered ? { opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent)",
          }}
        />

        <CardHeader className="relative border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-colors duration-300">
                <DatabaseIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Link
                  to={`/databases/${database.dbName}/tables`}
                  className="font-semibold text-foreground hover:text-primary transition-colors group-hover:text-primary"
                >
                  {database.dbName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Created {formatDateTime(database.createdAt)}
                </p>
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
                  onClick={() => navigate(`/databases/${database.dbName}/tables`)}
                >
                  View Tables
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={deleteProject}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Database
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative p-4 space-y-4">
          {/* Stats row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                <Table2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{tableCount}</p>
                <p className="text-xs text-muted-foreground">Tables</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                <Key className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <Badge
                  variant={hasApiKey ? "default" : "secondary"}
                  className={cn(
                    "text-xs",
                    hasApiKey
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                  )}
                >
                  {hasApiKey ? "Active" : "No Key"}
                </Badge>
              </div>
            </div>
          </div>

          {/* API Key section */}
          {hasApiKey && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono text-muted-foreground flex-1 truncate">
                  {showKey ? database.apiKey : maskedKey}
                </code>
                <div className="flex items-center gap-1 ml-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {showKey ? "Hide" : "Show"} API Key
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={copyApiKey}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy API Key</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <Button
            asChild
            variant="ghost"
            className="w-full justify-between group/btn hover:bg-primary/10"
          >
            <Link to={`/databases/${database.dbName}/tables`}>
              <span>View Tables</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

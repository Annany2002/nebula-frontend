import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline";
}

export function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  className,
  variant = "default",
}: QuickActionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300",
        variant === "default" && [
          "bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40",
          "border border-white/20 dark:border-gray-700/50",
          "hover:shadow-lg hover:shadow-purple-500/10",
          "hover:border-purple-500/30",
        ],
        variant === "outline" && [
          "border-2 border-dashed border-muted-foreground/20",
          "hover:border-primary/50 hover:bg-primary/5",
        ],
        className
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
          variant === "default" && [
            "bg-primary/10 group-hover:bg-primary/20",
          ],
          variant === "outline" && [
            "bg-muted/50 group-hover:bg-primary/10",
          ]
        )}
      >
        <Icon
          className={cn(
            "h-6 w-6 transition-colors duration-300",
            variant === "default" && "text-primary",
            variant === "outline" && "text-muted-foreground group-hover:text-primary"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
          "opacity-0 group-hover:opacity-100",
          "translate-x-2 group-hover:translate-x-0",
          "bg-primary/10"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </motion.button>
  );
}

interface QuickActionsGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function QuickActionsGrid({
  children,
  className,
  columns = 2,
}: QuickActionsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {children}
    </div>
  );
}

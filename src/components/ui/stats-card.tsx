import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface StatsCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  accentColor?: "purple" | "violet" | "indigo" | "fuchsia";
}

const accentColors = {
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200/50 dark:border-purple-500/20",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/15",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200/50 dark:border-violet-500/20",
  },
  indigo: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200/50 dark:border-indigo-500/20",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/15",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    border: "border-fuchsia-200/50 dark:border-fuchsia-500/20",
  },
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
  className,
  accentColor = "purple",
}: StatsCardProps) {
  const colors = accentColors[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5",
        "bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl",
        "border-purple-200/50 dark:border-white/[0.08]",
        "hover:border-purple-400/60 dark:hover:border-purple-500/40",
        "hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-purple-950/20",
        "transition-all duration-300",
        className
      )}
    >
      {/* Subtle glow highlight on card hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
          {description && (
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium pt-0.5">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105",
            colors.bg,
            colors.border
          )}
        >
          <Icon className={cn("h-5 w-5", colors.text)} />
        </div>
      </div>
    </motion.div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn("grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

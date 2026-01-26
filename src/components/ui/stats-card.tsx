import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface StatsCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  accentColor?: "purple" | "violet" | "indigo" | "fuchsia";
}

// Purple-focused accent colors to match the app's theme
const accentColors = {
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
  },
  indigo: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    border: "border-fuchsia-500/20",
  },
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  className,
  accentColor = "purple",
}: StatsCardProps) {
  const colors = accentColors[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-5",
        "bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-900/60 dark:to-gray-900/40",
        "backdrop-blur-md border-white/20 dark:border-gray-700/50",
        "hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30",
        "transition-all duration-300",
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        )}
      />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-purple-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
            "group-hover:from-purple-500/30 group-hover:to-purple-600/20",
            "transition-colors duration-300"
          )}
        >
          <Icon className={cn("h-6 w-6", colors.text)} />
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
    <div
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

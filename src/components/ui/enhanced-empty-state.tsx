import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EnhancedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionOnClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionOnClick?: () => void;
  className?: string;
}

export function EnhancedEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick,
  className,
}: EnhancedEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl p-12 text-center",
        "bg-gradient-to-b from-muted/30 to-muted/10",
        "border border-dashed border-muted-foreground/20",
        className
      )}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-purple-500"
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 shadow-lg shadow-primary/10"
        >
          <Icon className="h-8 w-8 text-primary" />
        </motion.div>

        <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {actionLabel && actionOnClick && (
            <Button onClick={actionOnClick} size="lg" className="gap-2">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && secondaryActionOnClick && (
            <Button onClick={secondaryActionOnClick} variant="outline" size="lg">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

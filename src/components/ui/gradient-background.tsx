import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  className?: string;
  variant?: "default" | "subtle" | "vibrant";
}

export function GradientBackground({ className, variant = "default" }: GradientBackgroundProps) {
  const variants = {
    default: {
      orb1: "bg-purple-500/20 dark:bg-purple-500/10",
      orb2: "bg-blue-500/20 dark:bg-blue-500/10",
      orb3: "bg-pink-500/15 dark:bg-pink-500/8",
    },
    subtle: {
      orb1: "bg-purple-500/10 dark:bg-purple-500/5",
      orb2: "bg-blue-500/10 dark:bg-blue-500/5",
      orb3: "bg-pink-500/8 dark:bg-pink-500/4",
    },
    vibrant: {
      orb1: "bg-purple-500/30 dark:bg-purple-500/15",
      orb2: "bg-blue-500/30 dark:bg-blue-500/15",
      orb3: "bg-pink-500/25 dark:bg-pink-500/12",
    },
  };

  const colors = variants[variant];

  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
      {/* Main gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full blur-3xl",
          colors.orb1
        )}
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full blur-3xl",
          colors.orb2
        )}
      />

      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full blur-3xl",
          colors.orb3
        )}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
}

export function AvatarGroup({
  children,
  className,
  max,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const maxAvatars = max || 3;
  const displayAvatars = childrenArray.slice(0, maxAvatars);
  const overflowAvatars = childrenArray.slice(maxAvatars);

  return (
    <div
      className={cn("flex -space-x-2 overflow-hidden", className)}
      {...props}
    >
      {displayAvatars}
      {overflowAvatars.length > 0 && (
        <Avatar className="h-6 w-6 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
          <span className="text-[10px]">+{overflowAvatars.length}</span>
        </Avatar>
      )}
    </div>
  );
}

import React from "react";
import nebulaLogo from "./download.jpeg";
import { cn } from "@/lib/utils";

interface NebulaLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
}

export const NebulaLogo: React.FC<NebulaLogoProps> = ({
  className,
  imgClassName,
  showText = true,
}) => {
  return (
    <div className={cn("inline-flex items-center gap-2 shrink-0", className)}>
      <img
        src={nebulaLogo}
        alt="nebula-logo"
        className={cn(
          "rounded-full aspect-square object-cover shrink-0 select-none",
          showText ? "w-8 h-8" : "w-7 h-7",
          imgClassName
        )}
      />
      {showText && (
        <span
          style={{ fontFamily: "Delius" }}
          className="inline-flex background-shine font-semibold bg-[length:250%_100%] bg-clip-text text-xl text-transparent select-none"
        >
          nebula
        </span>
      )}
    </div>
  );
};

export default NebulaLogo;

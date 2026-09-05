import React from "react";
import nebulaLogo from "./download.jpeg";

interface NebulaLogoProps {
  className?: string;
  showText?: boolean;
}

export const NebulaLogo: React.FC<NebulaLogoProps> = ({ className, showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <img
        src={nebulaLogo}
        alt="nebula-logo"
        className={`rounded-full w-10 h-10 ${showText ? "mr-[-11px]" : ""}`}
      />
      {showText && (
        <span
          style={{ fontFamily: "Delius" }}
          className="inline-flex background-shine font-semibold bg-[length:250%_100%] bg-clip-text text-xl text-transparent"
        >
          nebula
        </span>
      )}
    </div>
  );
};

export default NebulaLogo;

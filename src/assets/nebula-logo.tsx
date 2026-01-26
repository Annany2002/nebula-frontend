import React from "react";
import nebulaLogo from "./download.jpeg";

interface NebulaLogoProps {
  className?: string;
}

export const NebulaLogo: React.FC<NebulaLogoProps> = () => {
  return (
    <div className="flex items-center gap-2">
      <img
        src={nebulaLogo}
        alt="nebula-logo"
        className="rounded-full w-10 h-10 mr-[-11px]"
      />
      <span
        style={{ fontFamily: "Delius" }}
        className="inline-flex background-shine font-semibold bg-[length:250%_100%] bg-clip-text text-xl text-transparent"
      >
        nebula
      </span>
    </div>
  );
};

export default NebulaLogo;


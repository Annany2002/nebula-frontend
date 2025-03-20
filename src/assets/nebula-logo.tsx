import React from "react";
import nebulaLogo from "./download.jpeg";
import { Link } from "react-router-dom";

interface NebulaLogoProps {
  className?: string;
}

export const NebulaLogo: React.FC<NebulaLogoProps> = () => {
  return (
    <Link to={"/"}>
      <div className="flex items-center gap-2">
        <img
          src={nebulaLogo}
          alt="nebula-logo"
          className="rounded-full w-10 h-10 mr-[-11px]"
        />
        <span
          style={{ fontFamily: "Delius" }}
          // className="font-semibold text-xl bg-gradient-to-r bg-clip-text text-transparent dark:from-violet-600 dark:via-violet-400 dark:to-purple-400"
          className="inline-flex background-shine bg-[length:250%_100%] bg-clip-text text-xl text-transparent"
        >
          nebula
        </span>
      </div>
    </Link>
  );
};

export default NebulaLogo;

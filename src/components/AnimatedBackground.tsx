import React from "react";

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-white dark:bg-[#0c0a12] transition-colors duration-300" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-500/[0.06] dark:bg-purple-500/[0.08] blur-[180px] rounded-full" />
    </div>
  );
};

export default AnimatedBackground;

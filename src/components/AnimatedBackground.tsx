import React from "react";

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Base background: crisp white in light mode, deep obsidian black in dark mode */}
      <div className="absolute inset-0 bg-white dark:bg-[#09090b] transition-colors duration-300" />

      {/* Modern Purple Ambient Glow at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-purple-500/[0.10] dark:bg-purple-600/[0.22] blur-[140px] rounded-full pointer-events-none" />

      {/* Pure Modern Developer Grid Lines (No dots) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(147,51,234,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(147,51,234,0.08)_1px,transparent_1px)] bg-[size:44px_44px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
    </div>
  );
};

export default AnimatedBackground;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Copy, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

const codeExample = `import { NebulaClient } from "nebula-sdk-ts";

const nebula = new NebulaClient({
  baseURL: process.env.NEBULA_BASE_URL!,
  apiKey: process.env.NEBULA_API_KEY!,
});

const orders = await nebula.records.list(
  "ecommerce",
  "orders",
  { status: "completed" },
  { limit: 25, sort: "created_at", order: "desc" },
);`;

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("npm i nebula-sdk-ts");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 relative z-10">
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-950 dark:text-white leading-[1.08] text-balance"
        >
          The backend that runs on{" "}
          <span className="text-purple-600 dark:text-purple-400">a single file</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0, 1] }}
          className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto text-balance"
        >
          Nebula compiles into a ~28 MB Go binary that provisions isolated SQLite databases on disk.
          No Postgres. No Redis. No Docker. Just your data in standard .db files you own completely.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {isAuthenticated ? (
            <Link to={`/dashboard/${user?.userId}`}>
              <Button className="h-11 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-colors">
                Open Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/sign-up">
              <Button className="h-11 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-colors">
                Get started free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}

          <button
            type="button"
            onClick={handleCopyInstall}
            className="cursor-pointer group flex items-center gap-2.5 h-11 px-5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-white/20 transition-colors font-mono text-sm text-gray-700 dark:text-gray-300"
          >
            <Terminal className="h-4 w-4 text-gray-400" />
            <span>npm i nebula-sdk-ts</span>
            {copiedInstall ? (
              <Check className="h-3.5 w-3.5 text-purple-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
            )}
          </button>
        </motion.div>
      </div>

      {/* Code Block: the real hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0, 1] }}
        className="max-w-3xl mx-auto px-6 mt-16"
      >
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg shadow-black/[0.03] dark:shadow-black/20">
          {/* Title bar */}
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/10" />
              <span className="ml-3 text-[12px] text-gray-400 dark:text-gray-500 font-mono">
                app.ts
              </span>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
              TypeScript SDK
            </span>
          </div>

          {/* Code content */}
          <div className="p-5 bg-white dark:bg-[#0c0a12] overflow-x-auto">
            <pre className="font-mono text-[13px] leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Terminal, Code2, Cpu, CheckCircle2 } from "lucide-react";

interface CodeSnippet {
  id: string;
  name: string;
  lang: string;
  icon: typeof Code2;
  code: string;
  response: string;
}

const snippets: CodeSnippet[] = [
  {
    id: "ts",
    name: "TypeScript / React",
    lang: "typescript",
    icon: Code2,
    code: `// 1. Initialize Nebula Client
import { createNebulaClient } from "@nebula/client";

const nebula = createNebulaClient({
  endpoint: "https://api.nebula.dev",
  apiKey: process.env.NEBULA_API_KEY,
});

// 2. Query isolated SQLite records
const { data, error } = await nebula
  .database("ecommerce_prod")
  .from("orders")
  .select(["id", "customer_name", "total_usd", "status"])
  .where({ status: "completed" })
  .limit(10);

console.log("Orders retrieved:", data);`,
    response: `{
  "status": 200,
  "database": "ecommerce_prod.db",
  "table": "orders",
  "count": 3,
  "records": [
    { "id": "ord_81a", "customer_name": "Sarah Chen", "total_usd": 249.00, "status": "completed" },
    { "id": "ord_82b", "customer_name": "Marcus Vance", "total_usd": 89.50, "status": "completed" },
    { "id": "ord_83c", "customer_name": "Elena Rostova", "total_usd": 1240.00, "status": "completed" }
  ],
  "execution_ms": 0.84
}`,
  },
  {
    id: "curl",
    name: "cURL / REST API",
    lang: "bash",
    icon: Terminal,
    code: `# Create a record directly over high-speed REST
curl -X POST https://api.nebula.dev/api/v1/databases/analytics/tables/events/records \\
  -H "Authorization: ApiKey neb_live_9x8f2a10b4" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_name": "checkout_completed",
    "user_id": "usr_9921",
    "metadata": { "device": "mobile", "currency": "USD" }
  }'`,
    response: `{
  "success": true,
  "record_id": "rec_0918ef",
  "table": "events",
  "database": "analytics.db",
  "created_at": "2026-09-05T09:15:00Z",
  "persisted": true,
  "wal_checkpoint": "synced"
}`,
  },
  {
    id: "go",
    name: "Go Engine",
    lang: "go",
    icon: Cpu,
    code: `package main

import (
	"context"
	"fmt"
	"github.com/Annany2002/nebula-backend/internal/storage"
)

func main() {
	// Direct embedded engine or remote client
	db, err := storage.OpenUserDatabase("analytics.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	records, err := db.GetRecords(context.Background(), "events", 100, 0)
	fmt.Printf("Loaded %d events in < 1ms\\n", len(records))
}`,
    response: `{
  "engine": "Go 1.24 + Gin + SQLite3",
  "concurrency": "Goroutines (zero GIL)",
  "memory_resident": "28.4 MB",
  "bench_qps": "125,000 req/sec"
}`,
  },
];

const CodeDemo = () => {
  const [activeTab, setActiveTab] = useState<string>("ts");
  const [copied, setCopied] = useState<boolean>(false);

  const current = snippets.find((s) => s.id === activeTab) || snippets[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code-demo" className="py-24 relative z-10">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="glass-pill mb-4">
            <span className="mr-2">⚡</span> Developer-First Experience
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-5">
            Intuitive APIs.{" "}
            <span className="gradient-text">Zero Complexity.</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-zinc-300">
            Write clean code without fighting ORMs, managing connection pools, or
            configuring cloud VPCs. Use your favorite language or call the REST API
            directly.
          </p>
        </div>

        {/* Tab selector bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center p-1 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-purple-200/50 dark:border-white/10 backdrop-blur-md">
            {snippets.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === activeTab;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-gray-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.name}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/60 dark:bg-white/[0.04] border border-purple-200/60 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:border-purple-400 dark:hover:border-purple-500/40 backdrop-blur-md transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code + Response Dual Box */}
        <div className="grid lg:grid-cols-12 gap-4 rounded-2xl overflow-hidden border border-purple-200/60 dark:border-white/10 shadow-2xl bg-white/60 dark:bg-black/40 backdrop-blur-md text-gray-900 dark:text-zinc-100">
          {/* Left: Code Input */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-purple-100/60 dark:border-white/10 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-100/60 dark:border-white/10 text-xs text-gray-500 dark:text-zinc-400">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-gray-500 dark:text-zinc-400">
                    nebula-client.{current.lang === "go" ? "go" : current.lang === "bash" ? "sh" : "ts"}
                  </span>
                </div>
                <span className="text-purple-600 dark:text-purple-400 font-mono text-[11px]">SDK v2.4</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.pre
                  key={current.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-xs md:text-sm text-gray-800 dark:text-zinc-200 leading-relaxed overflow-x-auto whitespace-pre selection:bg-purple-500/30"
                >
                  <code>{current.code}</code>
                </motion.pre>
              </AnimatePresence>
            </div>

            <div className="pt-6 mt-6 border-t border-purple-100/60 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready for production
              </span>
              <span>Fully Type-Safe</span>
            </div>
          </div>

          {/* Right: Real-time Response Output */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-purple-50/30 dark:bg-black/30 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-100/60 dark:border-white/10 text-xs">
                <span className="font-mono text-[11px] text-gray-500 dark:text-zinc-400">HTTP Response</span>
                <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 font-mono text-[10px] font-semibold">
                  200 OK • 0.8ms
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.pre
                  key={current.id + "_resp"}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-xs text-purple-700 dark:text-purple-200/90 leading-relaxed overflow-x-auto whitespace-pre selection:bg-purple-500/30"
                >
                  <code>{current.response}</code>
                </motion.pre>
              </AnimatePresence>
            </div>

            <div className="pt-6 mt-6 border-t border-purple-100/60 dark:border-white/10 text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between font-mono">
              <span>SQLite Isolation: Active</span>
              <span className="text-purple-600 dark:text-purple-400">Edge Sync: Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeDemo;

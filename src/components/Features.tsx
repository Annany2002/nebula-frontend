import { motion } from "framer-motion";
import { HardDrive, KeyRound, Code2, Cpu, Layers } from "lucide-react";

const Features = () => {
  const benchmarks = [
    {
      label: "P99 Response Time",
      nebula: "1.2ms",
      traditional: "85ms",
      advantage: "70x Faster",
      percent: 92,
    },
    {
      label: "Memory Footprint",
      nebula: "32 MB",
      traditional: "450 MB",
      advantage: "92% Lighter",
      percent: 88,
    },
    {
      label: "Throughput (Req/Sec)",
      nebula: "125,000",
      traditional: "15,000",
      advantage: "8.3x Higher",
      percent: 94,
    },
  ];

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="glass-pill mb-4">
            <Layers className="h-3.5 w-3.5 mr-1.5" /> Architectural Highlights
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-5">
            Engineered for Speed, <span className="gradient-text">Isolation & Control</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-zinc-300">
            Built from first principles in Go and SQLite to eliminate the operational tax, noisy
            neighbors, and monthly bill shock of legacy cloud backends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Bento 1: Isolated SQLite (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="bento-card md:col-span-2 p-8 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                  <HardDrive className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Core Innovation
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                100% Isolated SQLite Per Database
              </h3>
              <p className="text-gray-600 dark:text-zinc-300 text-base max-w-xl leading-relaxed mb-6">
                Unlike traditional multi-tenant databases that cram hundreds of users into shared
                table spaces, Nebula stores each database as an independent, physical SQLite file.
                True isolation, zero lock contention, and instant file-level backups.
              </p>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-purple-50/20 dark:bg-white/[0.02] backdrop-blur-md border border-purple-100/60 dark:border-white/5 grid sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-white/60 dark:bg-black/40 backdrop-blur-md border border-purple-200/60 dark:border-white/10 shadow-xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-semibold">
                  <span>auth_user.db</span>
                  <span className="text-[10px] text-green-500">Active</span>
                </div>
                <span className="text-zinc-500 text-[11px]">Metadata & Users</span>
                <span className="text-[10px] text-zinc-400">WAL mode enabled</span>
              </div>

              <div className="p-3 rounded-lg bg-white/60 dark:bg-black/40 backdrop-blur-md border border-purple-200/60 dark:border-white/10 shadow-xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-semibold">
                  <span>shop_store.db</span>
                  <span className="text-[10px] text-green-500">Active</span>
                </div>
                <span className="text-zinc-500 text-[11px]">Tenant Database 1</span>
                <span className="text-[10px] text-zinc-400">Isolated 0.8ms P99</span>
              </div>

              <div className="p-3 rounded-lg bg-white/60 dark:bg-black/40 backdrop-blur-md border border-purple-200/60 dark:border-white/10 shadow-xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-semibold">
                  <span>telemetry.db</span>
                  <span className="text-[10px] text-green-500">Active</span>
                </div>
                <span className="text-zinc-500 text-[11px]">Tenant Database 2</span>
                <span className="text-[10px] text-zinc-400">Zero Lock Contention</span>
              </div>
            </div>
          </motion.div>

          {/* Bento 2: Dual-Tier Auth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="bento-card p-8 flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 w-fit mb-6">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Dual-Tier Authentication
              </h3>
              <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed mb-4">
                Secure JWT tokens for user account and dashboard sessions; scoped API keys for
                programmatic backend-to-backend operations.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/60 dark:bg-black/40 backdrop-blur-md border border-purple-100/60 dark:border-white/5 text-xs font-mono space-y-1.5">
              <div className="text-purple-600 dark:text-purple-300 flex items-center justify-between">
                <span>Bearer &lt;JWT&gt;</span>
                <span className="text-[10px] text-zinc-400">Account API</span>
              </div>
              <div className="text-indigo-600 dark:text-indigo-300 flex items-center justify-between">
                <span>ApiKey &lt;Token&gt;</span>
                <span className="text-[10px] text-zinc-400">Data Queries</span>
              </div>
            </div>
          </motion.div>

          {/* Bento 3: Auto-Generated REST APIs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="bento-card p-8 flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 w-fit mb-6">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Instant Auto REST APIs
              </h3>
              <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed mb-4">
                Create a table through the UI or API, and Nebula immediately mounts full CRUD
                endpoints with pagination and filter support.
              </p>
            </div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="font-bold">GET</span> /api/v1/:db/:table/records
              </div>
              <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <span className="font-bold">POST</span> /api/v1/:db/:table/records
              </div>
              <div className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="font-bold">PUT</span> /api/v1/:db/:table/records/:id
              </div>
            </div>
          </motion.div>

          {/* Bento 4: Go Concurrency Engine (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="bento-card md:col-span-2 p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Go 1.24 + Gin Performance
                    </h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                      Sub-millisecond route dispatch with native concurrency
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-zinc-300 text-sm max-w-xl leading-relaxed mb-6">
                Nebula compiles into a single lean binary. No Node.js garbage collection stalls, no
                Python GIL bottlenecks, and no JVM memory bloat.
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-purple-100 dark:border-white/5">
              {benchmarks.map((b, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-gray-800 dark:text-zinc-200">{b.label}</span>
                    <span className="text-green-600 dark:text-green-400 font-bold font-mono">
                      {b.nebula} vs {b.traditional} ({b.advantage})
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-purple-100 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${b.percent}%` }}
                      transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;

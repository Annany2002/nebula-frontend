import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Table as TableIcon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"schema" | "rest">("schema");

  return (
    <section className="pt-12 pb-20 md:pt-16 md:pb-28 relative z-10 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-500/15 dark:bg-purple-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-6 relative">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-14">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.1] mb-6"
          >
            The Backend Engine for{" "}
            <span className="inline-block bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-400 bg-clip-text text-transparent">
              High-Velocity Teams
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-zinc-300 max-w-2xl leading-relaxed mb-8"
          >
            Spin up isolated SQLite databases, auto-generate type-safe REST APIs, and authenticate
            users with dual-tier security. Single Go binary, zero cloud complexity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6"
          >
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to={`/dashboard/${user?.userId}`}>
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25 font-semibold text-base transition-all"
                  >
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/sign-in">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25 font-semibold text-base transition-all"
                  >
                    Start Building Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to="https://nebula-api-docs.vercel.app" target="_blank">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 rounded-xl border-purple-300/40 dark:border-white/10 text-gray-800 dark:text-zinc-200 bg-white/15 dark:bg-white/[0.03] hover:bg-purple-50/50 dark:hover:bg-white/[0.08] backdrop-blur-md font-semibold text-base"
                >
                  Explore Docs{" "}
                  <ExternalLink className="ml-2 h-4 w-4 text-gray-500 dark:text-zinc-400" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden border border-purple-300/40 dark:border-white/10 shadow-2xl bg-white/15 dark:bg-white/[0.03] backdrop-blur-md">
            <div className="p-3 bg-white/20 dark:bg-white/[0.02] border-b border-purple-200/30 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-xs text-gray-500 dark:text-zinc-400 ml-2">
                  nebula-workbench://prod-store
                </span>
              </div>

              <div className="flex items-center p-1 rounded-lg bg-purple-500/10 dark:bg-white/5 border border-purple-200/30 dark:border-white/10 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("schema")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                    activeTab === "schema"
                      ? "bg-purple-600 text-white shadow-xs font-semibold"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" /> Schema View
                </button>
                <button
                  onClick={() => setActiveTab("rest")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                    activeTab === "rest"
                      ? "bg-purple-600 text-white shadow-xs font-semibold"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" /> Auto REST
                </button>
              </div>
            </div>

            <div className="min-h-[300px] p-6 md:p-8 bg-transparent text-zinc-800 dark:text-zinc-100 font-mono text-xs md:text-sm">
              <AnimatePresence mode="wait">
                {activeTab === "schema" && (
                  <motion.div
                    key="schema"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 pb-2 border-b border-purple-100 dark:border-white/10">
                      <span>TABLE: users (SQLite file: data/users_prod.db)</span>
                      <span className="text-purple-600 dark:text-purple-400">
                        4 columns • 3 rows indexed
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="border-b border-purple-100 dark:border-white/10 text-gray-500 dark:text-zinc-400 text-xs">
                            <th className="py-2 px-3">id (TEXT PRIMARY KEY)</th>
                            <th className="py-2 px-3">email (VARCHAR UNIQUE)</th>
                            <th className="py-2 px-3">role (TEXT)</th>
                            <th className="py-2 px-3">created_at (TIMESTAMP)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100/50 dark:divide-white/5 text-gray-800 dark:text-zinc-300 text-xs">
                          <tr className="hover:bg-purple-500/10 transition-colors">
                            <td className="py-2.5 px-3 text-purple-600 dark:text-purple-300">
                              usr_902f
                            </td>
                            <td className="py-2.5 px-3 text-gray-800 dark:text-zinc-200">
                              alex.vance@nebula.sh
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/30 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
                                admin
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 dark:text-zinc-400">
                              2026-09-05 09:12:04
                            </td>
                          </tr>
                          <tr className="hover:bg-purple-500/10 transition-colors">
                            <td className="py-2.5 px-3 text-purple-600 dark:text-purple-300">
                              usr_903a
                            </td>
                            <td className="py-2.5 px-3 text-gray-800 dark:text-zinc-200">
                              elena.roche@studio.io
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/30 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
                                developer
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 dark:text-zinc-400">
                              2026-09-05 09:14:18
                            </td>
                          </tr>
                          <tr className="hover:bg-purple-500/10 transition-colors">
                            <td className="py-2.5 px-3 text-purple-600 dark:text-purple-300">
                              usr_904k
                            </td>
                            <td className="py-2.5 px-3 text-gray-800 dark:text-zinc-200">
                              marcus@enterprise.ai
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/30 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
                                member
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 dark:text-zinc-400">
                              2026-09-05 09:18:22
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-3 text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between">
                      <span>Indexes: idx_users_email (B-Tree)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Status: Read/Write Available
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "rest" && (
                  <motion.div
                    key="rest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400 pb-2 border-b border-purple-100 dark:border-white/10">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                        GET
                      </span>
                      <span className="text-gray-800 dark:text-zinc-200 font-mono">
                        /api/v1/databases/prod-store/tables/users/records?limit=3
                      </span>
                    </div>

                    <pre className="text-xs text-purple-700 dark:text-purple-200/90 leading-relaxed overflow-x-auto whitespace-pre">
                      {`// Instant REST response generated from SQLite
{
  "database": "prod-store",
  "table": "users",
  "records": [
    { "id": "usr_902f", "email": "alex.vance@nebula.sh", "role": "admin" },
    { "id": "usr_903a", "email": "elena.roche@studio.io", "role": "developer" },
    { "id": "usr_904k", "email": "marcus@enterprise.ai", "role": "member" }
  ],
  "pagination": { "limit": 3, "offset": 0, "total": 3 },
  "latency": "0.94ms"
}`}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

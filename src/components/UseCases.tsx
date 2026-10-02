import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const useCases = [
  {
    title: "SaaS multi-tenancy",
    description:
      "Give each customer their own .db file. No row-level security, no shared table contention. Back up a single tenant by copying one file.",
  },
  {
    title: "Self-hosted on a $5 VPS",
    description:
      "Run a single binary with ~32 MB RAM baseline. No Postgres, no Redis, no container orchestration. Ship production databases on hardware you control.",
  },
  {
    title: "Mobile and edge apps",
    description:
      "Standard REST endpoints that any HTTP client can call. No native database drivers needed for iOS, Android, Flutter, or React Native.",
  },
];

const comparisonRows = [
  {
    aspect: "Storage model",
    nebula: "Dedicated SQLite file per database",
    traditional: "Shared table space in a single cluster",
  },
  {
    aspect: "Deployment",
    nebula: "Single Go binary (~28 MB)",
    traditional: "API server, database, cache, pooler",
  },
  {
    aspect: "External dependencies",
    nebula: "None",
    traditional: "PostgreSQL, Redis, PgBouncer",
  },
  {
    aspect: "Data portability",
    nebula: "Standard SQLite 3.x file, readable anywhere",
    traditional: "Proprietary formats, cloud lock-in",
  },
  {
    aspect: "Schema changes",
    nebula: "Online ALTER TABLE via REST or UI",
    traditional: "Migration pipelines, maintenance windows",
  },
  {
    aspect: "Idle memory",
    nebula: "~32 MB",
    traditional: "300 MB to 1 GB",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] } },
};

const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
            Built for real deployments
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Whether you're running a multi-tenant SaaS or a weekend project on a cheap VPS, the
            architecture stays the same.
          </p>
        </div>

        {/* Use cases as inline text, not cards */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-10 mb-24"
        >
          {useCases.map((uc) => (
            <div key={uc.title}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{uc.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {uc.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Comparison table */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Architecture comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-white/10">
                  <th className="py-3 pr-6 font-medium text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider">
                    Aspect
                  </th>
                  <th className="py-3 px-6 font-medium text-purple-600 dark:text-purple-400 text-xs uppercase tracking-wider">
                    Nebula
                  </th>
                  <th className="py-3 pl-6 font-medium text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider">
                    Traditional stack
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {comparisonRows.map((row) => (
                  <tr key={row.aspect}>
                    <td className="py-3.5 pr-6 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {row.aspect}
                    </td>
                    <td className="py-3.5 px-6 text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        {row.nebula}
                      </span>
                    </td>
                    <td className="py-3.5 pl-6 text-gray-400 dark:text-gray-500">
                      {row.traditional}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCases;

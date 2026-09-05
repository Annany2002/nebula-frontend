import { motion } from "framer-motion";
import {
  Rocket,
  Code2,
  Smartphone,
  Server,
  CheckCircle,
  XCircle,
  Sparkles,
  Users,
} from "lucide-react";

interface PersonaCard {
  icon: typeof Rocket;
  title: string;
  role: string;
  description: string;
  highlight: string;
}

const personas: PersonaCard[] = [
  {
    icon: Rocket,
    title: "SaaS Startups & MVPs",
    role: "Ship in Days, Not Months",
    description:
      "Eliminate weeks spent provisioning Postgres clusters, writing boilerplate ORM queries, and configuring auth flows. Ship your MVP before competitors finish their sprint planning.",
    highlight: "Zero devops required to go live",
  },
  {
    icon: Code2,
    title: "Indie Hackers & Solo Devs",
    role: "Zero Maintenance, Zero Bill Shock",
    description:
      "Avoid paying $50/mo minimum cloud database fees for your side projects. Run multiple production databases on a $5 VPS or self-host with standard SQLite portability.",
    highlight: "100% portable .db files",
  },
  {
    icon: Smartphone,
    title: "Mobile & Edge Apps",
    role: "Low-Latency Data Sync",
    description:
      "Clean, consistent REST APIs make connecting iOS, Android, Flutter, and React Native apps straightforward. Sub-millisecond reads keep your UI snappy.",
    highlight: "Sub-millisecond API response",
  },
  {
    icon: Server,
    title: "Internal Tools & Portals",
    role: "Instant Data Store",
    description:
      "Quickly spin up structured data backends for internal dashboards, telemetry collectors, or team tooling without asking your infrastructure team for database access.",
    highlight: "Visual schema & table editor",
  },
];

const comparisonRows = [
  {
    feature: "Storage Architecture",
    nebula: "Isolated SQLite per DB (Zero Contention)",
    traditional: "Shared Multi-Tenant Cluster",
  },
  {
    feature: "P99 API Latency",
    nebula: "< 1.5 ms (Local Engine)",
    traditional: "45 - 120 ms (Network Hops)",
  },
  {
    feature: "Data Portability",
    nebula: "100% Standard .db file download",
    traditional: "Complex dump & restore tools",
  },
  {
    feature: "Self-Hosting",
    nebula: "Single Go binary / Docker Compose",
    traditional: "15+ containers & microservices",
  },
  {
    feature: "Auth Built-In",
    nebula: "Dual JWT + Scoped API Keys",
    traditional: "Often extra add-on / 3rd party",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 relative z-10">
      <div className="container max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="glass-pill mb-4">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Built For High-Velocity Builders
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-5">
            Designed for Real-World <span className="gradient-text">Product Velocity</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-zinc-300">
            Whether you are testing an idea over the weekend or scaling an active product, Nebula
            cuts out backend friction so you can focus on user experience.
          </p>
        </div>

        {/* 4 Persona Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {personas.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bento-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/40 dark:border-purple-500/20 text-purple-600 dark:text-purple-300 w-fit mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {p.title}
                  </h3>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3">
                    {p.role}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-purple-200/30 dark:border-white/10 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{p.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Matrix Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-purple-300/40 dark:border-white/10 bg-white/15 dark:bg-white/[0.03] backdrop-blur-md overflow-hidden shadow-xl"
        >
          <div className="p-6 md:p-8 border-b border-purple-200/30 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Nebula vs. Traditional Cloud Backends
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                How our isolated Go + SQLite architecture compares to legacy multi-tenant platforms.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-200/40 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold w-fit">
              Architecture Matrix
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-purple-200/30 dark:border-white/10 text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-400 bg-purple-500/5 dark:bg-white/[0.02]">
                  <th className="py-4 px-6 font-semibold">Capability</th>
                  <th className="py-4 px-6 font-semibold text-purple-600 dark:text-purple-400">
                    Nebula BaaS
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-500 dark:text-zinc-400">
                    Traditional Heavyweight Stack
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-200/30 dark:divide-white/10">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-purple-500/5 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{row.nebula}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-zinc-400">
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

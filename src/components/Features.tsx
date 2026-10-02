import { motion } from "framer-motion";

const features = [
  {
    heading: "One file per database",
    body: "Each project gets its own physical .db file on disk. No shared table spaces, no noisy neighbors, no row-level security hacks. One tenant crashes or locks? The rest don't notice.",
    code: `data/
├── usr_4a91/
│   ├── ecommerce.db      ← 4.8 MB, WAL mode
│   └── analytics.db      ← 12.1 MB, WAL mode
├── usr_7f03/
│   └── crm.db            ← 3.2 MB, WAL mode
└── metadata.db            ← Platform state`,
    codeLabel: "ls data/",
  },
  {
    heading: "Zero network hops to storage",
    body: "Go embeds SQLite through CGO. No TCP handshake, no connection pooler, no socket serialization. The database runs inside the same process as your API server.",
    code: `// Inside nebula-backend: no network layer between API and storage
db, err := storage.ConnectUserDB(ctx, "data/usr_4a91/ecommerce.db")
if err != nil { return err }
defer db.Close()

rows, err := db.QueryContext(ctx, "SELECT * FROM orders LIMIT ?", 25)
if err != nil { return err }
defer rows.Close()`,
    codeLabel: "internal/storage/user_database_storage.go",
  },
  {
    heading: "Deploy a single binary",
    body: "No Postgres cluster. No Redis cache. No Docker daemon. No PgBouncer. The entire backend is a single ~28 MB Go binary that starts in under a second and idles at ~32 MB RAM.",
    code: `$ scp nebula-backend user@vps:~/
$ ssh user@vps

$ ./nebula-backend
  Server listening on :8085
  Storage driver: mattn/go-sqlite3 (CGO)
  Memory baseline: 32 MB
  External dependencies: 0`,
    codeLabel: "terminal",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] } },
};

const Features = () => {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
            How it works
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Nebula replaces the traditional API + database + cache stack with a single process that
            reads and writes directly to SQLite files on your filesystem.
          </p>
        </div>

        <div className="space-y-28">
          {features.map((feature, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <motion.div
                key={feature.heading}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-start ${
                  isReversed ? "lg:direction-rtl" : ""
                }`}
                style={isReversed ? { direction: "rtl" } : undefined}
              >
                {/* Text */}
                <div style={{ direction: "ltr" }}>
                  <span className="text-sm font-mono text-purple-600 dark:text-purple-400">
                    0{idx + 1}
                  </span>
                  <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white tracking-tight">
                    {feature.heading}
                  </h3>
                  <p className="mt-4 text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                    {feature.body}
                  </p>
                </div>

                {/* Code */}
                <div
                  className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10"
                  style={{ direction: "ltr" }}
                >
                  <div className="px-4 py-2 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10">
                    <span className="text-[12px] font-mono text-gray-400 dark:text-gray-500">
                      {feature.codeLabel}
                    </span>
                  </div>
                  <div className="p-5 bg-white dark:bg-[#0c0a12] overflow-x-auto">
                    <pre className="font-mono text-[13px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre">
                      <code>{feature.code}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

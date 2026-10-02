import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does isolated SQLite work?",
    answer:
      "Every database you create is an independent .db file at data/<user_id>/<db_name>.db. They never share memory pools or table spaces. A lock or crash in one database has zero impact on any other.",
  },
  {
    question: "Can I export my raw database files?",
    answer:
      "Yes. They're standard SQLite 3 files. Download them, open them in TablePlus, DBeaver, or DB Browser, back them up with cp, or replicate them to any storage you control.",
  },
  {
    question: "How does authentication work?",
    answer:
      "Dual-layer. JWT Bearer tokens for user registration, profile management, and database provisioning. Database-scoped API keys (Authorization: ApiKey <key>) for data-plane operations like querying and inserting records.",
  },
  {
    question: "Can I self-host on my own server?",
    answer:
      "Yes. Nebula is MIT-licensed and written in Go. Run the ~28 MB binary directly, or use Docker Compose. Zero external service dependencies.",
  },
  {
    question: "Why SQLite instead of Postgres?",
    answer:
      "Embedding SQLite via CGO eliminates the network serialization and connection pool overhead of TCP-based database servers. Storage operations hit local filesystem memory-mapped pages directly. No daemon to manage, no connection limits to tune.",
  },
  {
    question: "Are there schema limits?",
    answer:
      "No artificial constraints. Create tables, define columns with types, set unique indexes, and alter schemas on the fly through the REST API or the visual Studio UI.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: Sticky heading */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Architecture, self-hosting, and data ownership.
            </p>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-8 divide-y divide-gray-200 dark:divide-white/10">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="py-5 first:pt-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full text-left flex items-start justify-between gap-4 group"
                  >
                    <span
                      className={`text-base font-medium transition-colors ${
                        isOpen
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span className="shrink-0 mt-1 text-gray-400">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed pr-8">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

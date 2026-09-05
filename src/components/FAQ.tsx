import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does isolated SQLite work in Nebula?",
    answer:
      "Every user database created in Nebula is an isolated, physical SQLite file stored on disk. This means your databases never contend for shared memory pools or tables. You get zero noisy-neighbor issues, instant point-in-time snapshots, and microsecond query latency.",
  },
  {
    question: "Can I export or download my raw SQLite database files?",
    answer:
      "Yes, completely! Because databases are standard SQLite files, you have 100% data ownership with zero vendor lock-in. You can download the `.db` files, open them in SQLite tools (like TablePlus or DB Browser), or replicate them to any cloud storage.",
  },
  {
    question: "How does authentication work between JWT and API Keys?",
    answer:
      "Nebula utilizes dual-layer authentication. User registration, profile updates, and database provisioning use secure JWT Bearer tokens. Data-plane operations (creating tables, querying and inserting records) use database-scoped API keys (`Authorization: ApiKey <key>`) for high-throughput programmatic access.",
  },
  {
    question: "Can I self-host Nebula on my own hardware or cloud VPS?",
    answer:
      "Yes. Nebula is open-source (MIT licensed) and written in Go. You can run the pre-compiled binary with zero external dependencies, or spin it up alongside the frontend using Docker Compose in seconds.",
  },
  {
    question: "How fast is Nebula compared to PostgreSQL or Supabase?",
    answer:
      "Because Nebula writes directly to dedicated local SQLite engines via Go's native CGO/cgo-free driver, there is zero network overhead between the API layer and the database process. Benchmark tests routinely achieve sub-1.5ms P99 responses with over 120,000 requests per second on standard hardware.",
  },
  {
    question: "Is there a limit on how many tables or columns I can create?",
    answer:
      "There are no artificial schema constraints. You can dynamically define tables, specify column data types, set unique indexes, and alter schemas on the fly using either the visual dashboard or the REST API.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative z-10">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="glass-pill mb-4">
            <HelpCircle className="h-3.5 w-3.5 mr-1.5" /> Frequently Asked Questions
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to know
          </h2>
          <p className="text-gray-600 dark:text-zinc-300">
            Got questions about architecture, self-hosting, or performance? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                viewport={{ once: true }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white/25 dark:bg-purple-950/20 border-purple-300 dark:border-purple-600/60 shadow-lg shadow-purple-500/5"
                    : "bg-white/15 dark:bg-white/[0.03] border-purple-200/40 dark:border-white/[0.06] hover:border-purple-300 dark:hover:border-white/10"
                } backdrop-blur-md`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 p-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/30 dark:border-purple-500/20 text-purple-600 dark:text-purple-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm md:text-base text-gray-600 dark:text-zinc-300 leading-relaxed border-t border-purple-100/30 dark:border-white/[0.04]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

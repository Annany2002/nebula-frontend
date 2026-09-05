import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BottomCTA = () => {
  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="container max-w-5xl mx-auto px-6 relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-purple-600/20 dark:bg-purple-600/30 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-10 md:p-16 border border-purple-200/60 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-md shadow-2xl text-center flex flex-col items-center"
        >
          <div className="glass-pill mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Start in 60 Seconds
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight mb-5 max-w-2xl leading-tight">
            Ready to Build With Pure <span className="gradient-text">Speed & Isolation?</span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 dark:text-zinc-300 max-w-xl mb-8 leading-relaxed">
            Eliminate complex backend devops, connection pool exhaustion, and cloud bill shock. Run
            production-grade SQLite backends powered by Go.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/sign-up">
              <Button
                size="lg"
                className="h-12 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base shadow-xl shadow-purple-500/25"
              >
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link to="https://github.com/Annany2002/nebula-backend" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 rounded-xl border-purple-200 dark:border-white/10 text-gray-800 dark:text-zinc-200 bg-white/50 dark:bg-white/[0.03] hover:bg-purple-50 dark:hover:bg-white/[0.08]"
              >
                Star on GitHub ★
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BottomCTA;

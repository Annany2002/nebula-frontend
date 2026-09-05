import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Hobbyist",
      badge: "Free Forever",
      description: "Ideal for prototyping, personal projects, and learning.",
      price: "0",
      period: "/month",
      cta: "Get Started Free",
      ctaLink: "/sign-up",
      highlighted: false,
      features: [
        "Up to 5 isolated SQLite databases",
        "10,000 API requests/day",
        "500 MB storage per database",
        "Full REST API auto-generation",
        "Dual JWT & API key security",
        "Community Discord support",
      ],
    },
    {
      name: "Pro Developer",
      badge: "Most Popular",
      description: "For active SaaS startups, production apps, and scaling teams.",
      price: isAnnual ? "29" : "39",
      period: "/month",
      cta: "Start 14-Day Pro Trial",
      ctaLink: "/sign-up",
      highlighted: true,
      features: [
        "Unlimited isolated SQLite databases",
        "500,000 API requests/day",
        "15 GB high-speed NVMe storage",
        "Automated continuous WAL backups",
        "Sub-1.2ms P99 priority routing",
        "Custom domain mapping",
        "Priority GitHub & email support",
      ],
    },
    {
      name: "Team & Enterprise",
      badge: "Custom Scale",
      description: "Dedicated infrastructure, custom SLAs, and on-premise support.",
      price: "Custom",
      period: "",
      cta: "Contact Architecture Team",
      ctaLink: "mailto:support@nebula.dev",
      highlighted: false,
      features: [
        "Unlimited API throughput & databases",
        "Dedicated Go Gin instances",
        "Custom volume storage & replication",
        "99.99% uptime SLA guarantee",
        "SOC 2 compliance documentation",
        "Dedicated Slack channel with core engineers",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 relative z-10">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="glass-pill mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-5">
            Simple, Honest, <span className="gradient-text">Predictable</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-zinc-300">
            Start building without a credit card. Upgrade only when your product needs dedicated
            production resources.
          </p>

          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-purple-200/50 dark:border-white/10 backdrop-blur-md">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                !isAnnual
                  ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xs"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                isAnnual
                  ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xs"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-8 items-stretch mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={plan.highlighted ? { y: -8, scale: 1.015 } : { y: -4 }}
              className={`rounded-2xl flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlighted
                  ? "bg-white/75 dark:bg-purple-950/20 backdrop-blur-md border-2 border-purple-500 shadow-2xl shadow-purple-500/15 dark:shadow-purple-900/20"
                  : "bento-card"
              } p-8`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  {!plan.highlighted && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-zinc-300 min-h-[40px] mb-6">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-purple-100 dark:border-white/10">
                  {plan.price === "Custom" ? (
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-gray-600 dark:text-zinc-400">$</span>
                      <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
                        {plan.period}
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link to={plan.ctaLink} className="w-full block">
                  <Button
                    size="lg"
                    className={`w-full font-semibold rounded-xl transition-all h-12 ${
                      plan.highlighted
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25"
                        : "bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white border border-purple-200/50 dark:border-white/10"
                    }`}
                  >
                    {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 md:p-8 rounded-2xl bg-purple-50/60 dark:bg-white/[0.02] border border-purple-100/80 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Zero Lock-In Guarantee
              </h4>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                You can export your raw `.db` SQLite files at any time with one click. Your data is
                always yours.
              </p>
            </div>
          </div>
          <Link to="https://github.com/Annany2002/nebula-backend" target="_blank">
            <Button variant="outline" className="rounded-xl border-purple-200 dark:border-white/10">
              View Open Source Code
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

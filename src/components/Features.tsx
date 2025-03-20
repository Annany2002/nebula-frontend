import { useIntersectionObserver } from "@/lib/animations";
import {
  Database,
  Shield,
  Zap,
  Globe,
  Code,
  Repeat,
  BarChart,
  Upload,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Features = () => {
  const titleRef = useIntersectionObserver();
  const descRef = useIntersectionObserver();

  const featureItems = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Managed Databases",
      description:
        "SQL and NoSQL databases with automatic scaling, backups, and high availability.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Authentication",
      description:
        "Secure user authentication with OAuth, JWT, and role-based access control.",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "API Generation",
      description:
        "Auto-generate RESTful and GraphQL APIs from your data models with zero code.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Edge Deployment",
      description:
        "Deploy your backend to global edge locations for low-latency worldwide access.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Serverless Functions",
      description:
        "Write custom business logic in Go that scales automatically with your needs.",
    },
    {
      icon: <Repeat className="h-6 w-6" />,
      title: "Real-time Updates",
      description:
        "Built-in WebSocket support and subscriptions for live data updates and sync.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Performance Analytics",
      description:
        "Monitor and optimize your application with real-time analytics and insights.",
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: "File Storage",
      description:
        "Efficient cloud file storage with CDN distribution and access controls.",
    },
  ];

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="container max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100/50 backdrop-blur-sm text-purple-700 text-sm font-medium dark:bg-purple-900/40 dark:text-purple-300 mb-4"
          >
            <span className="mr-2">⚡</span>
            Powerful Features
          </motion.div>

          <motion.h2
            ref={titleRef as React.RefObject<HTMLHeadingElement>}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-300 dark:to-purple-500 animate-gradient-flow"
          >
            Everything you need to build modern backends
          </motion.h2>

          <motion.p
            ref={descRef as React.RefObject<HTMLParagraphElement>}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg dark:text-gray-300 animate-fade-in"
          >
            Nebula provides all the tools and services you need to build
            scalable, secure, and high-performance backend applications.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureItems.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass p-6 rounded-xl border border-purple-100/20 dark:border-purple-900/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity dark:from-purple-900/20 dark:to-purple-800/5"></div>

              <div className="h-12 w-12 rounded-lg bg-purple-100/70 backdrop-blur-sm flex items-center justify-center mb-5 relative z-10 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                {feature.icon}
              </div>

              <h3
                className="text-xl font-semibold text-gray-800 mb-3 relative z-10 dark:text-white animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {feature.title}
              </h3>

              <p
                className="text-gray-600 relative z-10 dark:text-gray-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 glass rounded-xl overflow-hidden border border-purple-100/20 dark:border-purple-900/30 shadow-xl"
        >
          <div className="grid md:grid-cols-5 gap-0">
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white animate-fade-in">
                Optimized for Performance
              </h3>

              <p
                className="text-gray-600 mb-8 dark:text-gray-300 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Powered by Go's lightning-fast performance and concurrency
                model, Nebula delivers unmatched speed for your backend
                services.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "10x faster response times",
                  "80% less memory usage",
                  "Scale to millions of users",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center animate-slide-in-left"
                    style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
                  >
                    <span className="h-6 w-6 rounded-full bg-green-100/70 backdrop-blur-sm flex items-center justify-center mr-3 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="text-gray-700 dark:text-gray-200">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white self-start animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                See Benchmarks <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="md:col-span-3 bg-gradient-to-br from-purple-600/90 to-purple-800/90 backdrop-blur-sm p-8 md:p-10 dark:from-purple-800/90 dark:to-purple-900/90">
              <div className="text-white mb-6">
                <h4 className="text-xl font-semibold mb-2 animate-fade-in">
                  Performance Comparison
                </h4>
                <p
                  className="text-purple-100 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  Nebula vs. Traditional Backend Frameworks
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    label: "Response Time",
                    nebula: "23ms",
                    others: "230ms",
                    percent: 90,
                  },
                  {
                    label: "Requests/Second",
                    nebula: "125,000",
                    others: "15,000",
                    percent: 85,
                  },
                  {
                    label: "Memory Usage",
                    nebula: "32MB",
                    others: "250MB",
                    percent: 80,
                  },
                ].map((metric, i) => (
                  <div
                    key={i}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.15 + 0.2}s` }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white font-medium">
                        {metric.label}
                      </span>
                      <div className="flex space-x-4">
                        <span className="text-green-300">
                          Nebula: {metric.nebula}
                        </span>
                        <span className="text-purple-200">
                          Others: {metric.others}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-purple-400/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.percent}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        viewport={{ once: true }}
                        className="h-2 bg-gradient-to-r from-green-400 to-green-300 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div
                    className="text-white animate-fade-in"
                    style={{ animationDelay: "0.7s" }}
                  >
                    <div className="font-semibold">
                      Go-powered Infrastructure
                    </div>
                    <div className="text-sm text-purple-200">
                      Built for speed and reliability
                    </div>
                  </div>
                  <div
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white animate-fade-in"
                    style={{ animationDelay: "0.8s" }}
                  >
                    <div className="text-xs">Real-world testing</div>
                    <div className="font-mono text-lg">10,000+ req/sec</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

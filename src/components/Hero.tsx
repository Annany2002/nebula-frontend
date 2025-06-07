import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronRight,
  Server,
  Database,
  Shield,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

// Define proper type for terminal lines
interface TerminalLine {
  text: string;
  prefix: string;
  className?: string;
  delay: number;
}

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [terminalText, setTerminalText] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [typedText, setTypedText] = useState("");

  const terminalLines: TerminalLine[] = [
    { text: "nebula init my-project", prefix: "$", delay: 0 },
    {
      text: "Initializing Nebula project",
      prefix: "✓",
      className: "text-green-400",
      delay: 1000,
    },
    {
      text: "Creating API endpoints",
      prefix: "✓",
      className: "text-green-400",
      delay: 500,
    },
    {
      text: "Setting up database",
      prefix: "✓",
      className: "text-green-400",
      delay: 500,
    },
    {
      text: "Configuring authentication",
      prefix: "✓",
      className: "text-green-400",
      delay: 500,
    },
    { text: "nebula deploy", prefix: "$", delay: 1000 },
    {
      text: "Building backend services",
      prefix: "✓",
      className: "text-green-400",
      delay: 500,
    },
    {
      text: "Optimizing for production",
      prefix: "✓",
      className: "text-green-400",
      delay: 500,
    },
    {
      text: "Deploying to edge network",
      prefix: "✓",
      className: "text-green-400",
      delay: 500,
    },
    {
      text: "🚀 Deployed successfully!",
      prefix: "",
      className: "text-gray-300",
      delay: 800,
    },
    {
      text: "API endpoint: https://api.nebula.app/my-project",
      prefix: "",
      className: "text-purple-400",
      delay: 500,
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Start typing animation
    if (currentLineIndex < terminalLines.length) {
      const timer = setTimeout(() => {
        setTerminalText((prev) => [...prev, terminalLines[currentLineIndex]]);
        setTypedText("");
        setIsTyping(true);
      }, terminalLines[currentLineIndex].delay);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex]);

  useEffect(() => {
    if (isTyping && currentLineIndex < terminalLines.length) {
      const currentLine = terminalLines[currentLineIndex].text;
      if (typedText.length < currentLine.length) {
        const timer = setTimeout(() => {
          setTypedText(currentLine.substring(0, typedText.length + 1));
        }, 30); // Typing speed
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        setCurrentLineIndex((prev) => prev + 1);
      }
    }
  }, [typedText, isTyping, currentLineIndex]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="pt-28 pb-16 relative z-10">
      <div className="container max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
          variants={container}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left column - Text content */}
          <div className="space-y-6">
            <motion.div
              variants={item}
              className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100/50 backdrop-blur-sm text-purple-700 text-sm font-medium dark:bg-purple-900/40 dark:text-purple-300"
            >
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              Powered by Go
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance animate-gradient-flow"
            >
              <span className="inline-flex animate-text-gradient">
                Backend as a Service
              </span>
              <br />
              for the Modern Web
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg text-gray-600 max-w-xl dark:text-gray-300 animate-fade-in"
            >
              Deploy scalable, secure and high-performance backend services with
              a streamlined developer experience. Built for modern teams.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md shadow-purple-200 dark:shadow-purple-900/20 animate-slide-in-left"
              >
                {isAuthenticated ? (
                  <Link
                    className="flex items-center w-fit"
                    to={`/dashboard/${user?.userId}`}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link to={"/sign-in"} className="flex gap-1 items-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300
                dark:bg-transparent dark:hover:bg-purple-900/20 backdrop-blur-sm bg-white/10 animate-slide-in-right"
              >
                <Link
                  className="flex items-center"
                  to="https://nebula-api-docs.vercel.app/"
                  target="_blank"
                >
                  View Docs <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* New section to replace the "Ready to Transform Your Backend" */}
            <motion.div
              variants={item}
              className="pt-8 mt-6 border-t border-purple-100/50 dark:border-purple-800/30"
            >
              <div className="backdrop-blur-lg bg-white/5 dark:bg-purple-900/10 rounded-xl overflow-hidden shadow-lg border border-purple-100/30 dark:border-purple-800/20">
                <div className="p-5 bg-gradient-to-br from-purple-50/70 to-transparent dark:from-purple-900/20 dark:to-transparent">
                  <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-300 dark:to-indigo-300">
                    Transform Your Backend Infrastructure
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-5 text-sm">
                    A complete solution for modern applications with
                    enterprise-grade features
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        icon: <Server className="h-5 w-5" />,
                        text: "Serverless",
                        description: "Auto-scaling",
                      },
                      {
                        icon: <Database className="h-5 w-5" />,
                        text: "Scalable",
                        description: "Global deployment",
                      },
                      {
                        icon: <Shield className="h-5 w-5" />,
                        text: "Secure",
                        description: "SOC 2 compliant",
                      },
                    ].map((item, i) => (
                      <div key={i} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-indigo-200/30 dark:from-purple-700/30 dark:to-indigo-700/20 rounded-lg transform transition-all duration-300 group-hover:scale-90 opacity-0 group-hover:opacity-100"></div>
                        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 transform transition-all duration-300 group-hover:translate-y-[-5px] relative z-10">
                          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-lg inline-flex mb-2 text-white">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {item.text}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Terminal & Features */}
          <div className="lg:pl-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative"
            >
              {/* Terminal Window - Updated with a more modern design */}
              <div className="relative overflow-hidden rounded-xl shadow-2xl border border-gray-700/50">
                {/* Blurred glow effects behind terminal */}
                <div className="absolute w-40 h-40 rounded-full bg-purple-500/20 blur-2xl -top-10 -left-10"></div>
                <div className="absolute w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl -bottom-10 -right-10"></div>

                {/* Terminal header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-sm p-3 flex items-center border-b border-gray-700/50">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center mx-auto pr-6">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-xs text-white px-2 py-1 rounded-sm mr-2">
                      NEBULA
                    </div>
                    <div className="text-gray-400 text-xs">
                      Command Line Interface
                    </div>
                  </div>
                </div>

                {/* Terminal content */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 font-mono text-sm text-gray-300 space-y-3 h-80 overflow-hidden">
                  {/* Terminal content with line numbers */}
                  <div className="flex">
                    <div className="text-gray-600 w-5 text-right mr-3">1</div>
                    <div className="flex-1">
                      <span className="text-purple-400">$</span>
                      <span className="ml-2 text-white font-medium">
                        nebula --version
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="text-gray-600 w-5 text-right mr-3">2</div>
                    <div className="flex-1">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                        Nebula CLI v1.2.0
                      </span>
                    </div>
                  </div>

                  {/* Dynamic terminal content */}
                  {terminalText.map((line, idx) => (
                    <div key={idx} className="flex">
                      <div className="text-gray-600 w-5 text-right mr-3">
                        {idx + 3}
                      </div>
                      <div className={`flex-1 ${line.className || ""}`}>
                        {line.prefix && (
                          <span
                            className={
                              line.prefix === "$" ? "text-purple-400" : ""
                            }
                          >
                            {line.prefix}
                          </span>
                        )}
                        <span className="ml-2">
                          {idx === terminalText.length - 1
                            ? typedText
                            : line.text}
                        </span>
                      </div>
                    </div>
                  ))}

                  {currentLineIndex === terminalLines.length && (
                    <div className="flex">
                      <div className="text-gray-600 w-5 text-right mr-3">
                        {terminalLines.length + 3}
                      </div>
                      <div className="flex-1">
                        <span className="text-purple-400">$</span>
                        <span className="ml-2 relative">
                          <span className="absolute top-0 left-0 animate-blink">
                            |
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Code syntax highlights */}
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    Syntax: TypeScript | Go
                  </div>
                </div>
              </div>

              {/* Feature callouts */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute -top-6 -right-6 backdrop-blur-xl bg-white/10 dark:bg-gray-900/40 px-3 py-2 rounded-lg shadow-xl border border-white/20 dark:border-gray-700/30 animate-float"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1 rounded text-white">
                    <Server className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    99.9% Uptime SLA
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 backdrop-blur-xl bg-white/10 dark:bg-gray-900/40 px-3 py-2 rounded-lg shadow-xl border border-white/20 dark:border-gray-700/30 animate-float"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-1 rounded text-white">
                    <Database className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Managed Storage
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="absolute bottom-1/4 -right-8 backdrop-blur-xl bg-white/10 dark:bg-gray-900/40 px-3 py-2 rounded-lg shadow-xl border border-white/20 dark:border-gray-700/30 animate-float"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1 rounded text-white">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Enterprise Security
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Play } from "lucide-react";

const snippets = [
  {
    id: "ts",
    label: "TypeScript",
    filename: "app.ts",
    code: `import { NebulaClient } from "nebula-sdk-ts";

const client = new NebulaClient({
  baseURL: process.env.NEBULA_BASE_URL!,
  apiKey: process.env.NEBULA_API_KEY!,
});

const records = await client.records.list(
  "ecommerce_prod",
  "orders",
  { status: "completed" },
  { limit: 10, sort: "created_at", order: "desc" },
);

console.log("Orders:", records);`,
    response: `{
  "records": [
    { "id": "ord_81a", "customer": "Sarah Chen", "total": 249.00 },
    { "id": "ord_82b", "customer": "Marcus Vance", "total": 89.50 },
    { "id": "ord_83c", "customer": "Elena Rostova", "total": 1240.00 }
  ],
  "pagination": { "total": 3, "limit": 10, "offset": 0 }
}`,
  },
  {
    id: "curl",
    label: "cURL",
    filename: "terminal",
    code: `curl -X GET \\
  "$NEBULA_BASE_URL/api/v1/databases/prod/tables/users/records?limit=3" \\
  -H "Authorization: ApiKey $NEBULA_API_KEY" \\
  -H "Content-Type: application/json"`,
    response: `{
  "records": [
    { "id": "usr_902f", "email": "alex@nebula.sh", "role": "admin" },
    { "id": "usr_903a", "email": "elena@studio.io", "role": "developer" },
    { "id": "usr_904k", "email": "marcus@enterprise.ai", "role": "member" }
  ],
  "pagination": { "total": 3, "limit": 3, "offset": 0 }
}`,
  },
  {
    id: "go",
    label: "Go",
    filename: "main.go",
    code: `package main

import (
  "fmt"
  "io"
  "net/http"
  "os"
  "time"
)

func main() {
  req, err := http.NewRequest("GET",
    os.Getenv("NEBULA_BASE_URL") +
      "/api/v1/databases/prod/tables/users/records?limit=3",
    nil,
  )
  if err != nil { panic(err) }
  req.Header.Set("Authorization", "ApiKey " + os.Getenv("NEBULA_API_KEY"))

  client := &http.Client{Timeout: 15 * time.Second}
  res, err := client.Do(req)
  if err != nil { panic(err) }
  defer res.Body.Close()
  if res.StatusCode != http.StatusOK { panic(res.Status) }

  body, err := io.ReadAll(res.Body)
  if err != nil { panic(err) }
  fmt.Println(string(body))
}`,
    response: `{
  "records": [
    { "id": "usr_902f", "email": "alex@nebula.sh", "role": "admin" },
    { "id": "usr_903a", "email": "elena@studio.io", "role": "developer" },
    { "id": "usr_904k", "email": "marcus@enterprise.ai", "role": "member" }
  ],
  "pagination": { "total": 3, "limit": 3, "offset": 0 }
}`,
  },
];

const CodeDemo = () => {
  const [activeTab, setActiveTab] = useState("ts");
  const [copied, setCopied] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const current = snippets.find((s) => s.id === activeTab) || snippets[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setShowResponse(true);
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setShowResponse(false);
  };

  return (
    <section id="code-demo" className="py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
            Ship in minutes, not months
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Use the TypeScript SDK or call the REST API directly with cURL or Go. No ORMs, no
            connection pools, no VPC firewalls.
          </p>
        </div>

        {/* Full-width code surface */}
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg shadow-black/[0.03] dark:shadow-black/20">
          {/* Tab bar */}
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-6">
              {snippets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleTabChange(s.id)}
                  className={`text-[13px] font-mono py-1 border-b-2 transition-colors ${
                    s.id === activeTab
                      ? "border-purple-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors"
              >
                <Play className="h-3 w-3 fill-current" />
                Show response
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-white/10 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-purple-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code content */}
          <div className="bg-white dark:bg-[#0c0a12]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="p-5 overflow-x-auto">
                  <pre className="font-mono text-[13px] leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre">
                    <code>{current.code}</code>
                  </pre>
                </div>

                {/* Response (slides down when Run is clicked) */}
                <AnimatePresence>
                  {showResponse && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-200 dark:border-white/10 p-5 bg-gray-50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-3 text-[12px] font-mono text-gray-400 dark:text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Example response
                        </div>
                        <pre className="font-mono text-[13px] leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre overflow-x-auto">
                          <code>{current.response}</code>
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeDemo;

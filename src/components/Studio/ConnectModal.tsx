import { useState } from "react";
import { Copy, Check, Terminal, Code2, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { url } from "@/lib/config";
import { toast } from "sonner";

interface ConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dbName: string;
  apiKey: string;
}

export default function ConnectModal({ open, onOpenChange, dbName, apiKey }: ConnectModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlSnippet = `# Fetch all tables
curl -X GET "${url}/api/v1/databases/${dbName}/tables" \\
  -H "Authorization: ApiKey ${apiKey || "YOUR_API_KEY"}"

# Query records from a table
curl -X GET "${url}/api/v1/databases/${dbName}/tables/<TABLE_NAME>/records?limit=25" \\
  -H "Authorization: ApiKey ${apiKey || "YOUR_API_KEY"}"

# Execute custom SQL
curl -X POST "${url}/api/v1/databases/${dbName}/sql" \\
  -H "Authorization: ApiKey ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "SELECT * FROM <TABLE_NAME> LIMIT 10;"}'`;

  const jsSnippet = `// Using standard fetch in JavaScript / TypeScript
const API_URL = "${url}/api/v1/databases/${dbName}";
const API_KEY = "${apiKey || "YOUR_API_KEY"}";

// 1. Fetch records
async function getRecords(tableName) {
  const res = await fetch(\`\${API_URL}/tables/\${tableName}/records?limit=25\`, {
    headers: {
      "Authorization": \`ApiKey \${API_KEY}\`
    }
  });
  return await res.json();
}

// 2. Execute custom SQL
async function executeSQL(query) {
  const res = await fetch(\`\${API_URL}/sql\`, {
    method: "POST",
    headers: {
      "Authorization": \`ApiKey \${API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });
  return await res.json();
}`;

  const pythonSnippet = `import requests

API_URL = "${url}/api/v1/databases/${dbName}"
API_KEY = "${apiKey || "YOUR_API_KEY"}"
headers = {"Authorization": f"ApiKey {API_KEY}"}

# 1. Fetch records
resp = requests.get(f"{API_URL}/tables/<TABLE_NAME>/records?limit=25", headers=headers)
print(resp.json())

# 2. Execute SQL
sql_resp = requests.post(
    f"{API_URL}/sql",
    headers=headers,
    json={"query": "SELECT * FROM <TABLE_NAME> LIMIT 10;"}
)
print(sql_resp.json())`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-2xl border-purple-200/50 dark:border-purple-500/20 text-card-foreground shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Connect to {dbName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Connect to your isolated SQLite backend database using REST or SQL endpoints.
          </DialogDescription>
        </DialogHeader>

        {/* API Credentials */}
        <div className="space-y-3 my-2 min-w-0">
          <div className="p-3 bg-muted/40 border border-purple-200/40 dark:border-white/10 rounded-xl space-y-1.5 min-w-0">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Project API Base URL
            </div>
            <div className="flex items-center justify-between font-mono text-xs bg-background/80 px-3 py-2 rounded-lg border border-purple-200/30 dark:border-white/10 min-w-0 gap-2">
              <span className="text-purple-600 dark:text-purple-300 truncate font-mono">
                {`${url}/api/v1/databases/${dbName}`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => copyToClipboard(`${url}/api/v1/databases/${dbName}`, "API Base URL")}
              >
                {copiedKey === "API Base URL" ? (
                  <Check className="w-3.5 h-3.5 text-purple-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted/40 border border-purple-200/40 dark:border-white/10 rounded-xl space-y-1.5 min-w-0">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Project API Key (Secret)
            </div>
            <div className="flex items-center justify-between font-mono text-xs bg-background/80 px-3 py-2 rounded-lg border border-purple-200/30 dark:border-white/10 min-w-0 gap-2">
              <span className="text-foreground truncate font-mono">
                {apiKey ? apiKey : "No API key found. Generate one in API Keys tab."}
              </span>
              {apiKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => copyToClipboard(apiKey, "API Key")}
                >
                  {copiedKey === "API Key" ? (
                    <Check className="w-3.5 h-3.5 text-purple-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Snippets */}
        <Tabs defaultValue="curl" className="w-full min-w-0">
          <div className="flex items-center justify-between mb-2">
            <TabsList className="bg-muted/60 border border-purple-200/30 dark:border-white/10">
              <TabsTrigger
                value="curl"
                className="text-xs gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Terminal className="w-3.5 h-3.5" /> cURL
              </TabsTrigger>
              <TabsTrigger
                value="js"
                className="text-xs gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Code2 className="w-3.5 h-3.5" /> JavaScript
              </TabsTrigger>
              <TabsTrigger
                value="python"
                className="text-xs gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Terminal className="w-3.5 h-3.5" /> Python
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="curl" className="mt-0 relative w-full min-w-0">
            <div className="relative group w-full min-w-0">
              <pre className="w-full max-w-full bg-[#0c0b16] text-zinc-200 border border-purple-500/20 rounded-xl p-3.5 pr-20 text-xs font-mono overflow-x-auto max-h-[220px] leading-relaxed">
                {curlSnippet}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2.5 right-2.5 z-10 h-7 px-2.5 text-xs bg-white/10 border-white/15 hover:bg-white/20 text-white shadow-xs"
                onClick={() => copyToClipboard(curlSnippet, "cURL snippet")}
              >
                {copiedKey === "cURL snippet" ? (
                  <Check className="w-3.5 h-3.5 mr-1 text-purple-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1" />
                )}
                Copy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="js" className="mt-0 relative w-full min-w-0">
            <div className="relative group w-full min-w-0">
              <pre className="w-full max-w-full bg-[#0c0b16] text-zinc-200 border border-purple-500/20 rounded-xl p-3.5 pr-20 text-xs font-mono overflow-x-auto max-h-[220px] leading-relaxed">
                {jsSnippet}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2.5 right-2.5 z-10 h-7 px-2.5 text-xs bg-white/10 border-white/15 hover:bg-white/20 text-white shadow-xs"
                onClick={() => copyToClipboard(jsSnippet, "JavaScript snippet")}
              >
                {copiedKey === "JavaScript snippet" ? (
                  <Check className="w-3.5 h-3.5 mr-1 text-purple-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1" />
                )}
                Copy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="python" className="mt-0 relative w-full min-w-0">
            <div className="relative group w-full min-w-0">
              <pre className="w-full max-w-full bg-[#0c0b16] text-zinc-200 border border-purple-500/20 rounded-xl p-3.5 pr-20 text-xs font-mono overflow-x-auto max-h-[220px] leading-relaxed">
                {pythonSnippet}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2.5 right-2.5 z-10 h-7 px-2.5 text-xs bg-white/10 border-white/15 hover:bg-white/20 text-white shadow-xs"
                onClick={() => copyToClipboard(pythonSnippet, "Python snippet")}
              >
                {copiedKey === "Python snippet" ? (
                  <Check className="w-3.5 h-3.5 mr-1 text-purple-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1" />
                )}
                Copy
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

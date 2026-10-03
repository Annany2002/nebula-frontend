import { useEffect, useRef, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseApiKey } from "@/components/Database/DatabaseApiKey";
import { useApiKey } from "@/hooks/queries";
import { url } from "@/lib/config";
import "@/styles/api-keys.css";

export default function ApiKeys({ dbName }: { dbName: string }) {
  const { isFetching, refetch } = useApiKey(dbName);
  return (
    <div className="api-keys-page">
      <header className="api-keys-heading">
        <div>
          <h1>API keys</h1>
          <p>
            Manage application access to <span>{dbName}</span>.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh key details"
        >
          <RefreshCw
            size={14}
            className={isFetching ? "animate-spin motion-reduce:animate-none" : ""}
          />
          <span>Refresh</span>
        </Button>
      </header>
      <div className="api-keys-layout">
        <div className="api-keys-main">
          <DatabaseApiKey databaseName={dbName} />
          <ConnectionExamples key={dbName} dbName={dbName} />
        </div>
        <aside className="api-key-guide" aria-labelledby="api-key-access-heading">
          <h2 id="api-key-access-heading">Key access</h2>
          <dl>
            <div>
              <dt>Scope</dt>
              <dd>This database only</dd>
            </div>
            <div>
              <dt>Permissions</dt>
              <dd>Read and write database data, run SQL, and manage schemas.</dd>
            </div>
            <div>
              <dt>Account access</dt>
              <dd>Profile and key management require your signed-in session.</dd>
            </div>
          </dl>
          <h2>Keep your key private</h2>
          <p>
            Store the secret in your server’s environment. Avoid committing it to source control or
            including it in browser code.
          </p>
          <p>
            Each database has one key. Rotating it replaces the current credential; update your app
            before making more requests.
          </p>
        </aside>
      </div>
    </div>
  );
}
function ConnectionExamples({ dbName }: { dbName: string }) {
  const baseUrl = `${url.replace(/\/$/, "")}/api/v1/databases/${encodeURIComponent(dbName)}`;
  const snippets = {
    curl: `curl "${baseUrl}/tables" \\\n  -H "Authorization: ApiKey YOUR_API_KEY"`,
    fetch: `const response = await fetch(\n  "${baseUrl}/tables",\n  {\n    headers: {\n      Authorization: \`ApiKey \${process.env.NEBULA_API_KEY}\`,\n    },\n  },\n);\n\nif (!response.ok) throw new Error("Request failed");\nconst { tables } = await response.json();`,
  };
  const [example, setExample] = useState<"curl" | "fetch">("curl");
  const [copied, setCopied] = useState<{ target: "url" | "example"; value: string } | null>(null);
  const [copyError, setCopyError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const copy = async (text: string, target: "url" | "example") => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(text);
      if (!mounted.current) return;
      setCopied({ target, value: text });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      if (mounted.current)
        setCopyError("Couldn’t copy. Select the text and copy it manually, or try again.");
    }
  };
  return (
    <section className="api-key-examples" aria-labelledby="api-key-examples-heading">
      <h2 id="api-key-examples-heading">Connect from your server</h2>
      <p>
        Use <code>Authorization: ApiKey YOUR_API_KEY</code> with the secret you saved.
      </p>
      <label id="api-key-url-label">API base URL</label>
      <div className="api-key-url">
        <code aria-labelledby="api-key-url-label">{baseUrl}</code>
        <Button
          variant="ghost"
          size="icon"
          aria-label={copied?.target === "url" ? "API URL copied" : "Copy API URL"}
          onClick={() => copy(baseUrl, "url")}
        >
          {copied?.target === "url" ? <Check size={15} /> : <Copy size={15} />}
        </Button>
      </div>
      <Tabs
        value={example}
        onValueChange={(value) => {
          setExample(value as "curl" | "fetch");
          setCopied(null);
          clearTimeout(timer.current);
        }}
      >
        <div className="api-key-example-toolbar">
          <TabsList>
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="fetch">Node.js fetch</TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            aria-label={
              copied?.target === "example" && copied.value === snippets[example]
                ? "Example copied"
                : "Copy connection example"
            }
            onClick={() => copy(snippets[example], "example")}
          >
            {copied?.target === "example" && copied.value === snippets[example] ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
            <span>
              {copied?.target === "example" && copied.value === snippets[example]
                ? "Copied"
                : "Copy"}
            </span>
          </Button>
        </div>
        <TabsContent value="curl">
          <pre tabIndex={0} aria-label="cURL connection example">
            <code>{snippets.curl}</code>
          </pre>
        </TabsContent>
        <TabsContent value="fetch">
          <pre tabIndex={0} aria-label="Node.js connection example">
            <code>{snippets.fetch}</code>
          </pre>
        </TabsContent>
      </Tabs>
      {copyError && (
        <p className="api-key-error" role="alert">
          {copyError}
        </p>
      )}
      <span className="sr-only" role="status">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, KeyRound, Table2, Terminal } from "lucide-react";
import { useTables } from "@/hooks/queries";
import type { DataBaseType } from "@/types/allType";
import { url } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function DatabaseQuickstart({ databases }: { databases: DataBaseType[] }) {
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [language, setLanguage] = useState("curl");
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(copiedTimeout.current), []);

  const database = databases.find((db) => db.dbName === selectedDatabase) || databases[0];
  const { data: tables = [], isLoading, isError, refetch } = useTables(database.dbName);
  const table = tables.find((item) => item.name === selectedTable) || tables[0];
  const basePath = `/databases/${encodeURIComponent(database.dbName)}`;
  const endpoint = `${url.replace(/\/$/, "")}/api/v1/${encodeURIComponent(database.dbName)}/${encodeURIComponent(table?.name || "TABLE_NAME")}?limit=20`;
  const snippets = {
    curl: `curl "${endpoint}" \\\n  -H "Authorization: ApiKey YOUR_API_KEY"`,
    fetch: `const response = await fetch("${endpoint}", {
  headers: { Authorization: "ApiKey YOUR_API_KEY" }
});

if (!response.ok) throw new Error("Request failed");
const { records } = await response.json();`,
  };
  const snippet = language === "curl" ? snippets.curl : snippets.fetch;

  const copy = async () => {
    clearTimeout(copiedTimeout.current);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      copiedTimeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      toast.error("Couldn’t copy the request. Please try again.");
    }
  };

  return (
    <section className="db-quickstart-section" aria-labelledby="quickstart-heading">
      <div className="db-quickstart-heading">
        <div>
          <h2 id="quickstart-heading">Connect your app</h2>
          <p>A request template for your database.</p>
        </div>
        <div className="db-quickstart-database">
          <span id="quickstart-database-label">Database</span>
          <Select
            value={database.dbName}
            onValueChange={(value) => {
              setSelectedDatabase(value);
              setSelectedTable("");
              setCopied(false);
            }}
          >
            <SelectTrigger aria-labelledby="quickstart-database-label">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {databases.map((db) => (
                <SelectItem key={db.databaseId} value={db.dbName}>
                  {db.dbName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="db-quickstart-workbench">
        <aside className="db-quickstart-setup" aria-label="Connection setup">
          <h3>Before your first request</h3>
          <ol>
            <li>
              <span className="db-step-number">1</span>
              <div>
                <Link to={`${basePath}/tables`}>
                  <Table2 size={15} aria-hidden="true" />
                  {table ? "Explore your tables" : "Create a table"}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <p>
                  {table
                    ? "Choose a table for the request."
                    : "Add columns and your first records."}
                </p>
              </div>
            </li>
            <li>
              <span className="db-step-number">2</span>
              <div>
                <Link to={`${basePath}/apikeys`}>
                  <KeyRound size={15} aria-hidden="true" />
                  Get an API key
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <p>Replace YOUR_API_KEY in the example.</p>
              </div>
            </li>
          </ol>
          <Link className="db-sql-link" to={`${basePath}/sql`}>
            <Terminal size={16} aria-hidden="true" />
            Open SQL runner
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </aside>
        <div className="db-quickstart-request">
          <div className="db-request-target">
            <span className="db-request-method">GET</span>
            {isError ? (
              <p role="alert">
                Couldn’t load tables.{" "}
                <button type="button" onClick={() => refetch()}>
                  Retry
                </button>
              </p>
            ) : isLoading ? (
              <p role="status">Loading tables…</p>
            ) : table ? (
              <Select
                value={table.name}
                onValueChange={(value) => {
                  setSelectedTable(value);
                  setCopied(false);
                }}
              >
                <SelectTrigger aria-label="Request table">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>Create a table to use the records API.</p>
            )}
          </div>
          <Tabs
            value={language}
            onValueChange={(value) => {
              setLanguage(value);
              setCopied(false);
            }}
          >
            <div className="db-request-toolbar">
              <TabsList aria-label="Request language">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="fetch">JavaScript</TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm" onClick={copy} className="db-copy-request">
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span aria-live="polite">{copied ? "Copied" : "Copy request"}</span>
              </Button>
            </div>
            {(["curl", "fetch"] as const).map((value) => (
              <TabsContent key={value} value={value}>
                <pre className="db-request-code">
                  <code>{snippets[value]}</code>
                </pre>
              </TabsContent>
            ))}
          </Tabs>
          <p className="db-request-note">
            {table
              ? "Uses a database API key, not your Studio session."
              : "TABLE_NAME is a placeholder. Create a table, then select it here."}
          </p>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { FileCode2, Play, Terminal, Check } from "lucide-react";
import Reveal from "./landing/Reveal";
import CopyButton from "./landing/CopyButton";

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
  const [showResponse, setShowResponse] = useState(false);
  const current = snippets.find((snippet) => snippet.id === activeTab) || snippets[0];
  const changeTab = (id: string) => {
    setActiveTab(id);
    setShowResponse(false);
  };

  return (
    <section
      id="code-demo"
      className="nbl-section nbl-developers"
      aria-labelledby="developers-title"
    >
      <div className="nbl-container nbl-code-layout">
        <Reveal className="nbl-code-intro">
          <h2 id="developers-title">Connect in a few lines.</h2>
          <p>
            Use the TypeScript SDK or standard HTTP. Set NEBULA_BASE_URL and NEBULA_API_KEY to
            connect to your instance.
          </p>
          <ol className="nbl-code-steps">
            <li>
              <span>1</span> Create your database in Studio.
            </li>
            <li>
              <span>2</span> Add tables and generate an API key.
            </li>
            <li>
              <span>3</span> Connect your app. That's it.
            </li>
          </ol>
          <div className="nbl-install">
            <Terminal size={14} />
            <code>npm i nebula-sdk-ts</code>
            <CopyButton text="npm i nebula-sdk-ts" label="Copy" />
          </div>
        </Reveal>
        <Reveal className="nbl-code-workbench" delay={0.08}>
          <div className="nbl-code-tabs" role="tablist" aria-label="Integration example language">
            {snippets.map((snippet, index) => (
              <button
                type="button"
                key={snippet.id}
                id={`code-tab-${snippet.id}`}
                role="tab"
                aria-selected={activeTab === snippet.id}
                aria-controls="code-example-panel"
                tabIndex={activeTab === snippet.id ? 0 : -1}
                onClick={() => changeTab(snippet.id)}
                onKeyDown={(event) => {
                  const offset =
                    event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                  if (!offset) return;
                  event.preventDefault();
                  const next = snippets[(index + offset + snippets.length) % snippets.length];
                  changeTab(next.id);
                  document.getElementById(`code-tab-${next.id}`)?.focus();
                }}
              >
                {snippet.label}
              </button>
            ))}
          </div>
          <div className="nbl-code-filebar">
            <span>
              <FileCode2 size={12} />
              {current.filename}
            </span>
            <CopyButton text={current.code} />
          </div>
          <div
            key={activeTab}
            id="code-example-panel"
            role="tabpanel"
            aria-labelledby={`code-tab-${activeTab}`}
          >
            <div className="nbl-code-scroll">
              <pre>
                <code>
                  {current.code.split("\n").map((line, index) => (
                    <span key={`${current.id}-${index}`} className="nbl-code-line">
                      <span className="nbl-line-number" aria-hidden="true">
                        {index + 1}
                      </span>
                      {line
                        .split(
                          /("(?:[^"\\]|\\.)*"|'[^']*'|\/\/.*|\b(?:import|from|const|await|package|func|if|defer|return)\b)/g
                        )
                        .map((token, i) => (
                          <span
                            key={i}
                            className={
                              /^["']/.test(token)
                                ? "nbl-token-string"
                                : token.startsWith("//")
                                  ? "nbl-token-comment"
                                  : /^(import|from|const|await|package|func|if|defer|return)$/.test(
                                        token
                                      )
                                    ? "nbl-token-keyword"
                                    : undefined
                            }
                          >
                            {token || " "}
                          </span>
                        ))}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
            <div className="nbl-code-bottom">
              <span>
                <Check size={12} /> SDK + standard REST
              </span>
              <button
                type="button"
                aria-expanded={showResponse}
                aria-controls="code-example-response"
                onClick={() => setShowResponse((show) => !show)}
              >
                <Play size={11} />
                {showResponse ? "Hide example response" : "Show example response"}
              </button>
            </div>
            {showResponse && (
              <div id="code-example-response" className="nbl-code-response">
                <span>EXAMPLE RESPONSE · SAMPLE DATA</span>
                <pre>
                  <code>{current.response}</code>
                </pre>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CodeDemo;

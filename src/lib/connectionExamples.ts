import { url } from "@/lib/config";

export type ConnectionExampleId = "curl" | "node" | "python" | "sdk";
export interface ConnectionExample {
  id: ConnectionExampleId;
  label: string;
  hint: string;
  code: string;
}
export function databaseApiUrl(dbName: string, serverUrl = url) {
  return `${serverUrl.replace(/\/+$/, "")}/api/v1/databases/${encodeURIComponent(dbName)}`;
}
const shellQuote = (value: string) => `'${value.replace(/'/g, "'\\''")}'`;

export function connectionExamples(dbName: string, serverUrl = url): ConnectionExample[] {
  const endpoint = `${databaseApiUrl(dbName, serverUrl)}/tables`;
  const endpointLiteral = JSON.stringify(endpoint);
  const environment = `const apiKey = process.env.NEBULA_API_KEY;
if (!apiKey) throw new Error("Set NEBULA_API_KEY to your saved key");`;
  return [
    {
      id: "curl",
      label: "cURL",
      hint: "Run in a terminal with NEBULA_API_KEY set.",
      code: `curl --fail-with-body ${shellQuote(endpoint)} \\
  -H "Authorization: ApiKey \${NEBULA_API_KEY:?Set NEBULA_API_KEY}"`,
    },
    {
      id: "node",
      label: "Node.js",
      hint: "Use the built-in fetch in Node.js 18 or later.",
      code: `${environment}

const response = await fetch(${endpointLiteral}, {
  headers: { Authorization: \`ApiKey \${apiKey}\` },
});
if (!response.ok) throw new Error(\`Request failed: \${response.status}\`);
const { tables } = await response.json();
console.log(tables);`,
    },
    {
      id: "python",
      label: "Python",
      hint: "Install requests with: pip install requests",
      code: `import os
import requests

response = requests.get(
    ${endpointLiteral},
    headers={"Authorization": f"ApiKey {os.environ['NEBULA_API_KEY']}"},
    timeout=30,
)
response.raise_for_status()
print(response.json()["tables"])`,
    },
    {
      id: "sdk",
      label: "SDK",
      hint: "Install the TypeScript SDK with: npm install nebula-sdk-ts",
      code: `import { NebulaClient } from "nebula-sdk-ts";

${environment}

const nebula = new NebulaClient({
  baseURL: ${JSON.stringify(serverUrl.replace(/\/+$/, ""))},
  apiKey,
});
const { tables } = await nebula.schema.listTables(${JSON.stringify(dbName)});
console.log(tables);`,
    },
  ];
}

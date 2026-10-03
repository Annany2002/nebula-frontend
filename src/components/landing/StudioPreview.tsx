import { useState } from "react";
import {
  Braces,
  Database,
  GitBranch,
  Layers,
  Play,
  Search,
  Table2,
  Terminal,
  Check,
} from "lucide-react";

const tables = [
  {
    name: "users",
    fields: [
      ["id", "integer", "PK"],
      ["name", "text", ""],
      ["email", "text", ""],
      ["created_at", "datetime", ""],
    ],
  },
  {
    name: "orders",
    fields: [
      ["id", "integer", "PK"],
      ["user_id", "integer", "FK"],
      ["total", "real", ""],
      ["status", "text", ""],
    ],
  },
  {
    name: "products",
    fields: [
      ["id", "integer", "PK"],
      ["name", "text", ""],
      ["price", "real", ""],
    ],
  },
];
const records = [
  { id: 1, customer: "Alex Morgan", total: 149, status: "completed" },
  { id: 2, customer: "Sam Rivera", total: 89, status: "pending" },
  { id: 3, customer: "Jamie Chen", total: 245, status: "completed" },
  { id: 4, customer: "Taylor Park", total: 64, status: "completed" },
];
const tabs = [
  { id: "schema", label: "Schema", icon: GitBranch },
  { id: "records", label: "Records", icon: Table2 },
  { id: "sql", label: "SQL", icon: Terminal },
] as const;
type PreviewTab = (typeof tabs)[number]["id"];

const StudioPreview = () => {
  const [tab, setTab] = useState<PreviewTab>("schema");
  const [selectedTable, setSelectedTable] = useState("users");
  const [search, setSearch] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const shownRecords =
    tab === "sql"
      ? records.filter((row) => row.status === "completed")
      : records.filter((row) =>
          `${row.customer} ${row.status}`.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div className="nbl-studio" aria-label="Interactive Nebula Studio demo">
      <div className="nbl-studio-chrome">
        <span className="nbl-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          <Layers size={12} /> Nebula Studio
        </span>
        <span className="nbl-demo-label">Interactive demo</span>
      </div>
      <div className="nbl-studio-topbar">
        <span className="nbl-project">
          <Database size={16} /> ecommerce <span>production</span>
        </span>
        <span className="nbl-status">
          <i /> Connected
        </span>
      </div>
      <div className="nbl-studio-tabs" role="tablist" aria-label="Studio preview views">
        {tabs.map((item, index) => (
          <button
            key={item.id}
            id={`preview-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls="preview-panel"
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => {
              const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
              if (!offset) return;
              event.preventDefault();
              const next = tabs[(index + offset + tabs.length) % tabs.length];
              setTab(next.id);
              document.getElementById(`preview-tab-${next.id}`)?.focus();
            }}
          >
            <item.icon size={14} /> {item.label}
          </button>
        ))}
        <span className="nbl-studio-tab-note">Your data, connected.</span>
      </div>
      <div
        key={tab}
        id="preview-panel"
        className={`nbl-preview-panel nbl-preview-${tab}`}
        role="tabpanel"
        aria-labelledby={`preview-tab-${tab}`}
      >
        {tab === "schema" ? (
          <div className="nbl-schema-canvas">
            <svg className="nbl-schema-links" viewBox="0 0 620 330" fill="none" aria-hidden="true">
              <path d="M242 158 H276 Q294 158 294 140 V98 Q294 80 312 80 H337" />
              <path d="M435 172 V213 Q435 234 415 234 H310 Q288 234 288 257 H242" />
              <circle cx="242" cy="158" r="4" />
              <circle cx="337" cy="80" r="4" />
              <circle cx="435" cy="172" r="4" />
              <circle cx="242" cy="257" r="4" />
            </svg>
            {tables.map((table) => (
              <button
                type="button"
                key={table.name}
                className={`nbl-schema-table nbl-table-${table.name} ${selectedTable === table.name ? "is-selected" : ""}`}
                aria-pressed={selectedTable === table.name}
                onClick={() => setSelectedTable(table.name)}
              >
                <span className="nbl-schema-title">
                  <Table2 size={13} />
                  {table.name}
                  <span>{table.fields.length}</span>
                </span>
                <span className="nbl-schema-fields">
                  {table.fields.map(([name, type, key]) => (
                    <span key={name}>
                      <span className={key ? "nbl-schema-key" : ""}>{key || "·"}</span>
                      <span>{name}</span>
                      <span>{type}</span>
                    </span>
                  ))}
                </span>
              </button>
            ))}
            <span className="nbl-canvas-caption">
              <Braces size={12} /> Foreign keys. Visualized.
            </span>
          </div>
        ) : (
          <div className="nbl-preview-data">
            {tab === "records" ? (
              <label className="nbl-record-search">
                <Search size={14} />
                <input
                  aria-label="Search demo orders"
                  placeholder="Search orders…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            ) : (
              <div className="nbl-sql-preview">
                <pre>
                  <code>
                    <span>SELECT</span> id, customer, total
                    <br />
                    <span>FROM</span> orders
                    <br />
                    <span>WHERE</span> status = <em>'completed'</em>;
                  </code>
                </pre>
                <button type="button" className="nbl-run" onClick={() => setHasRun(true)}>
                  <Play size={12} /> Run query
                </button>
              </div>
            )}
            {tab !== "sql" || hasRun ? (
              <div className="nbl-record-table-wrap">
                <table className="nbl-record-table">
                  <thead>
                    <tr>
                      <th>id</th>
                      <th>customer</th>
                      <th>total</th>
                      <th>status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownRecords.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.customer}</td>
                        <td>${row.total.toFixed(2)}</td>
                        <td>
                          <span className={`nbl-record-status ${row.status}`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {shownRecords.length === 0 && (
                  <p className="nbl-empty">No matching orders. Try another search.</p>
                )}
                <p className="nbl-result-count" role="status">
                  {shownRecords.length} rows
                  {tab === "sql" ? " returned from demo data" : " in this view"}
                </p>
              </div>
            ) : (
              <p className="nbl-query-hint">Run the query to explore the sample dataset.</p>
            )}
          </div>
        )}
      </div>
      <div className="nbl-studio-statusbar">
        <span>
          <i /> SQLite · WAL mode
        </span>
        <span role="status">
          {tab === "schema"
            ? `${selectedTable} selected`
            : tab === "records"
              ? "orders table"
              : hasRun
                ? "Query complete"
                : "SQL console"}
        </span>
        <span>
          <Check size={11} /> Sample data
        </span>
      </div>
    </div>
  );
};

export default StudioPreview;

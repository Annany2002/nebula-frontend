import {
  Network,
  Table2,
  ListFilter,
  Zap,
  HardDriveDownload,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
export type DatabaseSubTab = "visualizer" | "tables" | "indexes" | "triggers" | "backups";
interface DatabaseSubSidebarProps {
  currentSubTab: DatabaseSubTab;
  onSubTabChange: (tab: DatabaseSubTab) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
const items = [
  { id: "visualizer", label: "Schema visualizer", icon: Network },
  { id: "tables", label: "Tables", icon: Table2 },
  { id: "indexes", label: "Indexes", icon: ListFilter },
  { id: "triggers", label: "Triggers", icon: Zap },
  { id: "backups", label: "Backups & export", icon: HardDriveDownload },
] as const;
export default function DatabaseSubSidebar({
  currentSubTab,
  onSubTabChange,
  collapsed = false,
  onToggleCollapse,
}: DatabaseSubSidebarProps) {
  return (
    <aside className={`studio-subsidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="studio-subsidebar-heading">
        <span>Database</span>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand database navigation" : "Collapse database navigation"}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>
      <nav aria-label="Database navigation">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => onSubTabChange(id)}
            aria-current={currentSubTab === id ? "page" : undefined}
            aria-label={label}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

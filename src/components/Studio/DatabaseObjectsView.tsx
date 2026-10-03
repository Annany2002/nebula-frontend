import DatabaseTables from "@/components/Studio/DatabaseTables";
import DatabaseObjectDetails from "@/components/Studio/DatabaseObjectDetails";
export type DatabaseSubView = "tables" | "indexes" | "triggers" | "backups";
interface Props {
  dbName: string;
  subView: DatabaseSubView;
  onSelectTable?: (name: string) => void;
  onOpenCreateTable?: () => void;
}
export default function DatabaseObjectsView({
  dbName,
  subView,
  onSelectTable,
  onOpenCreateTable,
}: Props) {
  return subView === "tables" ? (
    <DatabaseTables
      key={dbName}
      dbName={dbName}
      onSelectTable={onSelectTable}
      onOpenCreateTable={onOpenCreateTable}
    />
  ) : (
    <DatabaseObjectDetails key={`${dbName}:${subView}`} dbName={dbName} subView={subView} />
  );
}

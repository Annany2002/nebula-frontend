import DatabaseSqlObjects from "@/components/Studio/DatabaseSqlObjects";
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
  ) : subView === "indexes" || subView === "triggers" ? (
    <DatabaseSqlObjects
      key={`${dbName}:${subView}`}
      category={subView}
      dbName={dbName}
      onSelectTable={onSelectTable}
    />
  ) : (
    <DatabaseObjectDetails key={`${dbName}:${subView}`} dbName={dbName} />
  );
}

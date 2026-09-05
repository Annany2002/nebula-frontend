export interface DataBaseType {
  databaseId: number;
  createdAt: string;
  dbName: string;
  userId: string;
  filePath: string;
  tables: number;
  apiKey: string;
}

export interface TableColumnType {
  cid: string;
  name: string;
  type: string;
  notnull: number;
  dflt_value: unknown;
  pk: number;
}

export interface TableType {
  columns: TableColumnType[];
  createdAt: string;
  name: string;
  rootpage: string;
  sql: string;
  tbl_name: string;
  type: string;
  rowCount?: number;
}

export interface RecordSchemaType {
  [key: string]: unknown;
}

// Pagination types for records API
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

export interface RecordsResponse {
  records: RecordSchemaType[];
  pagination: PaginationInfo;
}

export interface RecordsQueryParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
  fields?: string[];
  filters?: Record<string, string>;
}

export interface UserProfileType {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface DatabaseDetailType {
  databaseId: number;
  userId: string;
  dbName: string;
  filePath: string;
  createdAt: string;
  tables: number;
  totalRecords: number;
  sizeBytes: number;
  sizeDisplay: string;
  apiKey: string;
}

export interface SQLQueryResultType {
  columns?: string[];
  rows?: unknown[][];
  rowCount: number;
  rowsAffected: number;
  executionMs: number;
  message?: string;
}

export interface ServiceMetricBucket {
  timestamp: string;
  requests: number;
  warnings: number;
  errors: number;
}

export interface ServiceMetricsType {
  name: string;
  requests: number;
  warnings: number;
  errors: number;
  history: ServiceMetricBucket[];
}

export interface AdvisorIssueType {
  id: string;
  category: "SECURITY" | "PERFORMANCE" | "SCHEMA";
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  tableName?: string;
  suggestion: string;
}

export interface DatabaseAnalyticsType {
  totalRequests: number;
  successRate: number;
  timeframe: string;
  services: ServiceMetricsType[];
  advisor: AdvisorIssueType[];
}

export interface ForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  onUpdate: string;
  onDelete: string;
}

export interface TableDiagramInfo {
  name: string;
  columns: TableColumnType[];
  foreignKeys: ForeignKeyInfo[];
  rowCount: number;
  sql: string;
}

export interface SchemaDiagramType {
  tables: TableDiagramInfo[];
  totalTables: number;
  totalForeignKeys: number;
}

export interface IndexInfo {
  name: string;
  tableName: string;
  unique: boolean;
  sql: string;
}

export interface TriggerInfo {
  name: string;
  tableName: string;
  sql: string;
}

export interface DatabaseObjectsType {
  indexes: IndexInfo[];
  triggers: TriggerInfo[];
}

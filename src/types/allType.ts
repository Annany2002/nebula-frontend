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
  name: string;
  type: string;
}

export interface TableType {
  columns: TableColumnType[];
  createdAt: string;
  name: string;
  rootpage: string;
  sql: string;
  tbl_name: string;
  type: string;
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

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
  [key: string]: any;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { url } from "@/lib/config";
import {
  DataBaseType,
  TableType,
  RecordSchemaType,
  RecordsResponse,
  RecordsQueryParams,
  UserProfileType,
  DatabaseDetailType,
  SQLQueryResultType,
  DatabaseAnalyticsType,
  SchemaDiagramType,
  DatabaseObjectsType,
  CreateIndexPayload,
  CreateIndexResponse,
  DropIndexResponse,
  CreateTriggerPayload,
  CreateTriggerResponse,
  DropTriggerResponse,
  AlterTablePayload,
  APIKeyMetadataType,
  ColumnDefinitionType,
} from "@/types/allType";
import { toast } from "sonner";
import { apiKeyPrefix } from "@/lib/apiKey";

export const getToken = () => localStorage.getItem("token");

export const useDatabases = () => {
  return useQuery({
    queryKey: ["databases"],
    queryFn: async (): Promise<DataBaseType[]> => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch databases");
      const data = await response.json();
      return data.databases;
    },
  });
};

export const useTables = (dbName: string | undefined) => {
  return useQuery({
    queryKey: ["tables", dbName],
    queryFn: async (): Promise<TableType[]> => {
      if (!dbName) return [];
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${dbName}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tables");
      const data = await response.json();
      return data.tables;
    },
    enabled: !!dbName,
  });
};

export const useRecords = (
  dbName: string | undefined,
  tableName: string | undefined,
  params: RecordsQueryParams = {}
) => {
  const { limit = 100, offset = 0, sort = "id", order = "asc", fields, filters } = params;

  return useQuery({
    queryKey: ["records", dbName, tableName, { limit, offset, sort, order, fields, filters }],
    queryFn: async (): Promise<RecordsResponse> => {
      if (!dbName || !tableName) {
        return { records: [], pagination: { total: 0, limit, offset } };
      }

      const token = getToken();
      const queryParams = new URLSearchParams();

      queryParams.set("limit", String(limit));
      queryParams.set("offset", String(offset));
      queryParams.set("sort", sort);
      queryParams.set("order", order);

      if (fields && fields.length > 0) {
        queryParams.set("fields", fields.join(","));
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          queryParams.set(key, value);
        });
      }

      const response = await fetch(
        `${url}/api/v1/databases/${dbName}/tables/${tableName}/records?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch records");

      const data = await response.json();

      // Handle both old format (array) and new format ({ records, pagination })
      if (Array.isArray(data)) {
        return {
          records: data,
          pagination: { total: data.length, limit, offset },
        };
      }

      return {
        records: data.records || [],
        pagination: data.pagination || { total: 0, limit, offset },
      };
    },
    enabled: !!dbName && !!tableName,
  });
};

// Schema Query
export const useTableSchema = (dbName: string, tableName: string) => {
  return useQuery({
    queryKey: ["schema", dbName, tableName],
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    queryFn: async (): Promise<any> => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${dbName}/tables/${tableName}/schema`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch schema");
      const data = await response.json();
      return data.schema;
    },
    enabled: !!dbName && !!tableName,
  });
};

// Mutations
export const useCreateDatabase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbName: string) => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ db_name: dbName }),
      });
      if (!response.ok) throw new Error("Failed to create database");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
    },
  });
};

// Table Mutations
export const useDeleteDatabase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbName: string) => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${dbName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete database");
    },
    onSuccess: (_, dbName) => {
      queryClient.setQueryData<DataBaseType[]>(["databases"], (old) =>
        old?.filter((database) => database.dbName !== dbName)
      );
      queryClient.removeQueries({
        predicate: ({ queryKey }) =>
          queryKey[1] === dbName &&
          [
            "tables",
            "records",
            "schema",
            "apikey",
            "databaseDetails",
            "databaseAnalytics",
            "schemaDiagram",
            "databaseObjects",
          ].includes(String(queryKey[0])),
      });
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success(`Database ${dbName} deleted`);
    },
    onError: () => toast.error("Error in deleting database"),
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dbName,
      tableName,
      schema,
    }: {
      dbName: string;
      tableName: string;
      schema: ColumnDefinitionType[];
    }) => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${encodeURIComponent(dbName)}/tables`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table_name: tableName, schema }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          typeof data?.error === "string" ? data.error : "Couldn’t create the table. Try again."
        );
      }
      return response.json();
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        ...["tables", "schemaDiagram", "databaseObjects", "databaseDetails"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key, variables.dbName] })
        ),
        queryClient.invalidateQueries({ queryKey: ["databases"] }),
      ]);
      toast.success("Table created successfully");
    },
    onError: () => toast.error("Failed to create table"),
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dbName, tableName }: { dbName: string; tableName: string }) => {
      const token = getToken();
      const response = await fetch(
        `${url}/api/v1/databases/${encodeURIComponent(dbName)}/tables/${encodeURIComponent(tableName)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete table");
    },
    onSuccess: (_, variables) => {
      const { dbName, tableName } = variables;
      queryClient.setQueryData<TableType[]>(["tables", dbName], (old) =>
        old?.filter((table) => table.name !== tableName)
      );
      queryClient.removeQueries({ queryKey: ["records", dbName, tableName] });
      queryClient.removeQueries({ queryKey: ["schema", dbName, tableName] });
      for (const key of ["tables", "schemaDiagram", "databaseObjects", "databaseDetails"]) {
        queryClient.invalidateQueries({ queryKey: [key, dbName] });
      }
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success(`Table ${variables.tableName} deleted successfully`);
    },
    onError: () => toast.error("Error deleting table"),
  });
};

export const useAlterTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dbName,
      tableName,
      payload,
    }: {
      dbName: string;
      tableName: string;
      payload: AlterTablePayload;
    }) => {
      const token = getToken();
      const response = await fetch(
        `${url}/api/v1/databases/${encodeURIComponent(dbName)}/tables/${encodeURIComponent(tableName)}/alter`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          typeof errorData?.error === "string"
            ? errorData.error
            : "Couldn’t update the schema. Try again."
        );
      }
      return response.json();
    },
    onSuccess: async (data, variables) => {
      const resultingTable =
        variables.payload.action === "rename_table"
          ? variables.payload.new_table_name || variables.tableName
          : data?.table_name || variables.tableName;
      const refresh = Promise.all([
        ...["tables", "schemaDiagram", "databaseObjects", "databaseDetails"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key, variables.dbName] })
        ),
        ...Array.from(new Set([variables.tableName, resultingTable])).flatMap((tableName) =>
          ["schema", "records"].map((key) =>
            queryClient.invalidateQueries({ queryKey: [key, variables.dbName, tableName] })
          )
        ),
        queryClient.invalidateQueries({ queryKey: ["databases"] }),
      ]);
      // Let the dialog navigate before a renamed table disappears from the current view.
      if (variables.payload.action !== "rename_table") await refresh;
      toast.success(data?.message || "Table schema updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to alter table");
    },
  });
};

// Record Mutations
export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dbName,
      tableName,
      data,
    }: {
      dbName: string;
      tableName: string;
      data: Record<string, unknown>;
    }) => {
      const token = getToken();
      const response = await fetch(
        `${url}/api/v1/databases/${dbName}/tables/${tableName}/records`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to create record");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["records", variables.dbName, variables.tableName],
      });
      toast.success("Record created successfully");
    },
    onError: () => toast.error("Failed to create record"),
  });
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dbName,
      tableName,
      recordId,
    }: {
      dbName: string;
      tableName: string;
      recordId: number | string;
    }) => {
      const token = getToken();
      const response = await fetch(
        `${url}/api/v1/databases/${dbName}/tables/${tableName}/records/${encodeURIComponent(String(recordId))}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete record");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["records", variables.dbName, variables.tableName],
      });
      toast.success(`Record deleted successfully`);
    },
    onError: () => toast.error("Error deleting record"),
  });
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dbName,
      tableName,
      recordId,
      data,
    }: {
      dbName: string;
      tableName: string;
      recordId: number | string;
      data: Record<string, unknown>;
    }) => {
      const token = getToken();
      const response = await fetch(
        `${url}/api/v1/databases/${dbName}/tables/${tableName}/records/${encodeURIComponent(String(recordId))}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to update record");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["records", variables.dbName, variables.tableName],
      });
      toast.success(`Record with id ${variables.recordId} edited successfully`);
    },
    onError: () => toast.error("Cannot edit record, please try again"),
  });
};

// API Key Hooks
export const useApiKey = (dbName: string) => {
  return useQuery({
    queryKey: ["apikey", dbName],
    queryFn: async ({ signal }): Promise<APIKeyMetadataType | null> => {
      const response = await fetch(
        `${url}/api/v1/account/databases/${encodeURIComponent(dbName)}/apikey`,
        {
          signal,
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Couldn’t load API key details.");
      const data = await response.json();
      if (typeof data?.key_prefix !== "string" || !data.key_prefix) {
        throw new Error("API key details were incomplete. Try refreshing.");
      }
      return {
        key_prefix: data.key_prefix,
        created_at: typeof data.created_at === "string" ? data.created_at : "",
      };
    },
    enabled: !!dbName,
    retry: false,
  });
};

export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    gcTime: 0,
    onMutate: (dbName: string) => queryClient.cancelQueries({ queryKey: ["apikey", dbName] }),
    mutationFn: async (dbName: string): Promise<{ api_key: string }> => {
      const response = await fetch(`${url}/api/v1/account/databases/${dbName}/apikey`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Couldn’t generate a key. Please try again.");
      const data = await response.json();
      if (typeof data?.api_key !== "string" || !data.api_key) {
        throw new Error("The secret wasn’t returned. Refresh the key details before trying again.");
      }
      return { api_key: data.api_key };
    },
    onSuccess: (data, dbName) => {
      const prefix = apiKeyPrefix(data.api_key);
      queryClient.setQueryData<APIKeyMetadataType>(["apikey", dbName], {
        key_prefix: prefix,
        created_at: "",
      });
      queryClient.setQueryData<DataBaseType[]>(["databases"], (old) =>
        old?.map((db) => (db.dbName === dbName ? { ...db, apiKey: "", apiKeyPrefix: prefix } : db))
      );
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      queryClient.invalidateQueries({ queryKey: ["databaseDetails", dbName] });
      toast.success("API key generated. Copy it before leaving this page.");
    },
    onSettled: (_, __, dbName) => {
      queryClient.invalidateQueries({ queryKey: ["apikey", dbName] });
    },
    onError: () => toast.error("Couldn’t generate an API key"),
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: (dbName: string) => queryClient.cancelQueries({ queryKey: ["apikey", dbName] }),
    mutationFn: async (dbName: string) => {
      const response = await fetch(`${url}/api/v1/account/databases/${dbName}/apikey`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Couldn’t revoke this key. Please try again.");
    },
    onSuccess: (_, dbName) => {
      queryClient.setQueryData(["apikey", dbName], null);
      queryClient.setQueryData<DataBaseType[]>(["databases"], (old) =>
        old?.map((db) =>
          db.dbName === dbName ? { ...db, apiKey: "", apiKeyPrefix: undefined } : db
        )
      );
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      queryClient.invalidateQueries({ queryKey: ["databaseDetails", dbName] });
      toast.success("API key revoked");
    },
    onSettled: (_, __, dbName) => {
      queryClient.invalidateQueries({ queryKey: ["apikey", dbName] });
    },
    onError: () => toast.error("Couldn’t revoke the API key"),
  });
};

// User Profile Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<UserProfileType> => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/account/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user profile");
      return response.json();
    },
    enabled: !!getToken(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username?: string; email?: string }) => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/account/user/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// Database Details Hook
export const useDatabaseDetails = (dbName: string | undefined) => {
  return useQuery({
    queryKey: ["databaseDetails", dbName],
    queryFn: async (): Promise<DatabaseDetailType> => {
      if (!dbName) throw new Error("Database name required");
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${dbName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch database details");
      const data = await response.json();
      return data.database;
    },
    enabled: !!dbName,
  });
};

// SQL Execution Hook
export const useExecuteSQL = (dbName: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (query: string): Promise<SQLQueryResultType> => {
      if (!dbName) throw new Error("Database name required");
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${dbName}/sql`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to execute SQL");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", dbName] });
      queryClient.invalidateQueries({ queryKey: ["records", dbName] });
      queryClient.invalidateQueries({ queryKey: ["databaseObjects", dbName] });
      queryClient.invalidateQueries({ queryKey: ["schemaDiagram", dbName] });
      queryClient.invalidateQueries({ queryKey: ["databaseDetails", dbName] });
      queryClient.invalidateQueries({ queryKey: ["databaseAnalytics", dbName] });
    },
  });
};

// Database Analytics & Schema Advisor Hook
export const useDatabaseAnalytics = (dbName: string | undefined) => {
  return useQuery({
    queryKey: ["databaseAnalytics", dbName],
    queryFn: async (): Promise<DatabaseAnalyticsType> => {
      if (!dbName) throw new Error("Database name required");
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${dbName}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch database analytics");
      return response.json();
    },
    enabled: !!dbName,
    refetchInterval: 15000,
  });
};

// Schema Visualizer Diagram Hook
export const useSchemaDiagram = (dbName: string | undefined) => {
  return useQuery({
    queryKey: ["schemaDiagram", dbName],
    queryFn: async ({ signal }): Promise<SchemaDiagramType> => {
      if (!dbName) throw new Error("Database name required");
      const token = getToken();
      const response = await fetch(
        `${url}/api/v1/databases/${encodeURIComponent(dbName)}/diagram`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        }
      );
      if (!response.ok) throw new Error("Failed to fetch schema diagram");
      return response.json();
    },
    enabled: !!dbName,
  });
};

// Database Objects (Indexes & Triggers) Hook
export const useDatabaseObjects = (dbName: string | undefined) => {
  return useQuery({
    queryKey: ["databaseObjects", dbName],
    queryFn: async ({ signal }): Promise<DatabaseObjectsType> => {
      if (!dbName) throw new Error("Database name required");
      const token = getToken();
      const response = await fetch(
        `${url}/api/v1/databases/${encodeURIComponent(dbName)}/objects`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        }
      );
      if (!response.ok) throw new Error("Failed to fetch database objects");
      const data = await response.json();
      const isNamedObject = (item: unknown) => {
        if (!item || typeof item !== "object") return false;
        const object = item as Record<string, unknown>;
        return (
          typeof object.name === "string" &&
          !!object.name &&
          typeof object.tableName === "string" &&
          !!object.tableName &&
          (object.sql == null || typeof object.sql === "string")
        );
      };
      if (
        !Array.isArray(data?.indexes) ||
        !Array.isArray(data?.triggers) ||
        !data.indexes.every(isNamedObject) ||
        !data.triggers.every(isNamedObject)
      ) {
        throw new Error("Database object details were incomplete. Try refreshing.");
      }
      return data;
    },
    enabled: !!dbName,
  });
};

// Index writes are never retried automatically: a lost response may have already committed.
async function indexRequest<T>(
  dbName: string,
  method: "POST" | "DELETE",
  payload?: CreateIndexPayload,
  indexName?: string
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Sign in again to manage indexes.");
  const endpoint = `${url}/api/v1/databases/${encodeURIComponent(dbName)}/indexes${indexName === undefined ? "" : `/${encodeURIComponent(indexName)}`}`;
  const response = await fetch(endpoint, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : `Couldn’t ${method === "POST" ? "create" : "drop"} the index. Refresh the catalog before trying again.`
    );
  return data as T;
}

function useObjectInvalidation(dbName: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      ["databaseObjects", "tables", "databaseDetails", "schemaDiagram", "databaseAnalytics"].map(
        (key) => queryClient.invalidateQueries({ queryKey: [key, dbName] })
      )
    );
}

export const useCreateIndex = (dbName: string) => {
  const invalidate = useObjectInvalidation(dbName);
  return useMutation({
    mutationFn: (payload: CreateIndexPayload) =>
      indexRequest<CreateIndexResponse>(dbName, "POST", payload),
    retry: false,
    onSuccess: invalidate,
  });
};

export const useDropIndex = (dbName: string) => {
  const invalidate = useObjectInvalidation(dbName);
  return useMutation({
    mutationFn: (name: string) =>
      indexRequest<DropIndexResponse>(dbName, "DELETE", undefined, name),
    retry: false,
    onSuccess: invalidate,
  });
};

// Trigger mutations use a single request; failures can follow a committed write.
async function triggerRequest(
  dbName: string,
  method: "POST" | "DELETE",
  payload?: CreateTriggerPayload,
  triggerName?: string
): Promise<CreateTriggerResponse | DropTriggerResponse> {
  const token = getToken();
  if (!token) throw new Error("Sign in again to manage triggers.");
  const endpoint = `${url}/api/v1/databases/${encodeURIComponent(dbName)}/triggers${triggerName === undefined ? "" : `/${encodeURIComponent(triggerName)}`}`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
  } catch {
    throw new Error(
      "The trigger request couldn’t be confirmed. Refresh the catalog before trying again."
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : `Couldn’t ${method === "POST" ? "create" : "drop"} the trigger. Refresh the catalog before trying again.`
    );
  const valid =
    data?.db_name === dbName &&
    typeof data?.message === "string" &&
    (method === "POST"
      ? data?.trigger?.name === payload?.name &&
        typeof data?.trigger?.tableName === "string" &&
        data.trigger.tableName.toLowerCase() === payload?.table_name.toLowerCase() &&
        typeof data?.trigger?.sql === "string" &&
        !!data.trigger.sql.trim()
      : typeof data?.trigger_name === "string" &&
        data.trigger_name.toLowerCase() === triggerName?.toLowerCase());
  if (!valid)
    throw new Error(
      "The trigger response was incomplete. Refresh the catalog before trying again."
    );
  return data;
}

export const useCreateTrigger = (dbName: string) => {
  const invalidate = useObjectInvalidation(dbName);
  return useMutation({
    mutationFn: (payload: CreateTriggerPayload) => triggerRequest(dbName, "POST", payload),
    retry: false,
    onSuccess: invalidate,
  });
};

export const useDropTrigger = (dbName: string) => {
  const invalidate = useObjectInvalidation(dbName);
  return useMutation({
    mutationFn: (name: string) => triggerRequest(dbName, "DELETE", undefined, name),
    retry: false,
    onSuccess: invalidate,
  });
};

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
} from "@/types/allType";
import { toast } from "sonner";

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
    queryFn: async (): Promise<Record<string, unknown>> => {
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
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success(`Project ${dbName} successfully deleted`);
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
      schema: Record<string, unknown>;
    }) => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/databases/${dbName}/tables`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table_name: tableName, schema }),
      });
      if (!response.ok) throw new Error("Failed to create table");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tables", variables.dbName] });
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
      const response = await fetch(`${url}/api/v1/databases/${dbName}/tables/${tableName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete table");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tables", variables.dbName] });
      toast.success(`Table ${variables.tableName} deleted successfully`);
    },
    onError: () => toast.error("Error deleting table"),
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
        `${url}/api/v1/databases/${dbName}/tables/${tableName}/records/${recordId}`,
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
        `${url}/api/v1/databases/${dbName}/tables/${tableName}/records/${recordId}`,
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
    queryFn: async (): Promise<string> => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/account/databases/${dbName}/apikey`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 404) return "";
        throw new Error("Failed to fetch API key");
      }
      const data = await response.json();
      return data.key || "";
    },
    enabled: !!dbName,
    retry: false, // Don't retry if 404 (no key)
  });
};

export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbName: string) => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/account/databases/${dbName}/apikey`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to generate API key");
      return response.json();
    },
    onSuccess: (data: { api_key?: string }, dbName: string) => {
      const newKey = data?.api_key || "";
      if (newKey) {
        queryClient.setQueryData(["apikey", dbName], newKey);
        queryClient.setQueryData<DataBaseType[]>(["databases"], (old) => {
          if (!old) return old;
          return old.map((db) => (db.dbName === dbName ? { ...db, apiKey: newKey } : db));
        });
      }
      queryClient.invalidateQueries({ queryKey: ["apikey", dbName] });
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("API key generated successfully");
    },
    onError: () => toast.error("Failed to generate API key"),
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dbName: string) => {
      const token = getToken();
      const response = await fetch(`${url}/api/v1/account/databases/${dbName}/apikey`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete API key");
    },
    onSuccess: (_, dbName: string) => {
      queryClient.setQueryData(["apikey", dbName], "");
      queryClient.setQueryData<DataBaseType[]>(["databases"], (old) => {
        if (!old) return old;
        return old.map((db) => (db.dbName === dbName ? { ...db, apiKey: "" } : db));
      });
      queryClient.invalidateQueries({ queryKey: ["apikey", dbName] });
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("API key deleted successfully");
    },
    onError: () => toast.error("Failed to delete API key"),
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
      queryClient.invalidateQueries({ queryKey: ["databaseDetails", dbName] });
    },
  });
};


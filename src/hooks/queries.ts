import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { url } from "@/App";
import { DataBaseType, TableType, RecordSchemaType } from "@/types/allType";
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

export const useRecords = (dbName: string | undefined, tableName: string | undefined) => {
    return useQuery({
        queryKey: ["records", dbName, tableName],
        queryFn: async (): Promise<RecordSchemaType[]> => {
            if (!dbName || !tableName) return [];
            const token = getToken();
            const response = await fetch(
                `${url}/api/v1/databases/${dbName}/tables/${tableName}/records`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error("Failed to fetch records");
            const data = await response.json();
            return data;
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
            const response = await fetch(
                `${url}/api/v1/databases/${dbName}/tables/${tableName}/schema`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
            const response = await fetch(
                `${url}/api/v1/databases/${dbName}/tables`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ table_name: tableName, schema }),
                }
            );
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
        mutationFn: async ({
            dbName,
            tableName,
        }: {
            dbName: string;
            tableName: string;
        }) => {
            const token = getToken();
            const response = await fetch(
                `${url}/api/v1/databases/${dbName}/tables/${tableName}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
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
            recordId: number;
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
            recordId: number;
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
            const response = await fetch(
                `${url}/api/v1/account/databases/${dbName}/apikey`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error("Failed to fetch API key");
            const data = await response.json();
            return data.key;
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
            const response = await fetch(
                `${url}/api/v1/account/databases/${dbName}/apikey`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to generate API key");
            return response.json();
        },
        onSuccess: (_, dbName) => {
            queryClient.invalidateQueries({ queryKey: ["apikey", dbName] });
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
            const response = await fetch(
                `${url}/api/v1/account/databases/${dbName}/apikey`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to delete API key");
        },
        onSuccess: (_, dbName) => {
            queryClient.setQueryData(["apikey", dbName], "");
            toast.success("API key deleted successfully");
        },
        onError: () => toast.error("Failed to delete API key"),
    });
};

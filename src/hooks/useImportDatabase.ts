import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/hooks/queries";
import { uploadSQLiteDatabase, validateSQLiteFile, SQLiteImportProgress } from "@/lib/sqliteImport";

interface ImportDatabaseInput {
  file: File;
  dbName: string;
  signal: AbortSignal;
  onProgress: (progress: SQLiteImportProgress) => void;
}

export function useImportDatabase() {
  const queryClient = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (input: ImportDatabaseInput) => {
      await validateSQLiteFile(input.file);
      return uploadSQLiteDatabase({ ...input, token: getToken() });
    },
    // Refresh even after an ambiguous response or cancellation. The server may
    // have committed the new database before the response was lost.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["databases"] });
    },
  });
}

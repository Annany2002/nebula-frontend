import { useEffect } from "react";
import { useQuery, QueryKey } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { getAccountSummary, isAccessError, ManagementError } from "@/lib/management";

export function useAccountSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accountSummary", user?.userId],
    queryFn: ({ signal }) => getAccountSummary(signal),
    enabled: !!user,
    staleTime: 15_000,
    gcTime: 0,
    retry: false,
  });
}

export function useAdminRead<T>(
  key: QueryKey,
  read: (signal: AbortSignal) => Promise<T>,
  onAccessError: (error: ManagementError) => void
) {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["administration", user?.userId, ...key],
    queryFn: ({ signal }) => read(signal),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (isAccessError(query.error)) onAccessError(query.error as ManagementError);
  }, [query.error, onAccessError]);
  return query;
}

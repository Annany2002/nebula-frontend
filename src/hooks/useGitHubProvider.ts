import { useQuery } from "@tanstack/react-query";
import { discoverAuthProviders } from "@/lib/github-api";

export function useGitHubProvider() {
  const { data } = useQuery({
    queryKey: ["auth-providers"],
    queryFn: ({ signal }) => discoverAuthProviders(signal),
    retry: false,
    staleTime: 60_000,
  });
  // Discovery failures and older servers leave password authentication usable.
  return data?.providers.github === true;
}

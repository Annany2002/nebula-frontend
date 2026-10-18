import { z } from "zod";
import { accountRequest, parseAccountResponse, loginResponseSchema } from "@/lib/account";

export function discoverAuthProviders(signal?: AbortSignal) {
  return accountRequest("/auth/providers", { signal }, (response) =>
    parseAccountResponse(
      response,
      z.object({ providers: z.object({ password: z.boolean(), github: z.boolean() }) })
    )
  );
}
export function startGitHubRequest(
  challenge: string,
  signal?: AbortSignal,
  link?: { token: string; password: string }
) {
  return accountRequest(
    link ? "/api/v1/account/identities/github/start" : "/auth/github/start",
    {
      method: "POST",
      signal,
      headers: link ? { Authorization: `Bearer ${link.token}` } : undefined,
      body: JSON.stringify({
        code_challenge: challenge,
        ...(link ? { current_password: link.password } : {}),
      }),
    },
    (response) =>
      parseAccountResponse(
        response,
        z.object({
          authorization_url: z.string().max(4096),
          expires_in: z.number().int().positive().max(600),
        }),
        true
      )
  );
}
export function exchangeGitHubCode(
  data: { code: string; state: string; code_verifier: string },
  mode: "sign-in" | "link"
) {
  return accountRequest(
    "/auth/github/callback",
    { method: "POST", body: JSON.stringify(data) },
    async (response) => {
      if (mode === "link") {
        // Linking revokes sessions and returns no JWT. Never interpret it as a login response.
        await parseAccountResponse(response, z.object({ message: z.string() }).strict(), true);
        return { mode: "link" as const };
      }
      return {
        mode: "sign-in" as const,
        login: await parseAccountResponse(response, loginResponseSchema, true),
      };
    }
  );
}

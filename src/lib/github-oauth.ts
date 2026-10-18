import { z } from "zod";
import { AccountError } from "@/lib/account";
import { exchangeGitHubCode, startGitHubRequest } from "@/lib/github-api";

export const githubCallbackPath = "/auth/github/callback";
const storageKey = "nebula.github-attempt.v1";
const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const digest = async (value: string) =>
  base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
// 32 bytes encoded without padding have exactly 43 characters with four significant bits in the final character.
const proof = z
  .string()
  .length(43)
  .regex(/^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/);
const pendingSchema = z
  .object({
    state: proof,
    verifier: proof,
    mode: z.enum(["sign-in", "link"]),
    expiresAt: z.number().finite(),
    userId: z.string(),
    sessionDigest: proof,
  })
  .strict();
type Pending = z.infer<typeof pendingSchema>;
export type GitHubCallbackStatus =
  { kind: "ready"; mode: Pending["mode"] } | { kind: "error"; message: string };
const freshAttempt = () =>
  new AccountError(
    "This GitHub request is missing, expired, or already used. Start again from sign in."
  );
const session = () => ({
  token: localStorage.getItem("token") || "",
  userId: localStorage.getItem("user_id") || "",
});
const sessionDigest = (value: ReturnType<typeof session>) => digest(JSON.stringify(value));
const sameSession = (value: ReturnType<typeof session>) => {
  const current = session();
  return current.token === value.token && current.userId === value.userId;
};

function hasURLControls(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 32 || code === 127;
  });
}

let starting = false;
export async function beginGitHub(signal: AbortSignal, password?: string) {
  if (starting) throw new AccountError("A GitHub request is already starting.");
  starting = true;
  try {
    const originSession = session();
    const mode = password === undefined ? "sign-in" : "link";
    if (mode === "link" && (!originSession.token || !originSession.userId || !password))
      throw new AccountError("Sign in and confirm your current password to connect GitHub.");
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const [challenge, sessionHash] = await Promise.all([
      digest(verifier),
      sessionDigest(originSession),
    ]);
    const result = await startGitHubRequest(
      challenge,
      signal,
      mode === "link" ? { token: originSession.token, password: password! } : undefined
    );
    if (hasURLControls(result.authorization_url))
      throw new AccountError("The server returned an invalid GitHub redirect.");
    const target = new URL(result.authorization_url);
    const params = target.searchParams;
    for (const name of [
      "state",
      "code_challenge",
      "code_challenge_method",
      "redirect_uri",
      "scope",
      "client_id",
    ])
      if (params.getAll(name).length !== 1)
        throw new AccountError("The server returned an invalid GitHub redirect.");
    if (
      Array.from(params.keys()).some(
        (name) =>
          ![
            "state",
            "code_challenge",
            "code_challenge_method",
            "redirect_uri",
            "scope",
            "client_id",
            "prompt",
          ].includes(name)
      )
    )
      throw new AccountError("The server returned an invalid GitHub redirect.");
    const state = proof.parse(params.get("state"));
    if (
      target.origin !== "https://github.com" ||
      target.pathname !== "/login/oauth/authorize" ||
      target.username ||
      target.password ||
      result.authorization_url.includes("#") ||
      params.get("code_challenge") !== challenge ||
      params.get("code_challenge_method") !== "S256" ||
      params.get("redirect_uri") !== window.location.origin + githubCallbackPath ||
      params.get("scope") !== "user:email" ||
      !params.get("client_id")
    )
      throw new AccountError(
        "GitHub sign-in is not configured for this application address. Contact the platform operator."
      );
    if (signal.aborted || !sameSession(originSession)) throw freshAttempt();
    const pending: Pending = {
      state,
      verifier,
      mode,
      expiresAt: Date.now() + result.expires_in * 1000,
      userId: originSession.userId,
      sessionDigest: sessionHash,
    };
    // Verify storage before leaving the tab. No passwords, JWTs, or provider tokens are persisted here.
    const encoded = JSON.stringify(pending);
    sessionStorage.setItem(storageKey, encoded);
    if (sessionStorage.getItem(storageKey) !== encoded) throw new Error("Storage unavailable");
    window.location.assign(target.href);
  } catch (error) {
    if (error instanceof AccountError) throw error;
    throw new AccountError(
      "GitHub sign-in could not start. Use a secure connection and allow storage for this tab, then try again."
    );
  } finally {
    starting = false;
  }
}

let captured: { pending: Pending; code: string } | undefined;
let status: GitHubCallbackStatus = { kind: "error", message: freshAttempt().message };
let claimed = false;
let sessionChanged = false;
const invalidateSession = (event: StorageEvent) => {
  if (
    (captured || claimed) &&
    (event.key === null || event.key === "token" || event.key === "user_id")
  )
    sessionChanged = true;
};

function captureCallback() {
  if (window.location.pathname !== githubCallbackPath) return;
  const callback = new URL(window.location.href);
  // Runs before React and analytics. A reload cannot replay a code from browser history.
  window.history.replaceState(window.history.state, "", githubCallbackPath);
  try {
    const raw = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);
    const pending = pendingSchema.parse(JSON.parse(raw || "null"));
    const state = callback.searchParams.getAll("state");
    if (
      callback.hash ||
      state.length !== 1 ||
      state[0] !== pending.state ||
      Date.now() >= pending.expiresAt ||
      pending.expiresAt > Date.now() + 600_000
    )
      throw freshAttempt();
    const codes = callback.searchParams.getAll("code");
    const errors = callback.searchParams.getAll("error");
    if (errors.length) {
      if (errors.length !== 1 || codes.length) throw freshAttempt();
      status = {
        kind: "error",
        message:
          errors[0] === "access_denied"
            ? "GitHub sign-in was cancelled. Your account has not been changed."
            : "GitHub could not authorize this request. Start again from sign in.",
      };
      return;
    }
    if (
      codes.length !== 1 ||
      codes[0].length < 1 ||
      codes[0].length > 512 ||
      /[^\x21-\x7e]/.test(codes[0])
    )
      throw freshAttempt();
    captured = { pending, code: codes[0] };
    status = { kind: "ready", mode: pending.mode };
  } catch {
    status = { kind: "error", message: freshAttempt().message };
  }
}
if (typeof window !== "undefined") {
  captureCallback();
  window.addEventListener("storage", invalidateSession);
}
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    window.removeEventListener("storage", invalidateSession);
    captured = undefined;
  });
export function getGitHubCallbackStatus() {
  return status;
}

export async function finishGitHub() {
  if (claimed || sessionChanged || !captured || status.kind !== "ready") throw freshAttempt();
  claimed = true;
  const attempt = captured;
  captured = undefined;
  const originSession = session();
  if (
    Date.now() >= attempt.pending.expiresAt ||
    originSession.userId !== attempt.pending.userId ||
    (await sessionDigest(originSession)) !== attempt.pending.sessionDigest ||
    sessionChanged ||
    !sameSession(originSession)
  )
    throw freshAttempt();
  const result = await exchangeGitHubCode(
    { code: attempt.code, state: attempt.pending.state, code_verifier: attempt.pending.verifier },
    attempt.pending.mode
  );
  if (sessionChanged || !sameSession(originSession))
    throw new AccountError("Your session changed in another tab. Start GitHub sign-in again.");
  return { ...result, isCurrentSession: () => !sessionChanged && sameSession(originSession) };
}

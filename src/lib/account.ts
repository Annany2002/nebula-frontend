import { z } from "zod";
import { url } from "@/lib/config";

export const accountEmailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(254, "Email addresses must be at most 254 characters")
  .regex(/^[\x20-\x7e]+$/, "Use a plain email address without a display name");

export const accountPasswordSchema = z
  .string()
  .refine((value) => Array.from(value).length >= 8, "Password must be at least 8 characters")
  .refine((value) => !/[\uD800-\uDFFF]/u.test(value), "Use valid Unicode characters")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password must be at most 72 UTF-8 bytes"
  );

const profileSchema = z.object({
  userId: z.string().min(1),
  username: z.string(),
  email: z.string(),
  createdAt: z.string(),
  email_verified: z.boolean().optional(),
  verification_required: z.boolean().optional(),
  pending_email: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
});
export type AccountProfile = z.infer<typeof profileSchema>;
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface SignupCredentials extends LoginCredentials {
  username: string;
}

export class AccountError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    readonly code = "",
    readonly retryAfter = 0,
    readonly outcomeUnknown = false
  ) {
    super(message);
    this.name = "AccountError";
  }
}

const messages: Record<string, string> = {
  invalid_github_oauth_request:
    "GitHub sign-in could not start. Start again from the sign-in page.",
  invalid_github_oauth_state: "This GitHub request has expired or was already used. Start again.",
  github_verified_email_required: "Verify your primary email on GitHub before trying again.",
  github_account_unavailable: "This account cannot sign in. Contact the platform operator.",
  github_account_conflict:
    "This GitHub account or email already belongs to an account. Sign in with your existing method, then connect GitHub from Your account.",
  github_oauth_rate_limited: "Too many GitHub requests. Wait before starting again.",
  github_oauth_busy: "GitHub sign-in is busy. Wait a moment, then start again.",
  github_oauth_disabled: "GitHub sign-in is not available on this server.",
  github_oauth_unavailable: "GitHub sign-in could not be confirmed. Start a fresh sign-in attempt.",
  password_reset_disabled:
    "Password recovery is not available on this server. Contact the platform operator.",
  password_reset_busy: "Password recovery is busy. Wait a moment and try again.",
  password_reset_rate_limited: "Too many recovery requests. Wait before trying again.",
  password_reset_unavailable:
    "The reset response could not be confirmed. Try signing in with your new password before requesting another link.",
  invalid_password_reset_token:
    "This reset link is invalid, expired, or already used. Request a new link.",
  invalid_password: "Use at least 8 characters and at most 72 UTF-8 bytes for your password.",
  email_verification_required: "Verify your email before signing in.",
  invalid_verification_token:
    "This link is invalid, expired, or already used. Request another email or try signing in.",
  verification_disabled:
    "Email verification is not available on this server. Contact the operator if you cannot sign in.",
  verification_busy: "Email delivery is busy. Wait a moment and try again.",
  verification_rate_limited: "Too many email requests. Wait before requesting another.",
  verification_delivery_unconfirmed:
    "Email delivery couldn’t be confirmed. Your current email remains active. Wait before trying again.",
  reauthentication_required: "Confirm your current password and try again.",
  email_conflict: "That email address is already in use. Your current email remains unchanged.",
  session_revoked: "Your sign-in details changed. Sign in again to continue.",
  account_suspended: "This account is suspended. Contact the platform operator.",
  invalid_email_change: "Update your username and email separately.",
  request_too_large: "These account details are too long. Check your entries and try again.",
  invalid_auth_request: "Check your account details and try again.",
};

function retrySeconds(value: string | null) {
  if (!value) return 0;
  const seconds = /^\d+$/.test(value) ? Number(value) : (Date.parse(value) - Date.now()) / 1000;
  return Number.isFinite(seconds) ? Math.max(0, Math.min(3600, Math.ceil(seconds))) : 0;
}

// One deadline covers headers and JSON consumption; credentials never enter query caches.
export async function accountRequest<T>(
  path: string,
  options: RequestInit,
  consume: (response: Response) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const external = options.signal;
  if (external?.aborted) throw new AccountError("Request cancelled before sending.");
  external?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 35_000);
  const write = options.method === "POST" || options.method === "PUT";
  try {
    const response = await fetch(`${url}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const code = typeof body?.code === "string" ? body.code : "";
      const unknown = write && (response.status === 408 || response.status >= 500);
      const message =
        messages[code] ||
        (response.status === 404
          ? [
              "/auth/verify-email",
              "/auth/resend-verification",
              "/auth/forgot-password",
              "/auth/reset-password",
              "/auth/providers",
              "/auth/github/start",
              "/auth/github/callback",
              "/api/v1/account/identities/github/start",
            ].includes(path)
            ? "This feature requires an updated Nebula server."
            : "Check your credentials or sign in again."
          : response.status === 429
            ? "Too many requests. Wait before trying again."
            : response.status === 409
              ? "That email address is already in use."
              : response.status === 401
                ? "Check your credentials or sign in again."
                : unknown
                  ? "The server response couldn’t be confirmed. Check your account before retrying."
                  : "This account request couldn’t be completed. Please try again.");
      throw new AccountError(
        message,
        response.status,
        code,
        retrySeconds(response.headers.get("Retry-After")),
        unknown
      );
    }
    return await consume(response);
  } catch (error) {
    if (error instanceof AccountError) throw error;
    throw new AccountError(
      path.includes("/github/")
        ? "The GitHub response couldn’t be confirmed. Start a fresh GitHub sign-in to check your account."
        : write
          ? "The response couldn’t be confirmed. The server may have completed this request. Check your email or try signing in before retrying."
          : "Couldn’t reach your account. Check your connection and try again.",
      0,
      "",
      0,
      write
    );
  } finally {
    clearTimeout(timeout);
    external?.removeEventListener("abort", abort);
  }
}

export async function parseAccountResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  write = false,
  expectedStatus = 200
): Promise<T> {
  if (response.status !== expectedStatus)
    throw new AccountError(
      "The server returned an unexpected response. Check your account before retrying.",
      response.status,
      "invalid_response",
      0,
      write
    );
  const result = schema.safeParse(await response.json().catch(() => null));
  if (!result.success)
    throw new AccountError(
      "The server returned an incomplete response. Check your account before retrying.",
      response.status,
      "invalid_response",
      0,
      write
    );
  return result.data;
}

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: profileSchema,
  message: z.string(),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

const messageSchema = z.object({ message: z.string() });
const signupSchema = z
  .object({
    user_id: z.string().min(1),
    message: z.string(),
    verification_required: z.boolean().optional(),
    verification_delivery: z.enum(["sent", "unconfirmed"]).optional(),
  })
  .refine((data) => !data.verification_required || !!data.verification_delivery);

export function signupAccount(data: SignupCredentials) {
  return accountRequest(
    "/auth/signup",
    { method: "POST", body: JSON.stringify(data) },
    (response) => parseAccountResponse(response, signupSchema, true, 201)
  );
}
export function loginAccount(data: LoginCredentials) {
  return accountRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }, (response) =>
    parseAccountResponse(response, loginResponseSchema, true)
  );
}
export function getAccountProfile(token: string, signal?: AbortSignal) {
  return accountRequest(
    "/api/v1/account/user/me",
    { headers: { Authorization: `Bearer ${token}` }, signal },
    (response) => parseAccountResponse(response, profileSchema)
  );
}
export type ProfileUpdate =
  { kind: "updated"; user: AccountProfile } | { kind: "pending"; email: string };
export function updateAccountProfile(data: {
  username?: string;
  email?: string;
  current_password?: string;
}): Promise<ProfileUpdate> {
  const token = localStorage.getItem("token");
  if (!token) return Promise.reject(new AccountError("Sign in again to update your account.", 401));
  return accountRequest(
    "/api/v1/account/user/me",
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    },
    async (response) => {
      if (response.status === 202) {
        const result = await parseAccountResponse(
          response,
          z.object({ pending_email: z.string().email(), message: z.string() }),
          true,
          202
        );
        if (result.pending_email !== data.email)
          throw new AccountError(
            "The server returned a different pending address. Refresh your profile.",
            202,
            "invalid_response",
            0,
            true
          );
        return { kind: "pending", email: result.pending_email };
      }
      if (response.status !== 200)
        throw new AccountError(
          "The profile update couldn’t be confirmed. Refresh your account.",
          response.status,
          "invalid_response",
          0,
          true
        );
      const result = await parseAccountResponse(
        response,
        z.object({ user: profileSchema, message: z.string() }),
        true
      );
      return { kind: "updated", user: result.user };
    }
  );
}
export function verifyAccountEmail(token: string) {
  return accountRequest(
    "/auth/verify-email",
    { method: "POST", body: JSON.stringify({ token }) },
    (response) => parseAccountResponse(response, messageSchema, true)
  );
}
export function resendAccountVerification(email: string) {
  return accountRequest(
    "/auth/resend-verification",
    { method: "POST", body: JSON.stringify({ email }) },
    (response) => parseAccountResponse(response, messageSchema, true, 202)
  );
}

export function requestPasswordReset(email: string) {
  return accountRequest(
    "/auth/forgot-password",
    { method: "POST", body: JSON.stringify({ email }) },
    (response) => parseAccountResponse(response, messageSchema, true, 202)
  );
}
export function resetAccountPassword(token: string, password: string) {
  return accountRequest(
    "/auth/reset-password",
    { method: "POST", body: JSON.stringify({ token, password }) },
    (response) => parseAccountResponse(response, messageSchema, true)
  );
}

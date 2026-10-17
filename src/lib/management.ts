import { z } from "zod";
import { url } from "@/lib/config";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const userSchema = z.object({
  user_id: z.string().min(1),
  username: z.string(),
  email: z.string(),
  created_at: z.string().datetime({ offset: true }),
  email_verified: z.boolean(),
  verification_required: z.boolean(),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "suspended"]),
  database_count: count,
});
const paginationSchema = z.object({
  total: count,
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().min(0).max(1_000_000),
});
const auditSchema = z.object({
  event_id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  actor_user_id: z.string().min(1),
  target_user_id: z.string().min(1),
  action: z.enum(["suspend", "activate"]),
  created_at: z.string().datetime({ offset: true }),
});
export type AdminUser = z.infer<typeof userSchema>;
export type AdminAuditEvent = z.infer<typeof auditSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export interface UserFilters {
  q?: string;
  role?: "user" | "admin";
  status?: "active" | "suspended";
}
export interface AuditFilters {
  actor_user_id?: string;
  target_user_id?: string;
  action?: "suspend" | "activate";
}
export const ADMIN_PAGE_SIZE = 20;
export const MAX_ADMIN_OFFSET = 1_000_000;

export class ManagementError extends Error {
  constructor(
    message: string,
    readonly status = 0,
    readonly code = "",
    readonly outcomeUnknown = false
  ) {
    super(message);
    this.name = "ManagementError";
  }
}

export function isAccessError(error: unknown) {
  return error instanceof ManagementError && [401, 403].includes(error.status);
}

const messages: Record<string, string> = {
  admin_required: "Administrator access is no longer available for this account.",
  admin_account_protected:
    "Administrator accounts cannot be suspended. Revoke membership through the operator CLI first.",
  account_suspended: "This account is suspended. Contact the platform operator.",
  session_revoked: "Your session has been revoked. Sign in again to continue.",
  email_verification_required: "Verify your email before continuing.",
  user_not_found: "This account no longer exists. Refresh the user list.",
  invalid_admin_query: "Check the filters and try again.",
  admin_stats_busy: "Statistics are already being collected. Try again in a moment.",
};

// Headers and response parsing share one deadline. Tokens never enter query keys or payloads.
async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
  write = false
): Promise<T> {
  const token = localStorage.getItem("token");
  if (!token) throw new ManagementError("Sign in again to continue.", 401);
  signal?.throwIfAborted();
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 15_000);
  try {
    const response = await fetch(`${url}/api/v1/${path}`, {
      method: write ? "PUT" : "GET",
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const code = typeof body?.code === "string" ? body.code : "";
      const unknown = write && (response.status === 408 || response.status >= 500);
      const message = unknown
        ? "The change couldn’t be confirmed. Reload this account to check its current status before trying again."
        : messages[code] ||
          (response.status === 401
            ? "Sign in again to continue."
            : response.status === 403
              ? "You don’t have permission to view this information."
              : response.status === 404
                ? "This feature requires an updated Nebula server."
                : response.status === 429
                  ? "Too many requests. Wait a moment before trying again."
                  : "The request couldn’t be completed. Try again.");
      throw new ManagementError(message, response.status, code, unknown);
    }
    const parsed = schema.safeParse(await response.json());
    if (response.status !== 200 || !parsed.success)
      throw new ManagementError(
        "The server returned an incomplete response. Refresh before continuing.",
        response.status,
        "invalid_response",
        write
      );
    return parsed.data;
  } catch (error) {
    if (error instanceof ManagementError) throw error;
    throw new ManagementError(
      write
        ? "The change couldn’t be confirmed. Reload this account to check its current status before trying again."
        : "Couldn’t load this information. Check your connection and try again.",
      0,
      "",
      write
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
    controller.abort();
  }
}

function pageParams(offset: number, filters: Record<string, string>) {
  if (!Number.isInteger(offset) || offset < 0 || offset > MAX_ADMIN_OFFSET)
    throw new ManagementError("Invalid page. Return to the first page.");
  const params = new URLSearchParams({ limit: String(ADMIN_PAGE_SIZE), offset: String(offset) });
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  return params;
}
function checkPage(page: Pagination, offset: number, length: number) {
  if (
    page.offset !== offset ||
    page.limit !== ADMIN_PAGE_SIZE ||
    length > ADMIN_PAGE_SIZE ||
    length > Math.max(0, page.total - offset)
  )
    throw new ManagementError(
      "The server returned an inconsistent page. Refresh before continuing.",
      200,
      "invalid_response"
    );
}
function assertAccount(user: AdminUser, id: string, status?: AdminUser["status"]) {
  if (user.user_id !== id || (status && user.status !== status))
    throw new ManagementError(
      "The returned account didn’t match this request. Reload before continuing.",
      200,
      "invalid_response",
      !!status
    );
  return user;
}
export function getAccountSummary(signal?: AbortSignal) {
  return request(
    "account/summary",
    z.object({
      summary: z.object({
        database_count: count,
        active_api_key_count: count,
        ready_backup_count: count,
      }),
    }),
    signal
  ).then((data) => data.summary);
}
export function getPlatformStats(signal?: AbortSignal) {
  return request(
    "admin/stats",
    z.object({
      stats: z
        .object({
          total_users: count,
          total_databases: count,
          total_tables: count.nullable(),
          databases_counted: count,
          databases_unavailable: count,
        })
        .refine(
          (stats) =>
            stats.databases_counted + stats.databases_unavailable === stats.total_databases &&
            (stats.databases_unavailable > 0
              ? stats.total_tables === null
              : stats.total_tables !== null)
        ),
    }),
    signal
  ).then((data) => data.stats);
}
export async function listAdminUsers(filters: UserFilters, offset: number, signal?: AbortSignal) {
  const params = pageParams(offset, { q: filters.q, role: filters.role, status: filters.status });
  const data = await request(
    `admin/users?${params}`,
    z.object({ users: z.array(userSchema).max(100), pagination: paginationSchema }),
    signal
  );
  checkPage(data.pagination, offset, data.users.length);
  return data;
}
export async function getAdminUser(id: string, signal?: AbortSignal) {
  const data = await request(
    `admin/users/${encodeURIComponent(id)}`,
    z.object({ user: userSchema }),
    signal
  );
  return assertAccount(data.user, id);
}
export async function setAdminUserStatus(id: string, status: AdminUser["status"]) {
  const action = status === "suspended" ? "suspend" : "activate";
  const data = await request(
    `admin/users/${encodeURIComponent(id)}/${action}`,
    z.object({ user: userSchema }),
    undefined,
    true
  );
  return assertAccount(data.user, id, status);
}
export async function listAdminAudit(filters: AuditFilters, offset: number, signal?: AbortSignal) {
  const params = pageParams(offset, { ...filters });
  const data = await request(
    `admin/audit-events?${params}`,
    z.object({ events: z.array(auditSchema).max(100), pagination: paginationSchema }),
    signal
  );
  checkPage(data.pagination, offset, data.events.length);
  return data;
}

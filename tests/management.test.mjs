import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { before, after, afterEach, test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
let server, management, account, cacheDir;
const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const user = {
  user_id: "fixture-owner",
  username: "fixture",
  email: "owner@example.test",
  created_at: "2026-10-17T09:00:00Z",
  email_verified: false,
  verification_required: false,
  role: "user",
  status: "active",
  database_count: 1,
};
const pagination = { total: 1, limit: 20, offset: 0 };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
before(async () => {
  cacheDir = await mkdtemp(path.join(tmpdir(), "nebula-management-tests-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir,
    logLevel: "silent",
    server: { middlewareMode: true, hmr: false, watch: null },
    resolve: { alias: { "@": path.join(root, "src") } },
  });
  management = await server.ssrLoadModule("/src/lib/management.ts");
  account = await server.ssrLoadModule("/src/lib/account.ts");
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else delete globalThis.localStorage;
});
after(async () => {
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
});
const session = () => {
  globalThis.localStorage = { getItem: () => "fixture-token" };
};

test("profile preserves explicit role, rejects unknown roles and tolerates old servers", async () => {
  const profile = {
    userId: user.user_id,
    username: user.username,
    email: user.email,
    createdAt: user.created_at,
  };
  for (const role of [undefined, "user", "admin"]) {
    globalThis.fetch = async () => json({ ...profile, role });
    assert.equal((await account.getAccountProfile("token")).role, role);
  }
  globalThis.fetch = async () => json({ ...profile, role: "owner" });
  await assert.rejects(account.getAccountProfile("token"), { code: "invalid_response" });
});

test("filters are encoded literally and pages must match the requested contract", async () => {
  session();
  globalThis.fetch = async (endpoint, options) => {
    const target = new URL(endpoint);
    assert.equal(target.pathname, "/api/v1/admin/users");
    assert.equal(target.searchParams.get("q"), "build_%\\&team");
    assert.equal(target.searchParams.get("role"), "user");
    assert.equal(options.headers.Authorization, "Bearer fixture-token");
    assert.equal(options.cache, "no-store");
    assert.equal(options.credentials, "omit");
    return json({ users: [{ ...user, password_hash: "private" }], pagination });
  };
  const page = await management.listAdminUsers({ q: "build_%\\&team", role: "user" }, 0);
  assert.equal(page.users[0].password_hash, undefined);
  for (const invalid of [
    { users: [user], pagination: { ...pagination, offset: 20 } },
    { users: [user], pagination: { ...pagination, total: 0 } },
    { users: [{ ...user, role: "owner" }], pagination },
    { users: null, pagination },
  ]) {
    globalThis.fetch = async () => json(invalid);
    await assert.rejects(management.listAdminUsers({}, 0), { code: "invalid_response" });
  }
});

test("summary is owner scoped and rejects negative or missing counts", async () => {
  session();
  const summary = { database_count: 1, active_api_key_count: 0, ready_backup_count: 2 };
  globalThis.fetch = async (endpoint) => {
    assert.equal(new URL(endpoint).search, "");
    return json({ summary });
  };
  assert.deepEqual(await management.getAccountSummary(), summary);
  globalThis.fetch = async () => json({ summary: { ...summary, ready_backup_count: -1 } });
  await assert.rejects(management.getAccountSummary(), { code: "invalid_response" });
});

test("incomplete table counts stay null and statistics must report completeness consistently", async () => {
  session();
  const stats = {
    total_users: 3,
    total_databases: 2,
    total_tables: null,
    databases_counted: 1,
    databases_unavailable: 1,
  };
  globalThis.fetch = async () => json({ stats });
  assert.equal((await management.getPlatformStats()).total_tables, null);
  globalThis.fetch = async () => json({ stats: { ...stats, total_tables: 0 } });
  await assert.rejects(management.getPlatformStats(), { code: "invalid_response" });
});

test("writes validate account identity and desired state, without replaying uncertain requests", async () => {
  session();
  let calls = 0;
  globalThis.fetch = async (endpoint, options) => {
    calls++;
    assert.equal(new URL(endpoint).pathname, "/api/v1/admin/users/account%2Fname/suspend");
    assert.equal(options.method, "PUT");
    assert.equal(options.body, undefined);
    return json({ user: { ...user, user_id: "account/name", status: "suspended" } });
  };
  assert.equal(
    (await management.setAdminUserStatus("account/name", "suspended")).status,
    "suspended"
  );
  assert.equal(calls, 1);
  for (const result of [
    { user },
    { user: { ...user, user_id: "different", status: "suspended" } },
  ]) {
    globalThis.fetch = async () => json(result);
    await assert.rejects(management.setAdminUserStatus(user.user_id, "suspended"), {
      outcomeUnknown: true,
    });
  }
  calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("offline");
  };
  await assert.rejects(management.setAdminUserStatus(user.user_id, "active"), {
    outcomeUnknown: true,
  });
  assert.equal(calls, 1);
});

test("authorization and protected-account errors retain codes without exposing raw server output", async () => {
  session();
  for (const [status, code, unknown] of [
    [403, "admin_required", false],
    [401, "session_revoked", false],
    [409, "admin_account_protected", false],
    [503, "admin_unavailable", true],
  ]) {
    globalThis.fetch = async () => json({ code, error: "sensitive SQL output" }, status);
    await assert.rejects(management.setAdminUserStatus(user.user_id, "suspended"), (error) => {
      assert.equal(error.status, status);
      assert.equal(error.code, code);
      assert.equal(error.outcomeUnknown, unknown);
      assert.doesNotMatch(error.message, /sensitive SQL/);
      return true;
    });
  }
});

test("audit filters and pagination preserve deleted account IDs and omit sensitive fields", async () => {
  session();
  globalThis.fetch = async (endpoint) => {
    const target = new URL(endpoint);
    assert.equal(target.searchParams.get("actor_user_id"), "deleted+actor");
    assert.equal(target.searchParams.get("action"), "suspend");
    return json({
      events: [
        {
          event_id: 1,
          actor_user_id: "deleted+actor",
          target_user_id: "deleted-target",
          action: "suspend",
          created_at: user.created_at,
          email: "private",
        },
      ],
      pagination,
    });
  };
  const result = await management.listAdminAudit(
    { actor_user_id: "deleted+actor", action: "suspend" },
    0
  );
  assert.equal(result.events[0].email, undefined);
  globalThis.fetch = async () =>
    json({ events: [], pagination: { total: 0, limit: 20, offset: 0 } });
  assert.deepEqual((await management.listAdminAudit({}, 0)).events, []);
});

test("absent sessions, cancelled requests and invalid pages do not send any request", async () => {
  globalThis.fetch = async () => assert.fail("Request must not start");
  globalThis.localStorage = { getItem: () => null };
  await assert.rejects(management.getPlatformStats(), { status: 401 });
  session();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(management.getAccountSummary(controller.signal));
  for (const offset of [-1, 1.2, 1_000_001])
    await assert.rejects(management.listAdminUsers({}, offset));
});

test("deadline covers JSON consumption and failed writes remain uncertain", async (t) => {
  session();
  t.mock.timers.enable({ apis: ["setTimeout"] });
  globalThis.fetch = async (_endpoint, { signal }) => ({
    ok: true,
    status: 200,
    json: () =>
      new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(new Error("deadline")))
      ),
  });
  const result = assert.rejects(management.setAdminUserStatus(user.user_id, "suspended"), {
    outcomeUnknown: true,
  });
  await nextTurn();
  t.mock.timers.tick(15_000);
  await result;
});

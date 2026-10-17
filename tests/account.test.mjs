import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { before, after, afterEach, test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
let server, account, cacheDir;
const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const originalWindow = globalThis.window;
const profile = {
  userId: "fixture-owner",
  username: "fixture",
  email: "owner@example.test",
  createdAt: "2026-10-10T00:00:00Z",
};
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers });

before(async () => {
  // Use Vite's existing TS/alias loader without a listener, browser, or production build.
  cacheDir = await mkdtemp(path.join(tmpdir(), "nebula-account-tests-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir,
    logLevel: "silent",
    server: { middlewareMode: true, hmr: false, watch: null },
    resolve: { alias: { "@": path.join(root, "src") } },
  });
  account = await server.ssrLoadModule("/src/lib/account.ts");
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else delete globalThis.localStorage;
  globalThis.window = originalWindow;
});
after(async () => {
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
});

test("signup accepts legacy and verification-required contracts", async () => {
  const credentials = {
    email: profile.email,
    username: profile.username,
    password: "fixture-password",
  };
  globalThis.fetch = async (endpoint, options) => {
    assert.equal(endpoint, "http://localhost:8080/auth/signup");
    assert.equal(options.cache, "no-store");
    assert.equal(options.credentials, "omit");
    assert.deepEqual(JSON.parse(options.body), credentials);
    return json({ user_id: profile.userId, message: "Created" }, 201);
  };
  assert.equal((await account.signupAccount(credentials)).verification_required, undefined);
  globalThis.fetch = async () =>
    json(
      {
        user_id: profile.userId,
        message: "Created",
        verification_required: true,
        verification_delivery: "unconfirmed",
      },
      201
    );
  assert.equal((await account.signupAccount(credentials)).verification_delivery, "unconfirmed");
  globalThis.fetch = async () =>
    json({ user_id: profile.userId, message: "Created", verification_required: true }, 201);
  await assert.rejects(account.signupAccount(credentials), {
    code: "invalid_response",
    outcomeUnknown: true,
  });
});

test("profiles accept omitted legacy fields and drop sensitive fields", async () => {
  globalThis.fetch = async () =>
    json({ ...profile, password_hash: "must-not-escape", session_version: 4 });
  const result = await account.getAccountProfile("fixture-token");
  assert.deepEqual(result, profile);
});

test("email changes distinguish pending and immediate updates", async () => {
  globalThis.localStorage = { getItem: () => "fixture-token" };
  globalThis.fetch = async (_endpoint, options) => {
    assert.deepEqual(JSON.parse(options.body), {
      email: "new@example.test",
      current_password: "fixture-password",
    });
    return json({ pending_email: "new@example.test", message: "Confirm" }, 202);
  };
  assert.deepEqual(
    await account.updateAccountProfile({
      email: "new@example.test",
      current_password: "fixture-password",
    }),
    { kind: "pending", email: "new@example.test" }
  );
  globalThis.fetch = async () =>
    json({ user: { ...profile, email: "new@example.test" }, message: "Updated" });
  assert.equal((await account.updateAccountProfile({ email: "new@example.test" })).kind, "updated");
  globalThis.fetch = async () =>
    json({ pending_email: "other@example.test", message: "Confirm" }, 202);
  await assert.rejects(account.updateAccountProfile({ email: "new@example.test" }), {
    code: "invalid_response",
    outcomeUnknown: true,
  });
});

test("email changes refuse to send without a session", async () => {
  globalThis.localStorage = { getItem: () => null };
  globalThis.fetch = async () => {
    assert.fail("Unauthenticated request sent");
  };
  await assert.rejects(account.updateAccountProfile({ email: "new@example.test" }), {
    status: 401,
  });
});

test("verification sends a token only in a POST body and requires confirmed success", async () => {
  globalThis.fetch = async (endpoint, options) => {
    assert.equal(endpoint, "http://localhost:8080/auth/verify-email");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { token: "fixture-token" });
    return json({ message: "Verified" });
  };
  await account.verifyAccountEmail("fixture-token");
  globalThis.fetch = async () => json({ message: "Queued" }, 202);
  await assert.rejects(account.verifyAccountEmail("fixture-token"), { code: "invalid_response" });
});

test("resend accepts 202 and treats a malformed acknowledgement as uncertain", async () => {
  globalThis.fetch = async () => json({ message: "If eligible" }, 202);
  await account.resendAccountVerification(profile.email);
  globalThis.fetch = async () => json({}, 202);
  await assert.rejects(account.resendAccountVerification(profile.email), {
    code: "invalid_response",
    outcomeUnknown: true,
  });
});

test("server codes and persistent Retry-After are preserved without reflecting raw errors", async () => {
  globalThis.fetch = async () =>
    json({ code: "verification_rate_limited", error: "raw sensitive output" }, 429, {
      "Retry-After": "3240",
    });
  await assert.rejects(account.resendAccountVerification(profile.email), (error) => {
    assert.equal(error.retryAfter, 3240);
    assert.equal(error.status, 429);
    assert.doesNotMatch(error.message, /raw sensitive/);
    return true;
  });
  globalThis.fetch = async () => json({ code: "email_verification_required" }, 403);
  await assert.rejects(
    account.loginAccount({ email: profile.email, password: "fixture-password" }),
    { code: "email_verification_required" }
  );
});

test("unsupported servers, replay, and network failures remain distinct", async () => {
  globalThis.fetch = async () => json({}, 404);
  await assert.rejects(account.resendAccountVerification(profile.email), { status: 404 });
  await assert.rejects(
    account.loginAccount({ email: profile.email, password: "fixture-password" }),
    (error) => {
      assert.equal(error.status, 404);
      assert.doesNotMatch(error.message, /updated.*server/);
      return true;
    }
  );
  globalThis.fetch = async () => json({ code: "invalid_verification_token" }, 400);
  await assert.rejects(account.verifyAccountEmail("used-token"), {
    code: "invalid_verification_token",
    outcomeUnknown: false,
  });
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  await assert.rejects(account.verifyAccountEmail("fixture-token"), { outcomeUnknown: true });
});

test("a cancelled request never starts and body consumption retains the deadline", async (t) => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async () => {
    assert.fail("Cancelled request sent");
  };
  await assert.rejects(account.getAccountProfile("fixture-token", controller.signal));
  t.mock.timers.enable({ apis: ["setTimeout"] });
  globalThis.fetch = async (_endpoint, { signal }) => ({
    ok: true,
    status: 200,
    json: () =>
      new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(new Error("deadline")))
      ),
  });
  const result = account.getAccountProfile("fixture-token");
  const rejected = assert.rejects(result, { code: "invalid_response" });
  await nextTurn();
  t.mock.timers.tick(35_000);
  await rejected;
});

test("verification bootstrap removes secrets before mounting without persisting them", async () => {
  const token = "A".repeat(43);
  for (const [index, hash, search, expectedToken, invalid] of [
    [0, `#token=${token}`, "", token, false],
    [1, "#token=bad", "", "", true],
    [2, `#token=${token}&token=${token}`, "", "", true],
    [3, "", `?token=${token}&from=email`, "", true],
    [4, "", "", "", false],
  ]) {
    let cleanURL;
    globalThis.window = {
      addEventListener() {},
      removeEventListener() {},
      location: { pathname: "/verify-email", hash, search },
      history: {
        state: null,
        replaceState: (_state, _unused, nextURL) => {
          cleanURL = nextURL;
        },
      },
    };
    const link = await server.ssrLoadModule(`/src/lib/verificationLink.ts?fixture=${index}`);
    assert.deepEqual(link.getVerificationLink(), { token: expectedToken, invalid });
    assert.equal(
      cleanURL,
      index === 4 ? undefined : index === 3 ? "/verify-email?from=email" : "/verify-email"
    );
    if (cleanURL) assert.doesNotMatch(cleanURL, /token=/);
    link.forgetVerificationLink();
    assert.deepEqual(link.getVerificationLink(), { token: "", invalid: false });
  }
});

test("same-tab links survive paired popstate and hashchange events", async () => {
  const events = new Map();
  const token = "B".repeat(43);
  globalThis.window = {
    location: { pathname: "/sign-up", hash: "", search: "" },
    history: {
      state: null,
      replaceState() {
        globalThis.window.location.hash = "";
      },
    },
    addEventListener: (name, callback) => events.set(name, callback),
    removeEventListener() {},
  };
  const link = await server.ssrLoadModule("/src/lib/verificationLink.ts?fixture=navigation");
  let updates = 0;
  const unsubscribe = link.subscribeVerificationLink(() => updates++);
  globalThis.window.location.pathname = "/verify-email";
  globalThis.window.location.hash = `#token=${token}`;
  events.get("popstate")();
  const snapshot = link.getVerificationLink();
  events.get("hashchange")();
  assert.equal(link.getVerificationLink(), snapshot);
  assert.equal(snapshot.token, token);
  assert.equal(updates, 1);
  link.forgetVerificationLink();
  assert.equal(updates, 2);
  unsubscribe();
});

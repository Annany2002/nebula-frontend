import assert from "node:assert/strict";
import { webcrypto, createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { before, after, afterEach, test } from "node:test";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const keys = ["window", "sessionStorage", "localStorage", "fetch", "crypto"];
const originals = new Map(
  keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)])
);
let server, cacheDir;
const origin = "http://localhost:3000";
const state = Buffer.alloc(32, 5).toString("base64url");
const sha = (value) => createHash("sha256").update(value).digest("base64url");
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers });
function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}
function setup(callback = "", pending = null, identity = { token: "", userId: "" }) {
  const location = new URL(origin + (callback || "/sign-in"));
  const assigned = [];
  location.assign = (target) => assigned.push(target);
  const events = new EventTarget();
  globalThis.window = {
    location,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
    history: {
      state: null,
      replaceState: (_state, _title, target) => {
        globalThis.window.location = new URL(target, origin);
      },
    },
  };
  globalThis.localStorage = storage({ token: identity.token, user_id: identity.userId });
  globalThis.sessionStorage = storage(
    pending ? { "nebula.github-attempt.v1": JSON.stringify(pending) } : {}
  );
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: webcrypto });
  return assigned;
}
function pending(overrides = {}, identity = { token: "", userId: "" }) {
  return {
    state,
    verifier: Buffer.alloc(32, 7).toString("base64url"),
    mode: "sign-in",
    expiresAt: Date.now() + 590_000,
    userId: identity.userId,
    sessionDigest: sha(JSON.stringify(identity)),
    ...overrides,
  };
}
async function load() {
  server.moduleGraph.invalidateAll();
  return server.ssrLoadModule("/src/lib/github-oauth.ts");
}
function authorization(challenge, overrides = {}) {
  const target = new URL("https://github.com/login/oauth/authorize");
  target.search = new URLSearchParams({
    client_id: "fixture",
    redirect_uri: origin + "/auth/github/callback",
    scope: "user:email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    ...overrides,
  });
  return target.href;
}
before(async () => {
  cacheDir = await mkdtemp(path.join(tmpdir(), "nebula-github-tests-"));
  server = await createServer({
    configFile: false,
    root,
    cacheDir,
    logLevel: "silent",
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, watch: null },
    resolve: { alias: { "@": path.join(root, "src") } },
  });
});
afterEach(() => {
  for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});
after(async () => {
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
});

test("start creates a fresh S256 proof and persists only tab-scoped attempt data", async () => {
  const assigned = setup();
  const github = await load();
  let challenge;
  globalThis.fetch = async (endpoint, options) => {
    assert.equal(endpoint, "http://localhost:8080/auth/github/start");
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, undefined);
    const body = JSON.parse(options.body);
    challenge = body.code_challenge;
    assert.deepEqual(Object.keys(body), ["code_challenge"]);
    return json({ authorization_url: authorization(challenge), expires_in: 600 });
  };
  await github.beginGitHub(new AbortController().signal);
  const saved = JSON.parse(sessionStorage.getItem("nebula.github-attempt.v1"));
  assert.equal(sha(saved.verifier), challenge);
  assert.equal(saved.state, state);
  assert.equal(saved.mode, "sign-in");
  assert.equal(assigned.length, 1);
  assert.equal(saved.token, undefined);
  assert.equal(saved.password, undefined);
  const verifier = saved.verifier;
  await github.beginGitHub(new AbortController().signal);
  assert.notEqual(
    JSON.parse(sessionStorage.getItem("nebula.github-attempt.v1")).verifier,
    verifier
  );
});
test("unsafe redirect, incorrect PKCE, duplicate state and unavailable tab storage fail closed", async () => {
  for (const bad of [
    "host",
    "redirect",
    "proof",
    "duplicate",
    "storage",
    "state-newline",
    "url-newline",
  ]) {
    const assigned = setup();
    const github = await load();
    globalThis.fetch = async (_endpoint, options) => {
      const challenge = JSON.parse(options.body).code_challenge;
      let target = authorization(challenge);
      if (bad === "host") target = target.replace("github.com", "github.com.evil.test");
      if (bad === "redirect")
        target = authorization(challenge, {
          redirect_uri: "https://other.test/auth/github/callback",
        });
      if (bad === "proof") target = authorization("wrong");
      if (bad === "duplicate") target += "&state=" + state;
      if (bad === "url-newline") target = target.replace("github.com", "git\nhub.com");
      if (bad === "state-newline") target = authorization(challenge, { state: state + "\n" });
      if (bad === "storage")
        sessionStorage.setItem = () => {
          throw new Error("blocked");
        };
      return json({ authorization_url: target, expires_in: 600 });
    };
    await assert.rejects(github.beginGitHub(new AbortController().signal));
    assert.deepEqual(assigned, []);
  }
});
test("link start sends the owner JWT and password only to its protected endpoint", async () => {
  const identity = { token: "fixture-jwt", userId: "owner" };
  const assigned = setup("", null, identity);
  const github = await load();
  globalThis.fetch = async (endpoint, options) => {
    assert.equal(endpoint, "http://localhost:8080/api/v1/account/identities/github/start");
    assert.equal(options.headers.Authorization, "Bearer fixture-jwt");
    const body = JSON.parse(options.body);
    assert.equal(body.current_password, "fixture-password");
    return json({ authorization_url: authorization(body.code_challenge), expires_in: 600 });
  };
  await github.beginGitHub(new AbortController().signal, "fixture-password");
  const serialized = sessionStorage.getItem("nebula.github-attempt.v1");
  assert.equal(JSON.parse(serialized).mode, "link");
  assert(!serialized.includes("fixture-jwt"));
  assert(!serialized.includes("fixture-password"));
  assert.equal(assigned.length, 1);
});
test("callback scrubs secrets and consumes pending storage before any explicit exchange", async () => {
  const saved = pending();
  setup("/auth/github/callback?code=fixture-code&state=" + state, saved);
  let calls = 0;
  globalThis.fetch = async (_endpoint, options) => {
    calls++;
    assert.equal(options.headers.Authorization, undefined);
    assert.deepEqual(JSON.parse(options.body), {
      code: "fixture-code",
      state,
      code_verifier: saved.verifier,
    });
    return json({
      token: "fixture-session",
      message: "Logged in",
      user: {
        userId: "new-owner",
        username: "fixture",
        email: "fixture@example.test",
        createdAt: "2026-10-18",
      },
      provider_token: "never-return",
    });
  };
  const github = await load();
  assert.equal(window.location.href, origin + "/auth/github/callback");
  assert.equal(sessionStorage.getItem("nebula.github-attempt.v1"), null);
  assert.deepEqual(github.getGitHubCallbackStatus(), { kind: "ready", mode: "sign-in" });
  assert.equal(calls, 0);
  const result = await github.finishGitHub();
  assert.equal(result.mode, "sign-in");
  assert.equal(result.login.provider_token, undefined);
  await assert.rejects(github.finishGitHub());
  assert.equal(calls, 1);
  const reload = await load();
  await assert.rejects(reload.finishGitHub());
  assert.equal(calls, 1);
});
test("invalid, missing, expired, denied and duplicate callback parameters never send codes", async () => {
  const cases = [
    ["?code=x%0A&state=" + state, pending()],
    ["?code=x&state=" + state, null],
    ["?code=x&state=wrong", pending()],
    ["?code=x&state=" + state, pending({ expiresAt: Date.now() - 1 })],
    ["?code=x&state=" + state + "&state=" + state, pending()],
    ["?code=x&code=y&state=" + state, pending()],
    ["?error=access_denied&state=" + state, pending()],
    ["?error=access_denied&code=x&state=" + state, pending()],
    ["?code=x&state=" + state + "#unexpected", pending()],
  ];
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("Must not send");
  };
  for (const [query, saved] of cases) {
    setup("/auth/github/callback" + query, saved);
    const github = await load();
    assert.equal(window.location.search, "");
    assert.equal(window.location.hash, "");
    assert.equal(github.getGitHubCallbackStatus().kind, "error");
    await assert.rejects(github.finishGitHub());
  }
  assert.equal(calls, 0);
});
test("session changes before exchange and in-flight exchanges cannot replace a different account", async () => {
  setup("/auth/github/callback?code=x&state=" + state, pending());
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("Must not send");
  };
  let github = await load();
  localStorage.setItem("token", "different-session");
  await assert.rejects(github.finishGitHub());
  assert.equal(calls, 0);
  setup("/auth/github/callback?code=x&state=" + state, pending());
  github = await load();
  globalThis.fetch = async () => {
    localStorage.setItem("token", "different-session");
    return json({
      message: "OK",
      token: "new-session",
      user: {
        userId: "owner",
        username: "fixture",
        email: "fixture@example.test",
        createdAt: "today",
      },
    });
  };
  await assert.rejects(github.finishGitHub(), /session changed/);
});
test("uncertain exchanges, conflicts and malformed responses never retry and keep safe errors", async () => {
  for (const kind of ["network", "conflict", "malformed"]) {
    setup("/auth/github/callback?code=x&state=" + state, pending());
    const github = await load();
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      if (kind === "network") throw new Error("provider-secret");
      if (kind === "conflict")
        return json({ code: "github_account_conflict", error: "provider-secret" }, 409);
      return json({ message: "incomplete" });
    };
    await assert.rejects(github.finishGitHub(), (error) => {
      assert(!error.message.includes("provider-secret"));
      assert.equal(error.outcomeUnknown, kind !== "conflict");
      return true;
    });
    await assert.rejects(github.finishGitHub());
    assert.equal(calls, 1);
  }
});
test("link completion accepts message-only responses and refuses a login-shaped result", async () => {
  const identity = { token: "fixture-jwt", userId: "owner" };
  setup(
    "/auth/github/callback?code=x&state=" + state,
    pending({ mode: "link" }, identity),
    identity
  );
  let github = await load();
  globalThis.fetch = async () => json({ message: "Linked" });
  assert.equal((await github.finishGitHub()).mode, "link");
  setup(
    "/auth/github/callback?code=x&state=" + state,
    pending({ mode: "link" }, identity),
    identity
  );
  github = await load();
  globalThis.fetch = async () => json({ message: "Linked", token: "unexpected" });
  await assert.rejects(github.finishGitHub(), { code: "invalid_response", outcomeUnknown: true });
});

test("a cross-tab session change remains invalid even when stored values change back", async () => {
  setup("/auth/github/callback?code=x&state=" + state, pending());
  const github = await load();
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("Must not send");
  };
  const changed = new Event("storage");
  Object.defineProperty(changed, "key", { value: "token" });
  window.dispatchEvent(changed);
  await assert.rejects(github.finishGitHub());
  assert.equal(calls, 0);
});

test("aborted starts cannot persist a proof or leave the application", async () => {
  const assigned = setup();
  const github = await load();
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("Must not send");
  };
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(github.beginGitHub(controller.signal));
  assert.equal(calls, 0);
  assert.deepEqual(assigned, []);
  assert.equal(sessionStorage.getItem("nebula.github-attempt.v1"), null);
});

test("provider discovery is public and rate limits preserve safe retry information", async () => {
  setup();
  server.moduleGraph.invalidateAll();
  const api = await server.ssrLoadModule("/src/lib/github-api.ts");
  let calls = 0;
  globalThis.fetch = async (endpoint, options) => {
    calls++;
    assert.equal(endpoint, "http://localhost:8080/auth/providers");
    assert.equal(options.headers.Authorization, undefined);
    return json({ providers: { password: true, github: false }, client_secret: "must-not-escape" });
  };
  assert.deepEqual(await api.discoverAuthProviders(), {
    providers: { password: true, github: false },
  });
  assert.equal(calls, 1);
  globalThis.fetch = async () =>
    json({ code: "github_oauth_rate_limited", error: "unsafe-details" }, 429, {
      "Retry-After": "600",
    });
  await assert.rejects(
    api.startGitHubRequest(state),
    (error) =>
      error.retryAfter === 600 &&
      error.code === "github_oauth_rate_limited" &&
      !error.message.includes("unsafe-details")
  );
});

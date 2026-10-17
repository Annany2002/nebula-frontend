// Capture before React/analytics mount. Never persist or forward a link token in a URL.
let link = { token: "", invalid: false };
const listeners = new Set<() => void>();

function captureVerificationLink() {
  if (!/^\/verify-email\/?$/.test(window.location.pathname)) return;
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);
  if (!window.location.hash && !query.has("token")) return;
  const values = fragment.getAll("token");
  const candidate = values.length === 1 ? values[0] : "";
  const token = /^[a-zA-Z0-9_-]{43}$/.test(candidate) ? candidate : "";
  const invalid = (fragment.has("token") && !token) || query.has("token");
  query.delete("token");
  const search = query.toString();
  window.history.replaceState(
    window.history.state,
    "",
    "/verify-email" + (search ? `?${search}` : "")
  );
  link = { token, invalid };
  listeners.forEach((listener) => listener());
}
captureVerificationLink();
// Email links can also arrive as same-document hash navigations in an existing tab.
window.addEventListener("hashchange", captureVerificationLink);
window.addEventListener("popstate", captureVerificationLink);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    window.removeEventListener("hashchange", captureVerificationLink);
    window.removeEventListener("popstate", captureVerificationLink);
  });

export function getVerificationLink() {
  return link;
}
export function subscribeVerificationLink(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function forgetVerificationLink() {
  link = { token: "", invalid: false };
  listeners.forEach((listener) => listener());
}

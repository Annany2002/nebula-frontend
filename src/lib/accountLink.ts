// Capture account-action secrets before React and analytics mount. Store them only in memory.
export function createAccountLinkStore(path: string) {
  let link = { token: "", invalid: false };
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const capture = () => {
    if (window.location.pathname.replace(/\/$/, "") !== path) return;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    if (!window.location.hash && !query.has("token")) return;
    const values = fragment.getAll("token");
    const candidate = values.length === 1 ? values[0] : "";
    const token = /^[a-zA-Z0-9_-]{43}$/.test(candidate) && !query.has("token") ? candidate : "";
    const invalid = (fragment.has("token") && !token) || query.has("token");
    query.delete("token");
    const search = query.toString();
    window.history.replaceState(window.history.state, "", path + (search ? `?${search}` : ""));
    link = { token, invalid };
    notify();
  };
  capture();
  window.addEventListener("hashchange", capture);
  window.addEventListener("popstate", capture);
  return {
    get: () => link,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    forget() {
      link = { token: "", invalid: false };
      notify();
    },
    dispose() {
      window.removeEventListener("hashchange", capture);
      window.removeEventListener("popstate", capture);
    },
  };
}

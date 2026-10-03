export function apiKeyPrefix(key: string) {
  return `${key.slice(0, key.startsWith("neb_live_") ? 17 : 12)}...`;
}

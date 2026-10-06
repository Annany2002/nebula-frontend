export const isProtectedIndexTarget = (name: string) => /^(sqlite_|_nebula_)/i.test(name);

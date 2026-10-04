export const url = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8080";

export const docsUrl =
  (import.meta.env.VITE_DOCS_URL as string | undefined)?.trim() ||
  "https://github.com/Annany2002/nebula-backend/blob/main/docs/api-reference/overview.mdx";

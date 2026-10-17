# Contributing to Nebula Frontend

This repository contains the React/TypeScript web interface for [Nebula](https://github.com/Annany2002/nebula-backend). Keep changes focused, preserve existing behavior and update public documentation when workflows or backend requirements change.

## Local development

Use Node.js/npm and a running backend. Install the locked dependencies and configure the backend origin:

```bash
npm ci
cp .env.example .env.local
# Set VITE_BACKEND_URL=http://localhost:8080.
npm run dev
```

Open `http://localhost:3000`. Frontend environment variables are public; do not include SMTP credentials, JWT signing secrets or npm tokens. For account email testing, use the backend's `./scripts/dev-email.sh` runner and local inbox at `http://localhost:8025`.

## Verification

```bash
npm test
npm run check
```

Use type, lint and formatting checks during development. Check changed pages in light/dark themes and at mobile/desktop widths. Verify keyboard access, focus, input validation, loading/empty/error states and reduced motion. Authentication changes also need live backend coverage for expired sessions, invalid links, throttling and uncertain write outcomes. Keep recovery tokens and passwords out of URLs, storage, analytics, query caches and diagnostic output.

Use existing UI components and theme tokens. Derive database workspace tabs from exact route segments instead of synchronizing URL state through effects. Do not change unrelated shared layout to address a focused UI issue.

## Pull requests

Create a focused branch from current `origin/main`. Use conventional commit messages and describe the user-visible change, tests and any backend deployment dependency. Use the [PR template](.github/ISSUE_TEMPLATE/PULL_REQUEST_TEMPLATE.md). Report bugs and proposals through [GitHub issues](https://github.com/Annany2002/nebula-frontend/issues).

Keep backend contracts and SDK examples aligned. An opt-in server feature should remain disabled until compatible frontend routes are deployed. Update [README.md](README.md) for configuration, route or feature changes. Do not include runtime data or credentials in the pull request.

## License

Contributions are licensed under [MIT](LICENSE).

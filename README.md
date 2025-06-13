# Nebula Frontend

This repository contains the frontend web application for the **Nebula BaaS** project. It provides a modern, user-friendly interface for interacting with the backend API to manage databases, schemas, API keys, and data.

---

## Built With

- **Framework:** React
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI

---

## Features

- 🚪 Signup / Login UI with JWT-based authentication
- 📊 Dashboard for managing:
  - Databases
  - Tables (with column schema definition)
  - API Keys
- 🔐 Secure API Key generation and management
- ⚡️ Fast, modern DX with Vite + HMR
- 🌙 Dark mode (Shadcn-powered)

---

## Prerequisites

- Node.js (v18 or v20+ recommended)
- npm or yarn
- A running instance of the [Nebula Backend](https://github.com/Annany2002/nebula-backend)

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Annany2002/nebula-frontend.git
cd nebula-frontend
```

Install dependencies:

```bash
npm install
# OR
yarn install
```

Configure backend URL:

```bash
cp .env.example .env.local
# Edit `.env.local` and set:
```

Start development server:

```bash
npm run dev
```

App runs at: [http://localhost:5173](http://localhost:5173)

---

## Building for Production

Set production backend URL in `.env.production.local`, then run:

```bash
npm run build
```

Output goes to `dist/` – ready to deploy to Netlify, Vercel, S3, etc.

---

## Backend Integration

- Communicates with backend via `VITE_NEBULA_API_BASE_URL`
- Handles:

  - Signup/Login → receives JWT
  - API Key actions → uses `Authorization: ApiKey <key>`

- Ensure backend CORS is configured to allow frontend origin

---

## Contributing

We welcome contributions!
Please check out the following before opening an issue or PR:

- [📜 Contribution Guide](./CONTRIBUTING.md)
- [🐞 Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yaml)
- [✨ Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yaml)
- [🔁 Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md)

To begin:

```bash
# Fork + Clone
# Create a new branch
git checkout -b feat/improve-auth-ui

# After changes:
npm run lint   # Check code style
npm run dev    # Run locally
```

---

## Testing

We encourage testing UI changes manually for visual accuracy.
If applicable, add/modify unit or integration tests.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## Acknowledgements

Thanks for checking out Nebula Frontend!
Join us in building a developer-friendly, open-source BaaS ✨

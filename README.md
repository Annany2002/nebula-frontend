# Nebula Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
This repository contains the frontend web application for the [Nebula BaaS](https://github.com/Annany2002/nebula-backend) project. It provides a user interface for interacting with the backend API to manage databases, schemas, API keys, and potentially data.

Built with:

- **Framework:** React
- **Build Tool:** Vite
- **Language:** TypeScript
- **(Optional Styling):** Tailwind CSS & Shadcn UI

---

## ✨ Features (UI)

- User-friendly interface for **Signup** and **Login**.
- Dashboard area for managing BaaS resources (Databases, Tables, API Keys).
- UI components for **Listing, Creating, and Deleting** Database registrations.
- Interface for **Defining Table Schemas** (specifying columns and types).
- UI for **Listing and Deleting Tables** within a selected database.
- Secure **API Key Generation** and management interface.
- Modern, fast development experience powered by Vite and TypeScript.

## 🧰 Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18 or v20+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- **A running instance of the [Nebula BaaS Backend API](https://github.com/Annany2002/nebula-backend).** This frontend communicates with the backend API.

---

## 🚀 Getting Started (Local Development)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Annany2002/nebula-frontend.git
    cd nebula-frontend
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # OR
    # yarn install
    ```

3.  **Configure Backend API URL:**

    - Create a local environment file by copying the example:
      ```bash
      cp .env.example .env.local
      ```
    - Edit the `.env.local` file.
    - Set the `VITE_NEBULA_API_BASE_URL` variable to point to your **running Nebula BaaS backend instance**.
      - For local backend development (usually running on port 8080):
        `dotenv
    VITE_NEBULA_API_BASE_URL=http://localhost:8080
    `
        _(Note: Vite requires environment variables exposed to the browser to be prefixed with `VITE_`)_

4.  **Run the Development Server:**
    ```bash
    npm run dev
    # OR
    # yarn dev
    ```
    This will start the Vite development server, typically accessible at `http://localhost:5173` (check terminal output for the exact URL). The app will have hot module replacement (HMR) enabled.

---

## 🛠 Building for Production

1.  **Ensure `VITE_NEBULA_API_BASE_URL`** in your production environment configuration (or `.env.production.local`) points to the correct deployed backend URL (e.g., `https://nebula-backend.duckdns.org`).
2.  Run the build command:
    ```bash
    npm run build
    # OR
    # yarn build
    ```
3.  This will create an optimized static build in the `dist/` directory, ready for deployment to any static hosting provider (like Netlify, Vercel, S3/CloudFront, or served via Nginx).

---

## 🔗 Connecting to the Backend

This frontend application is designed explicitly to consume the [Nebula BaaS Backend API](https://github.com/Annany2002/nebula-backend).

- It makes HTTP requests (using `Workspace` or libraries like `axios`) to the backend URL specified by the `VITE_NEBULA_API_BASE_URL` environment variable.
- It handles user authentication (Signup/Login) to obtain JWTs, which are then used primarily to access the API key generation endpoint on the backend.
- For most data operations (DB/Schema/Table/Record management), it expects the user to provide a database-scoped API Key (obtained via the UI) which is then sent in the `Authorization: ApiKey <key>` header for backend requests.
- Ensure the backend has appropriate CORS configuration (via its `.env` `ALLOWED_ORIGINS`) to accept requests from the domain where this frontend is hosted.

---

## 📜 License

MIT License

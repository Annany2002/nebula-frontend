# 🙌 Contributing to Nebula Frontend

First off, thanks for taking the time to contribute to Nebula! 🎉  
This document outlines how you can effectively contribute to the project.

---

## 📦 Repository Overview

This is the **Nebula Frontend**, a modern TypeScript + React web application built with Vite, Tailwind CSS, and Shadcn UI. It interacts with the [Nebula BaaS Backend](https://github.com/Annany2002/nebula-backend) to manage databases, tables, and API keys.

---

## 🛠️ Getting Started

1. **Fork** the repository
2. **Clone** your fork

```bash
git clone https://github.com/<your-username>/nebula-frontend.git
cd nebula-frontend
```

3. **Install dependencies**

```bash
npm install
# or
yarn install
```

4. **Configure Environment**

```bash
cp .env.example .env.local
# Set your backend URL inside .env.local
```

5. **Run locally**

```bash
npm run dev
```

---

## 🐛 Reporting Bugs or Suggesting Features

- For bugs, [open a bug report](../../issues/new?template=bug_report.yaml)
- For features, [submit a feature request](../../issues/new?template=feature_request.yaml)

Please **check existing issues** before creating a new one.

---

## 🧑‍💻 Submitting a Pull Request

1. Create a branch:

```bash
git checkout -b fix/login-bug
```

2. Make your changes.

3. **Test your changes** thoroughly.

4. Commit using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/):

```bash
git commit -m "fix(auth): resolve login error on invalid token"
```

5. Push and open a Pull Request. GitHub will auto-fill the [PR Template](./.github/PULL_REQUEST_TEMPLATE.md).

---

## ✅ Code Standards

- Use **TypeScript** and **React best practices**
- Use `npm run lint` to check for code style issues
- Follow accessibility and semantic HTML principles
- Use Tailwind CSS for UI styling (avoid inline styles)

---

## 🧪 Testing

- Manual UI testing is expected for visual/UI changes
- Unit and integration tests (if applicable) must be updated or added

---

## 🧾 Licensing

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

## 🙏 Thank You!

We’re excited to see what you’ll build or improve 🚀
If you have any questions, feel free to open a discussion or issue.

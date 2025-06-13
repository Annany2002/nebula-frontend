# 🚀 Pull Request: [Title of Your PR]

## 📋 Summary

<!-- Provide a brief explanation of the change -->

This PR introduces/fixes/enhances XYZ functionality...

## 🧾 Related Issue(s)

<!-- Link to related issues if applicable -->

Closes #123 <!-- use keywords like closes/fixes/resolves to auto-close issues -->

## ✅ Changes Made

<!-- Bullet point list of changes for quick review -->

- Added new component `DatabaseCard`
- Refactored `TableSchemaForm` to support validation
- Fixed login form not clearing error on input change

## 🧪 Testing Steps (Upcoming)

<!-- Explain how a reviewer can test this PR -->

1. Pull this branch
2. Run `npm run dev`
3. Go to `/dashboard` and verify new UI
4. Run unit tests with `npm run test`

## 📸 Screenshots (if applicable)

<!-- Add before/after UI or logs -->

| Before                                      | After                                       |
| ------------------------------------------- | ------------------------------------------- |
| ![old](https://via.placeholder.com/200x150) | ![new](https://via.placeholder.com/200x150) |

## 🧠 Notes for Reviewers

<!-- Call out anything that might be unexpected or requires explanation -->

- Reused backend API call from login to reduce duplication
- Needs review on accessibility

## 🔒 Checklist

Please confirm the following before submitting:

- [ ] The code follows the project’s coding standards
- [ ] Linting passes (`npm run lint`)
- [ ] I have added or updated unit/integration tests
- [ ] I have updated documentation if needed
- [ ] This PR does **not** include sensitive info like secrets or credentials

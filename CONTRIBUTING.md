# Contributing to SIBapp

Thank you for your interest in contributing to **SIBapp**.
We welcome contributions of all kinds—bug fixes, new features, documentation improvements, UI enhancements, and performance optimizations.

This document outlines the contribution process and expectations to ensure smooth collaboration.

---

## Table of Contents

* Code of Conduct
* How to Contribute
* Reporting Bugs
* Suggesting Features
* Development Workflow
* Coding Guidelines
* Commit Message Guidelines
* Pull Request Process
* Issue Assignment Rules
* Community Support

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and professional environment.
Harassment, discrimination, or abusive behavior of any kind will not be tolerated.

A formal `CODE_OF_CONDUCT.md` will be added soon. Until then, follow standard open-source etiquette.

---

## How to Contribute

You can contribute by:

* Fixing bugs
* Improving UI/UX
* Adding new features
* Enhancing performance
* Writing or improving documentation
* Refactoring existing code

Before starting work, **always check the existing issues**.

---

## Reporting Bugs

If you find a bug:

1. Check if the issue already exists.
2. If not, create a new issue with:

   * Clear title
   * Steps to reproduce
   * Expected vs actual behavior
   * Screenshots or logs (if applicable)

Do **not** open pull requests without an issue for major bugs.

---

## Suggesting Features

Feature requests are welcome.

Please open an issue and include:

* Problem statement
* Proposed solution
* Why it benefits the project
* Any alternatives considered

Large features require maintainer approval before implementation.

---

## Development Workflow

### 1. Fork the Repository

```bash
git clone https://github.com/your-username/SIBapp.git
cd SIBapp
```

---

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

* `feature/` – new features
* `fix/` – bug fixes
* `refactor/` – code refactoring
* `docs/` – documentation changes

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Run the Project

```bash
npm run dev
```

---

## Coding Guidelines

### General

* Follow existing folder structure
* Keep components modular and reusable
* Avoid unnecessary re-renders
* Do not introduce breaking changes without discussion

### React

* Use functional components and hooks
* Avoid inline business logic inside JSX
* Keep API calls inside hooks or services

### Styling

* Use Tailwind CSS utility classes
* Avoid inline styles unless absolutely necessary

### Files & Naming

* Components: `PascalCase`
* Hooks: `camelCase` prefixed with `use`
* Utilities: `camelCase`
* Folders: `PascalCase` or descriptive lowercase

---

## Commit Message Guidelines

Use clear and descriptive commit messages.

Format:

```
type(scope): short description
```

Examples:

```
feat(members): add advanced filter support
fix(auth): prevent session crash on refresh
docs(readme): improve setup instructions
```

Types:

* `feat`
* `fix`
* `refactor`
* `docs`
* `chore`

---

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run the project locally and test changes
3. Open a pull request with:

   * Clear title
   * Description of changes
   * Linked issue (mandatory)
4. Follow the PR template (if provided)
5. Address review comments promptly

Pull requests without a linked issue **may be closed**.

---

## Issue Assignment Rules

* Comment on an issue to request assignment
* One issue per contributor at a time (for beginners)
* If inactive for more than **5 days**, the issue may be reassigned

---

## Community Support

* Use GitHub Issues for discussions
* Be respectful and collaborative
* Ask questions if requirements are unclear

Maintainers reserve the right to reject contributions that:

* Break architecture consistency
* Introduce security risks
* Do not follow guidelines

---

## Final Note

SIBapp is a **real-world, production-oriented project**.
Quality, clarity, and maintainability matter more than quantity.

We appreciate your contribution and look forward to collaborating with you.

Happy coding 🚀

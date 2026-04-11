# Contributing to All India Villages API

First off — thanks for taking the time to contribute! 🇮🇳

This project is a production-grade SaaS API for India geography data. Contributions of all kinds are welcome — whether it's fixing a typo, correcting village data, improving the UI, or adding a new feature.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Branch & Commit Conventions](#branch--commit-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Data Contributions](#data-contributions)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

Be respectful and constructive. This is a welcoming space for developers of all experience levels. Harassment, discrimination, or dismissive behaviour will not be tolerated.

---

## Ways to Contribute

| Type | Examples |
|---|---|
| 🐛 Bug fix | API returning wrong data, broken UI, failed edge case |
| 🗺️ Data correction | Wrong village name, missing entry, incorrect district mapping |
| ✨ New feature | New endpoint, dashboard improvement, new filter |
| 📝 Documentation | README improvements, inline code comments, API examples |
| 🧪 Tests | New test cases, improving coverage, fixing flaky tests |
| 🎨 UI/UX | Frontend polish, mobile responsiveness, accessibility |

Not sure if your idea is a good fit? Open a [Discussion](https://github.com/JayeshJadhav28/all-india-villages-api/discussions) or a [draft PR](https://github.com/JayeshJadhav28/all-india-villages-api/pulls) first — happy to give early feedback.

---

## Project Structure

```
ALL_INDIA_VILLAGES_API/
├── backend/        # Node.js + Express + TypeScript + Prisma
├── frontend/       # React + Vite + Tailwind (Admin + B2B dashboards)
├── data-import/    # Python pipeline for cleaning/importing MDDS datasets
└── demo-client/    # Optional demo app
```

Pick the area relevant to your contribution. Each has its own dependencies and setup.

---

## Local Setup

Full setup instructions are in the [README](./README.md). Quick summary:

**Backend**
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL, REDIS_URL, JWT_SECRET
npm install
npx prisma migrate dev
npm run seed
npm run dev               # runs on http://localhost:3000
```

**Frontend**
```bash
cd frontend
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
npm install
npm run dev               # runs on http://localhost:5173
```

**Data Import (Python)**
```bash
cd data-import
pip install -r requirements.txt
# place raw MDDS files in data-import/raw/
python scripts/clean_all_states.py
python scripts/import_to_db.py
```

> **Tip:** Use a separate `.env.test` for backend tests so you don't touch your dev database.

---

## Branch & Commit Conventions

### Branch naming

```
feat/short-description        # new feature
fix/short-description         # bug fix
data/state-or-village-name    # data correction
docs/what-you-updated         # documentation only
test/what-you-tested          # tests only
chore/what-you-cleaned-up     # refactor, deps, tooling
```

Examples:
```
feat/village-export-endpoint
fix/autocomplete-empty-query
data/madhya-pradesh-corrections
docs/improve-api-reference
```

### Commit messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add CSV export endpoint for villages
fix: handle empty query string in autocomplete
data: correct district mapping for MP villages
docs: add rate limiting section to README
test: add integration test for /api/v1/search
chore: upgrade prisma to 5.x
```

---

## Pull Request Guidelines

1. **Fork** the repo and create your branch from `main`.
2. **Run tests** before submitting — `cd backend && npm test`. PRs with failing tests will not be merged.
3. **Keep PRs focused** — one fix or feature per PR. Avoid bundling unrelated changes.
4. **Describe your changes** — fill out the PR template. Include what you changed, why, and how to test it.
5. **Check for breaking changes** — if your PR changes an existing API response shape or endpoint, flag it explicitly.
6. **Update docs** — if you add a new endpoint or change behaviour, update the relevant section of `README.md`.

### PR Template

When you open a PR, please include:

```
## What does this PR do?
<!-- Brief description -->

## Why is it needed?
<!-- Context / problem being solved -->

## How to test it?
<!-- Steps to reproduce or verify the change -->

## Breaking changes?
<!-- Yes / No. If yes, describe what breaks -->

## Related issues?
<!-- Closes #123 -->
```

---

## Reporting Bugs

Please use the [GitHub Issues](https://github.com/JayeshJadhav28/all-india-villages-api/issues) tab.

Include the following in your bug report:

- **Endpoint or page affected**
- **What you expected to happen**
- **What actually happened** (paste the error or screenshot)
- **Steps to reproduce**
- **Environment** — Node version, OS, browser if frontend

> For security vulnerabilities, **do not open a public issue**. Email the maintainer directly via [jayeshjadhav.com](https://jayeshjadhav.com) instead.

---

## Data Contributions

This project uses [MDDS (Metadata and Data Standards)](https://mdds.nic.in/) datasets for village data. Data quality contributions are especially valuable.

**If you find a data error:**

1. Open an issue with the label `data-error`
2. Include the affected **state, district, sub-district, and village name**
3. Provide the correct value and a source reference if possible (census records, government sites, etc.)

**If you want to add missing data:**

1. Check the raw dataset in `data-import/raw/` to confirm the entry is genuinely missing
2. Follow the cleaning format used in `data-import/scripts/clean_all_states.py`
3. Open a PR with the label `data-addition` and include a sample of the corrected/added records

---

## Feature Requests

Open a [GitHub Issue](https://github.com/JayeshJadhav28/all-india-villages-api/issues) with the label `enhancement`.

Good feature requests include:
- The problem you're trying to solve (not just the solution)
- Who would benefit from this
- Any API design ideas you have in mind

---

## Questions?

Open a [GitHub Discussion](https://github.com/JayeshJadhav28/all-india-villages-api/discussions) or reach out via [jayeshjadhav.com](https://jayeshjadhav.com).

---

Built with ❤️ by [Jayesh Jadhav](https://jayeshjadhav.com) · [MIT License](./LICENSE)
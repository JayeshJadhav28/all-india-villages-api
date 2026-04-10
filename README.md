# 🇮🇳 All India Villages API

<div align="center">

![All India Villages API](https://img.shields.io/badge/India%20Geography-API-FF9933?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==)
[![Live API](https://img.shields.io/badge/API-Live-28a745?style=for-the-badge&logo=railway)](https://all-india-villages-api-production.up.railway.app)
[![Frontend](https://img.shields.io/badge/Dashboard-Live-000000?style=for-the-badge&logo=vercel)](https://all-india-villages-api.vercel.app)
[![Dataset](https://img.shields.io/badge/Dataset-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive)](https://drive.google.com/drive/folders/1B0jJA2BPozpOgt0rkkgOhW7XFsao8Sxi?usp=sharing)

**A production-grade SaaS platform providing standardized India geography data — Country → State → District → Sub-District → Village — via authenticated REST APIs.**

[**Live Demo**](https://all-india-villages-api.vercel.app) · [**API Docs**](#-api-reference) · [**Dataset**](https://drive.google.com/drive/folders/1B0jJA2BPozpOgt0rkkgOhW7XFsao8Sxi?usp=sharing) · [**Quick Start**](#-quick-start)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#-api-reference)
  - [Authentication](#authentication-endpoints)
  - [Geography APIs](#geography-endpoints-api-key--secret-required)
  - [B2B Portal APIs](#b2b-portal-jwt)
  - [Admin APIs](#admin-portal-jwt--admin-role)
- [Data Import Pipeline](#-data-import-pipeline)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Dataset](#-dataset)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🗺 Overview

All India Villages API is a **production-style SaaS platform** that exposes a clean, paginated REST API for the complete India geography hierarchy:

```
Country → State → District → Sub-District → Village
```

The platform is built for **B2B use cases** — fintech, agritech, logistics, government portals, healthcare platforms — where standardized, machine-readable geographic data for all Indian villages is required.

**Key highlights:**
- 🔑 API Key + Secret authentication for all geo endpoints
- 🏢 Multi-tenant B2B portal for key management & usage analytics
- 🛡 Admin portal for user approval workflows and monitoring
- ⚡ Redis-backed rate limiting and caching for high performance
- 📊 Automatic daily usage aggregation & billing-ready logs
- 🔍 Full-text search & autocomplete across all geo levels

---

## ✨ Features

| Feature | Description |
|---|---|
| **Complete Geography Hierarchy** | Country → State → District → Sub-District → Village (MDDS standard) |
| **API Key Authentication** | Per-client API Key + Secret for geo endpoint access |
| **JWT Auth** | Secure JWT-based auth for Admin and B2B dashboards |
| **Rate Limiting** | Redis-backed per-key rate limiting with plan-based quotas |
| **Caching** | Redis caching for static geo lists and autocomplete results |
| **Search & Autocomplete** | Fast full-text search and autocomplete powered by PostgreSQL trigrams |
| **Request Logging** | Per-request `ApiLog` records for complete audit trails |
| **Usage Aggregation** | Scheduled daily aggregation job (`UsageDaily`) for billing & analytics |
| **B2B Dashboard** | Self-serve portal: key creation/revocation, usage graphs, profile management |
| **Admin Dashboard** | User approvals, plan changes, log inspection, aggregate stats |
| **Paginated Responses** | Consistent pagination across all list endpoints |

---

## 🛠 Tech Stack

### Backend
| Technology | Role |
|---|---|
| Node.js ≥ 18 | Runtime |
| Express + TypeScript | Web framework |
| Prisma ORM | Database access layer |
| PostgreSQL (Neon) | Primary database |
| Redis (Upstash) | Rate limiting + caching |
| JWT | Dashboard authentication |
| bcrypt | Password + secret hashing |
| Vitest + Supertest | Integration tests |

### Frontend
| Technology | Role |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Query | Server state management |
| Zustand | Client state management |

### Infrastructure
| Service | Usage |
|---|---|
| Railway | Backend hosting |
| Vercel | Frontend hosting |
| Neon | Serverless PostgreSQL |
| Upstash | Serverless Redis |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│   B2B Apps (API Key)   Admin UI (JWT)   B2B Portal (JWT)    │
└──────────┬──────────────────┬────────────────┬─────────────┘
           │                  │                │
           ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│              Express + TypeScript Backend                    │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Geo Routes  │  │  Auth Routes │  │  Admin/B2B Routes │  │
│  │ /api/v1/*   │  │  /api/auth/* │  │  /api/admin|b2b/* │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                │                    │             │
│  ┌──────▼────────────────▼────────────────────▼──────────┐  │
│  │              Middleware Layer                          │  │
│  │   API Key Auth │ JWT Auth │ Rate Limit │ Logger        │  │
│  └──────┬─────────────────────────────────────────────┬──┘  │
│         │                                             │      │
│  ┌──────▼──────┐                           ┌─────────▼───┐  │
│  │   Redis     │                           │  PostgreSQL │  │
│  │  Cache +    │                           │  (Prisma)   │  │
│  │ Rate Limit  │                           │             │  │
│  └─────────────┘                           └─────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Cron Jobs: UsageAggregation (daily + hourly)       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ALL_INDIA_VILLAGES_API/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB schema (User, ApiKey, GeoHierarchy, ApiLog, UsageDaily)
│   │   ├── seed.ts                # Seeds admin user + India country record
│   │   └── migrations/            # Prisma migration history
│   ├── src/
│   │   ├── app.ts                 # Express app setup
│   │   ├── server.ts              # Server entry point
│   │   ├── config/
│   │   │   ├── db.ts              # Prisma client
│   │   │   ├── env.ts             # Validated env config
│   │   │   └── redis.ts           # Redis (Upstash) client
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic
│   │   ├── routes/                # Route definitions
│   │   ├── middlewares/
│   │   │   ├── apiKeyAuth.middleware.ts   # API Key + Secret validation
│   │   │   ├── jwtAuth.middleware.ts      # JWT validation
│   │   │   ├── rateLimit.middleware.ts    # Redis-backed rate limiting
│   │   │   └── logger.middleware.ts       # Request logging → ApiLog
│   │   ├── jobs/
│   │   │   ├── usageAggregation.job.ts    # Aggregation logic
│   │   │   └── usageScheduler.ts          # Cron scheduler
│   │   └── utils/
│   │       ├── cache.ts           # Redis cache helpers
│   │       └── redisLock.ts       # Distributed lock utility
│   └── tests/
│       └── auth-admin-b2b-geo.test.ts     # Integration tests
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── admin/             # Admin dashboard pages
│       │   ├── b2b/               # B2B portal pages
│       │   └── auth/              # Login / Register
│       ├── components/            # Shared UI components
│       ├── store/authStore.ts     # Zustand auth state
│       └── lib/api.ts             # Axios API client
│
├── data-import/
│   └── scripts/
│       ├── clean_all_states.py    # MDDS data cleaning pipeline
│       ├── import_to_db.py        # PostgreSQL bulk import
│       └── audit_cleaned_data.py  # Data quality checks
│
└── demo-client/                   # Optional standalone demo app
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- PostgreSQL (local) or [Neon](https://neon.tech) (recommended)
- Redis (local) or [Upstash](https://upstash.com) (recommended)

---

### Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-username/all-india-villages-api.git
cd all-india-villages-api
```

**2. Create `backend/.env`**
```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname
DIRECT_URL=postgresql://user:password@host/dbname   # Required by Prisma

# Redis (Upstash format)
REDIS_URL=rediss://:<password>@<host>:<port>

# Auth
JWT_SECRET=replace-with-a-strong-random-secret
NODE_ENV=development
PORT=3000

# CORS
FRONTEND_URL=http://localhost:5173

# Seed admin credentials
ADMIN_EMAIL=root.admin@securemail.io
ADMIN_PASSWORD=YourStrongPassword

# Timezone
TZ=UTC

# Usage Aggregation Scheduler
USAGE_AGG_ENABLED=true
USAGE_AGG_DAILY_CRON=10 0 * * *       # Runs at 00:10 UTC daily
USAGE_AGG_TODAY_CRON=0 * * * *         # Hourly (useful in dev; leave empty in prod)
USAGE_AGG_RUN_ON_BOOT=false
```

**3. Install dependencies, migrate, and seed**
```bash
cd backend
npm install

# Run Prisma migrations
npx prisma migrate dev

# Seed admin user + India country record
npm run seed

# Start dev server
npm run dev
```

Backend will be running at `http://localhost:3000`.

---

### Frontend Setup

**1. Create `frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**2. Install and run**
```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at `http://localhost:5173`.

---

### Smoke Test

```bash
# 1. Health check
curl http://localhost:3000/api/v1/health

# 2. Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root.admin@securemail.io","password":"YourStrongPassword"}'

# 3. Register a B2B client (status: PENDING until approved)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "businessName": "Acme Corp",
    "phone": "+919999999999",
    "password": "Password@123"
  }'
```

After registration: approve the user via the Admin dashboard, then log in as the client and generate an API Key from the B2B portal.

---

## 📡 API Reference

### Base URLs

| Environment | URL |
|---|---|
| Production | `https://all-india-villages-api-production.up.railway.app` |
| Local | `http://localhost:3000` |

---

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new B2B client (status: PENDING) |
| `POST` | `/api/auth/login` | — | Login; returns JWT token |
| `GET` | `/api/auth/me` | JWT | Get current user profile |

**Register Request Body**
```json
{
  "email": "client@example.com",
  "businessName": "Acme Corp",
  "phone": "+919999999999",
  "password": "Password@123"
}
```

**Login Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxyz...",
    "email": "client@example.com",
    "role": "CLIENT",
    "status": "ACTIVE"
  }
}
```

---

### Geography Endpoints (API Key + Secret required)

All `/api/v1/*` endpoints (except `/health`) require these headers:

```
X-API-Key: ak_xxxxxxxxxxxxxxxx
X-API-Secret: as_xxxxxxxxxxxxxxxx
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Public health check |
| `GET` | `/api/v1/states` | List all states |
| `GET` | `/api/v1/states/:stateId/districts` | List districts in a state |
| `GET` | `/api/v1/districts/:districtId/subdistricts` | List sub-districts in a district |
| `GET` | `/api/v1/subdistricts/:subdistrictId/villages` | List villages (paginated) |
| `GET` | `/api/v1/villages/:villageId` | Get single village details |
| `GET` | `/api/v1/search?q=...` | Full-text search across geo hierarchy |
| `GET` | `/api/v1/autocomplete?q=...` | Autocomplete suggestions |

**Pagination** — for village lists:
```
GET /api/v1/subdistricts/:id/villages?page=1&limit=20
```

**Search Example**
```bash
curl "https://all-india-villages-api-production.up.railway.app/api/v1/search?q=pune" \
  -H "X-API-Key: ak_your_key" \
  -H "X-API-Secret: as_your_secret"
```

**Sample Response — States**
```json
{
  "data": [
    { "id": "state_01", "name": "Andhra Pradesh", "code": "AP" },
    { "id": "state_02", "name": "Maharashtra", "code": "MH" }
  ],
  "total": 36
}
```

---

### B2B Portal (JWT)

> Requires `Authorization: Bearer <token>` header. User must have `CLIENT` role and `ACTIVE` status.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/b2b/dashboard` | Dashboard summary stats |
| `GET` | `/api/b2b/keys` | List all API keys |
| `POST` | `/api/b2b/keys` | Create a new API key |
| `POST` | `/api/b2b/keys/:id/revoke` | Revoke an API key |
| `GET` | `/api/b2b/usage?days=30` | Usage stats for last N days |
| `GET` | `/api/b2b/profile` | Get business profile |
| `PUT` | `/api/b2b/profile` | Update business profile |

---

### Admin Portal (JWT + ADMIN role)

> Requires `Authorization: Bearer <token>` header. User must have `ADMIN` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Platform-wide stats |
| `GET` | `/api/admin/users` | List all users |
| `GET` | `/api/admin/users/:id` | Get user details |
| `POST` | `/api/admin/users/:id/approve` | Approve a pending user |
| `POST` | `/api/admin/users/:id/reject` | Reject a pending user |
| `POST` | `/api/admin/users/:id/suspend` | Suspend an active user |
| `POST` | `/api/admin/users/:id/plan` | Change user plan |
| `GET` | `/api/admin/logs` | View API request logs |

---

## 🐍 Data Import Pipeline

The `data-import/` directory contains a Python pipeline to clean and load MDDS-format datasets into PostgreSQL.

### Dataset

Raw MDDS village datasets (state-wise CSVs) are available on Google Drive:

📁 [**Download Dataset**](https://drive.google.com/drive/folders/1B0jJA2BPozpOgt0rkkgOhW7XFsao8Sxi?usp=sharing)

### Setup

```bash
cd data-import
pip install -r requirements.txt
```

### Workflow

```bash
# 1. Place raw MDDS CSV files in data-import/raw/

# 2. Clean all state data
python scripts/clean_all_states.py

# 3. Audit cleaned data quality
python scripts/audit_cleaned_data.py

# 4. Import to PostgreSQL
DATABASE_URL=postgresql://... python scripts/import_to_db.py

# 5. Diagnose any import issues
python scripts/diagnose_import.py
```

The pipeline handles:
- Encoding normalization (handles various Indian language encodings)
- Deduplication and standardization of place names
- Mapping raw codes to the MDDS hierarchy standard
- Bulk upsert into PostgreSQL with conflict handling

---

## ☁️ Deployment

### Backend (Railway)

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set the following environment variables in Railway:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
REDIS_URL=rediss://...
JWT_SECRET=your-production-secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://all-india-villages-api.vercel.app
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=StrongProductionPassword
TZ=UTC
USAGE_AGG_ENABLED=true
USAGE_AGG_DAILY_CRON=10 0 * * *
```

3. Set build and start commands:

```
Build:  npm run build
Start:  npm run start:prod
```

> `start:prod` runs `prisma migrate deploy` before starting the server, ensuring migrations are applied on every deployment.

---

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend/`
3. Set environment variable:

```env
VITE_API_BASE_URL=https://all-india-villages-api-production.up.railway.app/api
```

---

## 🧪 Testing

Backend integration tests are written with **Vitest** + **Supertest** and cover auth, admin, B2B, and geo flows.

```bash
cd backend
npm test
```

> **Tip:** Create a separate `backend/.env.test` pointing to a dedicated test database to avoid polluting your dev data.

The test suite covers:
- User registration and login
- Admin approval/rejection workflows
- API key creation and revocation
- Geo endpoint authentication and responses
- Rate limiting behavior
- Usage log generation

---

## 📦 Dataset

The geography dataset is based on the **MDDS (Metadata and Data Standards)** village directory as published by the Government of India.

| Level | Count (approx.) |
|---|---|
| States + UTs | 36 |
| Districts | ~800 |
| Sub-Districts (Tehsil/Taluka) | ~6,000 |
| Villages | ~6,40,000+ |

📁 [**Download from Google Drive**](https://drive.google.com/drive/folders/1B0jJA2BPozpOgt0rkkgOhW7XFsao8Sxi?usp=sharing)

---

## ⚠️ Notes & Gotchas

- **`DIRECT_URL` is required** by `schema.prisma` — do not omit it even if it's the same as `DATABASE_URL`.
- **Never commit `.env` files** — use `.env.example` as a reference template.
- **Seed script upserts admin** by `ADMIN_EMAIL` — if you change the admin email, re-run `npm run seed`.
- **Windows line endings** — add a `.gitattributes` file to ensure Prisma migration files are saved with LF endings.
- **Redis is required** — the app will fail to start without a valid `REDIS_URL` as rate limiting and caching depend on it.
- **User approval flow** — newly registered B2B clients have `PENDING` status and cannot authenticate against geo APIs until an admin approves them.

---

## 🗺 Roadmap

- [ ] OpenAPI / Swagger documentation
- [ ] SDK packages (JavaScript, Python)
- [ ] Webhooks for usage threshold alerts
- [ ] Geocoding (lat/lng) data per village
- [ ] GraphQL endpoint
- [ ] Self-serve plan upgrades via Stripe

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome. Please open an issue first to discuss what you'd like to change.

---

## 📄 License

Private / Internal — All rights reserved. See [LICENSE](./LICENSE) for details.

---

<div align="center">

Made with ❤️ for Indian developers and the geospatial community

[![API](https://img.shields.io/badge/API-Production-28a745)](https://all-india-villages-api-production.up.railway.app/api/v1/health)
[![Dashboard](https://img.shields.io/badge/Dashboard-Live-000000)](https://all-india-villages-api.vercel.app)

</div>

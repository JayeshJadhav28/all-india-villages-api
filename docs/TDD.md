# All India Villages API — SaaS Platform

**Version:** 1.0  
**Author:** Solo Builder  
**Status:** Draft  
**Last Updated:** 2026-04-07

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Scope](#3-scope)
4. [User Personas & Stories](#4-user-personas--stories)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Repository Structure](#7-repository-structure)
8. [Database Schema](#8-database-schema)
9. [Data Import Pipeline](#9-data-import-pipeline)
10. [Backend Design](#10-backend-design)
11. [API Reference](#11-api-reference)
12. [Authentication & Authorization](#12-authentication--authorization)
13. [API Key Management](#13-api-key-management)
14. [Rate Limiting](#14-rate-limiting)
15. [Caching Strategy](#15-caching-strategy)
16. [Search & Autocomplete](#16-search--autocomplete)
17. [Logging & Analytics](#17-logging--analytics)
18. [Frontend Design](#18-frontend-design)
19. [Security Design](#19-security-design)
20. [Error Handling](#20-error-handling)
21. [Deployment](#21-deployment)
22. [Testing Strategy](#22-testing-strategy)
23. [Implementation Roadmap](#23-implementation-roadmap)
24. [Task Breakdown](#24-task-breakdown)
25. [Risks & Mitigations](#25-risks--mitigations)
26. [Future Enhancements](#26-future-enhancements)
27. [Setup Guide](#27-setup-guide)

---

## 1. Product Overview

### 1.1 What Is This?

**All India Villages API** is a production-grade SaaS platform that exposes standardized, hierarchical Indian geographical data down to the village level via REST APIs. It is built for B2B clients — logistics companies, e-commerce platforms, government services, address verification systems — who need reliable, normalized address hierarchy data without maintaining it themselves.

The platform includes:

- A **REST API** serving the full India geo hierarchy (Country → State → District → Sub-District → Village)
- A **B2B self-service portal** for registration, key management, and usage tracking
- An **Admin dashboard** for user approval, access control, analytics, and platform monitoring
- A **demo client app** showcasing address autocomplete integration
- A **Python data import pipeline** for ingesting, normalizing, and loading raw MDDS source data

### 1.2 Problem Statement

Businesses operating in India frequently face:

- Incomplete or inconsistent village-level address datasets
- High maintenance burden of keeping local geo databases current
- Difficulty building usable address dropdowns for 600,000+ villages
- No standardized API for address hierarchy navigation or autocomplete
- Lack of referential data linking village → sub-district → district → state

### 1.3 Value Proposition

| Stakeholder | Value |
|---|---|
| B2B Client | Plug-and-play API; no self-maintained geo DB needed |
| End User | Reliable address autocomplete and consistent selection |
| Platform Owner | Subscription-ready SaaS with usage metering and plan control |

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

- Build a reusable SaaS product around Indian village-level geography data
- Support tiered subscription plans with usage limits
- Make the system demo-ready for future monetization

### 2.2 Technical Goals

- Import 100% of available hierarchy data from the MDDS source
- Serve 95% of common API responses under 100ms
- Provide reliable autocomplete with relevant ranked results
- Deploy a stable, production-like end-to-end system

### 2.3 Success Metrics

| Metric | Target |
|---|---|
| Data completeness | 100% of source rows imported or explained |
| API p95 latency | < 100ms for hierarchy and cached endpoints |
| Autocomplete accuracy | Relevant results for 2+ character queries |
| User lifecycle | Registration → Approval → Login → Key → API call all functional |
| Platform deployment | Stable production deployment with passing smoke tests |

---

## 3. Scope

### 3.1 In Scope

- India geography hierarchy: Country, State, District, Sub-District, Village
- REST API with JSON responses
- API Key + Secret authentication for external API consumers
- JWT-based login for admin and B2B dashboard users
- Admin dashboard: user management, logs, analytics, village browser
- B2B dashboard: usage, API keys, profile, docs
- Logging and daily usage aggregation
- Plan-based rate limiting
- State-level access restrictions
- Demo integration app
- Full documentation pack

### 3.2 Out of Scope (Initial Release)

- Payment gateway or billing automation
- Subscription self-upgrade
- Mobile application
- Multi-country support
- Enterprise SSO
- AI-powered address correction
- Multi-region write replication

---

## 4. User Personas & Stories

### 4.1 Personas

**Admin (Platform Operator)**
Manages clients, approves registrations, controls plans and access, monitors platform health and logs.

**B2B Client Developer**
A developer or technical lead at a company integrating the village search and autocomplete API into their product.

**B2B Business Manager**
Non-technical client-side user who monitors usage, checks API limits, and manages billing profile.

**Demo / Prospective User**
Public visitor exploring the demo form to evaluate whether the platform fits their needs.

### 4.2 User Stories

**Registration & Access**
- As a B2B client, I want to register my business so I can request platform access.
- As an admin, I want to approve or reject registrations so only valid businesses can use the API.
- As a client, I want to log in and manage my account after approval.
- As an admin, I want to suspend accounts that violate terms of service.

**API Usage**
- As a client, I want to generate API keys so my application can authenticate API calls.
- As a client, I want to search villages and get structured hierarchy information.
- As a client, I want autocomplete suggestions for village names as users type.
- As a client, I want to revoke and regenerate API keys when credentials are compromised.

**Monitoring & Analytics**
- As a client, I want to see my daily request usage against my plan limits.
- As a client, I want to see success/failure rates for my API calls.
- As an admin, I want to see platform-wide usage, top endpoints, and active clients.
- As an admin, I want to search and filter API logs for debugging.

**Access Control**
- As an admin, I want to restrict a client to specific states based on their subscription.
- As an admin, I want to change a client's plan tier.

---

## 5. System Architecture

### 5.1 High-Level Diagram

```
+-------------------------------------------------------------+
|                        Client Layer                         |
|-------------------------------------------------------------|
| Admin Dashboard | B2B Portal | Demo Client | External Apps |
+---------------------------+---------------------------------+
                            |
                            v
+-------------------------------------------------------------+
|                      API Gateway Layer                      |
|-------------------------------------------------------------|
|  CORS | Request ID | Rate Limit | JWT Auth | API Key Auth  |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
|                     Backend Application                     |
|-------------------------------------------------------------|
|  Auth | Geo APIs | Admin APIs | B2B APIs | Logging | Usage |
+-------------------------------------------------------------+
                            |
               +------------+-------------+
               |                          |
               v                          v
+-----------------------------+   +--------------------------+
| PostgreSQL (NeonDB)         |   | Redis (Upstash)          |
|-----------------------------|   |--------------------------|
| Master Geography Data       |   | Rate Limit Counters      |
| Users & API Keys            |   | Hierarchy Cache          |
| Logs & Usage Summaries      |   | Autocomplete Cache       |
| Audit Logs                  |   | Daily Quota Counters     |
+-----------------------------+   +--------------------------+

                ^
                |
+-------------------------------------------------------------+
|                  Python Data Import Pipeline                |
|-------------------------------------------------------------|
| Read Source → Clean → Validate → Normalize → Batch Insert  |
+-------------------------------------------------------------+
```

### 5.2 Architectural Principles

- **Stateless backend** — all session state in JWT or Redis; horizontally scalable
- **Layered architecture** — Routes → Controllers → Services → Repositories → Prisma
- **Cache-first for geo data** — static hierarchy served from Redis where possible
- **Async log writes** — API logs written non-blocking to avoid latency impact
- **Fail-safe import** — invalid rows skipped and reported; process never halts entirely

---

## 6. Technology Stack

### 6.1 Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (NeonDB) |
| Cache / Rate Limit | Redis (Upstash) |

### 6.2 Frontend

| Layer | Technology |
|---|---|
| Framework | React |
| Language | TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS |
| Data Fetching | React Query |
| State | Zustand |
| Charts | Recharts |

### 6.3 Data Processing

| Tool | Purpose |
|---|---|
| Python | Import scripts |
| pandas | DataFrame operations |
| openpyxl | Excel file reading |
| psycopg2 / SQLAlchemy | Direct DB inserts |

### 6.4 Infrastructure

| Service | Provider |
|---|---|
| PostgreSQL | NeonDB |
| Redis | Upstash |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway or Render |
| CI/CD | GitHub + platform auto-deploy |

### 6.5 Security Libraries

- `bcrypt` — password and secret hashing
- `jsonwebtoken` — JWT issuance and verification
- `helmet` — security response headers
- `cors` — cross-origin control
- `express-rate-limit` + custom Redis limiter
- `zod` — input validation schemas

---

## 7. Repository Structure

```
project-root/
├── README.md
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/          # env, constants, plan definitions
│   │   ├── constants/       # enums, error codes
│   │   ├── controllers/     # request handlers
│   │   ├── middlewares/     # auth, rate limit, logger, error
│   │   ├── repositories/    # DB query functions
│   │   ├── routes/          # Express routers
│   │   ├── services/        # business logic
│   │   ├── validations/     # Zod schemas
│   │   ├── utils/           # helpers, formatters
│   │   ├── jobs/            # scheduled aggregation jobs
│   │   └── app.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # shared UI components
│   │   ├── hooks/           # custom React hooks
│   │   ├── layouts/         # page shell, sidebar, topbar
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── b2b/
│   │   │   ├── auth/
│   │   │   └── public/
│   │   ├── routes/          # route definitions, guards
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # shared TypeScript types
│   │   └── utils/
│   └── package.json
│
├── demo-client/             # standalone autocomplete demo app
│
├── data-import/
│   ├── raw/                 # original source files
│   ├── cleaned/             # normalized output files
│   ├── scripts/             # Python import scripts
│   ├── logs/                # import error logs
│   └── reports/             # summary JSON/CSV reports
│
└── docs/
    ├── PRD.md
    ├── SRS.md
    ├── TDD.md
    ├── API_SPEC.md
    ├── DB_SCHEMA.md
    ├── IMPLEMENTATION_ROADMAP.md
    └── TASK_BREAKDOWN.md
```

---

## 8. Database Schema

### 8.1 Entity Relationships

```
Country
  └── State
        └── District
              └── SubDistrict
                    └── Village

User
  ├── ApiKey (1:many)
  ├── UserStateAccess (1:many)
  ├── ApiLog (1:many)
  └── UsageDaily (1:many)
```

### 8.2 Geography Tables

#### Country

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR | NOT NULL |
| code | VARCHAR | UNIQUE |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

#### State

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| countryId | UUID | FK → Country.id |
| code | VARCHAR | UNIQUE, NOT NULL |
| name | VARCHAR | NOT NULL |
| slug | VARCHAR | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

Indexes: `countryId`, `name`

#### District

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| stateId | UUID | FK → State.id |
| code | VARCHAR | NOT NULL |
| name | VARCHAR | NOT NULL |
| slug | VARCHAR | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

Constraints: `UNIQUE(stateId, code)` | Indexes: `stateId`, `name`

#### SubDistrict

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| districtId | UUID | FK → District.id |
| code | VARCHAR | NOT NULL |
| name | VARCHAR | NOT NULL |
| slug | VARCHAR | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

Constraints: `UNIQUE(districtId, code)` | Indexes: `districtId`, `name`

#### Village

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| subDistrictId | UUID | FK → SubDistrict.id |
| code | VARCHAR | UNIQUE |
| name | VARCHAR | NOT NULL |
| slug | VARCHAR | NOT NULL |
| fullAddress | TEXT | NOT NULL |
| searchableText | TEXT | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

Indexes: `subDistrictId`, `name`, **trigram GIN index on `searchableText`**

### 8.3 User & Access Tables

#### User

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR | UNIQUE, NOT NULL |
| businessName | VARCHAR | NOT NULL |
| phone | VARCHAR | NOT NULL |
| gstNumber | VARCHAR | NULL |
| passwordHash | VARCHAR | NOT NULL |
| role | ENUM | `ADMIN` / `CLIENT` |
| status | ENUM | `PENDING` / `ACTIVE` / `SUSPENDED` / `REJECTED` |
| planType | ENUM | `FREE` / `PREMIUM` / `PRO` / `UNLIMITED` |
| approvedAt | TIMESTAMP | NULL |
| approvedBy | UUID | NULL |
| lastLoginAt | TIMESTAMP | NULL |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

#### ApiKey

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User.id |
| name | VARCHAR | NOT NULL |
| key | VARCHAR | UNIQUE, NOT NULL |
| secretHash | VARCHAR | NOT NULL |
| status | ENUM | `ACTIVE` / `REVOKED` / `EXPIRED` |
| expiresAt | TIMESTAMP | NULL |
| lastUsedAt | TIMESTAMP | NULL |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

#### UserStateAccess

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User.id |
| stateId | UUID | FK → State.id |
| createdAt | TIMESTAMP | NOT NULL |

Constraints: `UNIQUE(userId, stateId)`

### 8.4 Logs & Analytics Tables

#### ApiLog

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User.id |
| apiKeyId | UUID | FK → ApiKey.id |
| endpoint | VARCHAR | NOT NULL |
| method | VARCHAR | NOT NULL |
| statusCode | INT | NOT NULL |
| responseTimeMs | INT | NOT NULL |
| ipAddressMasked | VARCHAR | NULL |
| userAgent | TEXT | NULL |
| requestId | VARCHAR | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL |

Indexes: `(userId, createdAt)`, `(apiKeyId, createdAt)`, `endpoint`, `statusCode`

#### UsageDaily

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User.id |
| apiKeyId | UUID | FK → ApiKey.id |
| date | DATE | NOT NULL |
| totalRequests | INT | DEFAULT 0 |
| successRequests | INT | DEFAULT 0 |
| failedRequests | INT | DEFAULT 0 |
| avgResponseTimeMs | INT | DEFAULT 0 |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

Constraints: `UNIQUE(userId, apiKeyId, date)`

#### AuditLog

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| actorUserId | UUID | FK → User.id |
| action | VARCHAR | NOT NULL |
| entityType | VARCHAR | NOT NULL |
| entityId | VARCHAR | NOT NULL |
| oldValue | JSONB | NULL |
| newValue | JSONB | NULL |
| createdAt | TIMESTAMP | NOT NULL |

### 8.5 Database Integrity Rules

- No District without a valid State
- No SubDistrict without a valid District
- No Village without a valid SubDistrict
- Every ApiKey must belong to an existing User
- Every UsageDaily row must map to a valid User and ApiKey

---

## 9. Data Import Pipeline

### 9.1 Source Format

Expected input: Excel (`.xlsx`) or CSV from MDDS (Master Data for Data Standards) or equivalent official source.

Expected columns:

| Source Column | Maps To |
|---|---|
| MDDS STC | State Code |
| STATE NAME | State Name |
| MDDS DTC | District Code |
| DISTRICT NAME | District Name |
| MDDS Sub_DT | Sub-District Code |
| SUB-DISTRICT NAME | Sub-District Name |
| MDDS PLCN | Village Code |
| Area Name | Village Name |

### 9.2 Import Pipeline Steps

**Step 1 — Read source**
Load the file into a pandas DataFrame. Normalize header column names (strip, lowercase, replace spaces with underscores).

**Step 2 — Validate columns**
Confirm all required columns are present. If any are missing, halt with a descriptive error.

**Step 3 — Normalize values**
- Strip leading/trailing whitespace
- Collapse repeated internal spaces
- Normalize null/NaN to Python `None`
- Title-case names where appropriate
- Preserve raw code strings (do not cast to int)

**Step 4 — Validate rows**
- Required fields must be non-null
- Village codes must be unique if source expects uniqueness
- Parent hierarchy keys must be non-null for each record

**Step 5 — Build unique dimension datasets**
Extract unique sets of: states, districts, sub-districts, villages.

**Step 6 — Generate derived fields**
For each Village, compute:
- `slug` — URL-safe lowercase version of name
- `fullAddress` — `"VillageName, SubDistrictName, DistrictName, StateName, India"`
- `searchableText` — lowercased concatenation for trigram search

**Step 7 — Insert hierarchy (ordered)**
1. Country (upsert India record)
2. States (batch upsert by code)
3. Districts (batch upsert by stateId + code)
4. SubDistricts (batch upsert by districtId + code)
5. Villages (batch insert, batch size 2000–5000 rows)

**Step 8 — Post-import verification**
Run SQL checks:
- total counts per level
- duplicate code detection
- orphan record detection
- sample hierarchy traversal queries

**Step 9 — Generate reports**
Output files:
- `logs/invalid_rows.csv` — rows skipped with error reason
- `logs/duplicate_rows.csv` — duplicate codes found
- `reports/import_summary.json` — inserted/skipped counts per level

### 9.3 Error Handling

| Error Type | Behavior |
|---|---|
| Missing required column | Fatal — halt process immediately |
| Invalid/null row value | Non-fatal — skip row, log to invalid_rows.csv |
| Duplicate code | Non-fatal — skip row, log to duplicate_rows.csv |
| DB insert failure | Fatal for batch — log and retry with smaller batch |

### 9.4 Performance Strategy

- Use batch inserts (2000–5000 rows per batch) for villages
- Avoid row-by-row ORM inserts for the full dataset
- Disable FK checks during bulk import if database supports it safely
- Re-enable and verify after import completes

---

## 10. Backend Design

### 10.1 Layer Architecture

```
HTTP Request
    ↓
Router (route definition)
    ↓
Middleware (auth, rate-limit, validation, logger)
    ↓
Controller (parse request, call service, format response)
    ↓
Service (business logic, orchestration)
    ↓
Repository (DB queries via Prisma)
    ↓
Prisma ORM → PostgreSQL
         ↘ Redis (cache, rate counters)
```

### 10.2 Module Breakdown

#### Auth Module
- B2B registration with pending status
- Admin and client login
- JWT issuance (24-hour expiry)
- Password hashing with bcrypt
- `GET /auth/me` for current user info
- Middleware: role guard, status guard

#### Geo Module
- Hierarchy navigation endpoints (states → districts → sub-districts → villages)
- Village detail endpoint
- Search with filters and pagination
- Autocomplete with Redis cache
- Standardized response formatting

#### API Key Module
- Key + secret generation (`ak_<random>`, `as_<random>`)
- Secret hashed before storage; shown once on creation
- Key listing, revocation, secret regeneration
- Maximum 5 active keys per user enforced

#### Admin Module
- Dashboard metrics aggregation
- User list with filters (status, plan, search)
- User detail, approval, rejection, suspension, plan change
- State access grant/revoke
- Log viewer with filters
- Village data browser
- Analytics endpoints

#### Usage Module
- Request log insertion (non-blocking)
- Daily usage aggregation (scheduled job)
- Per-user and per-key usage reporting
- Response time tracking

#### Access Module
- State-level access validation against `UserStateAccess`
- Plan-based request limit validation
- User status blocking (PENDING, REJECTED, SUSPENDED)

---

## 11. API Reference

### 11.1 Conventions

**Base URL:** `/api`  
**Versioned Geo APIs:** `/api/v1`

**Success Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [],
  "meta": {
    "requestId": "req_abc123",
    "responseTime": 42
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Daily request limit exceeded for your plan."
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

### 11.2 Auth Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register B2B client |
| POST | `/api/auth/login` | None | Login (admin or client) |
| GET | `/api/auth/me` | JWT | Get current user |

**POST /api/auth/register — Body:**

```json
{
  "email": "ops@company.com",
  "businessName": "ABC Logistics Pvt Ltd",
  "phone": "+919999999999",
  "gstNumber": "27ABCDE1234F1Z5",
  "password": "Password@123"
}
```

**POST /api/auth/login — Response:**

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "uuid",
      "email": "ops@company.com",
      "role": "CLIENT",
      "status": "ACTIVE"
    }
  }
}
```

### 11.3 Geo API Endpoints

All geo APIs require `X-API-Key` and `X-API-Secret` headers.

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/states` | List all states |
| GET | `/api/v1/states/:stateId/districts` | Districts for a state |
| GET | `/api/v1/districts/:districtId/subdistricts` | Sub-districts for a district |
| GET | `/api/v1/subdistricts/:subdistrictId/villages` | Villages (paginated) |
| GET | `/api/v1/villages/:villageId` | Village detail |
| GET | `/api/v1/search` | Search villages |
| GET | `/api/v1/autocomplete` | Autocomplete suggestions |
| GET | `/api/v1/health` | Health check |

**GET /api/v1/villages/:villageId — Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Manibeli",
    "code": "525002",
    "fullAddress": "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India",
    "hierarchy": {
      "subDistrict": "Akkalkuwa",
      "district": "Nandurbar",
      "state": "Maharashtra",
      "country": "India"
    }
  }
}
```

**GET /api/v1/search — Query Params:**

| Param | Required | Description |
|---|---|---|
| q | Yes | Search string (min 2 chars) |
| state | No | Filter by state name |
| district | No | Filter by district name |
| subDistrict | No | Filter by sub-district name |
| page | No | Page number (default 1) |
| limit | No | Results per page (default 20, max 100) |

**GET /api/v1/autocomplete — Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "value": "525002",
      "label": "Manibeli",
      "fullAddress": "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India",
      "hierarchy": {
        "village": "Manibeli",
        "subDistrict": "Akkalkuwa",
        "district": "Nandurbar",
        "state": "Maharashtra",
        "country": "India"
      }
    }
  ]
}
```

### 11.4 B2B Endpoints

All require `Authorization: Bearer <jwt>` with role `CLIENT` and status `ACTIVE`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/b2b/dashboard` | Usage summary |
| GET | `/api/b2b/keys` | List API keys |
| POST | `/api/b2b/keys` | Create API key |
| POST | `/api/b2b/keys/:id/revoke` | Revoke a key |
| POST | `/api/b2b/keys/:id/regenerate` | Regenerate secret |
| GET | `/api/b2b/usage/daily` | Daily usage chart data |
| GET | `/api/b2b/profile` | Get profile |
| PUT | `/api/b2b/profile` | Update profile |

**POST /api/b2b/keys — Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Production Server",
    "key": "ak_123456",
    "secret": "as_abcdef",
    "warning": "Store this secret securely. It will not be shown again."
  }
}
```

### 11.5 Admin Endpoints

All require `Authorization: Bearer <jwt>` with role `ADMIN`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Platform metrics |
| GET | `/api/admin/users` | List users (filterable) |
| GET | `/api/admin/users/:id` | User detail |
| POST | `/api/admin/users/:id/approve` | Approve user |
| POST | `/api/admin/users/:id/reject` | Reject user |
| POST | `/api/admin/users/:id/suspend` | Suspend user |
| POST | `/api/admin/users/:id/plan` | Change plan |
| POST | `/api/admin/users/:id/state-access` | Set state access |
| GET | `/api/admin/logs` | API logs viewer |
| GET | `/api/admin/geo/villages` | Village data browser |
| GET | `/api/admin/analytics/usage` | Analytics charts data |

**POST /api/admin/users/:id/plan — Body:**

```json
{ "planType": "PRO" }
```

**POST /api/admin/users/:id/state-access — Body:**

```json
{ "stateIds": ["uuid1", "uuid2"] }
```

### 11.6 Error Codes

| HTTP Status | Error Code | Meaning |
|---|---|---|
| 400 | `INVALID_QUERY` | Query param invalid or too short |
| 400 | `VALIDATION_ERROR` | Request body failed schema validation |
| 401 | `INVALID_CREDENTIALS` | Email or password incorrect |
| 401 | `INVALID_API_KEY` | API key/secret missing or incorrect |
| 403 | `ACCESS_DENIED` | Authenticated but not authorized |
| 404 | `NOT_FOUND` | Resource does not exist |
| 429 | `RATE_LIMITED` | Per-minute burst or daily quota exceeded |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

---

## 12. Authentication & Authorization

### 12.1 JWT Authentication (Dashboard)

Used for admin and B2B portal routes.

**JWT Payload:**

```json
{
  "userId": "uuid",
  "role": "CLIENT",
  "status": "ACTIVE",
  "iat": 1234567890,
  "exp": 1234654290
}
```

- Expiry: 24 hours
- Header: `Authorization: Bearer <token>`
- Issued on login, verified on every protected request

### 12.2 API Key Authentication (External API)

Used for all `/api/v1/*` geo endpoints.

**Headers:**

```http
X-API-Key: ak_xxx
X-API-Secret: as_xxx
```

**Verification flow:**

1. Read `X-API-Key` and `X-API-Secret` from headers
2. Look up key record by `key` value
3. Verify key `status` is `ACTIVE`
4. Compare provided secret against stored `secretHash` using bcrypt
5. Verify associated user `status` is `ACTIVE`
6. Verify user plan is valid for the requested operation
7. Verify daily quota has not been exceeded
8. Verify state access if the endpoint is state-restricted

### 12.3 Role & Status Authorization

| Route Prefix | Required Role | Required Status |
|---|---|---|
| `/api/admin/*` | `ADMIN` | `ACTIVE` |
| `/api/b2b/*` | `CLIENT` | `ACTIVE` |
| `/api/v1/*` | API Key auth | `ACTIVE` (user) |

Blocked statuses: `PENDING`, `REJECTED`, `SUSPENDED` — receive `403 ACCESS_DENIED`.

---

## 13. API Key Management

### 13.1 Key Format

| Field | Format | Example |
|---|---|---|
| API Key | `ak_<32-char hex>` | `ak_a1b2c3d4e5f6...` |
| API Secret | `as_<32-char hex>` | `as_9z8y7x6w5v4u...` |

### 13.2 Storage Policy

- `key` stored as-is (searchable identifier)
- `secret` stored as bcrypt hash only — never in plaintext
- Secret is shown to the user **once** at creation or regeneration, then gone

### 13.3 Business Rules

- Maximum 5 active keys per user account
- Revoking a key blocks it immediately — no grace period
- Regenerating a secret invalidates the old secret
- Keys support an optional `expiresAt` timestamp
- Last used timestamp updated on each successful authenticated request

---

## 14. Rate Limiting

### 14.1 Plan Limits

| Plan | Daily Request Limit | Burst per Minute |
|---|---|---|
| FREE | 5,000 | 100 |
| PREMIUM | 50,000 | 500 |
| PRO | 300,000 | 2,000 |
| UNLIMITED | 1,000,000 | 5,000 |

### 14.2 Implementation

Two independent checks per request:

**Burst check (Redis, per-minute sliding window):**

```
key: rate:burst:{userId}:{minute}
TTL: 60 seconds
```

**Daily quota (Redis counter, synced to DB):**

```
key: rate:daily:{userId}:{YYYY-MM-DD}
TTL: until end of day
```

Both checks run before any business logic. If either fails, return `429 RATE_LIMITED`.

### 14.3 Response Headers

Every API response includes:

```http
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1712345678
```

---

## 15. Caching Strategy

### 15.1 Redis Cache Targets

| Data | Cache Key Pattern | TTL |
|---|---|---|
| States list | `geo:states` | 24 hours |
| Districts by state | `geo:districts:{stateId}` | 24 hours |
| SubDistricts by district | `geo:subdistricts:{districtId}` | 24 hours |
| Autocomplete results | `autocomplete:{query}:{limit}` | 1 hour |
| Plan metadata | `plan:{planType}` | 1 hour |
| Daily rate counters | `rate:daily:{userId}:{date}` | Until midnight |

### 15.2 Cache Invalidation

- Geo hierarchy data is largely static — long TTL acceptable
- Autocomplete uses shorter TTL since queries vary heavily
- Cache is explicitly invalidated if admin updates geo data
- Rate counters reset by TTL expiry at day boundary

---

## 16. Search & Autocomplete

### 16.1 Search Query

- Minimum 2 characters required
- Optional filters: state, district, sub-district (by name or ID)
- Case-insensitive matching on `searchableText` column
- Paginated results (default 20, max 100)

### 16.2 Autocomplete Query

- Minimum 2 characters to trigger
- Returns up to 10 results by default (configurable)
- Results include full hierarchy for immediate use in dropdowns
- Results cached in Redis per query string
- Falls back to DB trigram search on cache miss

### 16.3 Database Optimization

```sql
-- Trigram extension (enable once per DB)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on searchableText
CREATE INDEX village_searchable_gin
ON "Village" USING gin ("searchableText" gin_trgm_ops);

-- Composite index for filtered searches
CREATE INDEX village_subdistrict_name
ON "Village" ("subDistrictId", "name");
```

---

## 17. Logging & Analytics

### 17.1 Request Log Fields

Every API request through the geo middleware records:

| Field | Source |
|---|---|
| endpoint | Request path |
| method | HTTP method |
| statusCode | Response status |
| responseTimeMs | End - start timestamp |
| apiKeyId | Authenticated key |
| userId | Associated user |
| requestId | UUID generated per request |
| ipAddressMasked | First two octets only (e.g. `103.25.x.x`) |
| userAgent | Request header value |

### 17.2 Usage Aggregation

A scheduled job runs daily (e.g. via cron or Render job) to aggregate `ApiLog` rows into `UsageDaily`:

- Total requests
- Successful requests (2xx)
- Failed requests (4xx/5xx)
- Average response time

### 17.3 Dashboard Metrics

**Admin dashboard shows:**
- Total registered users
- Active users (status = ACTIVE)
- Total API requests today
- Platform avg response time
- Top 5 most-called endpoints
- Users by plan distribution

**B2B dashboard shows:**
- Requests today vs. plan limit
- Requests this month
- Success rate percentage
- Avg response time
- 30-day daily usage trend (line chart)

---

## 18. Frontend Design

### 18.1 Shared Components

- Layout shell (sidebar + topbar + content area)
- Data table with sorting, pagination, loading, and empty states
- Metric cards (value + label + optional trend indicator)
- Chart wrappers (Recharts: line, bar, pie)
- Paginated filter bar
- Form fields with validation feedback
- Modal dialog (confirm action)
- Toast notifications

### 18.2 Admin Pages

| Page | Key Functionality |
|---|---|
| Login | Email + password, redirect by role |
| Dashboard | Metrics overview, charts |
| Users List | Filter by status/plan, search by email |
| User Detail | Info, status history, keys, state access, plan |
| Village Browser | Browse/search villages with hierarchy |
| API Logs | Filter by user/endpoint/status/date range |
| Analytics | Usage trends, endpoint breakdown |

### 18.3 B2B Pages

| Page | Key Functionality |
|---|---|
| Register | Business registration form |
| Login | Email + password |
| Pending Approval | Informational waiting state |
| Dashboard | Usage summary, trend chart |
| API Keys | List keys, create, revoke, regenerate |
| Usage | Daily usage charts, success rate |
| API Docs | Endpoint reference for integration |
| Profile | View and update business details |

### 18.4 Demo Client

- Single-page address form
- Village name input with autocomplete dropdown
- On selection: auto-populate sub-district, district, state fields
- Submit button → thank-you page
- Deployed separately for public access

### 18.5 UI/UX Requirements

- Desktop-first dashboards; acceptable tablet support
- Demo form must be mobile-friendly
- All tables must paginate (no unbounded lists)
- Loading spinners on all async operations
- Human-readable error messages (no raw error codes shown to users)
- Keyboard-navigable controls
- Sufficient color contrast (WCAG AA minimum)

---

## 19. Security Design

### 19.1 Core Controls

| Control | Implementation |
|---|---|
| Password hashing | bcrypt, cost factor 12 |
| Secret hashing | bcrypt (same as passwords) |
| JWT security | Short expiry (24h), signed with strong secret |
| Input validation | Zod schemas on all endpoints |
| CORS | Whitelist frontend origin only |
| Security headers | Helmet middleware |
| Secret exposure | Secret shown once; never stored or returned in plaintext |
| Log safety | No raw secrets, no full IPs in logs |
| Admin audit trail | All admin actions logged in `AuditLog` |

### 19.2 Security Headers (via Helmet)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: no-referrer`

### 19.3 Sensitive Data Policy

- API secrets: hashed in DB; shown once at creation/regeneration; never logged
- Passwords: hashed in DB; never returned in any API response
- IP addresses: masked to first two octets before storage
- Stack traces: never sent to clients; logged server-side only
- Admin actions on users: recorded in `AuditLog` with before/after values

---

## 20. Error Handling

### 20.1 Error Categories & Codes

| Category | Code | HTTP |
|---|---|---|
| Input invalid | `VALIDATION_ERROR` | 400 |
| Bad query param | `INVALID_QUERY` | 400 |
| Login failed | `INVALID_CREDENTIALS` | 401 |
| API auth failed | `INVALID_API_KEY` | 401 |
| Not authorized | `ACCESS_DENIED` | 403 |
| Resource missing | `NOT_FOUND` | 404 |
| Over quota | `RATE_LIMITED` | 429 |
| Unhandled | `INTERNAL_ERROR` | 500 |

### 20.2 Error Response Policy

- Never expose stack traces in API responses
- Always include `requestId` for traceability
- Log full exception server-side with context
- Use structured error format consistently across all endpoints

---

## 21. Deployment

### 21.1 Environment Configuration

**Backend `.env`:**

```env
DATABASE_URL=postgres://...
REDIS_URL=rediss://...
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_EMAIL=admin@yourplatform.com
ADMIN_PASSWORD_HASH=<bcrypt-hash>
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

**Frontend `.env`:**

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### 21.2 Deployment Targets

| Component | Platform |
|---|---|
| Backend API | Railway or Render |
| Admin + B2B Frontend | Vercel |
| Demo Client | Vercel (separate deployment) |
| PostgreSQL | NeonDB |
| Redis | Upstash |

### 21.3 CI/CD Flow

```
feature/* branch  →  PR tests
        ↓
develop branch    →  auto-deploy to staging
        ↓
main branch       →  auto-deploy to production
```

### 21.4 Health Endpoint

`GET /api/v1/health` returns:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "db": "connected",
    "redis": "connected",
    "uptime": 3600
  }
}
```

---

## 22. Testing Strategy

### 22.1 Unit Tests

Target functions:
- utility helpers (slug generation, address formatting)
- Zod validation schemas
- auth helpers (JWT generation, bcrypt comparison)
- rate limit calculation logic

### 22.2 Integration Tests

Target flows:
- auth routes (register, login, JWT verification)
- API key middleware (valid key, revoked key, wrong secret)
- geo endpoints (states, search, autocomplete)
- admin actions (approve, reject, plan change)
- B2B key lifecycle (create, revoke, regenerate)

### 22.3 Data Validation Tests

- Duplicate code detection in import output
- Orphan record checks (village without sub-district, etc.)
- Null required field checks
- Count comparisons between source and imported DB rows

### 22.4 Frontend Tests

- Login form validation and redirect behavior
- API key creation and display flow
- Dashboard metrics rendering
- Form validation error display

### 22.5 Manual UAT Scenarios

1. User registers → receives pending status
2. Admin approves → user can log in
3. User creates API key → key and secret returned
4. Client calls autocomplete → receives hierarchy-enriched results
5. Client exceeds rate limit → receives `429 RATE_LIMITED`
6. Client accesses restricted state → receives `403 ACCESS_DENIED`
7. Admin revokes key → next API call returns `401 INVALID_API_KEY`
8. Admin views logs → sees correct entries with filters working

---

## 23. Implementation Roadmap

| Phase | Goal | Key Deliverables |
|---|---|---|
| **Phase 1** | Project setup | Repo, env, schema draft, base docs |
| **Phase 2** | Data import | Populated DB, import logs, validation report |
| **Phase 3** | Backend foundation | Express app, Prisma, Redis, middleware |
| **Phase 4** | Auth & API keys | Registration, login, JWT, key lifecycle |
| **Phase 5** | Geo APIs | All hierarchy, search, autocomplete endpoints |
| **Phase 6** | SaaS controls | Rate limiting, logging, usage aggregation |
| **Phase 7** | Admin dashboard | All admin pages and actions |
| **Phase 8** | B2B dashboard | All client pages |
| **Phase 9** | Demo client | Autocomplete demo app deployed |
| **Phase 10** | Polish & deploy | Query optimization, docs, production deploy |

---

## 24. Task Breakdown

### Setup
- [ ] Create repository and folder structure
- [ ] Initialize backend (Node + Express + TypeScript + Prisma)
- [ ] Initialize frontend (React + Vite + Tailwind)
- [ ] Configure environment variable files
- [ ] Set up NeonDB and Upstash Redis accounts
- [ ] Write base documentation

### Database
- [ ] Design and finalize Prisma schema
- [ ] Run initial migration
- [ ] Add all indexes (including trigram)
- [ ] Seed admin user
- [ ] Verify schema with sample queries

### Data Import
- [ ] Obtain and inspect raw MDDS dataset
- [ ] Write Python cleaning and normalization script
- [ ] Validate all required columns and row quality
- [ ] Import Country → State → District → SubDistrict → Village
- [ ] Run orphan and duplicate checks
- [ ] Generate import summary report

### Backend
- [ ] Express app with middleware stack
- [ ] Auth module (register, login, JWT, guards)
- [ ] API key module (generate, list, revoke, regenerate)
- [ ] Geo module (all 7 endpoints)
- [ ] Rate limit middleware (burst + daily)
- [ ] Request log middleware
- [ ] Usage aggregation scheduled job
- [ ] Admin module (all endpoints)
- [ ] B2B module (all endpoints)

### Frontend
- [ ] Admin: login, dashboard, users, logs, analytics, village browser
- [ ] B2B: register, login, pending, dashboard, keys, usage, profile, docs
- [ ] Shared components: table, metric cards, charts, modals, forms

### Demo Client
- [ ] Address form UI with village autocomplete
- [ ] Address field auto-fill on village selection
- [ ] Deploy publicly

### Deployment
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] Deploy demo client
- [ ] Configure production environment variables
- [ ] Run full smoke test suite

### Documentation
- [ ] PRD, SRS, TDD, API_SPEC, DB_SCHEMA, ROADMAP, TASK_BREAKDOWN, README

---

## 25. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Dirty or inconsistent source data | Incorrect hierarchy in DB | Row-level validation + skip + report |
| Slow autocomplete under load | Poor user experience | Trigram index + Redis caching |
| Scope creep during development | Delayed delivery | Phase-based milestones with explicit deferral list |
| High API log volume over time | DB storage growth | Daily aggregation + log pruning policy |
| Auth implementation mistakes | Security vulnerability | Strict middleware order + integration tests |
| Import script failure mid-run | Delayed data availability | Batch processing + restartable with checkpoints |
| Redis downtime | Rate limiting gaps | Graceful fallback to DB-based counting |
| Secrets accidentally exposed | Security breach | Code review + secret-never-logged policy |

---

## 26. Future Enhancements

- Payment gateway integration (Razorpay / Stripe)
- Subscription self-upgrade and billing automation
- Email automation (welcome, approval, limit warnings)
- Advanced analytics exports (CSV download, scheduled reports)
- Webhook support for usage threshold events
- Multi-country geography expansion
- Enterprise SLA dashboards
- Anomaly detection for unusual usage patterns
- Live API playground with sandboxed tokens
- GraphQL API layer

---

## 27. Setup Guide

### Prerequisites

- Node.js 18+
- Python 3.9+
- NeonDB account
- Upstash Redis account
- Vercel account
- Railway or Render account

### Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` from the template in Section 21.1.

```bash
# Run database migrations
npx prisma migrate dev

# Seed admin user
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

```bash
npm run dev
```

### Data Import Setup

```bash
cd data-import
pip install pandas openpyxl psycopg2-binary
```

Place raw source file in `data-import/raw/`.

```bash
python scripts/import.py --source raw/mdds_villages.xlsx
```

Review output in `data-import/logs/` and `data-import/reports/`.

### Demo Client Setup

```bash
cd demo-client
npm install
```

Create `demo-client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_KEY=ak_xxx
VITE_API_SECRET=as_xxx
```

```bash
npm run dev
```

---

*This document covers the full technical and product specification for the All India Villages API SaaS Platform. Refer to individual `docs/*.md` files for deeper detail on specific subsystems.*

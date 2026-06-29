# OTT Streaming Platform — Phase 0 Foundation

A Netflix-tier streaming platform. **Phase 0** proves the stack boots end-to-end:
a healthy, observable FastAPI backend, a premium Next.js 15 frontend, and a
production-grade authentication foundation (Better Auth) — with **no video
features yet** by design.

This setup runs **without Docker** using native Node + Python and a local SQLite
database for both the app and auth, so you can boot the whole thing on a laptop.

---

## Architecture Overview

```
Browser
  │
  ▼
Next.js 15 (frontend, :3000)            FastAPI (backend, :8001)
  ├─ App Router, SSR shell              ├─ /api/v1 versioned routes
  ├─ Premium design system              ├─ health / readiness / metrics
  ├─ Better Auth  ──issues session──▶   ├─ verifies Better Auth session  ◀─┐
  │   (HttpOnly cookie, SQLite)         ├─ structured JSON logging         │
  └─ Zustand + TanStack Query           ├─ request/correlation IDs         │
                                        ├─ Prometheus metrics middleware   │
                                        └─ OTel + Sentry hooks (inert)     │
                                                                           │
   GET /api/v1/auth/me  ──cookie──────────────────────────────────────────┘
```

- **Auth topology:** Better Auth (TypeScript) owns sessions in the Next.js layer.
  The FastAPI backend does **not** issue tokens — it verifies the Better Auth
  session by calling Better Auth's `get-session` endpoint and maps the result to
  a domain user. This is the one intentional deviation from "auth lives in
  FastAPI" in the steering docs.
- **Backend** follows clean architecture: `domain` (pure logic) → `application`
  (use cases) → `infrastructure` (DB, cache, observability, auth client) →
  `interface` (HTTP routes, middleware, error handlers). `domain` never imports
  outward layers.
- **Frontend** is feature-isolated: `app/` (routes), `features/` (feature
  modules), `shared/` (design system, effects, layout, lib, store).

### Phase 0 deviations from steering (developer-approved)
- **Elasticsearch, Kafka, Celery removed** from Phase 0 (return in later phases).
- **Auth = Better Auth** in Next.js, not custom FastAPI JWT.
- **Docker not used** locally; SQLite replaces Postgres, in-memory replaces Redis.

---

## Folder Structure

```
Movie Website/
├── backend/                 # FastAPI (Python 3.12 venv)
│   ├── main.py              # App bootstrap: middleware, routing, /metrics
│   ├── domain/              # Entities, enums, exceptions (no framework imports)
│   ├── application/         # Services (auth, audit), ports
│   ├── infrastructure/      # config, database, cache, observability, auth, security
│   ├── interface/           # api/ routes, middleware, schemas, error handlers
│   ├── tests/               # pytest suite (health, auth, pii)
│   ├── requirements.txt
│   └── pyproject.toml
│
├── frontend/                # Next.js 15 + TypeScript
│   ├── src/app/             # Routes: /, (auth)/login, (auth)/signup, api/auth
│   ├── src/features/auth/   # Auth feature module
│   ├── src/shared/
│   │   ├── components/      # ui/, effects/, layout/, placeholders/, CommandPalette
│   │   ├── lib/             # auth.ts, auth-client.ts, api-client.ts, query-provider
│   │   ├── store/           # Zustand auth store
│   │   └── styles/          # globals.css
│   ├── auth-cli.config.ts   # CLI-only Better Auth config (for migrations)
│   └── package.json
│
├── ops/                     # prometheus.yml, grafana provisioning
├── .kiro/                   # specs + steering
├── .env.example             # documented env vars
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ (tested on v24) and npm
- **Python** 3.11+ (tested on 3.12)
- No Docker required.

---

## Quick Start (No Docker)

Open two terminals.

### 1. Backend (FastAPI, port 8001)

```cmd
cd backend
.venv\Scripts\python.exe -m uvicorn main:app --port 8001
```

If the venv doesn't exist yet:

```cmd
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn main:app --port 8001
```

Verify:
- Health:    http://localhost:8001/api/v1/health  → `200 {"data":{"status":"ok"...}}`
- Readiness: http://localhost:8001/api/v1/readiness
- Metrics:   http://localhost:8001/metrics
- API docs:  http://localhost:8001/docs

### 2. Frontend (Next.js, port 3000)

First time only — create the Better Auth tables in the local SQLite DB:

```cmd
cd frontend
npm install
npx --yes @better-auth/cli@latest migrate --config auth-cli.config.ts -y
```

Then run the dev server:

```cmd
npm run dev
```

Open http://localhost:3000.

### 3. Verify auth end-to-end

Sign up at http://localhost:3000/signup. Behind the scenes:
1. Better Auth creates the user + session (HttpOnly cookie) in `auth.sqlite`.
2. The backend `GET /api/v1/auth/me` reads that cookie, verifies the session
   with Better Auth, and returns the profile in the standard envelope.

---

## Environment Variables

See `.env.example` (root), `backend/.env.local`, and `frontend/.env.local`.

### Backend (`backend/.env.local`)
| Variable | Purpose | Local default |
| --- | --- | --- |
| `DATABASE_URL` | App DB | `sqlite:///./ott_phase0.sqlite3` |
| `REDIS_URL` | Cache/rate-limit (blank → in-memory) | _(blank)_ |
| `CORS_ALLOW_ORIGINS` | Allowed frontend origin | `http://localhost:3000` |
| `BETTER_AUTH_URL` | Where to verify sessions | `http://localhost:3000` |
| `BETTER_AUTH_VERIFY_PATH` | Session verify endpoint | `/api/auth/get-session` |
| `RATE_LIMIT_REQUESTS` / `RATE_LIMIT_WINDOW_SECONDS` | Rate limit | `100` / `60` |
| `LOG_LEVEL` / `LOG_JSON` | Logging | `INFO` / `true` |
| `SENTRY_DSN` | Error tracking (inert if blank) | _(blank)_ |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Tracing export (no-op if blank) | _(blank)_ |

### Frontend (`frontend/.env.local`)
| Variable | Purpose | Local default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE` | Backend base URL | `http://localhost:8001` |
| `BETTER_AUTH_SECRET` | Session signing secret (**change in prod**) | dev value |
| `BETTER_AUTH_URL` | Public auth base URL | `http://localhost:3000` |
| `AUTH_SQLITE_PATH` | Local auth DB file | `./auth.sqlite` |
| `AUTH_DATABASE_URL` | Postgres for auth (optional) | _(blank → SQLite)_ |
| `GOOGLE_/FACEBOOK_/APPLE_CLIENT_ID` + `_SECRET` | OAuth (optional) | _(blank → disabled)_ |

> OAuth providers are wired but only activate when their credentials are present,
> so the app boots locally without them.

---

## Testing

```cmd
cd backend
.venv\Scripts\python.exe -m pytest -q        # backend unit/smoke tests
```

```cmd
cd frontend
npm run typecheck                            # TypeScript
npm run lint                                 # ESLint
npm run build                                # production build
```

---

## Observability

- **Metrics:** Prometheus format at `/metrics` (request latency histogram,
  request/error counters, auth event counters, build info, AI-cost placeholder).
- **Logging:** structured JSON with request ID + correlation ID; PII (emails)
  is masked in log output.
- **Tracing:** OpenTelemetry hooks initialize in no-op mode until an OTLP
  endpoint is configured.
- **Errors:** Sentry initializes only when `SENTRY_DSN` is set.
- Prometheus/Grafana configs live in `ops/` for when you reintroduce Docker.

---

## Security Baseline (OWASP ASVS-aligned)

Session cookies are HttpOnly/SameSite; CORS is origin-whitelisted (no `*`);
security headers (CSP, HSTS, X-Content-Type-Options, frame-ancestors,
Referrer-Policy, Permissions-Policy) are applied; Redis-backed rate limiting
(in-memory fallback locally); audit logging for auth events; PII masking;
device session binding; and documented seams for session anomaly detection,
content moderation, and bot detection.

---

## Contributing & Developer Onboarding

1. Read `.kiro/steering/{product,tech,structure}.md` for product intent,
   locked stack, and structural rules.
2. Read `.kiro/specs/phase-0-foundation/{requirements,design,tasks}.md`.
3. Run the stack (above) and confirm health + a signup round-trip before coding.
4. Keep features isolated: a feature must not import another feature's internals
   — share via `src/shared`.
5. Keep `domain` pure: no imports from `infrastructure`/`interface`.

### Coding Standards
- **Backend:** Python 3.11+, type hints everywhere, Pydantic v2, ruff for
  lint/format (`ruff check .`). Endpoints return the standard envelope.
- **Frontend:** TypeScript strict, ESLint (`next lint`), Tailwind tokens (no
  hardcoded hex in components), components styled from the design system.
- Validate all external input; never log secrets or raw PII.

### Git Workflow
- Branches per phase: `phase-0/...`, `phase-1/...`.
- One logical change per commit (e.g. "Add readiness DB ping").
- Never commit `.env`, `.env.local`, `*.sqlite`, or build artifacts.
- Commit `.kiro/specs` and `.kiro/steering` (specs are part of history).

---

## API Response Envelope

Success:
```json
{ "data": { "...": "..." }, "error": null, "meta": {} }
```

Error:
```json
{ "data": null, "error": { "code": "INVALID_CREDENTIALS", "message": "…", "status": 401 } }
```

---

## What's Next (Phase 1+)

Homepage hero + content API + Postgres schema, then video upload/encoding,
playback, recommendations, billing/DRM — reintroducing Postgres, Redis,
Elasticsearch, Kafka, and the AWS media pipeline as each phase needs them.

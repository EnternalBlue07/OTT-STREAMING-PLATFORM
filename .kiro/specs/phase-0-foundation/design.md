# Design Document — Phase 0: Foundation

## Overview

Phase 0 delivers a runnable, observable, secure foundation with a premium frontend — no OTT features. It runs **natively without Docker**: FastAPI via uvicorn, Next.js via the Node dev server. Backing services are made optional so the app boots on a clean machine:

- **Database:** SQLite by default (zero install), PostgreSQL via `DATABASE_URL` when available. SQLAlchemy abstracts both.
- **Cache/Rate-limit:** Redis when `REDIS_URL` is set; otherwise an in-memory fallback so dev still works.
- **Metrics:** Backend exposes Prometheus-format `/metrics`. Prometheus/Grafana are optional and configured via committed files you can run separately.

This keeps the "vertical slice boots in one step" promise without Docker.

## Architecture

### System Topology

```
┌──────────────────────────────┐         ┌───────────────────────────────┐
│  Next.js 15 (frontend :3000)  │         │  FastAPI (backend :8001)       │
│                                │         │                                │
│  • App Router shell           │  fetch  │  • /api/v1 routers             │
│  • Premium design system      │ ───────▶│  • health / readiness          │
│  • Better Auth (server)       │ cookie  │  • /metrics (Prometheus)       │
│    └ session store (SQLite/PG)│         │  • observability middleware    │
│  • /api/auth/[...all] handler │◀─────── │  • session verification        │
│  • Zustand + TanStack Query   │ verify  │    (calls Better Auth)         │
└──────────────────────────────┘         └───────────────────────────────┘
        │                                          │
        │ better-sqlite3 / pg                      │ SQLAlchemy
        ▼                                          ▼
   Auth tables (users, sessions,             Domain tables (SQLite/PG)
   accounts, verification)                   Redis (optional) for rate limit
```

### Auth Topology (key decision)

Better Auth is TypeScript and **owns authentication** inside the Next.js layer:

- The browser talks to Better Auth via `/api/auth/[...all]` (signup, login, OAuth, verify, reset, sessions, revoke). Better Auth sets the HttpOnly session cookie.
- When the frontend calls the FastAPI backend, it forwards the session cookie.
- **FastAPI verifies the session** by calling Better Auth's `get-session` endpoint server-to-server with the forwarded cookie, then caches the result briefly (Redis or in-memory). This avoids coupling two languages to one session table and keeps Better Auth the single source of truth.

```
Browser ──login──▶ Better Auth (Next.js) ──sets HttpOnly cookie──▶ Browser
Browser ──cookie──▶ FastAPI /api/v1/auth/me
                       └─ verify cookie ─▶ Better Auth /api/auth/get-session
                       └─ cache (short TTL) ─▶ return user profile
```

Rationale: alternative options were (a) FastAPI reads Better Auth's session table directly (tight coupling, schema drift risk), or (b) reissue a JWT from Next.js for FastAPI (extra token surface). Server-to-server verification is the lowest-risk option and keeps revocation instant. Tradeoff: one extra internal hop on protected calls, mitigated by short-TTL caching.

### Backend Layering (Clean Architecture)

```
backend/
  domain/          # pure business logic, no framework imports
    models.py      # User, SessionContext dataclasses
    enums.py       # Role, AuthEventType
    exceptions.py  # DomainException hierarchy
  application/      # use cases / services
    services/auth_service.py     # verify session, build profile
    services/audit_service.py    # record security events
    dto.py
  infrastructure/   # concrete adapters
    config.py                    # typed Settings (pydantic-settings)
    database/session.py, models.py
    cache/redis_client.py        # Redis or in-memory fallback
    auth/better_auth_client.py   # server-to-server session verify
    observability/logging.py, metrics.py, tracing.py, sentry.py
    security/pii.py, anomaly.py, moderation.py, bot_detection.py  # hooks
  interface/        # FastAPI surface
    api/router.py, health.py, auth.py
    schemas.py, dependencies.py, middleware.py, error_handlers.py
  main.py
  tests/
```

Dependency rule: `domain` imports nothing from `application`, `infrastructure`, or `interface`.

### Frontend Structure

```
frontend/src/
  app/
    layout.tsx              # root: providers, globals, shell
    page.tsx                # homepage (server) with placeholders
    (auth)/login/page.tsx
    (auth)/signup/page.tsx
    api/auth/[...all]/route.ts   # Better Auth handler
  shared/
    components/
      ui/ Button, Input, Card, Skeleton, EmptyState   # primitives
      layout/ Topbar, Sidebar, Footer, AppShell, ResizablePanels
      effects/ Aurora, MeshGradient, Spotlight, NoiseOverlay, GlassCard
      CommandPalette.tsx
      placeholders/ HeroTrailer, ContinueWatching, DashboardCards, ProfilePicker
    lib/ auth.ts (server), auth-client.ts, api-client.ts, query-provider.tsx, utils.ts
    store/ auth-store.ts
    styles/ globals.css
  middleware.ts
```

## Components and Interfaces

### Response Envelope

All backend responses use:
```json
{ "data": <payload|null>, "error": null | { "code": "STRING", "message": "...", "status": 401 }, "meta": { ... } }
```
A helper `envelope(data, meta)` and the error handler enforce this.

### Middleware Stack (order matters)

1. **RequestContextMiddleware** — generate/propagate `X-Request-ID` and correlation ID; bind to contextvars for logging.
2. **MetricsMiddleware** — record `http_request_duration_seconds` (histogram) and `http_requests_total` (counter by method/path/status).
3. **SecurityHeadersMiddleware** — CSP, HSTS, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy, Permissions-Policy.
4. **RateLimitMiddleware** — token bucket keyed by IP + identity, backed by Redis or in-memory.
5. **CORSMiddleware** — explicit frontend origin allowlist, credentials enabled.
6. **Structured request logging** — emitted at response time with PII masking.

CSRF: Better Auth handles CSRF for auth routes (double-submit/cookie). State-changing FastAPI routes added later will require the CSRF/Origin check helper defined here.

### Key Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Liveness, no dependency checks |
| GET | `/api/v1/readiness` | Checks DB + Redis (Redis optional) |
| GET | `/api/v1/auth/me` | Returns current user (verifies Better Auth session) |
| GET | `/api/v1/auth/sessions` | Lists active device sessions (proxied to Better Auth) |
| GET | `/metrics` | Prometheus exposition |

### Observability Interfaces

- `infrastructure/observability/logging.py` — `configure_logging()` returns a JSON logger; injects request_id/correlation_id; `mask_pii()` applied to fields.
- `metrics.py` — Prometheus collectors incl. `auth_events_total{type=...}` and an **AI-cost placeholder** `ai_cost_usd_total` gauge/counter with a `record_ai_cost()` no-op-safe API.
- `tracing.py` — `init_tracing(app)` sets up an OTel `TracerProvider`; exporter is OTLP if `OTEL_EXPORTER_OTLP_ENDPOINT` is set, else no-op.
- `sentry.py` — `init_sentry()` inert unless `SENTRY_DSN` present.

### Security Hooks (seams, not implementations)

- `security/anomaly.py` — `evaluate_session(context) -> AnomalySignal` returns `none` in Phase 0; logs inputs.
- `security/moderation.py` — `ContentModerationHook.check(payload)` raises `NotImplemented`-style passthrough returning `allowed`.
- `security/bot_detection.py` — `BotDetectionHook.score(request)` returns neutral score.
- `security/pii.py` — `mask_email()`, `mask_pii(dict)` used by logging.
- `application/services/audit_service.py` — `record(event_type, actor, context)` writes structured audit log lines (and DB-ready interface).

### Design System

- **Tokens** in `tailwind.config.ts`: colors (`background #0A0A0A`, `primary #E50914`, `secondary #564DFF`, `surface #1a1a1a`, `foreground #E5E5E5`), font families (display/body/mono), motion durations/easings, radii, shadows (elevation 0–4).
- **Effects** as React components using Framer Motion + CSS: `Aurora`, `MeshGradient` (animated), `Spotlight` (pointer-follow radial), `NoiseOverlay` (SVG/data-URI grain), `GlassCard` (backdrop-blur + translucent border).
- **Primitives**: `Button` (variants, hover scale+brightness, reduced-motion aware), `Input`, `Card`, `Skeleton` (animated gradient sweep), `EmptyState`.
- **Command palette**: `cmdk` overlay bound to ⌘K/Ctrl-K with navigation actions.
- **Shell**: `AppShell` composes `Topbar` + resizable `Sidebar` + content + `Footer`; responsive (sidebar collapses on mobile).
- Accessibility: focus-visible rings, `prefers-reduced-motion` disables non-essential motion, AA contrast pairings.

## Data Models

### Better Auth (frontend-owned, SQLite/PG)
Standard Better Auth schema: `user`, `session`, `account`, `verification`. Session rows carry `ipAddress`, `userAgent` (device binding). Generated/migrated by Better Auth.

### FastAPI Domain
```python
@dataclass
class User:          # domain entity (no ORM)
    id: str
    email: str
    name: str | None
    role: Role
    email_verified: bool

@dataclass
class SessionContext:
    session_id: str
    user: User
    ip: str | None
    user_agent: str | None
```
Phase 0 FastAPI does not persist users itself; it derives them from the verified Better Auth session. An empty SQLAlchemy base + readiness ping keeps the DB seam ready for later phases.

## Error Handling

- `DomainException(code, message, status)` base; subclasses `UnauthorizedError (401)`, `ValidationError (422)`, `RateLimitedError (429)`, `UpstreamAuthError (502)`.
- Central handler converts any `DomainException` → envelope; unhandled exceptions → 500 with generic message (details only in logs + Sentry), never leaking internals.
- Validation errors from Pydantic mapped to 422 envelope.

## Testing Strategy

- **Backend smoke/unit (pytest):** `test_health.py` (200 + envelope), `test_readiness.py` (DB up path), `test_metrics.py` (`/metrics` exposition), `test_auth_me.py` (401 without session; 200 with mocked Better Auth verify), `test_envelope.py`, `test_security_headers.py`.
- **Frontend:** type-check (`tsc --noEmit`) and lint as the Phase 0 gate; component tests deferred.
- **Manual verification:** README steps — start backend, hit `/api/v1/health` and `/metrics`; start frontend, load homepage, open command palette, navigate login/signup.

## Correctness Properties

- **Envelope invariant:** every backend response is either `{data, error:null, meta}` or `{data:null, error:{code,message,status}}` — never both populated, never neither.
- **Auth invariant:** `/api/v1/auth/me` returns 200 only when Better Auth verifies the forwarded cookie; any verification failure yields 401 (never a partial/anonymous profile).
- **Request-ID invariant:** every response carries an `X-Request-ID`; an inbound correlation ID is preserved end-to-end in logs.
- **PII invariant:** no raw email or personal field appears in emitted logs; masking is applied before any log write.
- **Readiness invariant:** readiness returns 200 only if every non-optional dependency is reachable; an unreachable required dependency forces 503.
- **Rate-limit invariant:** once a key exceeds its budget within the window, further requests are rejected with 429 until the window resets.
- **Domain isolation invariant:** `domain/` modules import only from the standard library and `domain/` itself.

## Deployment / Run (No Docker)

- Backend: `python -m venv`, `pip install -r requirements.txt`, `uvicorn main:app --reload --port 8001`.
- Frontend: `npm install`, `npm run dev` (port 3000).
- Optional observability: run Prometheus with committed `ops/prometheus.yml`; Grafana with committed provisioning (datasource + starter dashboard). Documented as optional.
- `.env.example` documents all variables; copy to `.env.local` (backend) and `.env.local` (frontend).
```

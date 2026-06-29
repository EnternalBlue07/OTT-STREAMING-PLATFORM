# Requirements Document

## Introduction

Phase 0 establishes the skeleton of the OTT Streaming Platform. The goal is **not** to ship any video feature. The goal is to prove that the stack boots, services talk to each other, a production-grade auth foundation works end-to-end, the backend is observable from day one, and a **premium design language** exists to build every future screen from.

This is a vertical-slice foundation: a developer should be able to clone the repo, run `docker compose up`, get a healthy and observable backend, a running frontend with the full design system, and be able to sign up / verify / log in / manage sessions / hit a protected endpoint.

**In scope:** repo structure; a slimmed local dev stack (Postgres, Redis, MinIO, Prometheus, Grafana); FastAPI bootstrap with observability (request IDs, structured logging, metrics, OpenTelemetry hooks); health/readiness checks; a **Better Auth**-based authentication foundation (session-based, HttpOnly cookies, refresh rotation, email-verification-ready, password-reset-ready, Google/Facebook/Apple OAuth-ready, device session management, session revocation); a **premium frontend foundation** (dark-first design language, glassmorphism, aurora/mesh backgrounds, micro-interactions, command palette, layout shell, OTT placeholders) built with shadcn, MagicUI, Aceternity UI, Framer Motion; an OWASP ASVS-aligned security baseline; and developer documentation.

**Out of scope (deferred to later phases):** video upload, encoding, playback, DRM, real search indexing, billing, subtitles, recommendation engine, real admin functionality. Search is deferred; early search (later) will use PostgreSQL full-text search before Elasticsearch is introduced. Kafka and Celery are deferred until the encoding pipeline (Phase 2+) actually needs them. These are referenced only where Phase 0 must leave a clean seam for them.

**Deviations from steering (intentional, developer-approved):**
- **Elasticsearch, Kafka, and Celery are removed from Phase 0.** Search is unnecessary now (Postgres FTS suffices early), Kafka adds operational overhead before there are events to process, and Celery is premature before there are async jobs. They return in later phases.
- **Authentication uses Better Auth (TypeScript) in the Next.js layer**, not custom FastAPI JWT. Better Auth owns session issuance, OAuth, verification, and revocation. FastAPI verifies the Better Auth session on protected endpoints. Exact topology is a design.md concern.

**Security target:** 9.9/10 — OWASP ASVS-aligned controls are first-class requirements, not afterthoughts.

**Stack constraints (from steering, except the deviations above):** Next.js 15 + TypeScript + Tailwind + shadcn/ui (frontend), FastAPI + Python 3.11+ + Pydantic v2 + SQLAlchemy (backend), PostgreSQL + Redis + MinIO (local dev). Clean architecture for backend (`domain` never imports `infrastructure`/`interface`). Feature-isolated frontend.

---

## Requirements

### Requirement 1: Repository Structure

**User Story:** As a developer, I want a clearly organized monorepo following the steering structure, so that I know where every kind of code belongs and features stay isolated.

#### Acceptance Criteria

1. THE SYSTEM SHALL provide a root layout containing `backend/`, `frontend/`, `docker-compose.yml`, `.env.example`, `.gitignore`, and `README.md`.
2. THE backend SHALL follow clean architecture layers: `domain/`, `application/`, `infrastructure/`, `interface/`, and `tests/`.
3. THE frontend SHALL follow the App Router structure with `src/app/`, `src/features/`, and `src/shared/` directories.
4. WHERE Better Auth is integrated, THE SYSTEM SHALL locate its server configuration in the Next.js layer and expose a documented seam for FastAPI to verify sessions.
5. WHERE a layer is created, THE SYSTEM SHALL include the package/module init files required for that ecosystem (e.g., `__init__.py` for Python packages).
6. IF a developer inspects `domain/`, THEN THE SYSTEM SHALL contain no imports from `infrastructure/` or `interface/`.
7. THE `.gitignore` SHALL exclude secrets (`.env.local`, `.env`), dependency directories (`node_modules/`, `__pycache__/`, virtualenvs), and build artifacts.

### Requirement 2: Local Development Stack (Docker-Free / Native)

**User Story:** As a developer, I want to run the whole Phase 0 stack natively without Docker, so that I can boot the product with only Node and Python installed.

#### Acceptance Criteria

1. THE SYSTEM SHALL run the backend natively via uvicorn and the frontend natively via the Next.js dev/build commands, with no Docker dependency.
2. THE SYSTEM SHALL use SQLite for local development persistence (backend domain data and Better Auth), while keeping PostgreSQL as the production target via SQLAlchemy and the Better Auth adapter.
3. THE SYSTEM SHALL treat Redis as optional in local dev: WHEN Redis is unavailable, THE SYSTEM SHALL fall back to an in-memory implementation for rate limiting and caching without crashing.
4. THE SYSTEM SHALL NOT include Elasticsearch, Kafka, Celery, or MinIO in the Phase 0 local stack.
5. THE SYSTEM SHALL expose the backend on port 8001 and the frontend on port 3000 by default, configurable via environment variables.
6. THE backend SHALL receive all connection settings via environment variables with safe local defaults, not hardcoded values.
7. THE SYSTEM SHALL expose a Prometheus-compatible `/metrics` endpoint; running Prometheus and Grafana SHALL be optional native tools documented in the README, not required for the app to boot.
8. THE SYSTEM SHALL provide a ready-to-use `prometheus.yml` scrape config and a Grafana datasource/dashboard provisioning file for developers who choose to run them.
9. THE `.env.example` SHALL document every environment variable the backend and frontend require, with safe local-dev defaults and no real secrets.

### Requirement 3: Backend Application Bootstrap & Observability

**User Story:** As a developer and operator, I want the FastAPI app to boot with consistent routing, structured logging, and metrics from day one, so that every endpoint is traceable and measurable.

#### Acceptance Criteria

1. WHEN the backend process starts, THE SYSTEM SHALL instantiate a FastAPI application with versioned routing under `/api/v1`.
2. THE SYSTEM SHALL register CORS middleware that whitelists the frontend origin and SHALL NOT use a `*` wildcard for allowed origins.
3. WHEN a request is received without a correlation/request ID, THE SYSTEM SHALL generate a unique request ID and attach it to the request context and the response headers.
4. WHEN an inbound request carries a correlation ID header, THE SYSTEM SHALL propagate that correlation ID through logs and downstream calls.
5. THE SYSTEM SHALL emit structured (JSON) logs that include timestamp, level, request ID, correlation ID, method, path, status code, and latency.
6. THE SYSTEM SHALL expose a Prometheus-compatible `/metrics` endpoint and record request latency, request count, and error count via metrics middleware.
7. THE SYSTEM SHALL include OpenTelemetry hooks (tracer/span setup) wired so traces can be exported later, even if the exporter is a no-op in local dev.
8. THE SYSTEM SHALL include an AI-cost-metrics placeholder (a counter/gauge stub and seam) so future AI/ML usage cost can be recorded without re-architecting.
9. WHEN any domain exception is raised, THE SYSTEM SHALL map it to the standard JSON error envelope via a centralized exception handler.
10. THE SYSTEM SHALL return all responses in the standard envelope: success as `{ "data": ..., "error": null, "meta": ... }` and failure as `{ "data": null, "error": { "code", "message", "status" } }`.
11. THE SYSTEM SHALL load configuration (database URL, Redis URL, allowed origins, auth verification settings, telemetry settings) from environment via a typed settings object.

### Requirement 4: Health and Readiness Checks

**User Story:** As an operator, I want health and readiness endpoints, so that orchestration and developers can tell whether the service and its dependencies are up.

#### Acceptance Criteria

1. WHEN a client requests `GET /api/v1/health`, THE SYSTEM SHALL return HTTP 200 with a liveness payload without checking external dependencies.
2. WHEN a client requests `GET /api/v1/readiness`, THE SYSTEM SHALL check connectivity to PostgreSQL and Redis and report the status of each.
3. IF any dependency checked by readiness is unreachable, THEN THE SYSTEM SHALL return HTTP 503 with per-dependency status detail.
4. WHILE all readiness dependencies are reachable, THE readiness endpoint SHALL return HTTP 200.

### Requirement 5: Authentication Foundation (Better Auth)

**User Story:** As a user, I want secure, session-based authentication with social login and proper session management, so that I can access the platform safely across my devices.

#### Acceptance Criteria

1. THE SYSTEM SHALL use Better Auth as the authentication provider, configured in the Next.js layer with SQLite for local development and PostgreSQL as the production backing store.
2. THE SYSTEM SHALL implement session-based authentication where the session identifier is stored in an HttpOnly, Secure, SameSite cookie and never exposed to client-side JavaScript.
3. WHEN a user signs up with email and password, THE SYSTEM SHALL create an account with a securely hashed password and establish a session.
4. THE SYSTEM SHALL implement refresh/session rotation so that session tokens are rotated on a defined schedule or on privileged actions, and the previous token is invalidated.
5. THE SYSTEM SHALL be email-verification-ready: the account model and flow SHALL support a verification state and a verification-token mechanism, with the sending transport stubbed/configurable for local dev.
6. THE SYSTEM SHALL be password-reset-ready: a reset-token flow SHALL exist with the sending transport stubbed/configurable for local dev.
7. THE SYSTEM SHALL be configured for Google OAuth, Facebook OAuth, and Apple Sign In, with provider credentials read from environment and documented placeholders in `.env.example` (providers may be disabled locally without breaking the app).
8. THE SYSTEM SHALL implement device session management: each session SHALL record device/user-agent and IP context, and a user SHALL be able to list their active sessions.
9. THE SYSTEM SHALL support session revocation: a user (or admin) SHALL be able to revoke a specific session or all sessions, after which the revoked session SHALL be rejected.
10. WHEN a client requests a protected backend endpoint (`GET /api/v1/auth/me`) with a valid Better Auth session, THE SYSTEM SHALL verify the session and return the current user's profile.
11. IF a protected endpoint is requested without a valid session, THEN THE SYSTEM SHALL return HTTP 401.
12. THE SYSTEM SHALL validate all auth-related request bodies and reject malformed input with an appropriate 4xx error.
13. WHERE the application persists users and sessions, THE SYSTEM SHALL store them in PostgreSQL and keep the FastAPI `domain` user entity separate from the Better Auth persistence schema.

### Requirement 6: Frontend Application Shell

**User Story:** As a user, I want a fast, server-rendered app shell with a complete premium layout, so that the product feels polished from the first screen.

#### Acceptance Criteria

1. WHEN a user loads the root route, THE SYSTEM SHALL render a server-rendered shell composed of a topbar, a sidebar, a main content area, and a footer.
2. THE SYSTEM SHALL provide resizable panels for the primary layout regions where appropriate (e.g., sidebar/content split).
3. THE SYSTEM SHALL provide `/login` and `/signup` routes wired to the Better Auth flows, surfacing success and error states.
4. THE SYSTEM SHALL manage client auth/session UI state in a Zustand store and server state via TanStack Query.
5. WHERE an authenticated session exists, THE topbar/sidebar SHALL reflect the logged-in state; otherwise they SHALL show login/signup actions.
6. THE SYSTEM SHALL provide placeholder dashboard, profile-picker, continue-watching, and hero-trailer regions that establish layout and motion without implementing OTT functionality.
7. THE SYSTEM SHALL be fully responsive across mobile, tablet, and desktop breakpoints.
8. THE SYSTEM SHALL NOT implement any OTT feature logic (no real video, upload, search, or playback) in Phase 0.

### Requirement 7: Premium Design System & Motion Language

**User Story:** As a developer, I want a premium, dark-first design system with rich motion and effects, so that every future screen is consistent, on-brand, and visually competitive with Netflix, Apple TV+, Linear, and Vercel.

#### Acceptance Criteria

1. THE SYSTEM SHALL be dark-theme-first and define design tokens in `tailwind.config.ts` for the brand palette: deep black `#0A0A0A`, primary `#E50914`, secondary `#564DFF`, surface `#1a1a1a`, and text `#E5E5E5`.
2. THE SYSTEM SHALL define a typography scale (display, body, monospace) and font weights (400/500/600/700) as reusable tokens.
3. THE SYSTEM SHALL provide reusable visual-effect primitives including glassmorphism surfaces, aurora backgrounds, animated mesh gradients, noise overlays, and spotlight effects.
4. THE SYSTEM SHALL provide primitive components (e.g., `Button`, `Input`, `Card`) styled from the tokens, with smooth hover states and motion-based transitions.
5. THE SYSTEM SHALL provide premium skeleton loaders (animated gradient, not opacity fades) and beautiful empty states.
6. THE SYSTEM SHALL implement a command palette (cmdk) accessible via keyboard shortcut.
7. THE SYSTEM SHALL implement micro-interactions (hover scale/brightness, entrance fade/slide) using Framer Motion with hardware-accelerated properties.
8. THE SYSTEM SHALL integrate the approved libraries: shadcn/ui, Tailwind, Framer Motion, MagicUI, Aceternity UI, Lucide icons, and cmdk.
9. THE body content color pairings SHALL meet WCAG AA contrast, and interactive elements SHALL meet accessibility AA requirements (focus states, keyboard navigation, reduced-motion support).
10. THE global stylesheet SHALL apply the deep-black background and base text color as the app default.

### Requirement 8: Security Baseline (OWASP ASVS-Aligned)

**User Story:** As a security-conscious team, I want OWASP ASVS-aligned controls established in Phase 0, so that security is built in rather than retrofitted.

#### Acceptance Criteria

1. THE SYSTEM SHALL set a Content Security Policy (CSP) restricting script, style, and connect sources to trusted origins.
2. THE SYSTEM SHALL enforce CSRF protection on state-changing requests.
3. THE SYSTEM SHALL apply rate limiting per IP and per authenticated identity, backed by Redis.
4. THE SYSTEM SHALL set secure HTTP headers (e.g., HSTS, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy, Permissions-Policy).
5. THE SYSTEM SHALL sanitize and validate all external input before processing or persistence.
6. THE SYSTEM SHALL write audit logs for security-relevant events (login, logout, session revocation, failed auth, privilege-sensitive actions).
7. THE SYSTEM SHALL support secret rotation by sourcing secrets from environment/secret store with no secrets committed to the repository.
8. THE SYSTEM SHALL implement device session binding so that a session is associated with its originating device/user-agent and IP context.
9. THE SYSTEM SHALL include session anomaly detection hooks that flag suspicious patterns (e.g., impossible travel, sudden device change, excessive failed attempts).
10. THE SYSTEM SHALL apply PII masking in logs so that emails and other personal data are redacted or hashed in log output.
11. THE SYSTEM SHALL provide content moderation hooks (a documented seam/interface) for later integration, without implementing moderation logic in Phase 0.
12. THE SYSTEM SHALL provide bot detection hooks (a documented seam/interface) for later integration, without implementing detection logic in Phase 0.

### Requirement 9: Observability

**User Story:** As an operator, I want metrics, dashboards, and error-tracking seams from day one, so that I can measure latency, errors, and auth health before scaling.

#### Acceptance Criteria

1. THE SYSTEM SHALL run Prometheus locally and scrape the backend `/metrics` endpoint.
2. THE SYSTEM SHALL run Grafana locally with Prometheus provisioned as a datasource and at least one starter dashboard.
3. THE SYSTEM SHALL record latency metrics (request duration histogram) and error metrics (counts by status class) for backend requests.
4. THE SYSTEM SHALL record authentication metrics (e.g., login success/failure counts, session creation/revocation counts).
5. THE SYSTEM SHALL include a Sentry integration placeholder (initialization seam, DSN from environment) that is inert when no DSN is configured.
6. THE SYSTEM SHALL include OpenTelemetry hooks consistent with Requirement 3 so traces can be exported when an exporter is configured.

### Requirement 10: Documentation & Developer Onboarding

**User Story:** As a new contributor, I want comprehensive documentation, so that I can set up, run, verify, and contribute to the project confidently.

#### Acceptance Criteria

1. THE `README.md` SHALL include an architecture overview describing the backend layers, frontend structure, auth topology, and the Phase 0 service stack.
2. THE `README.md` SHALL document the folder structure for both backend and frontend.
3. THE `README.md` SHALL provide a Docker startup guide and the commands to run backend and frontend.
4. THE `README.md` SHALL document all environment variables (referencing `.env.example`).
5. THE documentation SHALL include a contributing guide, a developer onboarding section, coding standards, and the Git workflow (branch and commit conventions).
6. WHEN a developer follows the README setup, THE SYSTEM SHALL allow them to reach the backend health endpoint, the metrics endpoint, and the frontend homepage successfully.
7. THE backend SHALL include at least one smoke test that asserts the health endpoint returns 200.
8. THE documentation SHALL describe the standard API response envelope and error format.

---

## Glossary

- **Better Auth:** TypeScript authentication framework (runs in the Next.js layer) providing session management, OAuth, email verification, and password reset. Owns auth in this project; FastAPI verifies its sessions.
- **Session-based auth:** Authentication where a server-side session is referenced by an opaque identifier in an HttpOnly cookie, rather than a self-contained JWT held client-side.
- **Refresh/session rotation:** Replacing a session token with a new one on a schedule or privileged action, invalidating the old token to limit replay risk.
- **Device session management:** Tracking each active session with device/user-agent and IP context, and allowing users to list and revoke them.
- **Session revocation:** Invalidating one or all sessions so subsequent requests using them are rejected.
- **Clean architecture:** Layered backend design where `domain` (pure business logic) has no dependency on `infrastructure` (DB, external services) or `interface` (HTTP). Dependencies point inward.
- **Design token:** A named, reusable value (color, spacing, type scale, motion timing) defined once and consumed across components.
- **Glassmorphism:** UI surface style using translucency, blur, and subtle borders to simulate frosted glass.
- **Aurora / mesh gradient:** Animated, soft, multi-color background effects used for premium visual depth.
- **Spotlight effect:** A radial highlight that follows or emphasizes a region for focus and depth.
- **Command palette:** A keyboard-driven overlay (cmdk) for quick navigation and actions.
- **Health check:** Liveness probe confirming the process is running; does not verify dependencies.
- **Readiness check:** Probe confirming the service and its critical dependencies (Postgres, Redis) are reachable and ready to serve traffic.
- **Response envelope:** Standard JSON shape `{ data, error, meta }` returned by every API endpoint.
- **Correlation ID / Request ID:** Identifiers attached to each request to trace it across logs and services.
- **OpenTelemetry (OTel) hooks:** Tracing setup (tracer/spans) wired so traces can be exported to a backend later.
- **OWASP ASVS:** Application Security Verification Standard; the security control framework this baseline aligns to.
- **CSP:** Content Security Policy; restricts which sources of scripts/styles/connections the browser may load.
- **PII masking:** Redacting or hashing personal data (e.g., emails) in logs.
- **Content moderation / bot detection hooks:** Documented seams/interfaces left in place for later integration without Phase 0 implementation.
- **MinIO:** S3-compatible object storage used locally in place of AWS S3.
- **Vertical slice:** A thin, end-to-end working path through all layers rather than a fully built single layer.

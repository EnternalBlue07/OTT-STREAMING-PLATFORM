# Implementation Plan — Phase 0: Foundation

## Overview

This plan builds the Phase 0 foundation natively (no Docker): a FastAPI backend with full observability and security baseline, a Better Auth-based authentication topology, and a premium Next.js design system + app shell. Tasks are ordered so the backend boots and is testable before the frontend consumes it. Each task references the requirements it satisfies.

## Tasks

- [ ] 1. Repository scaffolding and root config
  - Create `backend/` and `frontend/` trees, root `.gitignore`, `.env.example`, `README.md` skeleton, `ops/` for Prometheus/Grafana config.
  - _Requirements: 1, 2.9, 10_

- [ ] 2. Backend configuration and clean-architecture skeleton
  - Typed `Settings` (pydantic-settings), domain models/enums/exceptions, package `__init__` files, dependency-rule respected.
  - _Requirements: 1.2, 1.5, 1.6, 3.11_

- [ ] 3. Backend observability layer
  - Structured JSON logging with request/correlation IDs and PII masking; Prometheus metrics (latency, requests, errors, auth events, AI-cost placeholder); OpenTelemetry hooks; Sentry placeholder.
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 9.3, 9.4, 9.5, 9.6, 8.10_

- [ ] 4. Backend middleware and error handling
  - Request-context, metrics, security headers, rate limiting, CORS allowlist, request logging; central exception handler + envelope helper.
  - _Requirements: 3.2, 3.9, 3.10, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 5. Database and cache adapters
  - SQLAlchemy engine/session (SQLite default, Postgres via env); Redis client with in-memory fallback.
  - _Requirements: 2.5, 4.2, 8.3_

- [ ] 6. Auth verification and security hooks
  - Better Auth server-to-server session verification client; audit service; anomaly/moderation/bot-detection seams; PII helpers; device session binding context.
  - _Requirements: 5.10, 5.11, 8.6, 8.8, 8.9, 8.11, 8.12_

- [ ] 7. Backend API routers
  - `/api/v1/health`, `/api/v1/readiness`, `/api/v1/auth/me`, `/api/v1/auth/sessions`, `/metrics`; wire app in `main.py`.
  - _Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 5.10, 5.11, 9.1_

- [ ] 8. Backend tests
  - Smoke/unit: health, readiness, metrics exposition, envelope, security headers, auth/me (mocked verify).
  - _Requirements: 10.7, plus regression coverage for 3/4/5_

- [ ] 9. Frontend project setup
  - Next.js 15 + TS + Tailwind config with tokens; PostCSS/ESLint; dependencies (shadcn, framer-motion, magicui/aceternity utils, lucide, cmdk, zustand, tanstack query, better-auth); global stylesheet (dark-first).
  - _Requirements: 6.7, 7.1, 7.2, 7.8, 7.10_

- [ ] 10. Better Auth integration (frontend)
  - Server config (email/password + Google/Facebook/Apple ready, verification + reset ready, session rotation, device sessions, revocation); `/api/auth/[...all]` handler; client; Next middleware.
  - _Requirements: 5.1-5.9, 5.12, 5.13_

- [ ] 11. Design-system effects and primitives
  - Effects: Aurora, MeshGradient, Spotlight, NoiseOverlay, GlassCard. Primitives: Button, Input, Card, Skeleton, EmptyState. Reduced-motion + AA focus states.
  - _Requirements: 7.3, 7.4, 7.5, 7.7, 7.9_

- [ ] 12. App shell and command palette
  - AppShell (Topbar + resizable Sidebar + Footer), responsive; cmdk command palette on Cmd/Ctrl-K; providers (TanStack Query, Zustand auth store).
  - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.7, 7.6_

- [ ] 13. Pages and OTT placeholders
  - Homepage with HeroTrailer, ContinueWatching, DashboardCards, ProfilePicker placeholders; `/login` and `/signup` wired to Better Auth with success/error states. No OTT logic.
  - _Requirements: 6.3, 6.6, 6.8_

- [ ] 14. Shared API client and auth state
  - Fetch client with backend base URL, credentials, request-ID propagation; auth store reflecting session; TanStack Query wiring.
  - _Requirements: 6.4, 6.5, 3.4_

- [ ] 15. Observability ops config (optional run)
  - `ops/prometheus.yml` scraping backend; Grafana datasource + starter dashboard provisioning files.
  - _Requirements: 2.7, 2.8, 9.1, 9.2_

- [ ] 16. Documentation
  - README: architecture overview, folder structure, no-Docker startup, env vars, contributing guide, onboarding, coding standards, Git workflow, response-envelope/error docs.
  - _Requirements: 10.1-10.8_

- [ ] 17. Verification pass
  - Install backend deps, run pytest; install frontend deps, run type-check/lint; confirm health, metrics, homepage, command palette, auth pages.
  - _Requirements: 10.6, 10.7_

## Task Dependency Graph

```
1 ─┬─▶ 2 ─▶ 3 ─▶ 4 ─┬─▶ 7 ─▶ 8
   │        └▶ 5 ───┤
   │        └▶ 6 ───┘
   └─▶ 9 ─┬─▶ 10 ─┬─▶ 13 ─▶ 17
          ├─▶ 11 ─┤
          ├─▶ 12 ─┤
          └─▶ 14 ─┘
15 (independent, after 3/4) ─▶ 17
16 (after core code exists) ─▶ 17
```

- Backend chain: 1 → 2 → 3 → 4 → (5, 6) → 7 → 8.
- Frontend chain: 1 → 9 → (10, 11, 12, 14) → 13.
- 15 and 16 depend on prior code/config; 17 is the final gate.

```json
{
  "waves": [
    { "wave": 1, "tasks": [1] },
    { "wave": 2, "tasks": [2, 9] },
    { "wave": 3, "tasks": [3, 5, 10, 11, 12, 14] },
    { "wave": 4, "tasks": [4, 6, 13] },
    { "wave": 5, "tasks": [7, 15] },
    { "wave": 6, "tasks": [8, 16] },
    { "wave": 7, "tasks": [17] }
  ]
}
```

## Notes

- No Docker: SQLite is the default dev DB; Redis is optional with an in-memory fallback; Prometheus/Grafana are optional and run from `ops/` config.
- Better Auth (TypeScript) owns auth in the Next.js layer; FastAPI verifies sessions server-to-server. This is an approved deviation from the FastAPI-owned-auth steering.
- OAuth providers (Google/Facebook/Apple) are wired but disabled without credentials, so the app boots locally without them.
- No OTT feature logic is implemented in Phase 0; placeholders establish layout and motion only.

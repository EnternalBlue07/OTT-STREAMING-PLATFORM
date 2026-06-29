# 🎬 CinemaVerse OTT Platform — Full Project Explanation (Hinglish)

_Interview-ready guide: kya build hua, kaise hua, kyun hua, aur questions ke answers._

---

## 🔥 Project Kya Hai?

Yeh ek **Netflix-level OTT streaming platform** hai — movie dekhne ki service. Lekin sirf ek "video player" nahi hai, yeh ek puri **media distribution + personalization + monetization** system hai.

**3 main pillars:**
1. **Content Delivery** — 4K video bina buffering stream karna, adaptive bitrate, CDN
2. **Personalization** — recommendations feel like "yeh mujhe kaise pata?", instant search
3. **Monetization** — subscriptions, DRM (copy protection), concurrent device limits

---

## 🏗️ Architecture Overview

```
[User Browser]
     |
     ├── Next.js 15 Frontend (port 3000)
     │     ├── App Router (SSR + Client Components)
     │     ├── Better Auth (session management)
     │     ├── TanStack Query (server state caching)
     │     ├── Zustand (local state + persistence)
     │     ├── HLS.js (adaptive video streaming)
     │     └── Framer Motion (60fps animations)
     |
     └── FastAPI Backend (port 8001)
           ├── Clean Architecture (domain/application/infrastructure/interface)
           ├── SQLite Database (titles, reviews, episodes)
           ├── Prometheus Metrics (/metrics)
           ├── OpenTelemetry Hooks (distributed tracing ready)
           └── Structured JSON Logging (request ID + correlation ID)
```

---

## 📦 Tech Stack (Kya Use Kiya & Kyun)

### Frontend

| Technology | Kya Karta Hai | Kyun Use Kiya |
|---|---|---|
| **Next.js 15** (App Router) | React framework with SSR, file-based routing | HTML browser ko React load hone se pehle milta hai (faster FCP); image optimization built-in; Server Components = zero JS for non-interactive parts |
| **TypeScript** | Type-safe JavaScript | Compile-time pe bugs catch hote hain, autocomplete milta hai, team scale pe bahut helpful |
| **Tailwind CSS** | Utility-first CSS | No naming debates, consistent spacing/colors, design tokens ek jagah define karo |
| **shadcn/ui** | Headless component primitives (Radix) | Full styling control, accessible by default, small bundle |
| **HLS.js** | Adaptive bitrate video streaming | Auto-detect bandwidth → 480p on slow WiFi, 4K on fiber; industry standard (Netflix bhi HLS use karta hai) |
| **Framer Motion** | GPU-accelerated animations | 60fps, declarative (JSX mein), gesture support (swipe, drag) |
| **Zustand** | Local state management | Minimal boilerplate (1 file per feature); devtools; works great with TypeScript |
| **TanStack Query** | Server state (API data caching) | Caches responses, prevents redundant fetches, background refresh, pagination built-in |
| **cmdk** | Command palette (⌘K) | Quick navigation — Netflix/Vercel-style power UX |
| **Lucide React** | Icons | Consistent, tree-shakeable, 1000+ icons |
| **Better Auth** | Authentication (session-based) | Session cookies (HttpOnly, secure), OAuth ready, device management, session revocation |

### Backend

| Technology | Kya Karta Hai | Kyun Use Kiya |
|---|---|---|
| **FastAPI** | Async Python web framework | Async-first, auto-generated OpenAPI docs, Pydantic validation, 100K concurrent connections handle kar sakta hai |
| **Pydantic v2** | Request/response validation | Type safety; invalid input automatically reject with clear error |
| **SQLAlchemy** | ORM (Object-Relational Mapping) | Type-safe queries, relationship management, connection pooling |
| **SQLite** | Database (local dev) | Zero-install, file-based; production mein Postgres swap hoga (same ORM code) |
| **Prometheus** | Metrics collection | Request latency, error rates, auth events — real-time observability |
| **OpenTelemetry** | Distributed tracing hooks | Traces export-ready; jab scale kare toh DataDog/Jaeger mein dikhenge |
| **Sentry** (placeholder) | Error tracking | DSN set karo aur production errors auto-capture hote hain |

### Architecture Patterns

| Pattern | Kahan Use Hua | Benefit |
|---|---|---|
| **Clean Architecture** | Backend layers: domain → application → infrastructure → interface | Domain logic kabhi framework pe depend nahi karti; testing easy, swap easy |
| **Feature Isolation** | Frontend: `features/home`, `features/watch`, `features/player` | Ek feature doosre ka internal import nahi karta; scale aur maintain easy |
| **Standard Response Envelope** | Har API endpoint | `{ data, error, meta }` — frontend ko consistent parsing milta hai |
| **Server Components + Client Components** | Next.js App Router | Static layout server pe render, interactive parts (player, carousel) client pe — best of both |

---

## 🎯 Phase 0 — Foundation (Kya Banaya)

**Goal:** Prove the stack boots, services talk, auth works end-to-end.

**Kya Deliver Hua:**
- ✅ Monorepo structure (backend + frontend)
- ✅ Better Auth (signup, login, sessions, OAuth-ready, device management)
- ✅ FastAPI with versioned APIs, structured logging, request/correlation IDs
- ✅ Health + Readiness endpoints
- ✅ Prometheus metrics middleware
- ✅ Premium dark-first design system (glassmorphism, aurora, noise, spotlight)
- ✅ Command palette (⌘K)
- ✅ Resizable sidebar + topbar + footer (app shell)
- ✅ OWASP-aligned security (CSP, CSRF, rate limiting, PII masking, secure headers)
- ✅ Admin Content Studio (real uploads with poster, quality variants, persist to DB)

**Security Features:**
- HttpOnly session cookies (JS access nahi kar sakta)
- Rate limiting per IP (Redis-backed, in-memory fallback)
- CORS whitelist (no `*` wildcard)
- Audit logging for auth events
- PII masking in logs (emails redacted)

---

## 🎯 Phase 1 — Cinematic Discovery (Kya Banaya)

**Goal:** Catalog API + a homepage that competes with Netflix/Apple TV+ visually.

**Kya Deliver Hua:**
- ✅ **42 seeded titles** (movies + web-series + tv-series) with rich metadata
- ✅ **Auto-rotating hero carousel** (ken-burns, cross-fade, progress dots)
- ✅ **Ambient lighting** — hovering any card bleeds its accent color into the full page
- ✅ **Mood-based discovery** ("What's the vibe?" → tap Adrenaline/Comfort/etc.)
- ✅ **Momentum scroll rails** (snap, edge fades, hover arrows)
- ✅ **Cursor-follow spotlight cards** with accent glow, quality badges, match %
- ✅ **Taste DNA** — animated radar chart of genre affinity
- ✅ **My List** (localStorage-persisted watchlist, live rail)
- ✅ **Detail modal** (big card: synopsis, quality chips, Play, similar titles)
- ✅ **Player overlay** (simulated playback with scrubber)
- ✅ **Admin panel** (/admin) — real CRUD with poster upload, quality ladder, genres, moods

**Netflix Se Zyada Features:**
- Ambient page glow from poster colors (Netflix mein nahi hai)
- Taste DNA visualization (Netflix mein nahi hai)
- Mood-based real-time rail curation (Netflix sirf static rows dikhata hai)
- Cursor spotlight on cards (Netflix cards flat hain)

---

## 🎯 Phase 2 — Watch Page + Custom HLS Player (Kya Banaya)

**Goal:** Title detail page + a player better than browser default.

**Watch Page (`/watch/[id]`) Features:**
- ✅ **Cinematic banner** (poster + blurred color-matched backdrop)
- ✅ **Play (big red CTA)** → opens custom player
- ✅ **Watchlist toggle** (persisted)
- ✅ **Share** (copies URL to clipboard)
- ✅ **Expandable synopsis** (line-clamp + expand/collapse)
- ✅ **Trailers row** (inline HLS play + Picture-in-Picture)
- ✅ **Cast & Crew** (horizontal scroll; click → filmography side panel)
- ✅ **Episode List** (series only: season tabs, per-episode card, play each)
- ✅ **More Like This** (similarity algorithm: genre + mood + vibe tag overlap)
- ✅ **User Reviews** (star breakdown bar chart, verified-viewer badge, helpful voting, spoiler toggle, sort: Recent/Helpful/Critical/Positive)
- ✅ **Content Info Panel** (audio languages, subtitles, accessibility, content warning, studio, clickable genres)

**Custom Player (`/player/[id]`) Features:**
- ✅ **HLS.js adaptive bitrate** (auto-adjusts quality by bandwidth; fallback native HLS on Safari)
- ✅ **Custom controls** (NO browser default — full custom UI)
- ✅ **Scrub bar with thumbnail preview** (hover pe frame dikhaata hai)
- ✅ **Playback speed** (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- ✅ **Quality selector** (Auto / 4K / 1080p / 720p / 480p — shows active level)
- ✅ **Subtitle selector** (Off + available languages)
- ✅ **Audio track selector** (multiple languages when available)
- ✅ **Picture-in-Picture** (browser's floating window)
- ✅ **Fullscreen**
- ✅ **Mini-player** (shrinks to corner — browse while watching)
- ✅ **Smart Skip — Skip Intro** (appears at seeded interval 5–18s, seeks to end)
- ✅ **Smart Skip — Skip Recap** (same mechanism)
- ✅ **Smart Skip — Next Episode** (appears near credits, routes to next ep)
- ✅ **Keyboard shortcuts** (Space=play/pause, M=mute, F=fullscreen, C=cinematic, arrows=±10s/volume)
- ✅ **Double-tap/click seek** (±10 seconds)
- ✅ **Cinematic mode** (dims surrounding UI)
- ✅ **Controls auto-hide** (disappear on inactivity, reappear on activity)
- ✅ **Error recovery** (auto-retry on network/media errors, styled error + retry button)
- ✅ **Player preferences persist** (volume, muted, speed, preferred quality — survives across titles)

---

## 🧪 Testing

| Layer | What | Count |
|---|---|---|
| Backend pytest | Health, auth, content, admin, reviews, episodes, playback | **27 tests, all pass** |
| Frontend typecheck | `tsc --noEmit` | **Clean (0 errors)** |
| Manual verification | All routes serve 200; dev server compiles cleanly | ✅ |

---

## 📁 Project Structure (Simplified)

```
Movie Website/
├── backend/                    # FastAPI (Python)
│   ├── domain/                 # Pure business logic (no framework imports)
│   ├── application/services/   # Use cases (content, reviews, playback, admin)
│   ├── infrastructure/         # DB, cache, media, auth, observability
│   ├── interface/api/          # HTTP routes + middleware
│   └── tests/                  # 27 tests
│
├── frontend/                   # Next.js 15 (TypeScript)
│   ├── src/app/                # Routes: /, /admin, /watch/[id], /player/[id], /login, /signup
│   ├── src/features/           # home, watch, player, admin, auth
│   └── src/shared/             # Design system, hooks, stores, components
│
└── .kiro/specs/                # Requirements, design, tasks per phase
```

---

## 🎤 Interview Questions & Answers

### Q1: "Is project mein frontend aur backend kaise communicate karte hain?"
**A:** Frontend (Next.js) → Backend (FastAPI) ko HTTP REST calls karta hai. Har request pe:
- Frontend ek unique Request-ID generate karke header mein bhejta hai (tracing ke liye)
- Credentials: "include" se session cookie automatically jaati hai
- Backend session verify karta hai Better Auth ke through
- Response hamesha standard envelope `{ data, error, meta }` mein aata hai
- TanStack Query frontend pe responses cache karta hai (redundant fetches avoid)

### Q2: "HLS.js kya karta hai aur kyun use kiya?"
**A:** HLS = HTTP Live Streaming. Video ko chhote segments mein break karta hai aur ek manifest (.m3u8) se serve karta hai. HLS.js browser mein (Chrome/Firefox) adaptive bitrate playback enable karta hai — bandwidth measure karke quality auto-switch karta hai (2G pe 480p, fiber pe 4K). Safari natively HLS support karta hai toh wahan hls.js skip hota hai.

### Q3: "Better Auth kya hai aur custom JWT se better kyun hai?"
**A:** Better Auth ek TypeScript auth framework hai jo Next.js mein run karta hai. Session-based auth deta hai (HttpOnly cookies mein session ID store hota hai — client JS access nahi kar sakta). JWT se better kyun:
- Revocation instant hai (session DB se delete karo; JWT toh expire hone tak valid rehta hai)
- Device management built-in (active sessions list, revoke karo)
- OAuth (Google/Facebook/Apple) plug-and-play
- Refresh rotation automatic

### Q4: "Clean Architecture kyun use ki backend mein?"
**A:** 4 layers: domain → application → infrastructure → interface.
- **Domain** sirf business logic (dataclasses, no imports from outside) — testable without DB
- **Application** services use domain entities; depends only inward
- **Infrastructure** implements details (SQLAlchemy, HLS sources, Redis) — swappable
- **Interface** HTTP endpoints, middleware — never business logic here

Benefit: kal Postgres lagana ho toh sirf infrastructure change hoga, domain/application untouched.

### Q5: "Zustand vs Redux kyun?"
**A:** Zustand minimal boilerplate deta hai — 1 file mein ek store. Devtools support hai. TypeScript ke saath bahut clean types aate hain. Redux zyada powerful hai mega-complex apps ke liye, lekin OTT mein utna complexity nahi — Zustand leaner hai.

### Q6: "React Query (TanStack Query) kya solve karta hai?"
**A:** Server state manage karta hai:
- API responses cache karta hai (same data 2 baar fetch nahi hota)
- Background refresh (tab switch pe latest data)
- Stale-while-revalidate pattern
- Built-in loading/error states
- Pagination/infinite scroll support

Without it: har component mein useEffect + useState + isLoading + error likhna padta.

### Q7: "Smart Skip kaise implement hua?"
**A:** Backend per-title `skip_markers` store karta hai: `{ intro: {start:5, end:18}, recap: null, credits: {start:50} }`. Frontend `timeupdate` event pe current time check karta hai — agar interval mein hai toh button dikhata hai. Click pe `video.currentTime = interval.end` set hota hai. Interval pass hote hi button disappear.

### Q8: "Scrub bar mein thumbnail preview kaise kaam karta hai?"
**A:** Ek hidden detached `<video>` same HLS source pe load hota hai. Jab user scrub bar hover karta hai, us hidden video ko us time pe seek karke `<canvas>` pe frame draw karke `toDataURL()` se image extract hoti hai. CORS fail ho toh graceful fallback — sirf time label dikhta hai, crash nahi.

### Q9: "Authentication flow kya hai?"
**A:**
1. User signup karta hai → Better Auth (Next.js layer) user+session create karta hai SQLite mein
2. Session ID ek HttpOnly cookie mein set hota hai
3. Jab user `/watch` ya `/player` pe jaata hai → cookie automatically jaati hai
4. FastAPI backend Better Auth ke `get-session` endpoint se verify karta hai ki session valid hai
5. Valid → user profile return; Invalid → 401

### Q10: "Yeh project production-ready hai?"
**A:** Local dev ke liye ready hai; production ke liye yeh steps remaining hain:
- SQLite → Postgres (ORM same hai, sirf connection URL change)
- Redis for real caching + rate limiting (currently in-memory fallback)
- Real HLS encoding pipeline (AWS MediaConvert / FFmpeg)
- HTTPS + domain setup
- Admin endpoints ko RBAC se gate karna
- CDN (CloudFront) for video delivery
- Real poster images (currently gradient or uploaded via admin)

### Q11: "Framer Motion kyun? CSS animations nahi kar sakte?"
**A:** Framer Motion GPU-accelerated hai (transform + opacity sirf — layout thrashing nahi). Declarative API hai (JSX mein animate define karo). Gesture support (drag, pan). AnimatePresence se exit animations smooth hoti hain. CSS mein yeh sab manual keyframes, IntersectionObserver, aur event listeners likhne padte — zyada code, less control.

### Q12: "Ye project kaise scale karega 100K users ke liye?"
**A:** Architecture already designed hai:
- Next.js SSR reduces client load
- HLS + CDN (CloudFront) = video 200+ edge locations se serve
- FastAPI async = single machine 100K concurrent connections
- PostgreSQL + connection pooling for transactions
- DynamoDB for high-cardinality events (watch history, playback state)
- Redis for caching + sessions
- Kafka for event-driven encoding pipeline
- Kubernetes auto-scale

Currently Phase 2 local hai; infra layers mein sirf config change hogi — code change nahi (Clean Architecture ka benefit).

### Q13: "Security measures kya hain?"
**A:**
- HttpOnly cookies (XSS se protection)
- CORS whitelist (no wildcard)
- CSP headers (script injection block)
- Rate limiting per IP
- Input validation (Pydantic schemas)
- PII masking in logs
- Session binding (device + IP context)
- Audit logging
- Bot detection + content moderation hooks (interfaces ready)

### Q14: "Testing strategy kya hai?"
**A:**
- Backend: pytest (27 tests) — health, auth, content CRUD, reviews voting, episodes, playback shape
- Frontend: TypeScript strict mode (`tsc --noEmit`) catches type bugs at compile time
- Manual smoke: all routes 200, video plays, controls work
- Future: Playwright E2E tests for critical flows (login → search → play)

### Q15: "Competitor se yeh kaise different hai?"
**A:**
- **Ambient poster lighting** — hover pe page color change (Netflix mein nahi)
- **Taste DNA radar** — genre affinity visualization (Netflix nahi dikhata)
- **Mood discovery** — real-time rail curation by mood (Netflix static rows hai)
- **Smart Skip** — Skip Intro/Recap/Next Episode with precise markers
- **Custom player** — not browser default; premium UX with thumbnail scrub, mini-player, cinematic mode
- **Admin studio** — full content management with quality ladders (480p–4K)
- **Command palette** — Vercel/Linear-style ⌘K navigation

---

## 🚀 How to Run

```bash
# Terminal 1 — Backend
cd backend
.venv\Scripts\python.exe -m uvicorn main:app --port 8001 --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open: **http://localhost:3000**

Key pages:
- `/` — Homepage (carousel, mood dock, rails, Taste DNA)
- `/admin` — Content Studio (upload movies/series)
- `/watch/signal-horizon` — Movie detail page
- `/watch/crown-of-ash` — Series detail page (with episodes)
- `/player/signal-horizon` — Custom HLS player

---

## 📊 Numbers

- **42 titles** (movies + web-series + tv-series) seeded
- **180 reviews** seeded (with rating breakdown)
- **48 episodes** (8 series × 6 episodes each)
- **27 backend tests** (all passing)
- **0 TypeScript errors**
- **5 frontend routes** (all rendering 200)
- **6 backend API endpoint groups** (health, content, reviews, playback, episodes, admin)
- **~50+ frontend components** built
- **1 new library added in Phase 2** (hls.js)
- **Zero homepage files modified** during Phase 2

---

_Document generated: June 2026. Project is Phase 0 + Phase 1 + Phase 2 complete._

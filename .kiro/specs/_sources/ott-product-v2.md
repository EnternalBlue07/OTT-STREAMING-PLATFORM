# Product Steering v2 — CinemaVerse OTT Platform

## The Product in One Line
The world's most thoughtful streaming platform — every section works, every feature serves a purpose, and 12 features exist to make users say "how does this exist."

## Complete Page Map

### Public Pages (Pre-Login)
- `/` — Cinematic landing page (autoplay reel, live viewer counter, teased content)
- `/login` — Split-screen cinematic gateway (all OAuth options, OTP, magic link)
- `/signup` — 5-step wizard (account → plan → payment → genres → languages)
- `/pricing` — Full conversion page (3 tiers, annual toggle, feature table, FAQ)

### User Portal (Post-Login)
- `/home` — Personalized homepage (10 dynamic rows, mood-based, time-aware)
- `/watch/[id]` — Movie/show page (trailer, cast, reviews, related, episode list)
- `/player/[id]` — Custom HLS.js player (smart skip, chapters, subtitles, quality)
- `/search` — AI semantic + voice search with full filter panel
- `/my-list` — Smart watchlist (multiple views, AI queue ordering)
- `/continue` — Continue watching (cross-device sync, time remaining)
- `/downloads` — Offline downloads manager (premium only)
- `/profile` — Full control center (7 tabs: profile, preferences, subscription, devices, history, notifications, privacy)
- `/profiles` — Multi-profile switcher (up to 6, kids mode, PIN protection)
- `/party/[room-id]` — Watch Party (sync playback, WebRTC voice, reactions)
- `/assistant` — AI Cinema Assistant (natural language, mood, analysis, trivia)
- `/notifications` — Full notification center (types, actions, preferences)

### Admin Portal (Separate, No User Access)
- `/admin/login` — Separate auth (email+password only, mandatory 2FA, IP allowlist)
- `/admin/dashboard` — Live metrics (active viewers, revenue, encoding queue, errors)
- `/admin/content` — Upload (drag-drop, S3 direct, metadata, subtitles, scheduling)
- `/admin/series` — Series/season/episode management
- `/admin/users` — User table, search, ban, extend, delete
- `/admin/analytics` — Revenue, content, user, streaming quality analytics
- `/admin/subtitles` — Full subtitle workflow
- `/admin/moderation` — Report queue, auto-moderation
- `/admin/notifications` — Push notification management
- `/admin/settings` — Feature flags, platform config, payment gateways

## 12 Crazy Features (Core Product, Not Extras)

1. **MoodMatch™** — TensorFlow.js face-api (client-side, optional camera) → mood → personalized row
2. **SceneSeek™** — Describe a scene in plain language → finds exact movie + timestamp
3. **PartyPlay™** — Synchronized watch party with WebRTC voice, emoji reactions, reaction replay, reaction heatmap
4. **VoiceDub™** — AI dubs any movie into any language (AWS Translate + Amazon Polly + FFmpeg)
5. **ThumbAI™** — AI generates 5 thumbnail variants per title, A/B tests CTR, locks in winner
6. **ChapterSmart™** — Auto-detects chapters from audio analysis, shows named markers on scrub bar
7. **BingeGuard™** — Monitors session length, sends gentle break reminders, weekly watch summary
8. **ReCapAI™** — AI-generated 90-second video recap when returning to a series after weeks away
9. **StreamStreak™** — Daily watch streak with rewards (free downloads, discounts, badges)
10. **ContentPassport™** — Interactive world map for browsing by country/filming location
11. **DirectorRoom™** — Directors record audio commentary, Q&A sessions, fan questions
12. **StoryMode™** — Interactive quizzes, plot twist predictions, character loyalty tracker, shareable results

## 3 Subscription Tiers

- **Free (₹0)** — 500+ titles, 480p, 1 screen, ads, 2 downloads/month, join Watch Party
- **Premium (₹299/mo or ₹2,499/yr)** — 10,000+ titles, 4K HDR, 4 screens, no ads, 25 downloads, AI Assistant, VoiceDub (5/mo), create Watch Party
- **Family (₹499/mo or ₹3,999/yr)** — Everything + 6 screens, 6 profiles, Kids mode, parental controls, unlimited VoiceDub

## Login-Gated Sections
- `/home`, `/watch`, `/player`, `/my-list`, `/continue`, `/downloads`, `/profile`, `/profiles`, `/party`, `/assistant`, `/notifications` — all require auth
- `/`, `/login`, `/signup`, `/pricing` — public

## Admin-Gated Sections
- All `/admin/*` routes require admin role
- Admin and user portals are completely separate
- Admin login is at `/admin/login` — completely different page from `/login`

## Success Metrics
- Homepage load: < 2 sec LCP
- Video start: < 500ms (p95)
- Search: < 150ms (p95)
- Watch Party sync: < 100ms
- SceneSeek: < 2 sec
- MoodMatch: < 500ms (runs client-side)
- VoiceDub generation: < 5 min per movie
- ThumbAI generation: < 2 min per title (5 variants)
- Uptime: 99.99%

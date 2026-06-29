# Tech Stack Steering — OTT Streaming Platform

## Locked Stack (No Substitutions)

**Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, HLS.js, Zustand, React Query, Framer Motion, next-intl  
**Backend:** FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy ORM, Kafka, Celery  
**Databases:** PostgreSQL (transactional), DynamoDB (events), Redis (cache/session), Elasticsearch (search)  
**Media:** AWS MediaConvert (encoding), AWS S3 (storage), AWS CloudFront (CDN), AWS Transcribe (subtitles)  
**DRM & Security:** Widevine, FairPlay, PlayReady (via libraries), AWS KMS (key management), CloudFlare WAF  
**Admin:** React admin panel (custom), real-time updates via WebSocket  
**Monitoring:** Prometheus, Grafana, DataDog (APM/logs), Sentry (errors)

---

## Why Each Choice (Non-Negotiables)

### Frontend

**Next.js 15 (App Router, SSR):** 
- Server Components for layout, metadata, static content → zero JS for non-interactive parts
- Streaming SSR → HTML reaches browser before React loads (faster FCP, no white flash)
- Image optimization built-in (WebP, lazy loading, AVIF)
- File-based routing (no router config boilerplate)
- Tradeoff: opinionated (you work *with* Next, not against it)

**TypeScript:**
- Catch bugs at compile time, not runtime
- Autocomplete in video-heavy codebase (knows exactly what fields exist on a video object)
- Tradeoff: setup overhead, but pays for itself in 2 weeks

**Tailwind CSS + shadcn/ui:**
- Utility-first CSS → no naming debates, consistent spacing/colors
- shadcn components are headless (Radix UI primitives) → full control over styling
- Design tokens (colors, spacing, shadows) live in `tailwind.config.ts` → one source of truth
- Tradeoff: Tailwind has a learning curve (not Bootstrap), but results are cleaner

**HLS.js (Adaptive Bitrate Playback):**
- IETF standard (HLS), not proprietary
- Auto-detects bandwidth, switches bitrates without interruption
- Supports multiple audio tracks, subtitles, DRM (Widevine, FairPlay)
- Alternative: Dash.js (very similar, DASH format instead of HLS)
- Tradeoff: HLS slightly higher latency (~10 sec) than DASH, but more universal device support

**Zustand (Local State):**
- Minimal boilerplate (one file per feature)
- Devtools support (time-travel debugging)
- Works great with TypeScript
- Alternative: Redux (more powerful, more boilerplate), Jotai (similar, smaller)
- Tradeoff: Zustand is small; Redux handles mega-complex apps better (you won't need that)

**React Query (Server State):**
- Caches API responses, prevents redundant fetches
- Handles refetch on focus, background updates
- Built-in pagination/infinite query support
- Tradeoff: learning curve steeper than basic fetch, but essential for performance

**Framer Motion (Animations):**
- GPU-accelerated (transform, opacity only — no layout thrashing)
- Declarative (animation logic is JSX, not hidden in CSS)
- Gesture support (swipe, drag, pan)
- Tradeoff: bundle size (+50KB), but animations are 60fps, not 20fps

**next-intl (Internationalization):**
- Per-route language (URL structure: `/en/movie/123`, `/hi/movie/123`)
- Strongly typed translations
- Server-side rendering of locale-specific content
- Tradeoff: more setup than i18next, but cleaner architecture

---

### Backend

**FastAPI:**
- Async-first (all endpoints are `async def`) → handles 100K concurrent connections on single machine
- Pydantic validation → request/response schemas auto-generated as OpenAPI docs
- ASGI servers (Uvicorn, Gunicorn + Uvicorn workers) scale horizontally
- Tradeoff: less batteries-included than Django (you write more boilerplate), but that's good for learning

**Pydantic v2:**
- Type validation, serialization, JSON Schema
- Use `field_validator`, `computed_field`, `ConfigDict`
- Avoid v1 syntax (deprecated)

**SQLAlchemy ORM:**
- Type-safe queries (IDE autocomplete)
- Relationship management (one-to-many, many-to-many)
- Connection pooling (PostgreSQL best practice)
- Tradeoff: more verbose than Django ORM, but explicit control over N+1 query bugs

**Kafka (Message Queue):**
- Publish-subscribe decoupling: upload endpoint publishes `VideoUploadedEvent`, workers subscribe independently
- No requests block on encoding start; user gets confirmation immediately
- Multiple workers scale horizontally
- Tradeoff: operational complexity (must run Kafka cluster), but essential for video processing at scale

**Celery (Async Task Queue):**
- Schedule tasks (nightly: compute recommendations, clean old logs)
- Retry on failure (exponential backoff)
- Multiple queues by priority (video encoding in one queue, email in another)
- Tradeoff: adds Redis dependency, but standard for Python async patterns

---

### Databases

**PostgreSQL (Transactional):**
- ACID guarantees (money doesn't disappear, subscriptions don't double-charge)
- JSON support (store flexible metadata per video)
- Full-text search (basic, fast)
- Composite indexes (user + subscription status = O(1) lookup)
- Replication (Multi-AZ failover)
- Tradeoff: can't shard horizontally easily, but fine for transactional data

**DynamoDB (Event Data):**
- Watch history: billions of rows, can't fit in PostgreSQL
- Playback state: millions of users * 100 items in library = 100M rows
- Playback events: every seek, quality change, pause, resume = 1B+ events/month
- Why not Postgres: would need aggressive partitioning, expensive indexes, slow aggregations
- DynamoDB: designed for this scale, consistent < 50ms latency
- Tradeoff: no complex joins (DynamoDB is key-value), must denormalize

**Redis (Cache + Session):**
- Cache computed recommendations (compute nightly, serve instantly)
- Store playback state (user:movie:position, expires after 30 days)
- Rate limiting (IP:endpoint request count, reset hourly)
- Session tokens (user:device:session_id, JWT + Redis state binding)
- Tradeoff: volatile (data loss on crash, but fine for cache/sessions), must have persistence enabled

**Elasticsearch (Search):**
- Full-text search: "heist sci-fi" finds all movies with both words in title/description
- Filtering: genre: action AND year >= 2020 AND language: en
- Facets: return count per genre, year, language (for UI dropdowns)
- < 50ms latency (with local cluster replication)
- Tradeoff: must run as separate service (not embedded in app), operational overhead

---

### Media Services (AWS)

**MediaConvert (Video Encoding):**
- Input: movie.mp4 (2160p, 50 Mbps)
- Outputs (parallel): 4K (15 Mbps), 1080p (5 Mbps), 720p (2.5 Mbps), 480p (1 Mbps)
- HLS manifest auto-generated with variant playlists
- Callback when done (SNS → Kafka → mark video ready)
- Cost: ~$0.30 per 2-hour movie
- Tradeoff: no GPU cost, fully managed (vs. hand-rolling with FFmpeg)

**S3 (Storage):**
- Original video: one per title
- Encoded variants: 4 per title (4K, 1080p, 720p, 480p)
- Posters, thumbnails, backups
- Encryption at rest (AES-256)
- Versioning (rollback if corrupted)
- Cost: ~$0.023 per GB/month (~100TB stored = $2,300/month)
- Tradeoff: must use CloudFront in front (see below) or costs explode

**CloudFront (CDN):**
- Edge locations in 200+ cities
- Caches video segments from S3 (24h TTL, immutable)
- Serves user from proximity (user in Mumbai → edge in Mumbai)
- Egress cost: $0.02/GB (vs. S3 direct: $0.09/GB) = 60% savings
- HTTP/2, gzip compression, range requests (seek optimization)
- Tradeoff: caching strategy must be right (wrong TTL = stale content or cache misses)

**Transcribe (Subtitle Generation):**
- Audio → text (speaker recognition, timestamps)
- 99% accuracy (with manual review option for 1%)
- Multiple languages
- Cost: $1.50 per hour of audio (~500 hours/month = $5,000/month for bulk)
- Alternative: open-source Whisper locally (faster, cheaper but 95% accuracy)
- Tradeoff: AWS Transcribe more accurate, local Whisper saves cost

---

### DRM & Security

**Widevine (Google DRM):**
- DASH HLS format support, web + mobile
- License server: checks subscription, device limits, logs grants
- Cost: free (licensed by device OS)

**FairPlay (Apple DRM):**
- HLS format, iOS + macOS
- Licensing: apple.com developer account required
- Cost: free (built into OS)

**PlayReady (Microsoft DRM):**
- DASH format, Windows, Xbox, SmartTV
- Cost: free (built into OS)

**Strategy:** Use all three. Client-side check: `navigator.requestMediaKeySystemAccess()` detects support, picks appropriate DRM.

**AWS KMS (Key Management):**
- Master encryption key never leaves AWS (HSM-backed)
- Automatic rotation monthly
- Audit trail (who accessed what, when)
- Cost: $1/key + $0.03 per 10K requests
- Alternative: self-managed keys (risky)

**CloudFlare WAF:**
- Block SQL injection, XSS, bots before they hit your servers
- DDoS mitigation (anycast network absorbs attacks)
- Cost: Enterprise tier ($200/month)

---

## Database Schema (Sketch)

```sql
-- PostgreSQL
users (id, email, name, password_hash, avatar_url, created_at)
subscriptions (id, user_id, tier, start_date, end_date, status)
content (id, title, description, duration_sec, release_year, poster_url, 
         genre_ids json, cast_ids json, director_id)
cast (id, name, biography, profile_pic_url)
reviews (id, content_id, user_id, rating, text, created_at)
favorite_content (user_id, content_id, added_at)

-- DynamoDB
watch_history:
  PK: user_id
  SK: timestamp (latest first)
  Attrs: content_id, duration_watched_sec, quality, bitrate, device_id, region

playback_state:
  PK: user_id
  SK: content_id
  Attrs: current_position_sec, watched_percentage, updated_at

-- Elasticsearch
movies (index)
  id, title, description, genres[], cast[], director, year, language, imdb_rating
```

---

## API Conventions

All endpoints return JSON:
```json
{
  "data": { ... },
  "error": null,
  "meta": { "pagination": { "page": 1, "total": 100 } }
}
```

Error format:
```json
{
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password incorrect",
    "status": 401
  }
}
```

Versioning: `/api/v1/users` (major version in path, breaking changes explicit)

Rate limits (per IP, per authenticated user):
- General: 100 req/min
- Search: 30 req/min (expensive, Elasticsearch)
- Upload: 1 req/10 sec (serialized)
- DRM license requests: 100 req/min (per device)

---

## Testing Strategy

**Unit:**
- Domain logic (recommendation scoring, DRM license validation)
- Use fakes/mocks for repos, clients

**Integration:**
- API endpoints with real PostgreSQL (test container)
- Kafka producer/consumer (test broker)
- No external AWS calls

**E2E:**
- Critical flows: login → search → play video
- Use Playwright (headless browser)
- Run against staging environment

**Load Testing:**
- Simulate 100K concurrent video viewers
- Tools: k6, Locust
- Measure: video start latency, API response times, database connection pool saturation

---

## Deployment Targets

**Local Dev:**
- Docker Compose: postgres, redis, minio (S3-compatible), elasticsearch, kafka
- Minio replaces S3 (local dev, free)
- Mock DRM (skip encryption checks)

**Staging:**
- AWS account, all services real
- Reduced capacity (1 encoding GPU)
- Test full workflow before production

**Production:**
- Multi-region (us-east-1, eu-west-1, ap-south-1)
- Kubernetes (EKS): auto-scale backend based on load
- CloudFront: 200+ edge locations
- RDS Multi-AZ: PostgreSQL with automatic failover
- DynamoDB: global tables (read replicas in 3 regions)
- Route 53: health-based routing (if us-east-1 fails, route to eu-west-1)

---

## Cost Levers

**To reduce cost:**
1. Reduce CloudFront egress (lower bitrates for free tier: 360p instead of 480p)
2. Batch encoding jobs (off-peak hours = cheaper)
3. Use local Whisper instead of AWS Transcribe
4. DynamoDB on-demand (pay per request) instead of provisioned capacity

**To improve performance:**
1. Add DynamoDB global tables (user playback state available globally)
2. Add Lambda@Edge for image resizing (serve optimal dimensions to each device)
3. Cache recommendations aggressively (compute nightly, serve all day)
4. Use Varnish in front of Elasticsearch (cache query results)

---

## Security Checklist

- [ ] HTTPS/TLS 1.3 everywhere
- [ ] JWT + Refresh tokens (HttpOnly cookies)
- [ ] Rate limiting (per IP, per user)
- [ ] Input validation (Pydantic schemas)
- [ ] CORS (whitelist frontend domain)
- [ ] CSRF tokens (form submissions)
- [ ] Secrets in AWS Secrets Manager (not .env)
- [ ] Encryption at rest (KMS)
- [ ] Encryption in transit (TLS)
- [ ] SQL injection prevention (SQLAlchemy ORM)
- [ ] XSS prevention (React auto-escapes, CSP headers)
- [ ] DRM license server audit logs
- [ ] Dependency scanning (Snyk)
- [ ] Static analysis (SonarQube)
- [ ] Penetration testing (quarterly)
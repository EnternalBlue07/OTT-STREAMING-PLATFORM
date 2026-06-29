# Codebase Structure Steering — OTT Streaming Platform

## Root Layout

```
ott-streaming-platform/
├── backend/              # FastAPI backend
├── frontend/             # Next.js frontend
├── docker-compose.yml    # Local dev stack
├── .env.example          # Secrets template
├── .gitignore
├── README.md
└── .kiro/                # Kiro specs (commit these)
    └── steering/
        ├── product.md
        ├── tech.md
        └── structure.md
```

---

## Backend Structure (Clean Architecture + Async)

```
backend/
├── main.py               # FastAPI app instantiation, middleware, ASGI server setup
├── requirements.txt      # Python dependencies
├── Dockerfile
├── .env.local            # Local secrets (git-ignored)
│
├── domain/               # Pure business logic, zero framework imports
│   ├── __init__.py
│   ├── models.py         # Video, User, Subscription, RecommendationScore
│   ├── enums.py          # SubscriptionTier, VideoQuality, DRMType
│   └── exceptions.py     # DomainException, DRMLicensedenied, etc.
│
├── application/          # Use cases, business rules
│   ├── __init__.py
│   ├── services/
│   │   ├── video_service.py        # UploadVideoUseCase, PublishVideoUseCase
│   │   ├── playback_service.py     # GetPlaybackSessionUseCase, TrackPlaybackUseCase
│   │   ├── recommendation_service.py # GenerateRecommendationsUseCase
│   │   ├── drm_service.py          # GenerateLicenseUseCase, ValidateConcurrentLimit
│   │   ├── search_service.py       # SearchVideosUseCase, ApplyFiltersUseCase
│   │   └── billing_service.py      # CreateSubscriptionUseCase, RefundUseCase
│   └── dto.py            # Data transfer objects (internal request/response shapes)
│
├── infrastructure/       # Concrete implementations
│   ├── __init__.py
│   ├── database/
│   │   ├── postgres.py   # SQLAlchemy setup, pool, migrations
│   │   ├── models.py     # ORM models (mirror domain entities)
│   │   └── repositories/
│   │       ├── video_repo.py
│   │       ├── user_repo.py
│   │       ├── subscription_repo.py
│   │       └── review_repo.py
│   ├── dynamodb/
│   │   ├── client.py     # Boto3 DynamoDB client, connection
│   │   └── repositories/
│   │       ├── watch_history_repo.py
│   │       └── playback_state_repo.py
│   ├── cache/
│   │   ├── redis_client.py
│   │   └── cache_keys.py  # Key naming conventions
│   ├── search/
│   │   └── elasticsearch_client.py  # Elasticsearch queries
│   ├── media/
│   │   ├── mediaconvert_client.py   # AWS MediaConvert encoding
│   │   ├── s3_client.py             # AWS S3 storage
│   │   ├── cloudfront_client.py     # Signed URLs, cache invalidation
│   │   └── transcribe_client.py     # AWS Transcribe for subtitles
│   ├── drm/
│   │   ├── license_server.py        # DRM license generation
│   │   ├── widevine_client.py       # Widevine integration
│   │   └── fairplay_client.py       # FairPlay integration
│   ├── messaging/
│   │   ├── kafka_client.py          # Kafka producer/consumer
│   │   └── event_schemas.py         # VideoUploadedEvent, PlaybackEvent, etc.
│   ├── external/
│   │   └── stripe_client.py         # Stripe payment processing
│   └── auth/
│       └── oauth_client.py          # Google, Facebook, Apple OAuth
│
├── interface/            # FastAPI routers, request/response schemas, DI
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py     # GET /health, /readiness
│   │   ├── videos.py     # GET /videos, GET /videos/:id, POST /videos (upload)
│   │   ├── search.py     # GET /search, GET /search/suggestions
│   │   ├── playback.py   # POST /playback/start, POST /playback/progress
│   │   ├── drm.py        # POST /drm/license (license server endpoint)
│   │   ├── recommendations.py # GET /recommendations
│   │   ├── subscriptions.py   # POST /subscriptions, GET /subscriptions/:id
│   │   ├── admin.py      # Admin endpoints (protected by RBAC)
│   │   ├── auth.py       # Login, signup, refresh token
│   │   └── uploads.py    # Presigned S3 URLs for direct upload
│   ├── schemas.py        # Pydantic request/response models
│   ├── dependencies.py   # FastAPI dependency injection (repos, services)
│   ├── middleware.py     # CORS, CSRF, rate limiting, logging
│   └── error_handlers.py # Exception → HTTP response mapping
│
└── tests/
    ├── unit/
    │   ├── domain/
    │   ├── application/
    │   └── infrastructure/
    ├── integration/
    │   ├── test_video_upload_flow.py
    │   ├── test_playback_tracking.py
    │   └── test_drm_license_server.py
    ├── e2e/ (optional, usually run in Playwright)
    ├── conftest.py       # Pytest fixtures (fake repos, mock AWS)
    └── load_test.py      # k6 or Locust scripts for 100K concurrent
```

### Key Constraint: Domain Isolation

**`domain/` NEVER imports from `infrastructure/` or `interface/`.**

Example violation (BAD):
```python
# domain/models.py (WRONG!)
from sqlalchemy import Column, String  # Framework code in domain

class Video:
    __tablename__ = 'videos'
```

Correct approach (GOOD):
```python
# domain/models.py
from dataclasses import dataclass

@dataclass
class Video:
    id: str
    title: str
    duration_sec: int
```

ORM mapping lives in `infrastructure/database/models.py`, not domain.

---

## Frontend Structure (Feature Modules + Performance)

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout, metadata, fonts
│   │   ├── page.tsx      # Homepage (server component)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── search/page.tsx
│   │   ├── watch/[id]/page.tsx       # Video player page
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin nav, RBAC check
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── content/page.tsx      # Upload, manage content
│   │   │   ├── users/page.tsx        # User management
│   │   │   ├── analytics/page.tsx    # Revenue, engagement
│   │   │   └── subtitles/page.tsx    # Subtitle management
│   │   ├── profile/
│   │   │   ├── page.tsx              # User settings
│   │   │   ├── watchlist/page.tsx
│   │   │   └── devices/page.tsx      # Manage devices, logout sessions
│   │   └── api/                      # API routes (if needed, mostly call FastAPI)
│   │       └── auth/
│   │           ├── route.ts          # POST /api/auth/callback (OAuth redirect)
│   │           └── logout/route.ts
│   │
│   ├── features/         # Feature-based modules
│   │   ├── homepage/
│   │   │   ├── components/
│   │   │   │   ├── Hero.tsx          # Full-width banner, autoplay trailer
│   │   │   │   ├── TrendingRow.tsx   # Horizontal card scroll
│   │   │   │   ├── RecommendationRow.tsx
│   │   │   │   └── JoinCtaSection.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useHeroTrailer.ts
│   │   │   │   └── useHomepageRecommendations.ts
│   │   │   ├── api.ts                # Fetch homepage data
│   │   │   └── store.ts              # Zustand store (if needed)
│   │   │
│   │   ├── search/
│   │   │   ├── components/
│   │   │   │   ├── SearchBar.tsx     # Input, voice search
│   │   │   │   ├── SearchSuggestions.tsx
│   │   │   │   ├── FilterPanel.tsx   # Genre, year, language dropdowns
│   │   │   │   ├── SearchResults.tsx # Infinite scroll grid
│   │   │   │   └── ResultCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSearch.ts      # Debounced search, React Query
│   │   │   │   └── useFilters.ts     # URL state for filters
│   │   │   ├── api.ts
│   │   │   ├── store.ts              # Selected filters, sort order
│   │   │   └── types.ts
│   │   │
│   │   ├── video-player/
│   │   │   ├── components/
│   │   │   │   ├── Player.tsx        # HLS.js wrapper
│   │   │   │   ├── Controls.tsx      # Play/pause, quality, fullscreen
│   │   │   │   ├── SubtitlePanel.tsx # Language selection, styling
│   │   │   │   ├── VideoInfo.tsx     # Title, description, cast
│   │   │   │   ├── Reviews.tsx       # User reviews, ratings
│   │   │   │   └── RelatedVideos.tsx # "Up next", "You might like"
│   │   │   ├── hooks/
│   │   │   │   ├── useHlsPlayer.ts   # HLS.js initialization, bitrate switching
│   │   │   │   ├── usePlaybackTracking.ts  # Send progress to backend
│   │   │   │   ├── useSubtitles.ts   # Load, sync, style subtitles
│   │   │   │   └── useDRMLicense.ts  # Fetch & validate DRM license
│   │   │   ├── api.ts                # Playback endpoints
│   │   │   ├── store.ts              # Current video, playback state
│   │   │   └── types.ts
│   │   │
│   │   ├── admin-content/
│   │   │   ├── components/
│   │   │   │   ├── UploadForm.tsx    # Drag-drop, progress
│   │   │   │   ├── EncodingStatus.tsx # Real-time progress per bitrate
│   │   │   │   ├── MetadataForm.tsx  # Title, genres, cast, etc.
│   │   │   │   └── PublishModal.tsx  # Schedule release
│   │   │   ├── hooks/
│   │   │   │   ├── useVideoUpload.ts
│   │   │   │   ├── useEncodingProgress.ts (WebSocket)
│   │   │   │   └── useMetadataEdit.ts
│   │   │   ├── api.ts
│   │   │   └── store.ts
│   │   │
│   │   ├── admin-analytics/
│   │   │   ├── components/
│   │   │   │   ├── EngagementChart.tsx
│   │   │   │   ├── RevenueCard.tsx
│   │   │   │   ├── UserGrowthChart.tsx
│   │   │   │   └── BitrateDist.tsx  # Video quality distribution
│   │   │   ├── hooks/
│   │   │   │   └── useAnalyticsData.ts
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── recommendations/
│   │   │   ├── hooks/
│   │   │   │   └── usePersonalizedRecommendations.ts
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   │
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginForm.tsx
│   │       │   ├── SignupForm.tsx
│   │       │   ├── OAuthButtons.tsx
│   │       │   └── PasswordReset.tsx
│   │       ├── hooks/
│   │       │   ├── useAuth.ts        # Global auth state (Zustand)
│   │       │   └── useLogin.ts
│   │       ├── api.ts
│   │       └── store.ts              # Zustand: user, token, refresh state
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Navbar.tsx            # Top nav with user menu
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── SkeletonLoader.tsx    # Pulsing placeholder
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            # Check if logged in
│   │   │   ├── useFetch.ts           # Wrapper around fetch/axios
│   │   │   ├── useInfiniteScroll.ts  # Trigger load more
│   │   │   └── useLocalStorage.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts         # Axios instance, interceptors (auth, errors)
│   │   │   ├── format.ts             # Format duration, bitrate, filesize
│   │   │   ├── constants.ts          # API_BASE, CDN_BASE, etc.
│   │   │   ├── image-loader.ts       # Next.js Image optimization helper
│   │   │   └── error-handler.ts      # Common error scenarios
│   │   ├── styles/
│   │   │   └── globals.css           # Tailwind directives, global styles
│   │   ├── design-tokens/
│   │   │   ├── colors.ts             # Color scale (primary, secondary, etc.)
│   │   │   ├── spacing.ts            # Padding/margin scale
│   │   │   ├── typography.ts         # Font scales, weights
│   │   │   └── shadows.ts            # Elevation system
│   │   └── types/
│   │       └── global.ts             # Shared TypeScript types
│   │
│   └── middleware.ts     # Next.js middleware (auth checks, redirects)
│
├── public/              # Static assets (favicon, robots.txt)
│   ├── images/
│   ├── fonts/           # Self-hosted fonts (Inter, SF Pro Display)
│   └── icons/
│
├── vite.config.ts       # (Not used with Next.js, but might reference Tailwind)
├── tsconfig.json        # Strict mode
├── tailwind.config.ts   # Design tokens, color palette
├── next.config.js       # Image optimization, redirects
├── .eslintrc.json       # Linting rules, no-restricted-imports
├── package.json
├── package-lock.json
└── tests/
    ├── unit/
    │   └── features/
    │       ├── homepage.test.tsx
    │       ├── search.test.tsx
    │       └── player.test.tsx
    ├── integration/
    │   └── auth-flow.test.tsx  (signup → login → profile)
    └── e2e/
        ├── search-and-play.spec.ts  (Playwright)
        └── upload-and-stream.spec.ts
```

### Key Constraint: Feature Isolation

**No feature imports another feature's internals.**

Bad:
```tsx
// features/search/components/SearchResults.tsx
import { RecommendationRow } from '../recommendations/components/RecommendationRow'
```

Good:
```tsx
// shared/components/RecommendationRow.tsx (moved to shared)
// features/search/components/SearchResults.tsx
import { RecommendationRow } from '@/shared/components'
```

---

## Database Schema

### PostgreSQL

```sql
-- Transactional data
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  password_hash VARCHAR,
  avatar_url VARCHAR,
  preferred_language VARCHAR DEFAULT 'en',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP  -- soft delete for GDPR
)

subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  tier VARCHAR ('free', 'premium', 'family'),
  start_date DATE,
  end_date DATE,
  status VARCHAR ('active', 'canceled', 'past_due'),
  stripe_subscription_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

content (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  poster_url VARCHAR,
  banner_url VARCHAR,
  duration_sec INT,
  release_year INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

genres (id INT PRIMARY KEY, name VARCHAR UNIQUE)
content_genres (content_id UUID, genre_id INT)

cast (
  id UUID PRIMARY KEY,
  name VARCHAR,
  biography TEXT,
  profile_pic_url VARCHAR
)
content_cast (content_id UUID, cast_id UUID, character_name VARCHAR, credited_order INT)

reviews (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES content,
  user_id UUID REFERENCES users,
  rating INT (1-10),
  text TEXT,
  created_at TIMESTAMP
)

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id_status ON subscriptions(user_id, status);
CREATE INDEX idx_content_year_genres ON content(release_year) 
  INCLUDE (id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_cast ON content_cast(content_id, credited_order);
```

### DynamoDB

```
watch_history
├─ PK: user_id
├─ SK: timestamp (ISO 8601, latest first)
├─ Attributes:
│  ├─ content_id (movie ID)
│  ├─ duration_watched_sec (how much they watched)
│  ├─ quality (720p, 1080p, 4k)
│  ├─ bitrate (kbps)
│  ├─ device_id (which device)
│  └─ region (CloudFront edge location)
├─ TTL: 90 days (auto-delete old entries)

playback_state
├─ PK: user_id
├─ SK: content_id
├─ Attributes:
│  ├─ current_position_sec (where they left off)
│  ├─ watched_percentage (0-100)
│  ├─ updated_at (last sync)
│  ├─ device_id (which device last watched from)
│  └─ quality_preferred (user's preferred quality)
├─ TTL: 30 days (assume they won't return after a month)

playback_events
├─ PK: user_id
├─ SK: timestamp#event_type (e.g., "2024-01-15T10:30:45#pause")
├─ Attributes:
│  ├─ content_id
│  ├─ event_type (play, pause, seek, quality_change, end)
│  ├─ position_sec (where event occurred)
│  ├─ quality (what quality at event)
│  ├─ device_id
│  └─ duration_ms (how long playback lasted before event)
├─ TTL: 90 days

concurrent_sessions
├─ PK: user_id
├─ SK: device_id
├─ Attributes:
│  ├─ content_id (what's playing now)
│  ├─ position_sec (where in video)
│  ├─ started_at (session start timestamp)
│  ├─ last_heartbeat (when device last checked in)
│  ├─ ip_address
│  └─ user_agent
├─ TTL: 12 hours (auto-logout if no heartbeat)
```

### Elasticsearch

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text" },
      "genres": { "type": "keyword" },
      "cast": { "type": "text" },
      "director": { "type": "keyword" },
      "year": { "type": "integer" },
      "duration_min": { "type": "integer" },
      "language": { "type": "keyword" },
      "imdb_rating": { "type": "float" },
      "review_count": { "type": "integer" },
      "created_at": { "type": "date" }
    }
  }
}
```

---

## Docker Compose (Phase 0)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ott
      POSTGRES_PASSWORD: ott_dev
      POSTGRES_DB: ott_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes

  minio:  # S3-compatible, for local dev
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"  # Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/minio
    command: server /minio --console-address ":9001"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kafka:
    image: confluentinc/cp-kafka:7.0.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.0
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      DATABASE_URL: postgresql://ott:ott_dev@postgres:5432/ott_platform
      REDIS_URL: redis://redis:6379
      ELASTICSEARCH_URL: http://elasticsearch:9200
      KAFKA_BROKERS: kafka:29092
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    depends_on:
      - postgres
      - redis
      - elasticsearch
      - kafka
      - minio

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE: http://localhost:8001
    depends_on:
      - backend

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"  # 3000 taken by Next.js
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  minio_data:
  elasticsearch_data:
```

---

## Git Workflow

- **Branches:** `phase-0/`, `phase-1/`, etc.
- **Commits:** One feature per commit (e.g., "Add video upload endpoint", "Create RecommendationScore domain model")
- **Secrets:** Never commit `.env.local`, use `.env.example` as template
- **Spec files:** Commit `.kiro/specs/` and `.kiro/steering/` to git (specs are part of history)

---

## Performance Checklist

- [ ] Images optimized (Next.js Image, WebP, lazy loading)
- [ ] Code splitting per route (don't load 300KB JS for homepage)
- [ ] HLS.js bitrate adaptation (240p on 2G, 4K on fiber)
- [ ] Database indexes on frequent queries
- [ ] Redis caching of expensive operations (recommendations, search aggregations)
- [ ] CloudFront caching of static assets (24h for videos, 1h for manifests)
- [ ] API response streaming (for large lists, stream JSON to client)
- [ ] Service Worker for offline playback state
- [ ] Load testing with k6 (100K concurrent users)

---

## Security Checklist

- [ ] HTTPS/TLS 1.3 everywhere
- [ ] JWT + Refresh tokens in HttpOnly cookies
- [ ] Rate limiting per IP and user
- [ ] Input validation (Pydantic)
- [ ] CORS whitelist (no `*`)
- [ ] CSRF tokens
- [ ] Secrets in AWS Secrets Manager
- [ ] Encryption at rest (S3, RDS)
- [ ] Encryption in transit (TLS)
- [ ] DRM license server audit logs
- [ ] Dependency scanning
- [ ] Static code analysis
- [ ] Quarterly penetration testing
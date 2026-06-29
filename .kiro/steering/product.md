# Product Steering — OTT Streaming Platform

## What We're Building

A **Netflix-tier streaming service** — not just a video player, but a complete media distribution, monetization, and personalization platform. The product has three equal pillars:

1. **Content Delivery** — stream 4K without buffering, auto-adjust bitrate, CDN-optimized, cost-controlled
2. **Personalization** — recommendations feel inevitable, search is instant, UI feels like it knows you
3. **Monetization** — subscriptions, DRM prevents sharing, concurrent device limits enforce tiers

Any one pillar failing breaks the product. All three must work.

## User Personas (In Priority Order)

### 1. Casual Evening Viewer (40% of users)
- Watches 1–2 hours/night
- Browses for 5–10 minutes, wants decision fatigue eliminated
- Uses mobile, sometimes on weak WiFi
- **Success metric:** "I found something to watch in 5 minutes without buffering"
- **Technical needs:**
  - Page loads instantly (< 2 sec)
  - Recommendations feel personal, not generic
  - Video starts fast even on 2G (480p, not 4K)
  - Infinite scroll smooth (no jank)

### 2. Binge Watcher (30% of users)
- Watches 4+ hours/session, often across episodes
- Doesn't want to think about quality — just play
- Desktop/TV, tends to have decent bandwidth
- **Success metric:** "I watched 6 hours straight with zero buffering or restarts"
- **Technical needs:**
  - "Continue watching" is instant (resume within 1 second)
  - Quality auto-adjusts if bandwidth drops (4K → 1080p seamlessly)
  - Device never gets too hot (bitrate caps, seek optimization)
  - Playback state syncs across devices

### 3. International User (20% of users)
- Relies on subtitles (often non-native speaker)
- Poor connectivity (2G/3G in some regions)
- Multi-language audio expected
- **Success metric:** "Subtitles sync perfectly even on slow connection"
- **Technical needs:**
  - Subtitles load independently from video (don't wait for 4K to decode if watching at 480p)
  - 10+ language options + translation quality
  - Subtitle styling (size, background, position) customizable
  - Fallback to local transcription if network drops

### 4. Admin / Content Creator (5% of users, but critical)
- Uploads 10–50 titles/week
- Needs real-time feedback (is it encoding? how much time left?)
- Metadata correction should be instant, not wait for server sync
- **Success metric:** "Uploaded 5 movies, all streaming in 4K in 2 hours"
- **Technical needs:**
  - Bulk upload UI (drag-drop, resume on failure)
  - Real-time encoding progress (percent complete, ETA)
  - Metadata editing (title, description, genres, cast) with auto-save
  - Publish scheduling (go live at specific time)
  - Encoding error clarity (not "Error 500", but "Audio codec unsupported, use AAC")

## Core User Flows

### Flow 1: Discovery → Play
1. User opens app (< 2 sec load)
2. Homepage shows hero (autoplay trailer, no sound until hover)
3. Trending row, recommendations row
4. User clicks a title
5. Movie page shows trailer, cast, reviews, ratings
6. User clicks "Play"
7. Video starts in < 500 ms at appropriate bitrate
8. Subtitles load, auto-sync
9. User watches (playback state synced every 30 sec)

**Failure points:**
- Homepage takes 5 sec to load → user leaves
- Hero autoplay shows 4K when user on 2G → buffering, frustration
- Video starts but subtitles lag 2 sec behind → user can't follow
- User switches to next episode manually (instead of auto-play) → bad UX

### Flow 2: Search
1. User clicks search bar
2. Types "heist sci-fi"
3. Suggestions appear in < 150 ms
4. User filters: `action AND year >= 2020`
5. Results show 50 movies, faceted by genre/year/language
6. User scrolls, clicks one
7. Movie page loads
8. User watches

**Failure points:**
- Search suggestions take > 500 ms → feels slow
- No filters (user searches for 10 min, can't narrow down)
- Results in wrong language (user expects subtitles, not dubbed)

### Flow 3: Admin Upload
1. Admin drags 5 movies into upload UI
2. Files start uploading (S3 pre-signed URL, direct to cloud)
3. Progress bar shows 60% complete
4. Admin fills metadata: title, description, genres, cast, rating
5. Admin clicks "Publish"
6. Movie goes into encoding queue
7. Admin goes to "Encoding" dashboard
8. Real-time progress: "1080p 25% complete, 720p 40% complete"
9. All done in 30 min
10. Movie is live, searchable, streamable

**Failure points:**
- Upload hangs at 80% (browser crash, connection loss)
- Admin has to re-upload everything (no resume)
- Encoding queue is opaque (how long will it take? is it broken?)
- Movie published but not indexed in search (takes 10 min for full sync)

## Subscription Tiers (Monetization Model)

### Free Tier
- Max 1 device, 480p max resolution
- Ads supported (one ad per 20 min)
- No download, no offline watching
- No concurrent device enforcement (1 device on plan, so natural limit)

### Premium Tier ($15.99/month)
- Up to 4 devices, 4K resolution
- No ads
- Download episodes for offline
- DRM-enforced: concurrent streams capped at 4 (attempt to open 5th → oldest logs out)

### Family Tier ($19.99/month)
- Up to 4 user profiles per account
- 4K on all profiles
- Parental controls (age-gated content)
- Download support
- Concurrent stream limit: 4 (shared across profiles)

## DRM & Content Protection

### Signed URLs (Prevent Direct Sharing)
Video URLs are: `https://video-cdn.app/video/abc123?sig=xyz&expires=1234567890&user_id=user_456`
- Expires in 15 minutes
- Tied to user ID + device fingerprint (User-Agent + IP hash)
- Attempt to share URL or watch from different device → URL invalid
- No way to download raw video stream (CloudFront blocks direct S3 access)

### Widevine DRM (Video Encryption)
- Video segments encrypted, playable only by licensed HLS.js/Dash.js player
- Mobile: FairPlay (iOS), Widevine (Android)
- Web: Widevine (Chrome), PlayReady (Edge, some SmartTVs)
- License server checks: subscription active? Device limit exceeded?
- Each license grant logged (audit trail for DMCA, if needed)

### Concurrent Device Limit
- Premium tier: user can watch on 4 devices max
- At playback start: backend checks "how many active sessions for this user?"
- If limit hit: oldest session is force-logged-out (with warning: "Oldest device logged out to make room for new playback")
- Deters password sharing without being hostile

### Watermarking (Optional, Premium Feature)
- User ID embedded in video stream (visible in screenshots, invisible in playback)
- Deters illegal ripping/uploading to torrent sites
- Not foolproof, but raises friction

## Content Moderation & Compliance

### GDPR (Right to Deletion)
- User can request account deletion
- All personal data deleted: watch history, preferences, profile, payment info
- Video library remains (user no longer associated with it)
- Deletion completed within 30 days

### CCPA (Opt-Out)
- User can opt-out of personalized recommendations
- Gets random suggestions instead
- Can opt-back in anytime

### Age-Restricted Content
- Admin can mark content as 13+, 16+, 18+
- Free tier: all ages viewable (with warning for 16+, 18+)
- Parent control profiles: restrict by rating
- Warning on play if content above profile age

### Copyright & DMCA
- Report copyright violation: admin reviews
- Strike system: 3 strikes = content removed
- Watermark logs help trace illegal uploads

## Success Metrics (Testing & Beyond)

### Phase 0–3 (Before Public)
- Homepage: 95 Lighthouse score, 2.4 sec LCP
- Upload to stream (4K): 30 min end-to-end
- Search: < 150 ms p95
- Video start: < 500 ms p95, no buffering
- Subtitles: sync within 100ms, available in 3+ languages
- DRM: zero license errors (< 0.1% failure rate)

### Phase 4–7 (Private Testing, 1K Users)
- 1,000 concurrent users no degradation
- Video buffering: < 5% of sessions (p95)
- Recommendation CTR: > 30% (relevant)
- Subtitle generation: < 2 hours per movie
- Admin uploads: avg 20 min to stream
- User-reported issues: < 2% of sessions

### Public Launch (100K Concurrent)
- 99.99% uptime (11.5 min downtime/month)
- Video start: < 500 ms (p95)
- Search: < 150 ms (p95)
- Subscription churn: < 5% month-over-month
- Zero security breaches
- 95 Lighthouse score maintained

## Platform Differentiation (Why Users Pick Us)

1. **Faster video start** — competitors buffer, we stream (< 500 ms)
2. **Better recommendations** — feel personal, not algorithmic spam
3. **International-first** — multi-language, multi-subtitle, multi-audio baked in
4. **Premium design** — animations are smooth, UI doesn't feel cheap
5. **No ads on premium** — (vs. Netflix's ad tier)
6. **Fair pricing** — $15.99 vs. Netflix $22.99 (for 1080p tier)

## What We're NOT Building (Scope Boundaries)

- Live streaming (sports, events) — only on-demand video
- User-generated content (UGC) — curated catalog only
- Social features (following, watch parties) — maybe Phase 2
- Gaming (interactive movies) — out of scope
- VR/360° video — out of scope
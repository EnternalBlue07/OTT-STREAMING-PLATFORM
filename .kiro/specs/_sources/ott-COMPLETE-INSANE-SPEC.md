# 🔥 CINEMAVERSE — World's Most Insane OTT Platform
## Complete Product Spec + Crazy Features + All Sections Fully Functional

---

# PART 1: THE VISION

You're not building Netflix. You're building what Netflix would build if it was started in 2025 by someone who actually gives a damn about the experience. Every section works. Every page has a purpose. Every feature has a reason to exist. And then there are 12 features that exist only to make people say "what the actual fuck is this."

---

# PART 2: COMPLETE PAGE MAP (Every Page, Every Section, Fully Functional)

## 2.1 — PUBLIC PAGES (Before Login)

### A. Landing Page `/`
Not a login wall. A CINEMATIC EXPERIENCE.

**Hero Section:**
- Full-viewport autoplay video reel (no sound, 8-second loop of curated clips)
- Particle effect overlay (subtle, GPU-accelerated, responds to mouse movement)
- "Start Watching Free" CTA — triggers signup modal
- Live counter: "12,847 people watching right now" (real-time WebSocket)
- Glassmorphism card floating: "No credit card. No commitment. 500+ titles free."

**Why We're Different Section:**
- Animated feature comparison cards (us vs. the rest)
- 3D tilt cards on hover (Framer Motion + CSS transforms)
- Each card expands on click showing real demo

**Trending Right Now (Public Preview):**
- Horizontal scroll of 10 trending titles (blurred for non-logged-in users)
- Hover unblurs partially — teases the content, drives signups
- Click → triggers signup modal (not redirect, modal)

**Social Proof Section:**
- Live tweet wall (Twitter/X embed filtered by hashtag)
- User review carousel (auto-scroll, 5-star ratings)
- "Join X million viewers" — real number from DB

**Footer:**
- Links to all pages
- Language selector (changes UI language without reload)
- App download badges (iOS, Android)
- Social links

---

### B. Login Page `/login`

**Not a boring form. A cinematic gateway.**

Design: Split screen
- Left: looping clip reel of platform highlights, with glassmorphism "What's hot tonight" card
- Right: Auth form

**Auth Options:**
- Email + Password
- Google OAuth (one click)
- Apple Sign In
- Phone OTP (India-first: +91 support, 6-digit OTP via SMS)
- Magic Link (email link, no password)

**Features:**
- Auto-detect returning user (saved email, show avatar)
- "Remember this device for 30 days" checkbox
- Wrong password → "Forgot password?" link appears after 2nd attempt
- After 5 failed attempts → CAPTCHA + 15-minute lockout (security)
- Loading state: beautiful spinner, not just freeze
- On success: smooth full-page transition to homepage

**Post-Login Flow:**
- First-time user → Genre preference onboarding (5-step)
- Returning user → Resume where you left off
- Admin user → Redirect to `/admin` dashboard

---

### C. Signup Page `/signup`

**Steps (multi-step wizard, not one long form):**

Step 1 — Account:
- Name, Email, Password (strength meter: weak/medium/strong)
- OR: "Continue with Google / Apple / Phone"

Step 2 — Choose Plan:
- Three plan cards (Free, Premium, Family)
- Animated toggle: Monthly / Yearly (yearly shows savings)
- If Free: skip payment
- If Premium/Family: go to Step 3

Step 3 — Payment (if paid):
- Razorpay (India) + Stripe (International)
- Card, UPI, Net Banking, Wallets (Paytm, PhonePe, GPay)
- Auto-detect country → show appropriate gateway
- Coupon code field with instant validation

Step 4 — Genre Preferences:
- 20 genre tiles (visual, poster-style)
- Select 3+ to continue
- Real-time preview: "Based on your choices, you'll love..."

Step 5 — Language Preferences:
- Primary language
- Subtitle language
- Audio language preference

Done → Confetti animation → Redirect to personalized homepage

**Legal Compliance (explicit, not buried):**
- Separate checkbox for each: ToS, Privacy Policy, Cookie Policy, Content Usage Agreement
- Cannot proceed without all checked
- Each opens inline modal (not new tab) showing full text
- Timestamp of consent stored in DB

---

### D. Pricing Page `/pricing`

**This page is a conversion machine.**

**Hero:**
- "Your Entertainment, Your Price"
- Animated price cards floating with subtle 3D effect
- Trust badges: "Cancel anytime", "No hidden fees", "HD/4K included"

**Plan Cards (3 tiers):**

```
FREE                    PREMIUM                 FAMILY
₹0/month               ₹299/month              ₹499/month
                        (₹2,499/year)           (₹3,999/year)

500+ titles             10,000+ titles          10,000+ titles
480p max               4K HDR                  4K HDR
1 screen               4 screens               6 screens
Ads supported          No ads                  No ads
No downloads           Download 25/month       Download 50/month
                       1 profile               6 profiles
                                               Kids mode
                                               Parental controls
```

**Toggle: Monthly ↔ Yearly**
- Yearly shows "Save 30%" badge
- Price smoothly animates from monthly to yearly

**Feature Comparison Table (Full):**
- 30+ features listed
- Checkmarks/crosses per tier
- Hover each feature → tooltip explains what it means
- Sticky header so you always know which tier you're comparing

**FAQ Section:**
- 15 common questions with smooth accordion
- "Can I change plans?" "What payment methods?" "How to cancel?" etc.

**Testimonials:**
- 3 premium users with photo, name, quote
- "Switching to Premium was the best ₹299 I ever spent" — style

**Sticky Bottom Bar (on mobile):**
- "Start Free" and "Go Premium" buttons always visible

---

## 2.2 — USER PORTAL (After Login)

### E. Homepage `/home`

**This is the experience. The dopamine machine.**

**Personalized Hero Section:**
- Greeting: "Good evening, Arjun 👋 Here's what's trending for you"
- Auto-playing hero (top recommended for this user, chosen by AI)
- Background shifts based on time of day (darker at night, brighter morning)
- "Continue Watching" pill button if user has in-progress content
- Play trailer on hover (muted, 15-sec preview)
- "Add to Watchlist" heart button (animated, instant state)

**Content Rows (all horizontal scroll, all dynamic):**

Row 1: Continue Watching
- Shows exact timestamp ("45:23 remaining")
- Progress bar on card
- Smart prediction: "Episode 5 of Dark — you're 80% done!"
- Auto-removes on completion

Row 2: Trending Now
- Real-time (updates every 15 min from viewing data)
- Rank badges (#1, #2, #3)
- "Hot" fire badge for titles gaining fastest

Row 3: Because You Watched [Title]
- AI recommendation based on last watched
- "Since you loved Inception → Try these"

Row 4: Top 10 in India Today
- Netflix-style numbered cards (1-10)
- Numbers in giant typography behind poster

Row 5: New Releases
- "Just Added" badge
- Sorted by upload date

Row 6: Editor's Picks
- Human-curated (admin can set)
- "Our team recommends" branding

Row 7: Mood-Based Row
- AI detects time of day + viewing history + day of week
- Monday 9pm: "Unwind After Work" → short comedies
- Friday night: "Weekend Binge-Starter" → epic series
- Sunday morning: "Easy Sunday" → light documentaries

Row 8: Genre Rows (based on user preferences)
- One row per top 3 genres selected during signup
- "Your Horror Picks", "Sci-Fi for You", etc.

Row 9: Expiring Soon
- "Leaving in 3 days" — creates urgency
- Licensed content approaching license expiry

Row 10: Download & Go
- Titles available for offline download (premium only)
- "Watch on the plane" framing

**Search Bar (always visible in nav):**
- Instant suggestions (< 150ms)
- Voice search icon (Web Speech API)
- Recent searches
- Trending searches

---

### F. Movie/Show Page `/watch/[id]`

**The page that makes or breaks the decision to watch.**

**Above the Fold:**
- Giant banner with cinematic poster + blurred background matching poster colors
- Title in premium typography
- Badges: Year, Rating (U/A, A), Duration, Quality (4K HDR, HDR10+)
- Stars: IMDb rating + Platform rating + Your rating (if watched)
- Synopsis (2-3 sentences, expandable)
- Primary CTA: "▶ Play" (big, red, impossible to miss)
- Secondary CTAs: "+ Watchlist", "Share", "Download" (premium)

**Trailers Section:**
- Horizontal scroll: Main trailer, Teaser, Behind the Scenes, Interviews
- Play inline (no new tab) with picture-in-picture option

**Cast & Crew:**
- Horizontal scroll of cast cards
- Photo, name, character name
- Click → opens side panel with filmography on your platform
- "More from this director" link

**Episode List (for Series):**
- Season tabs
- Episode cards with thumbnail, title, duration, synopsis
- "Watched" indicator (checkmark overlay)
- Current episode highlighted
- Download button per episode (premium)

**Related Content:**
- "More Like This" row
- "From Same Director"
- "Same Genre You Might Like"

**User Reviews:**
- Average star rating with breakdown (1-5 stars, bar chart)
- Verified viewer badge (only users who watched > 80% can review)
- Helpful / Not Helpful voting on reviews
- Spoiler toggle (hide/show spoiler reviews)
- Sort: Most Recent, Most Helpful, Critical, Positive

**Content Info Panel:**
- Languages available (audio)
- Subtitles available
- Accessibility: Audio description, CC
- Content warning (violence/sexual/language level)
- Release date, Studio, Genre tags (clickable)

---

### G. Video Player `/player/[id]`

**The crown jewel. This player is better than anything out there.**

**Player Controls (custom, not browser default):**
- Play/Pause (spacebar shortcut)
- Scrub bar with thumbnail preview on hover (every 10 seconds)
- Volume slider + Mute (M key shortcut)
- 10-second rewind/forward (arrow keys, double-tap on mobile)
- Playback speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Quality selector: Auto, 4K, 1080p, 720p, 480p (with current bandwidth shown)
- Subtitle selector (language + style options)
- Audio track selector (language)
- Picture-in-Picture button
- Fullscreen button
- Mini-player button (shrinks to corner, user can browse while watching)

**Crazy Player Features:**

🎯 **Smart Skip:**
- AI detects intro sequences → "Skip Intro" button appears at exact right second
- AI detects recap sequences → "Skip Recap" button
- AI detects credits → "Next Episode" button appears 30 sec before end
- "Skip to Action" button for action movies (skip boring scenes)

🎭 **Cinematic Mode:**
- Dims browser UI, shows ONLY the player
- Keyboard shortcut: C
- Exit: ESC

📺 **Cast to TV:**
- Chromecast support
- AirPlay support (iOS/macOS)
- Samsung TV SmartThings

🎙️ **Real-time Subtitle Translation:**
- Original subtitle visible
- Below it: live AI translation in your preferred language
- Toggle: show original / translation / both

💬 **Commentary Mode (INSANE FEATURE #1):**
- Director's commentary track (if uploaded by admin)
- Fan commentary tracks (crowd-sourced, moderated)
- Switch between commentary tracks mid-watch

📊 **Viewing Stats (during playback):**
- Current bitrate being played
- Buffer health
- CDN edge location serving you
- Tap to hide (always off by default, nerd mode)

---

### H. Search Page `/search`

**AI-powered, not just keyword matching.**

**Search Bar:**
- Autofocus on page load
- Voice search (microphone icon, speak your query)
- Instant suggestions as you type (debounced 200ms)
- Query categories: Title, Person (actor/director), Genre, Mood, Year

**Crazy Search Capabilities:**

🧠 **Semantic Search:**
- "movie where guy goes back in time and fixes his regrets" → finds 5 relevant movies
- "something scary but not too gory" → horror-adjacent, family-safe filters applied
- "like interstellar but more emotional" → embedding-based similarity search

🎭 **Mood Search:**
- "I'm feeling sad" → comfort movies
- "I want to cry" → emotional dramas
- "I'm bored" → thriller/action/comedy rotation
- "I want to be inspired" → biopics, sports dramas

🎬 **Scene Search (INSANE FEATURE #2):**
- "Find me the scene where Leonardo DiCaprio spins the top" → finds exact movie + timestamp
- Powered by: video transcription index + subtitle index + scene tagging
- Results show: movie title, timestamp, 5-second thumbnail

**Filter Panel (left sidebar on desktop, bottom sheet on mobile):**
- Genre (multi-select checkboxes)
- Year range (dual-handle slider)
- IMDb rating (min rating slider)
- Duration (under 90 min, 90-120, 120+, series)
- Language (audio language)
- Subtitle availability
- Quality available (4K, 1080p, etc.)
- Content rating (U, U/A, A)
- Streaming quality for current network (auto-filter by what your connection can handle)

**Results Grid:**
- 4 columns desktop, 2 mobile
- Infinite scroll
- Sort: Relevance, Newest, Rating, Most Watched, Title A-Z
- Card hover: shows trailer, rating, synopsis snippet
- "Save search" feature (bookmarks the exact filter set)

---

### I. My List / Watchlist `/my-list`

**Not just a list. A smart queue.**

**Views:**
- Grid view (posters)
- List view (with synopsis, duration, progress)
- Timeline view (when added, when watched)

**Smart Features:**
- "Recommended to watch next" (AI picks from your list based on mood/time)
- Auto-sort by: Watch soon (expiring), Recently added, Genre
- Bulk actions: Remove multiple, Move to watched
- "Remind me" — set a notification for when you want to watch
- Estimated total watch time of entire list
- "You've been adding to this list for X months. Time to watch?"

---

### J. Continue Watching `/continue`

**Smart, not just a list of unfinished things.**

- Progress bars on all cards
- Time remaining shown
- "Pick up where you left off" — exact second
- "Restart from beginning" option
- Smart prediction: "You usually watch at 9pm — we saved your spot"
- Cross-device sync: "You were watching on Mobile. Continue here?"
- Auto-remove: 30 days after 100% completion

---

### K. Downloads `/downloads` (Premium Only)

**Offline viewing management.**

- Grid of downloaded titles
- Storage bar: "4.2 GB used of 10 GB"
- Quality selector per download (1080p vs 480p = storage difference shown)
- Expiry countdown: "This download expires in 7 days" (DRM-enforced)
- Watch offline button (plays without internet)
- Auto-download next episode toggle (series)
- Delete individual / Delete all

---

### L. User Profile `/profile`

**Full control center.**

**Tabs:**

Tab 1 — Profile:
- Avatar (upload, or choose from 50 preset avatars)
- Display name
- Bio (optional, 160 chars)
- Email (change with verification)
- Phone (change with OTP)

Tab 2 — Preferences:
- Default playback quality
- Autoplay next episode toggle
- Default subtitle language
- Default audio language
- Maturity settings (what content to show in recommendations)

Tab 3 — Subscription:
- Current plan badge (Free/Premium/Family)
- Billing date
- Payment method on file
- Change plan button (instant upgrade, prorated billing)
- Cancel plan (with retention flow: "Are you sure? Here's what you'll lose...")
- Invoice history (download PDF)

Tab 4 — Devices:
- List of all logged-in devices
- "MacBook Chrome", "iPhone 14", "Samsung TV"
- Last active timestamp
- Location (city level)
- Revoke access button per device
- "Log out all devices" nuclear option

Tab 5 — Watch History:
- Full list, date + time watched
- Search through history
- Delete individual entries (privacy)
- "Clear all history" (also resets recommendations)

Tab 6 — Notifications:
- New release alerts (per genre)
- "New episode of [your series]" notifications
- Promotional emails toggle
- Push notification settings (browser/app)

Tab 7 — Privacy & Data:
- Download your data (GDPR)
- Delete account (7-day grace period)
- Cookie preferences
- Tracking opt-out (personalisation off)

---

### M. Multiple Profiles `/profiles`

**Per-account profiles, like Netflix.**

- Up to 6 profiles (Family plan) / 1 profile (Premium) / 1 profile (Free)
- Each profile: separate watch history, separate recommendations, separate watchlist
- Kids profile: locked to U/U-A content only, no search for adult content, bright colorful UI
- Profile PIN: 4-digit PIN to protect profile
- Avatar selection (100+ options)
- Profile switching: click avatar in nav → dropdown of profiles → switch instantly

---

### N. Watch Party `/party/[room-id]`

**INSANE FEATURE #3 — Watch Together, Separated**

**Create Party:**
- Pick a movie/episode
- Generate room link (6-char code like "MOV-XK9")
- Set room size (max 10 people)
- Privacy: open link (anyone with link) or private (invite only)

**In Party:**
- Synchronized playback across all participants (< 100ms sync)
- If host pauses, everyone pauses
- Live reaction bar (emoji reactions float up on screen — customizable)
- Voice chat (WebRTC, no external service)
- Text chat sidebar
- "Raise hand" button (indicates you want to say something)
- Voting: "Should we skip this part?" → majority vote triggers skip
- Host controls: pause, skip, quality override for all

**Technology:**
- WebRTC for voice
- WebSocket room for sync commands
- Redis pub/sub for real-time events
- Max 10 people (bandwidth management)

---

### O. AI Cinema Assistant `/assistant`

**INSANE FEATURE #4 — Your Personal Film AI**

A full chat interface, but specifically for movies/shows.

**What it can do:**

🎬 **Recommendation by description:**
- "I want something like Parasite but set in Japan"
- Returns 5 movies with reasons

🗣️ **Natural language search:**
- "Show me all Christopher Nolan movies rated above 8 on IMDb"
- Returns filtered grid

🎭 **Mood-to-movie:**
- "I just got rejected, recommend something"
- Returns comfort movies + one "empowerment movie"

📖 **Movie analysis:**
- "Explain the ending of Inception"
- "What's the symbolism in 2001: A Space Odyssey?"
- Full AI analysis with spoiler warning

🕐 **Time-based:**
- "I have exactly 87 minutes, what should I watch?"
- Returns movies within that duration

🎲 **Random:**
- "Surprise me with something I'd never normally pick"
- AI picks something outside your comfort zone

📺 **Series planning:**
- "If I start Breaking Bad tonight, when will I finish at 2 episodes/day?"
- "Which season of [show] should I skip?"

---

### P. Notifications Center `/notifications`

**Not just a bell icon.**

Types:
- 🔴 New episode of your series
- 🟡 Movie you added to watchlist now available in 4K
- 🟢 New release in your top genre
- 🔵 Your download expires in 24 hours
- ⚪ Watch Party invite from a friend
- 🟣 Your review got upvoted
- 🟠 Platform announcement

Features:
- Mark all read
- Filter by type
- Per-notification actions (watch now, dismiss, snooze)
- Notification preferences (which types to receive, via what channel)

---

## 2.3 — ADMIN PORTAL `/admin` (Completely Separate, No User Access)

### Q. Admin Login `/admin/login`

**Separate login page, completely different design.**

- No Google/Apple/Phone auth — email + password only (more secure)
- 2FA mandatory (TOTP via Google Authenticator / Authy)
- IP allowlist (optional: only allow login from office IPs)
- Session duration: 8 hours (shorter than user sessions)
- Audit log: every login attempt logged (IP, timestamp, success/fail)
- Admin roles: Super Admin, Content Manager, Analytics Viewer, Moderation Team

---

### R. Admin Dashboard `/admin/dashboard`

**Real-time operations center.**

**Live Metrics Cards:**
- 🔴 Active viewers right now (live count via WebSocket)
- 📊 Total streams today
- 💰 Revenue today (MRR widget)
- 🎬 Videos being encoded (queue length)
- 🚨 Errors in last hour
- 📈 New signups today

**Charts (all real-time, auto-refresh):**
- Concurrent viewers over last 24 hours (line chart)
- Revenue: today vs. yesterday vs. last week (bar chart)
- Signup funnel: visits → signups → free → paid (funnel chart)
- Geographic heat map: where are users watching from right now
- Device breakdown: mobile 58%, desktop 32%, TV 10%
- Content popularity: top 10 most watched in last 24h

**Quick Actions:**
- Upload New Content (opens upload modal)
- Send Push Notification to all users
- Take platform into maintenance mode
- Emergency: kill all active streams

---

### S. Content Management `/admin/content`

**Where content is uploaded, managed, published.**

**Upload Flow:**

Step 1 — Upload:
- Drag-and-drop upload zone (supports MP4, MKV, MOV, AVI)
- Multiple file upload (up to 10 at once)
- Direct S3 upload (pre-signed URL, bypasses server)
- Real-time progress bar per file
- Upload speed indicator (MB/s)
- Resume on network failure (chunked upload)
- File validation: format, minimum resolution (720p minimum), maximum size (50GB)

Step 2 — Metadata:
- Title
- Description (rich text editor — bold, italic, links)
- Genre tags (multi-select from taxonomy)
- Cast (searchable, add existing or create new)
- Director
- Year
- Content Rating (U, U/A, A)
- Language of audio
- Country of origin
- Tags (custom)
- IMDb ID (optional, auto-fetches IMDb data if provided)

Step 3 — Thumbnails:
- Upload poster (2:3 ratio, minimum 600x900)
- Upload banner (16:9, minimum 1920x1080)
- Upload thumbnail (16:9, minimum 1280x720)
- AI auto-generate thumbnails option (INSANE FEATURE #5):
  - "Generate 5 thumbnail options" → AI creates from video frames
  - A/B test thumbnails (auto-rotate to find which drives most clicks)

Step 4 — Subtitles:
- Upload SRT/VTT per language
- Auto-generate from audio (AWS Transcribe)
- Auto-translate to 10 languages (AI translation + manual override)
- Subtitle editor (inline edit timing and text)
- Preview sync against video

Step 5 — Pricing & Access:
- Available to: Free, Premium, Family (or all)
- Set release date (schedule future release)
- Set expiry date (content leaves platform on this date)
- Geographic restrictions (only show in India, or block specific countries)
- Downloadable (yes/no)

Step 6 — Review & Publish:
- Preview how the movie page will look (live preview)
- Encoding status visible (4K 75%, 1080p done, 720p done)
- "Publish now" or "Schedule for [datetime]"
- Post-publish notification to subscribers of this genre (toggle)

**Content Library:**
- Searchable, filterable grid of all content
- Status badges: Draft, Encoding, Published, Scheduled, Expired, Removed
- Bulk actions: Publish selected, Unpublish selected, Delete, Change access tier
- Sort by: Upload date, Views, Revenue generated, Rating
- Quick edit (edit metadata without full re-upload)
- Version history (if re-uploaded, keep original)

---

### T. Series Management `/admin/series`

**For managing multi-episode series.**

- Create series (title, description, cover art)
- Create seasons within series
- Add episodes to seasons (drag-drop order)
- Reorder episodes within season
- Auto-numbering (S01E01, S01E02, etc.)
- Series-level metadata + episode-level metadata
- Release schedule: all at once, or weekly release schedule
- "New season" notifications auto-sent to users who watched previous season

---

### U. User Management `/admin/users`

**Full visibility and control over users.**

**User Table:**
- Columns: Name, Email, Plan, Joined, Last Active, Total Watch Time, Revenue Generated
- Search by email, name, phone
- Filter by: Plan, Country, Join date, Active/Inactive
- Sort by: any column
- Export as CSV

**User Detail Page:**
- Profile info (name, email, phone, avatar)
- Subscription history (all plan changes with dates)
- Payment history (all invoices)
- Device list (all logged in devices)
- Watch history (last 100 items)
- Total watch time (hours)
- Favorite genres (derived from watch history)
- IP history (last 20 IPs for fraud detection)

**Admin Actions on User:**
- Send email notification
- Force logout all devices
- Extend subscription (1 month free)
- Downgrade plan manually
- Ban account (temporary or permanent)
- Mark as suspicious (flags for review)
- Delete account (GDPR compliance)

---

### V. Analytics Dashboard `/admin/analytics`

**Data that actually drives decisions.**

**Revenue Analytics:**
- MRR (Monthly Recurring Revenue) trend
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- Churn rate (% users who cancelled)
- LTV (Lifetime Value by cohort)
- Revenue by plan tier
- Revenue by country
- Refund rate

**Content Analytics:**
- Most watched movies (by total hours)
- Completion rate per title (% who finish it)
- Drop-off analysis: at what minute do users abandon a title?
- Search terms that led to watches
- Titles added to watchlist vs. actually watched
- Trending titles (fastest growing views)

**User Analytics:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- DAU/MAU ratio (engagement health)
- New user acquisition (daily, by source: organic, referral, paid)
- Signup funnel conversion (visit → signup → paid conversion %)
- Session duration average
- Peak usage hours (heatmap by hour of day)
- Geographic distribution

**Streaming Quality Analytics:**
- Average bitrate served to users
- Buffer events per session (target: < 0.1)
- CDN cache hit rate (target: > 95%)
- Video start failures
- DRM license errors
- Subtitle sync issues reported

**Export:**
- Any chart → export as PNG
- Any table → export as CSV or Excel
- Scheduled reports: email weekly PDF to admin team

---

### W. Subtitle Management `/admin/subtitles`

**Full subtitle workflow.**

- View all subtitles per title
- Per language: status (AI generated / human reviewed / manual upload)
- Edit subtitles inline (timing + text)
- Quality score per subtitle (AI grades synchronization accuracy)
- Request human review (flag for translator)
- Batch translate (select title → translate to 5 languages → confirm)
- Preview: play video with subtitle overlay in browser

---

### X. Moderation Panel `/admin/moderation`

**Handle user reports.**

**Review Queue:**
- User-reported content (flagged as inappropriate, wrong genre, wrong subtitles)
- User reviews flagged by other users
- Spam reviews
- Copyright claims

**Per Report:**
- Who reported, when, why
- The content in question
- Action options: Dismiss, Remove content, Ban user, Escalate

**Auto-Moderation:**
- AI scans new reviews for: spam patterns, profanity, spoilers
- Auto-flags suspicious ones for human review
- Auto-hides reviews with extreme profanity until reviewed

---

### Y. Notifications Management `/admin/notifications`

**Push the right message at the right time.**

**Create Notification:**
- Target: All users, Premium users, Free users, Users who watched [title], Users in [country]
- Channel: In-app, Email, Push (if PWA installed)
- Schedule: Now or scheduled datetime
- Preview before send

**Templates:**
- New release: "🎬 [Title] is now on CinemaVerse"
- New season: "📺 [Series] Season [X] — All episodes now streaming"
- Expiring: "⏰ [Title] leaves the platform in 3 days"
- Promotional: "🎉 Family plan now ₹499/month"

**History:**
- All sent notifications with: sent at, delivery rate, open rate, CTR

---

### Z. Settings `/admin/settings`

**Platform configuration.**

- Platform name, logo, favicon
- Color scheme (primary accent color)
- Maintenance mode toggle (shows maintenance page to users)
- Feature flags (turn features on/off without deploy):
  - Watch Party: ON/OFF
  - AI Assistant: ON/OFF
  - Downloads: ON/OFF per plan
  - Voice Search: ON/OFF
- Content delivery settings (CloudFront config)
- Encoding quality presets
- Email sender settings (SES configuration)
- Payment gateway settings (Razorpay keys, Stripe keys)
- API rate limit configuration
- DRM license duration settings

---

# PART 3: THE 12 CRAZIEST FEATURES

These are the features that make people share your platform. Each one is technically real, buildable, and insane.

---

## 🔥 Crazy Feature #1 — AI Mood Engine

**Name:** MoodMatch™

**What it does:**
- Optionally asks camera permission on first visit
- Uses TensorFlow.js (runs in browser, never sends video to server) to detect facial expression
- Maps expression to mood: happy, sad, anxious, bored, excited, tired
- Cross-references with: time of day, day of week, recent watch history
- Returns a curated "mood row" on homepage: "You look tired. We picked these for you 😴"
- User can manually set mood via emoji picker if they decline camera

**Tech stack:**
- TensorFlow.js face-api model (runs client-side, zero privacy concern)
- Redis stores mood history per user (not video, just the mood label)
- Recommendation service uses mood as an input feature

**Privacy:** Camera permission is 100% optional. Mood detection happens in browser. No video ever leaves the device.

---

## 🔥 Crazy Feature #2 — Scene Search

**Name:** SceneSeek™

**What it does:**
- User types: "the scene where the hero stands in the rain and cries"
- System finds: the exact movie and the exact timestamp (± 30 seconds)
- User clicks → player opens at that exact timestamp

**How it works:**
- When video is uploaded, a background job extracts:
  - Audio transcript (every sentence, with timestamp)
  - Scene descriptions (AI generates: "Character stands in rain, close-up on face")
  - These get embedded and stored in pgvector
- At search time: query is embedded, finds matching scenes via cosine similarity
- Returns: movie title + timestamp + 5-second thumbnail of that scene

**What this means for UX:**
- "I can't remember which movie had that one scene but I remember exactly what happened"
- This is a billion-dollar search capability that nobody else has built this cleanly

---

## 🔥 Crazy Feature #3 — Watch Party with Reactions

**Name:** PartyPlay™

**Already described above. The crazy part:**
- Real-time emoji reactions (sent by one user, appear on EVERYONE'S screen)
- Custom platform reactions (not just 👍 but 😱😂🎬🔥💀)
- "Reaction Replay": after watching, you can re-watch a scene and see where everyone reacted
- Reaction heatmap: shows the emotional curve of a movie (based on all PartyPlay sessions)

---

## 🔥 Crazy Feature #4 — AI Voice Dubbing

**Name:** VoiceDub™

**What it does:**
- User is watching a Korean movie
- They click: "Dub into Hindi"
- AI generates Hindi audio track in real-time (synthesized voice, not human)
- Synced to video (lip-sync approximated)
- User can choose voice type: male/female/neutral
- Takes 2-3 minutes for a full movie

**Tech:**
- AWS Translate for subtitle translation
- Amazon Polly (Neural TTS) for voice generation
- FFmpeg mixes generated audio with video
- Stored as a separate audio track on S3

**Why this is insane:**
- Netflix spent millions hiring human dubbing studios
- You're doing this with AI for < $1 per movie

---

## 🔥 Crazy Feature #5 — AI Thumbnail A/B Testing

**Name:** ThumbAI™

**What it does:**
- When admin uploads a movie, AI generates 5 thumbnail variants:
  - Action shot
  - Character close-up
  - Dramatic moment
  - Title-focused
  - Emotion-based (scariest frame, funniest frame)
- Platform auto-rotates thumbnails every 2 hours
- Tracks CTR (click-through rate) per thumbnail per user segment
- Within 48 hours, identifies the winner
- Locks in winner for remaining catalog time

**Why this is insane:**
- Netflix has a team of 50 doing this manually
- You're automating it for every single title

---

## 🔥 Crazy Feature #6 — Smart Chapter Markers

**Name:** ChapterSmart™

**What it does:**
- User is scrubbing through a 2-hour movie
- The scrub bar shows named chapters: "Act 1", "Twist Scene", "Climax", "Resolution"
- User can jump directly to any chapter

**How it works:**
- When video is uploaded, AI analyzes:
  - Audio peaks (action sequences = audio spikes)
  - Scene changes (fast cuts = different scene)
  - Subtitle patterns (dialogue-heavy = character development, no dialogue = action/silence)
- Groups into chapters, auto-names them
- Stores chapter timestamps in DB
- Player renders chapters as markers on scrub bar

**Why it's insane:**
- YouTube has this but only for manually uploaded chapters
- You're auto-detecting chapters from any film automatically

---

## 🔥 Crazy Feature #7 — Binge Health Monitor

**Name:** BingeGuard™

**What it does:**
- Tracks session length per user
- After 3 hours continuous: gentle popup "You've been watching for 3 hours. Take a 10-minute break? We'll save your spot."
- After 5 hours: stronger popup with a 5-minute mandatory break timer
- After 8 hours: "Okay we're serious. Go drink some water. We'll be here when you're back. 💙"
- All of these are dismissable (we're not Netflix nannying you, just caring)

**Also:**
- Weekly "Watch summary" email: "You watched 14 hours this week. Your top genre was Thriller."
- Monthly report card: "Your most-watched day: Friday at 11pm"

**Why it's insane:**
- Every platform wants you addicted
- You're the only one that genuinely cares about your user's health
- This is a massive brand differentiator: "The streaming platform that respects your time"

---

## 🔥 Crazy Feature #8 — Personalized Recaps

**Name:** ReCapAI™

**What it does:**
- User stopped watching a series 3 months ago
- They come back to continue Season 3 Episode 4
- Before the episode: "It's been a while! Here's a 90-second recap of what happened" → AI-generated video summary (using subtitle + scene data)
- Voice narrated in their preferred language

**Also:**
- "Catch up with [Series]" row on homepage for series you haven't finished
- Recap video auto-generates from subtitle highlights + key frames

---

## 🔥 Crazy Feature #9 — Watch Streak

**Name:** StreamStreak™ (Gamification)**

**What it does:**
- Tracks consecutive days a user watches something
- Shows streak counter in profile + homepage greeting
- "🔥 7-day streak! You're on fire, Arjun"
- Rewards:
  - 7-day streak: 1 free download credit
  - 30-day streak: 1 month premium discount
  - 100-day streak: permanent "Power Viewer" badge on profile
- Leaderboard: "Top viewers this month" (opt-in)

**Why it's insane:**
- Duolingo made billions on streak psychology
- Nobody has applied this to streaming properly

---

## 🔥 Crazy Feature #10 — Content Passport

**Name:** ContentPassport™**

**What it does:**
- Every title has a "Passport" page
- Shows: countries the story is set in, filming locations, languages spoken
- Interactive map: click a country to see all content set there
- Travel mode: "Watching shows from India 🇮🇳 → Japan 🇯🇵 → Colombia 🇨🇴"
- Can filter search by: "Show me movies set in South Korea"
- "Virtually visit" a country through its cinema

**Why it's insane:**
- It's a content discovery mechanism disguised as a travel feature
- Massive appeal for travel enthusiasts, language learners, culture explorers

---

## 🔥 Crazy Feature #11 — Director's Room

**Name:** DirectorRoom™**

**What it does:**
- Admin can invite directors/writers to record audio commentary
- Users can enable "Director's Cut" mode while watching
- Director speaks over the movie (their mic recording, synced to the video)
- Can switch between: Original audio, Director commentary, Fan commentary

**Also:**
- Q&A sessions: director answers questions during live screenings
- "Ask the Director" form: user submits question, director records video answer

**Why it's insane:**
- This turns your platform into a venue for filmmaker interaction
- Massive PR and press opportunity for every content upload

---

## 🔥 Crazy Feature #12 — AI Story Mode

**Name:** StoryMode™ (The Wildest One)

**What it does:**
- User selects "Story Mode" before playing a movie
- During playback, AI monitors the subtitle stream
- At key plot points, a small bubble appears: "Did you predict this? 🤔"
- User answers: "Yes / No / I had no idea"
- At the end: "You predicted 3/7 plot twists. You're a 42% psychic 🔮"
- Share-able result card (drives viral sharing)

**Also includes:**
- Trivia questions about the movie, appearing during natural pauses
- "Predict the ending" mode: 10 minutes before the end, user picks an ending
- "Character loyalty" tracker: which character do you most agree with (based on choices)

**Why it's insane:**
- Transforms passive watching into interactive experience
- Every result is shareable ("I scored 87% on Inception quiz!")
- Drives massive social media sharing → free marketing

---

# PART 4: COMPLETE TECH ARCHITECTURE (UPDATED)

## All the Crazy Features Mapped to Tech

```
Frontend (Next.js 15 + TypeScript)
│
├─ AI Mood Engine → TensorFlow.js (client-side, privacy-safe)
├─ Watch Party → WebRTC (voice) + WebSocket (sync)
├─ Scene Search → Elasticsearch semantic + pgvector
├─ AI Assistant → Claude/GPT via API, streaming response
├─ Custom Player → HLS.js + custom controls
├─ Binge Guard → Session timer in Zustand + server-side check
├─ Story Mode → Subtitle parsing + WebSocket events
├─ Stream Streak → Redis counter + DynamoDB events
│
Backend (FastAPI + Kafka + Celery)
│
├─ VoiceDub → Celery worker → AWS Translate + Amazon Polly
├─ ThumbAI → Celery worker → DALL-E/Stable Diffusion + CloudFront
├─ ChapterSmart → Celery worker → Whisper + audio analysis
├─ ReCapAI → Celery worker → Claude + key frame extraction
├─ SceneSeek → Celery worker → pgvector embeddings per scene
│
Data Layer
│
├─ PostgreSQL → Users, subscriptions, content, reviews, profiles
├─ DynamoDB → Watch events, streak data, mood history
├─ Redis → Session sync, watch party rooms, binge timer
├─ pgvector → Scene embeddings, content embeddings for semantic search
├─ Elasticsearch → Full-text search, filters, facets
│
Media Layer
│
├─ AWS S3 → Original videos, encoded variants, subtitles, AI audio
├─ AWS CloudFront → CDN serving all media
├─ AWS MediaConvert → Encoding (4K/1080p/720p/480p)
├─ AWS Transcribe → Speech-to-text for subtitles
├─ AWS Translate → Multi-language subtitle translation
├─ Amazon Polly → Neural TTS for VoiceDub
│
Real-time Layer
│
├─ WebSocket server (FastAPI WebSocket)
├─ Redis pub/sub (Watch Party room events)
├─ WebRTC (P2P voice in Watch Party)
│
Security Layer
│
├─ CloudFlare WAF + DDoS
├─ Widevine + FairPlay + PlayReady (DRM)
├─ AWS KMS (encryption keys)
├─ JWT + Refresh tokens
├─ RBAC (user roles)
│
Observability
│
├─ Prometheus (metrics)
├─ Grafana (dashboards)
├─ DataDog (APM + logs)
├─ Sentry (errors)
```

---

# PART 5: COMPLETE KIRO STEERING UPDATE

## Additions to product.md:

All 12 crazy features are now core product features, not nice-to-haves:

- MoodMatch™ — Phase 4 (after recommendations engine)
- SceneSeek™ — Phase 2 (alongside search)
- PartyPlay™ — Phase 5
- VoiceDub™ — Phase 6
- ThumbAI™ — Phase 3 (alongside content management)
- ChapterSmart™ — Phase 3 (alongside video player)
- BingeGuard™ — Phase 4 (alongside user analytics)
- ReCapAI™ — Phase 5
- StreamStreak™ — Phase 4 (gamification)
- ContentPassport™ — Phase 5
- DirectorRoom™ — Phase 6
- StoryMode™ — Phase 7 (most complex)

## Updated Phased Roadmap:

| Phase | Scope | Duration |
|---|---|---|
| 0 | Repo, Docker, auth, design system, login/signup, pricing page | 2 weeks |
| 1 | Homepage (all rows), content API, PostgreSQL schema, search (basic) | 3 weeks |
| 2 | Video upload pipeline, encoding, CloudFront, movie/show page | 4 weeks |
| 3 | Custom video player, HLS.js, ChapterSmart, ThumbAI, admin content mgmt | 3 weeks |
| 4 | Recommendations, MoodMatch, BingeGuard, StreamStreak, user analytics | 3 weeks |
| 5 | Watch Party (PartyPlay), ReCapAI, ContentPassport, notifications | 3 weeks |
| 6 | Billing (Stripe + Razorpay), DRM, device limits, VoiceDub, DirectorRoom | 3 weeks |
| 7 | SceneSeek, AI Assistant, StoryMode, semantic search, voice search | 4 weeks |
| 8 | Subtitles, i18n, mobile optimization, PWA, offline downloads | 2 weeks |
| 9 | Admin portal complete (all sections), moderation, analytics deep dive | 3 weeks |
| 10 | Security hardening, pen testing, performance tuning, load testing | 2 weeks |
| 11 | GDPR/CCPA compliance, legal review, staging → production | 2 weeks |

**Total: 34 weeks (8.5 months)**

---

# PART 6: DESIGN LANGUAGE (Updated, Fully Specified)

## Color System

```css
:root {
  /* Backgrounds */
  --bg-base: #0A0A0A;          /* Main background (not pure black) */
  --bg-surface: #141414;       /* Cards, panels */
  --bg-elevated: #1E1E1E;      /* Modals, dropdowns */
  --bg-overlay: rgba(0,0,0,0.7); /* Video overlay, dimmed backgrounds */
  
  /* Brand */
  --brand-primary: #E50914;    /* Primary red (CTA, active states) */
  --brand-secondary: #564DFF;  /* Indigo (secondary CTAs, badges) */
  --brand-tertiary: #00D4AA;   /* Teal (success, streak, positive) */
  
  /* Text */
  --text-primary: #E5E5E5;     /* Main text (high contrast, WCAG AA) */
  --text-secondary: #A0A0A0;   /* Supporting text, labels */
  --text-muted: #6B6B6B;       /* Disabled, placeholder */
  
  /* Glassmorphism */
  --glass-bg: rgba(255,255,255,0.05);
  --glass-border: rgba(255,255,255,0.10);
  --glass-blur: blur(20px);
  
  /* Status */
  --status-success: #22C55E;
  --status-warning: #F59E0B;
  --status-error: #EF4444;
  --status-info: #3B82F6;
}
```

## Typography Scale

```css
/* Font families */
--font-display: 'SF Pro Display', 'Inter Tight', system-ui; /* Heroes, titles */
--font-body: 'Inter', 'Poppins', system-ui;                  /* Body, UI */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;       /* Code, timestamps */

/* Scale */
--text-xs: 0.75rem;   /* 12px - badges, captions */
--text-sm: 0.875rem;  /* 14px - labels, metadata */
--text-base: 1rem;    /* 16px - body text */
--text-lg: 1.125rem;  /* 18px - large body */
--text-xl: 1.25rem;   /* 20px - small headings */
--text-2xl: 1.5rem;   /* 24px - card titles */
--text-3xl: 1.875rem; /* 30px - section headers */
--text-4xl: 2.25rem;  /* 36px - page titles */
--text-5xl: 3rem;     /* 48px - hero text */
--text-6xl: 3.75rem;  /* 60px - display text */
--text-hero: clamp(3rem, 8vw, 6rem); /* Fluid hero */
```

## Animation Principles

```
Entrance: 300ms ease-out (nothing instant, nothing slow)
Hover: 150ms ease-out (fast, responsive)
Exit: 200ms ease-in (slightly faster than entrance)
Page transition: 400ms ease-in-out
Skeleton: 1.5s linear infinite (pulse)

Hardware-accelerated only: transform, opacity, filter
Never animate: width, height, top, left (causes layout reflow)
```

## Component Specifications

### VideoCard
```
Size: 
  - Desktop: 220x330px (2:3 ratio poster)
  - Mobile: 140x210px

Hover state:
  - Scale: 1.0 → 1.08 (150ms ease-out)
  - Show: play button, rating, quick-add-to-watchlist
  - Background: show 5-second preview clip (muted)
  - Shadow: 0 20px 40px rgba(0,0,0,0.6)

Badges (top-left):
  - "NEW" (green)
  - "4K" (blue)
  - "TOP 10" (red gradient)

Progress bar (bottom):
  - Red bar showing watch progress
  - Only shown if partially watched
```

### HeroSection
```
Height: 100vh (full viewport)
Video: autoplay, muted, loop (8-second reel)
Overlay: linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 60%)
Content: left-aligned (35% width)
Animation: fade-in from bottom on load (400ms)
CTA buttons:
  - Primary: red bg, white text, 48px height
  - Secondary: white border, white text, 48px height, glassmorphism bg
```

---

# PART 7: COMPLETE USER FLOW MAPS

## User Onboarding Flow
```
Visit / → See landing page
  ↓
Click "Start Watching Free"
  ↓
Signup modal → Name, Email, Password
  ↓
Verify email (click link)
  ↓
Choose plan (Free → skip payment, Premium → Razorpay/Stripe)
  ↓
Select genres (5+ tiles)
  ↓
Select languages
  ↓
Redirect to /home with personalized content
  ↓
First session: show onboarding tooltip tour
```

## Content Watch Flow
```
Homepage → Browse rows
  ↓
Click card → Movie page (/watch/[id])
  ↓
Read synopsis, watch trailer
  ↓
Click "Play" → /player/[id] opens
  ↓
Player loads with HLS adaptive bitrate
  ↓
Subtitles load (preferred language)
  ↓
Watch (playback state synced every 30 sec)
  ↓
Pause → state saved → close tab
  ↓
Return → "Continue watching from 47:23?"
```

## Admin Upload Flow
```
/admin/content → Click "Upload"
  ↓
Drag files (1-10 movies)
  ↓
Upload directly to S3 (pre-signed URL)
  ↓
Fill metadata (title, description, genres, cast)
  ↓
Upload thumbnails (or generate with ThumbAI)
  ↓
Upload/generate subtitles
  ↓
Set access tier + release date
  ↓
Submit → Kafka event → encoding queue
  ↓
Real-time progress: encoding percentages
  ↓
On completion: publish or auto-publish
  ↓
Users see it in "New Releases" row
```

---

# PART 8: PRICING PAGE — FULL SPECIFICATION

## `/pricing` — The Conversion Engine

### Above the Fold
- Headline: "Great cinema shouldn't cost a fortune"
- Subheadline: "Start free. Upgrade whenever. Cancel anytime."
- Annual/Monthly toggle (default: Monthly)

### Plan Cards (3)

**FREE — ₹0/month**
- 500+ handpicked titles
- 480p quality
- 1 screen at a time
- 2 downloads/month
- Ads (non-intrusive)
- 1 profile
- Watch Party (join only)
- CTA: "Start Free" (outline button)

**PREMIUM — ₹299/month (₹2,499/year)**
- "Most Popular" badge (gold)
- 10,000+ titles (full library)
- 4K HDR + Dolby Atmos
- 4 screens simultaneously
- 25 downloads/month
- No ads
- 4 profiles
- Watch Party (create + join)
- AI Assistant access
- VoiceDub (5 movies/month)
- Priority support
- CTA: "Start Premium" (filled red button)

**FAMILY — ₹499/month (₹3,999/year)**
- Everything in Premium
- 6 screens simultaneously
- 50 downloads/month
- 6 profiles
- Kids mode (curated children's content)
- Parental controls (per-profile content restrictions)
- Family watch party (up to 10 people)
- VoiceDub (unlimited)
- Dedicated family support
- CTA: "Start Family" (filled indigo button)

### Annual vs Monthly Toggle
- Flip → prices animate to yearly (smooth counter animation)
- "You save ₹1,089/year on Premium" label fades in
- "You save ₹1,989/year on Family" label fades in

### Feature Comparison Table
Full table, 30+ rows, 3 columns, hover tooltips on each feature

### Payment Methods Section
- Shows accepted methods: Visa, Mastercard, UPI, Paytm, PhonePe, GPay, Net Banking, Debit Card
- "All payments secured by Razorpay & Stripe (256-bit SSL)"

### FAQ
1. Can I cancel anytime?
2. What happens to my data if I cancel?
3. Can I switch between plans?
4. Does the free plan have ads?
5. What is 4K HDR?
6. How many devices can I use simultaneously?
7. Can I share my account?
8. What payment methods are accepted?
9. Is there a student discount?
10. How does Family plan work?

### Trust Signals
- "🔒 Secure payment"
- "❌ No hidden fees"
- "↩️ Cancel anytime"
- "📞 24/7 support"
- "⭐ 4.8/5 from 50,000+ reviews"

---

# PART 9: KIRO PROMPT UPDATE FOR ALL THIS

When you start the Kiro session for this updated plan, use this Phase-by-Phase framing for each spec session:

**Phase 0 Prompt:** "Spec Phase 0: Landing page (cinematic, fully functional), login page (split screen, all OAuth options), signup (multi-step wizard with plan selection and genre preferences), pricing page (3 tiers, full feature table, Razorpay + Stripe integration), auth scaffold (JWT + OAuth2 + OTP), design system (all tokens, components)."

**Phase 1 Prompt:** "Spec Phase 1: Full homepage with 10 content rows (all dynamic, all personalized), content API (CRUD), PostgreSQL schema, basic search with filters."

**Phase 2 Prompt:** "Spec Phase 2: Video upload pipeline (S3 pre-signed URL → Kafka → MediaConvert), movie/show detail page (full spec), encoding worker, CloudFront signed URLs."

...and so on for each phase. Each prompt references `.kiro/steering/` for context.

---

# THIS IS THE PLATFORM.

Every page works. Every button does something. Every feature serves a user need. And 12 of those features are so ahead of the curve that nobody's built them cleanly yet.

**This is CinemaVerse. Build it.**

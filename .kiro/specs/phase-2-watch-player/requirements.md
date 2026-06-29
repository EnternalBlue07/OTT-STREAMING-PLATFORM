# Requirements Document

## Introduction

Phase 2 adds the two pages that turn the catalog into a watchable product: the **Movie/Show detail page** (`/watch/[id]`) and the **custom video player** (`/player/[id]`). Source of truth is `.kiro/specs/_sources/ott-product-v2.md` and `ott-COMPLETE-INSANE-SPEC.md` (CinemaVerse), sections **F. Movie/Show Page** and **G. Video Player**.

This phase must feel like **one cohesive platform** with Phase 1: same dark theme, same navbar, same resizable sidebar, same card styles, same accent/ambient language. **The existing homepage and its components, animations, styling, and structure are frozen — Phase 2 does not modify them.** It only adds new routes, new feature modules, and the backend data those pages need.

**In scope**
- `/watch/[id]`: cinematic banner (poster + color-matched blurred backdrop), title, badges (year, rating, duration, quality), multi-source rating, expandable synopsis, large red Play CTA, Watchlist/Share/Download actions, trailers row (inline play + PiP), cast row + filmography side panel, episode list (series), "More Like This" / "From Same Director" / "Same Genre" rows, user reviews (rating breakdown, verified-viewer badge, helpful voting, spoiler toggle, sort), and a content info panel (audio languages, subtitles, accessibility, content warning, studio, clickable genres).
- `/player/[id]`: custom HLS.js player with full custom controls (no native chrome), scrub bar with hover thumbnail preview, playback speed (0.5x–2x), quality selector (Auto/4K/1080p/720p/480p), subtitle selector, audio-track selector, Picture-in-Picture, fullscreen, mini-player, Smart Skip (Skip Intro / Skip Recap / Next Episode), double-tap/arrow 10-second seek, and keyboard shortcuts (Space, M, F, C, arrows).
- Backend data + persistence to drive both pages (cast, trailers, reviews, episodes, content-info, chapters/skip markers, playback sources, subtitle & audio tracks), reusing the Phase-1 DB-backed catalog.

**Out of scope (later phases / source doc, not now)**
- MoodMatch, SceneSeek, PartyPlay, VoiceDub, AI Assistant, Downloads manager, Chromecast/AirPlay casting, commentary tracks, real-time subtitle AI translation, profiles, and the admin portal beyond what already exists.
- A real encoding pipeline (MediaConvert/HLS packaging). Until Phase 2's media phase, the player streams from a **sample HLS manifest** per title so the player itself is fully real and testable.

**Stack additions:** `hls.js` (frontend) for adaptive playback on browsers without native HLS. Everything else reuses the existing Next.js 15 + Tailwind + Framer Motion + TanStack Query frontend and the FastAPI + SQLite backend.

**Deviation note (developer-approved):** Product doc gates `/watch` and `/player` behind login. Phase 2 honors this with a graceful auth check (redirect unauthenticated users to `/login`), but keeps it lenient enough to not block local testing.

---

## Requirements

### Requirement 1: Watch Page Route & Data Loading

**User Story:** As a viewer, I want a dedicated, shareable page for each title, so that I can evaluate it before watching.

#### Acceptance Criteria

1. THE SYSTEM SHALL serve a route at `/watch/[id]` that loads a single title by id from the content API.
2. WHILE the title data is loading, THE SYSTEM SHALL render premium skeletons consistent with the Phase-1 loading style.
3. IF the id does not exist, THEN THE SYSTEM SHALL render a styled "not found" state with a path back to the homepage and return without crashing.
4. THE SYSTEM SHALL render the watch page within the existing app shell (navbar + sidebar + footer), preserving the Phase-1 theme.
5. WHERE a title is a series, THE watch page SHALL render the episode list section; WHERE it is a movie, THE page SHALL omit it.
6. WHEN data fetching fails, THE SYSTEM SHALL show a styled error state with a retry action.

### Requirement 2: Cinematic Banner

**User Story:** As a viewer, I want a cinematic banner, so that the page feels premium and on-brand.

#### Acceptance Criteria

1. THE banner SHALL display the title's poster (or its signature gradient when no poster exists) with a blurred background derived from the title's accent/gradient colors.
2. THE banner SHALL display the title, and badges for year, maturity rating, duration, and the highest available quality (e.g., 4K).
3. THE banner SHALL display ratings: the platform/IMDb-style rating and, where available, the user's own rating.
4. THE banner SHALL apply legibility scrims so text meets WCAG AA contrast over the artwork.
5. WHERE reduced motion is requested, THE banner SHALL avoid non-essential motion.

### Requirement 3: Primary Actions & Synopsis

**User Story:** As a viewer, I want clear actions and a readable synopsis, so that I can decide and start watching in one click.

#### Acceptance Criteria

1. THE SYSTEM SHALL render a large, primary red "Play" CTA that navigates to `/player/[id]`.
2. THE SYSTEM SHALL render a "+ Watchlist" action that toggles the title in the persisted My List and reflects saved state immediately.
3. THE SYSTEM SHALL render "Share" (copies the watch URL) and "Download" (premium-gated visual) secondary actions.
4. THE synopsis SHALL render truncated by default with an expand/collapse control when it exceeds a threshold.
5. WHEN the user activates Play, THE SYSTEM SHALL preserve the title id so the player opens the correct stream.

### Requirement 4: Trailers Section

**User Story:** As a viewer, I want to preview trailers inline, so that I don't lose my place by opening a new tab.

#### Acceptance Criteria

1. THE SYSTEM SHALL render a horizontally scrolling trailers row (e.g., Main Trailer, Teaser, Behind the Scenes) using the Phase-1 momentum-row interaction.
2. WHEN a trailer is selected, THE SYSTEM SHALL play it inline within the page (not a new tab).
3. THE inline trailer SHALL offer a Picture-in-Picture control where the browser supports it.
4. IF a title has no trailers, THEN THE SYSTEM SHALL omit the section rather than show an empty row.

### Requirement 5: Cast & Crew with Filmography Panel

**User Story:** As a viewer, I want to explore the cast, so that I can find more of what they're in.

#### Acceptance Criteria

1. THE SYSTEM SHALL render a horizontally scrolling cast row showing each member's photo (or placeholder), name, and character name.
2. WHEN a cast member is selected, THE SYSTEM SHALL open a side panel listing that person's other titles available on the platform (filmography).
3. THE side panel SHALL be dismissable via close button, backdrop click, and Escape.
4. THE SYSTEM SHALL provide a "More from this director" affordance where a director is present.

### Requirement 6: Episode List (Series)

**User Story:** As a series viewer, I want a clear episode list, so that I can pick and resume episodes.

#### Acceptance Criteria

1. WHERE a title is a series, THE SYSTEM SHALL render season tabs and, per season, episode cards with thumbnail, title, duration, and synopsis.
2. THE SYSTEM SHALL indicate watched episodes with a visible marker.
3. WHEN an episode's play control is activated, THE SYSTEM SHALL open the player for that episode.
4. THE currently-selected/last-watched episode SHALL be visually highlighted.

### Requirement 7: Related Content Rows

**User Story:** As a viewer, I want related recommendations, so that I keep discovering.

#### Acceptance Criteria

1. THE SYSTEM SHALL render a "More Like This" row of related titles (reusing the Phase-1 card and momentum row).
2. THE SYSTEM SHALL render additional relation rows where data supports them (e.g., "Same Genre"), omitting any that would be empty.
3. WHEN a related card is selected, THE SYSTEM SHALL navigate to that title's `/watch/[id]` page.

### Requirement 8: User Reviews

**User Story:** As a viewer, I want trustworthy reviews, so that I can judge quality and avoid spoilers.

#### Acceptance Criteria

1. THE SYSTEM SHALL display an average star rating and a 1–5 star breakdown as a bar chart.
2. THE SYSTEM SHALL render individual reviews with author, rating, date, and body.
3. THE SYSTEM SHALL show a "verified viewer" badge on reviews from users who watched more than 80% of the title.
4. THE SYSTEM SHALL provide Helpful / Not Helpful voting per review.
5. WHERE a review is marked as containing spoilers, THE SYSTEM SHALL hide its body behind a spoiler toggle by default.
6. THE SYSTEM SHALL allow sorting reviews by Most Recent, Most Helpful, Critical, and Positive.

### Requirement 9: Content Info Panel

**User Story:** As a viewer (especially international/accessibility-reliant), I want full content info, so that I know languages, subtitles, and warnings before watching.

#### Acceptance Criteria

1. THE panel SHALL list available audio languages and available subtitle languages.
2. THE panel SHALL list accessibility features (e.g., audio description, closed captions) where present.
3. THE panel SHALL display a content warning summarizing violence/language/mature themes where present.
4. THE panel SHALL display studio, release date, and genre tags, with genre tags being clickable to a filtered view.

### Requirement 10: Player Route & HLS Playback

**User Story:** As a viewer, I want video to start fast and adapt to my connection, so that I never buffer.

#### Acceptance Criteria

1. THE SYSTEM SHALL serve a route at `/player/[id]` that loads the title's playback sources.
2. THE SYSTEM SHALL play adaptive HLS via `hls.js`, and SHALL use native HLS playback where the browser supports it directly (e.g., Safari).
3. WHEN playback starts, THE player SHALL begin within the buffer target and recover from transient stalls without a full restart.
4. IF the stream fails to load, THEN THE SYSTEM SHALL show a styled error overlay with a retry control.
5. THE player page SHALL use the dark theme and SHALL present a distraction-reduced layout (no sidebar chrome over the video).

### Requirement 11: Custom Player Controls

**User Story:** As a viewer, I want a premium custom control set, so that the player feels better than the browser default.

#### Acceptance Criteria

1. THE SYSTEM SHALL render custom controls and SHALL NOT expose the browser's native video controls.
2. THE controls SHALL include play/pause, current time, total duration, and a buffered-vs-played scrub bar.
3. WHEN the user hovers the scrub bar, THE SYSTEM SHALL show a time/thumbnail preview at the hovered position.
4. THE controls SHALL include a volume slider and mute toggle.
5. THE controls SHALL include a playback-speed selector offering 0.5x, 0.75x, 1x, 1.25x, 1.5x, and 2x.
6. THE controls SHALL include a quality selector offering Auto plus each available rendition (4K/1080p/720p/480p), and SHALL indicate the active level.
7. THE controls SHALL include a subtitle selector (off + each available language) that toggles rendered captions.
8. THE controls SHALL include an audio-track selector where multiple audio tracks exist.
9. THE controls SHALL include Picture-in-Picture, fullscreen, and mini-player controls (mini-player shrinks playback to a corner).
10. THE controls SHALL auto-hide during inactivity and reappear on pointer movement or key press.

### Requirement 12: Smart Skip

**User Story:** As a binge viewer, I want to skip intros/recaps and jump to the next episode, so that I watch more, faster.

#### Acceptance Criteria

1. WHERE a title defines an intro marker, THE SYSTEM SHALL show a "Skip Intro" button only during that interval, and activating it SHALL seek to the marker end.
2. WHERE a title defines a recap marker, THE SYSTEM SHALL show a "Skip Recap" button only during that interval.
3. WHERE a title defines a credits/end marker (or is a series episode), THE SYSTEM SHALL show a "Next Episode" button near the end that advances to the next episode's player.
4. THE skip buttons SHALL be keyboard-focusable and dismiss when their interval passes.

### Requirement 13: Keyboard, Gestures & Cinematic Mode

**User Story:** As a power viewer, I want shortcuts and gestures, so that control is effortless.

#### Acceptance Criteria

1. THE SYSTEM SHALL map Space to play/pause, M to mute, F to fullscreen, and C to cinematic mode.
2. THE SYSTEM SHALL map Left/Right arrows to seek backward/forward by 10 seconds and Up/Down to volume.
3. WHEN the user double-taps the left or right half of the video (touch) or double-clicks, THE SYSTEM SHALL seek -10s or +10s respectively.
4. WHEN cinematic mode is active, THE SYSTEM SHALL dim surrounding UI to show only the player, and Escape SHALL exit it.
5. THE SYSTEM SHALL not trigger shortcuts while focus is in a text input.

### Requirement 14: Backend Data & Persistence

**User Story:** As the platform, I need real data behind these pages, so that nothing is hard-coded in the UI.

#### Acceptance Criteria

1. THE content detail API SHALL return, per title: trailers, cast & crew, content-info (audio languages, subtitle languages, accessibility, content warning, studio), and rating breakdown.
2. THE SYSTEM SHALL expose a reviews endpoint returning a rating distribution and individual reviews (author, rating, date, body, spoiler flag, helpful counts, verified flag), and SHALL accept helpful/not-helpful votes.
3. THE SYSTEM SHALL expose a playback endpoint returning HLS source(s), available quality renditions, audio tracks, subtitle tracks, and Smart-Skip markers (intro/recap/credits) for a title.
4. WHERE a title is a series, THE SYSTEM SHALL expose seasons and episodes with per-episode metadata and a next-episode reference.
5. THE SYSTEM SHALL persist this data (seeded for existing titles) so it survives restarts, consistent with the Phase-1 SQLite catalog, and existing public endpoints SHALL remain backward compatible.
6. THE new endpoints SHALL return the standard `{ data, error, meta }` envelope and SHALL be covered by tests.

### Requirement 15: Cohesion, Auth-Gating & Accessibility

**User Story:** As a user, I want these pages to feel native to the platform and respect access rules.

#### Acceptance Criteria

1. THE watch and player pages SHALL reuse the existing navbar, sidebar, card components, design tokens, and motion language, and SHALL NOT modify Phase-1 homepage components.
2. WHERE a user is unauthenticated, THE SYSTEM SHALL redirect `/watch/[id]` and `/player/[id]` to `/login` (graceful in local dev).
3. THE pages SHALL be responsive across mobile, tablet, and desktop breakpoints.
4. Interactive elements SHALL be keyboard-accessible with visible focus, and the player SHALL expose accessible labels for its controls.
5. THE pages SHALL honor prefers-reduced-motion for non-essential animation.

### Requirement 16: Performance

**User Story:** As a viewer, I want fast, smooth pages, so that the experience feels instant.

#### Acceptance Criteria

1. THE watch page SHALL avoid cumulative layout shift by reserving space for the banner and rows (fixed aspect ratios, skeletons).
2. THE player SHALL target a video start under ~500 ms once the manifest is reachable and SHALL not block the main thread on control rendering.
3. Horizontal rows SHALL scroll at 60fps using GPU-friendly transforms, consistent with Phase 1.

---

## Glossary

- **Watch page (`/watch/[id]`):** The title detail page — evaluate a title and launch playback.
- **Player page (`/player/[id]`):** The full custom video player route.
- **HLS / HLS.js:** HTTP Live Streaming; `hls.js` plays HLS in browsers without native support, handling adaptive bitrate.
- **Rendition / quality level:** A specific encoded resolution (4K/1080p/720p/480p); "Auto" lets ABR choose by bandwidth.
- **Scrub bar:** The seek timeline; supports hover preview (time + thumbnail).
- **Smart Skip:** Buttons (Skip Intro / Skip Recap / Next Episode) driven by per-title interval markers.
- **Cinematic mode:** A focus mode that dims surrounding UI to show only the player (toggle C, exit Esc).
- **Mini-player / PiP:** Mini-player shrinks playback to a corner within the app; PiP is the browser's native floating window.
- **Verified viewer:** A reviewer who watched more than 80% of the title; their review carries a trust badge.
- **Spoiler toggle:** Hides a review body flagged as containing spoilers until explicitly revealed.
- **Content info panel:** Audio/subtitle languages, accessibility features, content warning, studio, and clickable genres.
- **Skip marker:** A persisted interval (start/end seconds) labeling an intro, recap, or credits sequence.
- **App shell:** The existing navbar + resizable sidebar + footer layout from Phase 1.

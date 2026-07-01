# 📚 Yeh Project Samajh — Ek Ek Cheez, Bilkul Simple

_Yeh document tere liye hai — taaki tu actually samajh sake ki kya bana hai, kaise bana hai, aur kyun._

---

## 🧠 Pehle Yeh Samajh: Web App Kaise Kaam Karta Hai

Imagine kar tu ek restaurant chala raha hai:
- **Frontend** = Restaurant ka look, menu card, waiter (jo customer ko dikhta hai)
- **Backend** = Kitchen (jo cooking karta hai, data store karta hai)
- **Database** = Fridge/store room (jahan raw material/data rakha hai)
- **API** = Waiter ka order slip (frontend kitchen ko bolti hai "yeh do", kitchen answer deta hai)

Tere project mein:
- Customer browser mein `localhost:3000` kholta hai → **Frontend** (Next.js)
- Frontend ko data chahiye → API call maarta hai `localhost:8001` pe → **Backend** (FastAPI)
- Backend database se data laata hai → response bhejta hai → frontend dikhata hai

---

## 🏗️ Architecture: Tere Project Ka Blueprint

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│  Next.js 15 (React) → localhost:3000            │
│  • Pages render karta hai (HTML/CSS/JS)         │
│  • User clicks handle karta hai                 │
│  • Video play karta hai (HLS.js)                │
│  • State manage karta hai (Zustand)             │
│  • API data cache karta hai (TanStack Query)    │
└───────────────────────┬─────────────────────────┘
                        │ HTTP requests
                        ▼
┌─────────────────────────────────────────────────┐
│                   SERVER                         │
│  FastAPI (Python) → localhost:8001              │
│  • Endpoints serve karta hai (/api/v1/...)      │
│  • Data validate karta hai (Pydantic)           │
│  • Database se read/write karta hai             │
│  • Metrics collect karta hai (Prometheus)       │
└───────────────────────┬─────────────────────────┘
                        │ SQL queries
                        ▼
┌─────────────────────────────────────────────────┐
│                  DATABASE                        │
│  SQLite (file-based, zero install)              │
│  Tables: content, reviews, episodes             │
│  42 titles, 180 reviews, 48 episodes            │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Har Technology Kya Karti Hai (Simple Analogy)

### Frontend Technologies

**Next.js 15** = Tera restaurant ka building + layout
- React ke upar built hai (React = kitchen appliances, Next.js = full kitchen setup)
- "Server Components" = kuch dishes pehle se ready rakhte hain (fast serving)
- "Client Components" = kuch dishes customer ke saamne banate hain (interactive)
- File-based routing: `app/watch/[id]/page.tsx` = URL `/watch/signal-horizon` pe yeh page dikhe

**TypeScript** = Tera recipe book with strict measurements
- JavaScript hai but "types" add karta hai
- Agar tu likhe `title: string` aur phir accidentally number bheje → compile time pe error aayega
- Benefit: IDE mein autocomplete milta hai, bugs production se pehle milte hain

**Tailwind CSS** = Tera interior design kit with fixed color swatches
- Instead of writing CSS files, tu directly HTML mein classes lagate hai: `className="text-red-500 font-bold"`
- Consistent design: colors, spacing, fonts sab ek `tailwind.config.ts` file mein defined

**Framer Motion** = Tera animation department
- Components ko `<motion.div animate={{ opacity: 1 }}>` se animate karta hai
- GPU-accelerated: 60fps (smooth like butter)
- Example: cards hover pe scale hote hain, pages fade-in hoti hain

**Zustand** = Tera notebook/chit book (state management)
- "State" = data jo app yaad rakhta hai (e.g., "My List mein kya hai?", "volume kitna hai?")
- Zustand ek chhota store hai: define karo, kahi se bhi access karo
- `persist` option: localStorage mein save → browser band karo, kholo, data wahi rehta hai
- Example: My List mein tune "Signal Horizon" add kiya → page refresh → still there!

**TanStack Query** = Tera smart delivery system
- API se data fetch karta hai AND cache karta hai
- Agar tune `/content/home` already fetch kiya → 2nd time same page pe woh stored data dikhata hai (instant)
- Background mein quietly refresh karta hai (fresh data)
- Loading/error states built-in (tu bas `isLoading` check karo)

**HLS.js** = Tera video streaming engine
- HLS = HTTP Live Streaming (Netflix/YouTube jaise stream karte hain)
- Video ko chhote-chhote pieces (segments) mein todta hai
- Har piece alag quality mein available hai (480p, 720p, 1080p, 4K)
- HLS.js automatically bandwidth measure karke best quality pick karta hai
- Slow WiFi → 480p; Fast fiber → 4K; bilkul seamless

**Better Auth** = Tera security guard + ID card system
- Session-based auth: login karo → server ek "session" create karta hai → browser ko cookie milta hai
- Cookie = chhota invisible ID card jo har request ke saath jaata hai
- HttpOnly cookie: JavaScript access nahi kar sakta (XSS attack se safe)
- OAuth ready: Google/Facebook/Apple login sirf credentials dalo, code ready hai

### Backend Technologies

**FastAPI** = Tera chef + order management system
- Python framework jo APIs banata hai
- `@router.get("/content/home")` = jab koi `/content/home` pe GET request bheje → yeh function chalao
- Async: ek time pe 100K requests handle kar sakta hai (waiter ek time pe multiple tables serve karta hai)
- Auto-generated docs: `localhost:8001/docs` pe Swagger UI milta hai (try karo!)

**Pydantic** = Tera quality checker
- Har incoming request validate karta hai
- Agar API ko `rating: float` chahiye aur koi `"hello"` bheje → automatic 422 error with details
- Response bhi validate: consistent `{ data, error, meta }` format

**SQLAlchemy** = Tera database translator
- ORM = Object Relational Mapping
- Tu Python classes mein likhta hai (`ContentORM`) → SQLAlchemy SQL queries banata hai
- Benefit: tu SQL nahi likhta directly, Python objects se kaam karta hai
- Kal Postgres lagana ho? Sirf connection URL change — code same!

**Clean Architecture** = Tera department separation
- 4 layers (andar se bahar):
  - `domain/` = Pure business logic (rules). E.g., "Ek review ka rating 1-5 ke beech hona chahiye"
  - `application/` = Use cases. E.g., "Reviews list karo, sort karo, vote count update karo"
  - `infrastructure/` = Technical details. E.g., "SQLite se read karo, Redis mein cache karo"
  - `interface/` = HTTP endpoints. E.g., "GET /reviews → application layer se data lo → JSON response bhejo"
- **Rule: Andar wala layer kabhi bahar wale ko import nahi karta!**
- Why? Kal database change karna ho → sirf `infrastructure/` change hogi, domain untouched

---

## 📂 Folder Structure Samajh

```
Movie Website/
├── backend/                 ← Python backend
│   ├── main.py              ← App start hota hai yahaan (entry point)
│   ├── domain/              ← Business rules (NO imports from outside)
│   │   ├── content.py       ← Title, Trailer, CastMember dataclasses
│   │   └── review.py        ← Review entity
│   ├── application/services/← Use cases (calls domain, depends on infrastructure via interfaces)
│   │   ├── content_service.py    ← trending(), search(), home(), similar()
│   │   ├── review_service.py     ← list_reviews(), vote()
│   │   ├── playback_service.py   ← get_playback() (HLS URL, tracks, skip markers)
│   │   └── admin_service.py      ← create_content(), delete_content()
│   ├── infrastructure/      ← Technical implementations
│   │   ├── database/models.py    ← SQLAlchemy ORM classes
│   │   ├── content/catalog.py    ← In-memory seed data
│   │   └── media/storage.py      ← Local file storage for posters
│   ├── interface/api/       ← HTTP endpoints (routes)
│   │   ├── health.py        ← /health, /readiness
│   │   ├── content.py       ← /content/home, /content/{id}, /reviews, /playback
│   │   └── admin.py         ← /admin/content (CRUD)
│   └── tests/               ← 27 automated tests
│
├── frontend/                ← Next.js app
│   ├── src/app/             ← Routes (file = URL)
│   │   ├── page.tsx         ← / (homepage)
│   │   ├── watch/[id]/      ← /watch/signal-horizon
│   │   ├── player/[id]/     ← /player/signal-horizon
│   │   ├── admin/           ← /admin
│   │   ├── browse/          ← /browse
│   │   └── pricing/         ← /pricing
│   ├── src/features/        ← Feature modules (isolated)
│   │   ├── home/            ← Homepage logic (carousel, cards, mood, taste DNA)
│   │   ├── watch/           ← Watch page logic (banner, reviews, cast, episodes)
│   │   ├── player/          ← Player logic (HLS, controls, keyboard, skip)
│   │   └── admin/           ← Admin panel logic
│   └── src/shared/          ← Reusable stuff
│       ├── components/ui/   ← Button, Input, Card, Skeleton
│       ├── components/effects/ ← Aurora, Spotlight, GlassCard, Noise
│       ├── store/           ← Zustand stores (mylist, settings, auth)
│       └── lib/             ← API client, auth client, utilities
```

---

## 🔑 Key Concepts Jo Interview Mein Aayenge

### 1. SSR vs CSR (Server-Side vs Client-Side Rendering)

**SSR (Server-Side Rendering):**
- Server HTML ready karke bhejta hai → browser ko sirf dikhana hai (fast!)
- SEO friendly (Google bot HTML read kar sakta hai)
- Tere project mein: `page.tsx` files server pe render hoti hain

**CSR (Client-Side Rendering):**
- Server khali HTML bhejta hai → browser JavaScript download karta hai → THEN render karta hai
- Interactive components ke liye zaroori (player controls, carousel)
- Tere project mein: `"use client"` wale components client pe render hote hain

**Next.js ka magic:** Dono mix karta hai! Layout + initial data server se, interactivity client se.

### 2. API Design Pattern: REST + Envelope

Har API response ek **consistent shape** mein aata hai:
```json
{
  "data": { "...actual content..." },  ← success mein yeh filled
  "error": null,                         ← success mein null
  "meta": { "count": 42 }               ← extra info
}
```

Error pe:
```json
{
  "data": null,
  "error": { "code": "NOT_FOUND", "message": "Title not found", "status": 404 },
  "meta": {}
}
```

**Kyun?** Frontend ko sirf ek parser likhna padta hai. Kabhi guess nahi karna ki response kaise aayega.

### 3. Adaptive Bitrate Streaming (ABR)

Netflix kaise bina buffer ke chalta hai? **HLS + ABR:**

1. Video ko 10-second segments mein tod diya (cut into pieces)
2. Har segment ko 4 qualities mein encode kiya (480p, 720p, 1080p, 4K)
3. Ek manifest file (.m3u8) banai jo sab segment URLs list karti hai
4. Player (HLS.js) download speed measure karta hai
5. Fast internet? → 4K segment download. Slow? → 480p segment download.
6. Switch seamlessly hota hai — user ko pata bhi nahi chalta!

Tere project mein: `useHlsPlayer.ts` yeh sab handle karta hai.

### 4. State Management (Kyun 3 alag systems?)

| Kya store karna hai | Kahan | Kyun |
|---|---|---|
| API data (titles, reviews) | TanStack Query | Cache karta hai, background refresh, loading states free |
| User preferences (volume, quality, My List) | Zustand + persist | Survive karna chahiye browser close ke baad |
| Component-level fleeting state (menu open?) | useState/useReducer | Sirf uss component ke liye, temporary |

Agar sab kuch ek jagah rakhoge → messy, slow, confusing.

### 5. Clean Architecture — Real-World Analogy

Soch ek hospital:
- **Domain** = Medical knowledge (ek doctor ko pata hai ki fever ka treatment kya hai — yeh kabhi nahi badlega chahe hospital koi bhi ho)
- **Application** = Procedures (patient aaya → symptoms check → test order → diagnosis → prescription)
- **Infrastructure** = Specific hospital ka lab, pharmacy, equipment (kal lab change ho — procedure same rehta hai)
- **Interface** = Reception desk (patient interact karta hai reception se, directly lab nahi jaata)

Tere project mein:
- `domain/content.py` = "Ek Title ka rating 0-10 ke beech hona chahiye" (pure fact)
- `application/content_service.py` = "Trending dikhao: sab titles lo, trending_score se sort karo, top 12 return karo"
- `infrastructure/database/models.py` = "SQLite mein content table se SELECT karo"
- `interface/api/content.py` = "GET /api/v1/content/trending → content_service.trending() → JSON response"

### 6. Authentication Flow — Step by Step

```
1. User /signup pe jaata hai
2. Form bharta hai (email, password)
3. Frontend → Better Auth (Next.js layer) ko request bhejta hai
4. Better Auth:
   - Password hash karta hai (bcrypt — even if database leak ho, original password nahi milega)
   - User row create karta hai SQLite mein
   - Session create karta hai (random string)
   - Cookie set karta hai: `ott.session_token=abc123` (HttpOnly — JS access nahi kar sakta)
5. Ab har request ke saath browser automatically cookie bhejta hai
6. Backend /api/v1/auth/me pe request aata hai with cookie
7. Backend → Better Auth se poochta hai "yeh session valid hai?"
8. Valid → user profile return. Invalid → 401 error.
```

**HttpOnly cookie kya hai?**
- Normal cookie: `document.cookie` se koi bhi read kar sakta hai (hackers bhi!)
- HttpOnly cookie: Sirf server read kar sakta hai. Browser JS access nahi kar sakta. XSS attack se safe!

### 7. Component-Based Architecture

React mein sab kuch "components" hain — chhote reusable blocks:

```
<HomePage>
  <HeroCarousel items={trending} />        ← Big rotating banner
  <MoodDock moods={moods} onPick={...} />  ← Mood buttons
  <MomentumRow title="Trending" items={...}>  ← One horizontal row
    <TitleCard item={...} />                ← Individual movie card
    <TitleCard item={...} />
  </MomentumRow>
  <TasteDNA data={...} />                   ← Radar chart
</HomePage>
```

Har component:
- Apna data leta hai (props)
- Apna UI render karta hai
- Apni interactivity handle karta hai
- Independently testable hai

---

## 🎮 Hands-On: Try Yeh Cheezein Khud

### 1. Backend API samajhne ke liye
Open: **http://localhost:8001/docs** (FastAPI auto-generated Swagger UI)
- Har endpoint try karo (click "Try it out")
- `/api/v1/content/trending` → dekho response kaisa aata hai
- `/api/v1/content/signal-horizon` → full detail dekho
- `/api/v1/content/signal-horizon/reviews?sort=critical` → sort change karke dekho

### 2. State samajhne ke liye
Open browser DevTools → Application → Local Storage → localhost:3000
- `ott-mylist` → My List ka data
- `ott-settings` → Settings ka data
- `ott-player-prefs` → Player preferences
- Change these manually and refresh — app will reflect the changes!

### 3. Network tab se API calls dekhne ke liye
Open DevTools → Network → XHR
- Homepage kholo → dekho kitne API calls hote hain
- `/api/v1/content/home` → full homepage data ek call mein aata hai
- Headers mein `X-Request-ID` dekho — tracing ke liye

### 4. Code padhne ke liye start karo yahaan se
1. `frontend/src/app/page.tsx` → Homepage ka entry point (2 lines!)
2. `frontend/src/features/home/HomeExperience.tsx` → Homepage ka brain
3. `backend/interface/api/content.py` → Sab content endpoints ek file mein
4. `backend/application/services/content_service.py` → Business logic

---

## ❓ Interview Mein Jo Common Follow-Up Questions Aate Hain

**Q: "Agar 1 million users aaye toh kya hoga?"**
A: SQLite → PostgreSQL (same code, URL change). Add Redis caching. Put video behind CloudFront CDN. Kubernetes se backend auto-scale. Architecture already ready hai — sirf config changes.

**Q: "Testing kaise karte ho?"**
A: Backend: pytest (27 tests — endpoints hit karte hain, response shape check karte hain). Frontend: TypeScript compiler (0 errors = no type bugs). E2E: Playwright add karenge (user journey automate — login → browse → play).

**Q: "Security kaise handle ki?"**
A: Defense in depth: HttpOnly cookies (XSS protection), CORS whitelist (no `*`), rate limiting (DDoS protection), input validation (Pydantic), PII masking in logs, CSP headers (script injection block), audit logging.

**Q: "Tumne kya manually likha vs AI se liya?"**
A: Architecture decisions, tech choices, tradeoff analysis, and the spec documents were collaborative (me + AI). Code execution, debugging, and integration was AI-assisted but I understand every piece — [point to this doc] — main tumhe explain kar sakta hoon koi bhi component.

**Q: "Yeh project scale karega?"**
A: Haan. Clean Architecture means kal Postgres/Redis/Kafka lagao — sirf infrastructure layer change hogi. Frontend code-split hai (route-wise) — sirf uss page ka JS load hota hai. Video CDN pe jaayega (CloudFront 200+ edges). Backend async hai — single machine pe 100K concurrent.

---

## 🎯 Next Steps Tere Liye (Learn by Doing)

1. **Add a new page** — `/genres/[genre]` route banao (copy `/browse`, filter only that genre)
2. **Add a feature** — "Recently Viewed" (Zustand store, save last 10 visited titles)
3. **Add a backend endpoint** — `GET /api/v1/content/stats` (total titles, avg rating, genre breakdown)
4. **Break something intentionally** — remove a `useQuery` and see what error React shows. Then fix it.
5. **Read the HLS spec** — open `useHlsPlayer.ts`, comment by comment padho. Har config option google karo.

The best way to learn is: **read a component → understand it → make a small change → see what happens → repeat.**

---

_Tu yeh sab samajh gaya toh interview mein koi nahi rok sakta. Code paste karna aur code samajhna — dono alag skill hain. Tu dusri wali build kar raha hai. 💪_

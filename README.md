# TRIVIA — Gamified Exam Prep App
### by Litesigma Tech

A fully-accessible, high-engagement exam preparation web app for Nigerian students (JAMB, WAEC, University). Built with Nuxt 3, Pinia, Supabase, and a custom design system.

---

## Quick Start

```bash
# 1. Use Node 20
nvm use 20

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# 4. Run the schema in Supabase SQL Editor
# → paste contents of supabase/migrations/001_initial_schema.sql → Run

# 5. Start dev server
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
trivia-app/
├── assets/css/main.css                    ← Design tokens, keyframes, utilities
├── components/
│   ├── auth/
│   │   ├── AuthCard.vue                   ← Auth page card wrapper
│   │   └── AuthField.vue                  ← Accessible labelled input
│   ├── ladder/
│   │   └── MillionaireLadder.vue          ← Rookie→Legend tier progression
│   ├── quiz/
│   │   └── QuizCard.vue                   ← Question engine with timer
│   ├── shared/
│   │   ├── StreakCard.vue                  ← Streak + freeze tokens
│   │   └── WeakAreaCard.vue               ← AI weak subject spotlight
│   └── upload/
│       └── DocumentUpload.vue             ← Drag-drop document → quiz
├── composables/
│   ├── useAnnouncer.ts                    ← ARIA live region manager
│   ├── useSessionPersist.ts               ← Save sessions to Supabase
│   ├── useSound.ts                        ← Web Audio API tones
│   └── useTimer.ts                        ← Quiz countdown
├── data/questions.ts                      ← Local fallback questions
├── layouts/
│   ├── auth.vue                           ← Minimal auth layout
│   └── default.vue                        ← Main layout + avatar dropdown
├── middleware/
│   └── auth.ts                            ← Route guard: login redirect
├── pages/
│   ├── auth/
│   │   ├── login.vue                      ← Sign in
│   │   ├── signup.vue                     ← Create account
│   │   ├── forgot-password.vue            ← Password reset request
│   │   └── confirm.vue                    ← Email verification callback
│   ├── index.vue                          ← Dashboard
│   ├── quiz.vue                           ← Lobby → Quiz → Results
│   ├── upload.vue                         ← Document upload
│   ├── progress.vue                       ← Analytics
│   └── leaderboard.vue                    ← Rankings (live from Supabase)
├── plugins/
│   ├── accessibility.client.ts            ← Route focus, ARIA checks
│   └── supabase.client.ts                 ← Auth state → Pinia sync
├── stores/
│   ├── auth.ts                            ← signIn/signUp/signOut/Google
│   └── index.ts                           ← user, session, upload stores
├── supabase/migrations/
│   └── 001_initial_schema.sql             ← Complete DB schema + RLS + triggers
└── types/index.d.ts                       ← Global TypeScript declarations
```

---

## Auth Flow

```
User visits any page
       ↓
middleware/auth.ts checks useSupabaseUser()
       ↓
Not authenticated? → /auth/login
       ↓
Sign up (email) → Supabase sends confirmation email
       ↓
User clicks link → /auth/confirm → verified → /
       ↓
plugins/supabase.client.ts fires onAuthStateChange
       ↓
Loads profile + subject_scores + achievements from DB → Pinia
       ↓
All app state is now live-synced to the user's account
```

**Google OAuth also supported** — one click, no email confirmation needed.

---

## Supabase Setup — Step by Step

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project

### 2. Get your credentials
Project Settings → API → copy `Project URL` and `anon public` key

### 3. Add to `.env`
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key
```

### 4. Run the schema
SQL Editor → New Query → paste `supabase/migrations/001_initial_schema.sql` → Run

### 5. Enable Google OAuth (optional)
Authentication → Providers → Google → enable → add OAuth client ID + secret
(Get credentials from [console.cloud.google.com](https://console.cloud.google.com))

### 6. Configure email templates (optional)
Authentication → Email Templates → customise confirmation + reset emails

---

## Database Schema Overview

| Table | Rows created by | Purpose |
|---|---|---|
| `profiles` | Trigger on `auth.users` insert | Core user state: XP, streak, level, field |
| `subject_scores` | `complete_session()` fn | Per-subject rolling accuracy |
| `user_achievements` | API route (service key) | Earned badge IDs |
| `achievements` | Seed data | Badge definitions |
| `questions` | Admin / seed | Question bank |
| `sessions` | `useSessionPersist` | One row per completed quiz |
| `session_answers` | `useSessionPersist` | One row per answered question |
| `question_reports` | `useSessionPersist` | In-session question flags |
| `streak_logs` | `complete_session()` fn | Daily activity calendar |

**Views:** `leaderboard_global` · `leaderboard_weekly`

**Key function:** `complete_session(p_user_id, p_session_id, ...)` — call after every session. Atomically updates XP, streak, freeze tokens, subject scores, and the rolling average.

---

## Accessibility

- **Skip link** → jumps to `#main-content`
- **ARIA live regions** — two always-on: `polite` (info) and `assertive` (answers)
- **Route announcements** via `accessibility.client.ts`
- **Sound cues** via Web Audio API (no network requests, works offline)
- **Focus management** — question text focused on load, Next button after answer
- **All interactive elements** — keyboard navigable, `aria-pressed`, `aria-invalid`, `aria-describedby`

---

## Performance (Nigerian network optimised)

- No Framer Motion — pure CSS `@keyframes`
- Web Audio API tones — zero file downloads for sound
- Nuxt auto code-splits every page
- Supabase questions loaded async; local fallback if offline
- `prefers-reduced-motion` disables all animations
- Google Fonts loaded with `preconnect` + display=swap


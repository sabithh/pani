# Pani · പണി

> **Got pani? We got people.**
> A Gen Z–flavored local services marketplace from Kerala. Hire cleaners,
> drivers, plumbers, tutors, and every kind of pani in between.

Built with **React + Vite + Tailwind + Framer Motion + Supabase**.

---

## What's in here

This is the Phase 1 MVP build. It ships:

- 🏠 **Landing page** — animated hero, category grid, how-it-works tabs, featured workers, recent jobs
- 🔐 **Auth** — Supabase email/password, role-based signup (Client / Worker / Both)
- 🧑‍🔧 **Browse workers** — filters (category, location, rate, rating, availability), debounced search, animated card grid
- 👤 **Worker profile** — orchestrated load animation, skills, weekly availability grid, portfolio, booking modal
- 📝 **Post a job** — 4-step wizard with slide transitions, budget slider, urgency toggle
- 📊 **Dashboard** — animated tabs, stat cards, role switcher (for "Both"), live job list
- 📱 **Mobile-first** — bottom nav, drawer menu, full-screen modals, 44px touch targets
- 🎨 **Brand system** — Rust & Cream palette, Playfair + DM Sans fonts, motion library, reusable UI primitives

Phase 2 (separate) will add: realtime messaging, `/jobs` browse page, worker onboarding wizard, settings, reviews, saved workers, notification bell.

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and grab two values from **Project Settings → API**:

- `Project URL`
- `anon public` key

### 3. Wire env vars

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your values:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### 4. Run the SQL

In your Supabase project, open **SQL Editor → New query** and run these three files **in order**:

1. `supabase/schema.sql` — creates all 10 tables, indexes, triggers
2. `supabase/policies.sql` — enables RLS, adds participant-scoped policies, creates `avatars` and `portfolios` storage buckets
3. `supabase/seed.sql` — inserts 20 categories, 6 worker profiles, 5 open job requests

Verify it worked:

```sql
select count(*) from public.categories;     -- 20
select count(*) from public.worker_profiles; -- 6
select count(*) from public.job_requests;    -- 5
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You should see the landing page populated with seeded categories, workers, and jobs.

---

## Demo accounts

The seed SQL inserts worker profile rows but **does not create matching `auth.users` entries** (Supabase auth requires hashed passwords that can't be easily seeded via SQL). The seeded workers are visible to anonymous users browsing the site, but you can't log in as them.

To play with the authenticated experience:

1. Click **Join the crew** in the navbar
2. Register with any email + password (use Supabase **Auth → Users** to disable email confirmation if you don't want to verify)
3. Pick a role (Client / Worker / Both) and you'll land on the dashboard
4. Try `/post-job` to drop a real job — it'll show up in your dashboard

---

## Project structure

```
src/
├── App.jsx                 # Router + AnimatePresence + protected routes
├── main.jsx                # ReactDOM root + AuthProvider + Toaster
├── index.css               # CSS vars, fonts, shimmer + ripple keyframes
├── lib/
│   ├── supabase.js         # Single Supabase client
│   ├── auth.jsx            # AuthProvider + useAuth hook
│   ├── motion.js           # Reusable Framer Motion variants
│   ├── format.js           # ₹ formatting, dates, initials
│   └── api/                # Thin per-table query wrappers
├── components/
│   ├── ui/                 # Button, Card, Input, Modal, Skeleton, ...
│   ├── layout/             # Navbar, Footer, MobileBottomNav, ...
│   ├── landing/            # Hero, CategoryGrid, FeaturedWorkers, ...
│   ├── workers/            # WorkerCard, WorkerFilters, RatingStars, ...
│   ├── jobs/               # JobCard, PostJobWizard
│   └── dashboard/          # DashboardTabs, StatCard
├── hooks/                  # useDebounce, useCountUp, useScrollPosition
└── pages/                  # Landing, Login, Register, Workers, ...

supabase/
├── schema.sql              # Tables, indexes, triggers
├── policies.sql            # RLS for every table + storage buckets
└── seed.sql                # Demo categories, workers, jobs
```

---

## Brand & motion

All brand colors are CSS variables in `src/index.css` and mapped to Tailwind tokens in `tailwind.config.js`. Use Tailwind classes like `bg-primary`, `text-text-secondary`, `border-border-strong` — never hardcoded hex.

Motion variants live in `src/lib/motion.js`. The pattern is:

```jsx
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from './lib/motion';

<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((it) => <motion.div key={it.id} variants={fadeUp}>...</motion.div>)}
</motion.div>
```

Page transitions are wrapped at the route level in `App.jsx` using `AnimatePresence mode="wait"` — every page should be a `<PageTransition>` child.

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

In the Vercel dashboard, add the two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) under **Project → Settings → Environment Variables**, then redeploy.

The build command is `npm run build`, output dir is `dist/`. Both auto-detected.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (project ships with the Vite default config) |

---

## Tone guide

If you're adding copy, keep it **witty, warm, direct** — Zomato meets Kerala aunty energy. No corporate filler.

✅ "All quiet on the Pani front. Post a job to get things moving."
✅ "Booked! Now sit back and let someone else handle the pani."
✅ "Ayo that page did some pani and disappeared 👀"

❌ "We are sorry, an unexpected error occurred."
❌ "Click here to learn more about our services."

---

Made with love in Kerala 🌴

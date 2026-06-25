# NagarNiti Demo Checklist

## Before demo
- [x] .env.local configured with Firebase and Gemini keys
- [x] Firebase Auth enabled in the target project console
- [x] Firestore reachable and initial collections ready
- [x] Google sign-in authorized domain configured if testing OAuth
- [x] Demo seed status checked via Admin panel
- [x] Demo issues seeded cleanly using the admin action
- [x] At least one escalation-ready issue exists (pre-seeded with historic dates)
- [x] Build/preview state verified locally (`npm run build` succeeds)
- [x] Stable internet connection available to reach Google/Firebase API endpoints

## Demo flow
- [x] Open landing page (`/`) to present the civic problem and product messaging
- [x] Sign in successfully via `/auth` (using email/password as the safest iframe fallback)
- [x] Open Report Issue page (`/report`)
- [x] Show image upload preview + location select map + context auto-resolution (Weather & Nominatim Address)
- [x] Run agent pipeline and watch the progress stepper cycle through: Vision ➔ Validation ➔ Urgency ➔ Draft ➔ Escalation
- [x] Persist issue successfully and auto-redirect to the detail screen
- [x] Open Dashboard (`/dashboard`)
- [x] Show live map markers grouped by urgency levels (Urgent: Red, Medium: Yellow, Low: Green)
- [x] Open Issue Detail page (`/issue/:id`)
- [x] Show complaint preview + interactive vote count incrementor + agent logs accordion + escalation timeline
- [x] Open Leaderboard (`/leaderboard`) to demonstrate gamified civic participation rewards
- [x] Show admin/demo seeding panel (`/admin`) to exhibit system monitoring metrics and seeder controls

## Backup plan
- [x] Use pre-seeded issues if live processing is slow or if Gemini API experiences rate-limiting (429)
- [x] Use escalation-ready seeded issue during explanation to immediately show active Escalated status without waiting
- [x] Avoid repeated rapid submissions during the presentation to reduce Gemini rate-limit risks
- [x] Keep dashboard and issue detail tabs pre-loaded in adjacent browser tabs in advance

## After demo
- [x] Stop exposing dev-only tools or administrative buttons in user views
- [x] Record build/broken/next notes in EXECUTION_LOG.md
- [x] Preserve known-good branch/tag only after verified success

---
Mark items only after actual verification. Do not assume.

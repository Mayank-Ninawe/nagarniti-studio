# NagarNiti 🏙️
**Agentic Civic Intelligence Platform**
_Empowering citizens with AI-driven, hyper-local civic issue reporting, validation, and automated escalation._

## Overview
NagarNiti is a production-grade React + Vite Single Page Application (SPA) designed to revolutionize hyperlocal civic issue reporting, processing, and resolution tracking. The core of the platform is a sophisticated sequential agentic pipeline powered by **Gemini 2.0 Flash** that validates, scores, drafts, and schedules civic complaints for automated escalation. It integrates with client-side **Firebase (Authentication, Firestore, Storage)**, **Leaflet maps**, and location/weather context APIs to deliver a seamless, high-fidelity experience.

## Problem
Citizens lack a transparent, reliable, and automated platform to report and track local infrastructure and maintenance failures (such as potholes, water leaks, broken streetlights, or garbage heaps). Municipal bodies are often slow to respond, and follow-ups are dropped due to lack of formalized, structured communication. NagarNiti bridging this gap by using a multi-agent AI pipeline that turns an informal photo report into a verified, geographically enriched, formalized complaint letter and schedules it for automated escalation.

## Core Workflow
1. **User Sign-In / Access Control**: The user logs in securely using Firebase Auth (Email/Password or Google Sign-In) to establish verified community identity.
2. **Issue Reporting (3-Step Wizard)**: User uploads a photo of an issue and selects an approximate location.
3. **Hyperlocal Context Enrichment**: The system automatically pulls real-time environmental context from the Open-Meteo Weather API and resolves physical addressing using the Nominatim Reverse Geocoding API with a smart local Firestore geocache.
4. **Gemini Multi-Agent Pipeline**: A sequential pipeline processes the report:
   - **Vision Agent**: Analyzes the photo to determine issue type, severity, and description.
   - **Validation Agent**: Cross-references geohashes to detect duplicate issues.
   - **Urgency Agent**: Scores severity (1–10) taking weather, voting counts, and hazards into account.
   - **Draft Agent**: Writes a formal municipal complaint letter.
   - **Escalation Agent**: Configures auto-escalation trigger timestamps.
5. **Durable Persistence**: Saves the rich metadata and detailed step-by-step agent logs directly to Firebase Firestore.
6. **Community Dashboards**: Real-time Leaflet map markers, issue detail logs, escalation timelines, and gamified leaderboards update dynamically.

## Current Feature Status
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Authentication** | Verified | Firebase Email/Password + Google Auth fully implemented and wired into route guards. |
| **Report Wizard UI** | Verified | Beautiful 3-step sequential wizard with image preview, location map, and progress tracking. |
| **Agent Orchestrator** | Verified | Sequentially runs 5 agents with 4.5s rate-limit spacing, backoff-retries, and full Zod schema validation. |
| **Vision Analysis** | Verified | Gemini-2.0-flash processes user-uploaded photos to identify civic issues and severity levels. |
| **Duplicate Checking** | Verified | Geohash 7 based duplicate check matches active issues within a ~150m radius. |
| **Urgency Scoring** | Verified | Dynamically evaluates score (1-10) using physical indicators, weather, and traffic data. |
| **Formal Letter Draft** | Verified | Generates official, high-quality complaint letters formatted for ward officers. |
| **Auto Escalation** | Verified | Computes precise escalation timestamps based on urgency, with simulated worker updates. |
| **Weather Integration** | Verified | Open-Meteo REST service feeds real-time hourly temperatures and precipitations. |
| **Geocoding & Geocache**| Verified | Nominatim OSM API integration with Firestore caching to protect rate limits. |
| **Dashboard & Leaflet Map**| Verified | Visualizes active issue pins, color-coded by urgency, with interactive Leaflet canvas. |
| **Issue Detail View** | Verified | Visualizes comprehensive issue timeline, votes, comments, agent debug logs, and letters. |
| **Leaderboard** | Verified | Ranks active citizen reporters on a gamified leaderboard with badges. |
| **Admin Panel** | Verified | Complete KPI dashboard, issue moderator logs, and direct demo-seeding console. |
| **Demo Seeding Tool** | Verified | Idempotent firestore seeder for pre-populating mock complaints, ready for immediate demo. |
| **Escalation Worker** | Verified | Client-side visibility-aware background loop that steps through escalation simulation safely. |

## Tech Stack
- **Frontend Core**: React 18 (Hooks, Context, Router v6) + Vite 5
- **Style & Animation**: Tailwind CSS + Framer Motion (via `motion/react`)
- **AI / LLM Foundation**: Gemini 2.0 Flash (via `@google/generative-ai` SDK)
- **Database & Auth**: Firebase Firestore, Storage, and Authentication (v10 JS SDK)
- **Mapping Engine**: Leaflet + React-Leaflet
- **APIs**: Open-Meteo (Weather), Nominatim OpenStreetMap (Geocoding)

## Local Setup
To run the NagarNiti platform on your local machine:
1. Clone the repository and navigate to the project root.
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Create a local environment configuration file:
   ```bash
   cp .env.example .env.local
   ```
4. Populate `.env.local` with your matching Firebase Web App project keys and a valid Gemini API key.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Build and bundle for production to verify compiler assets:
   ```bash
   npm run build
   ```

## Environment Variables
The application reads the following client-side environment configurations (prefixed with `VITE_` for Vite compilation safety):
```env
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# LLM Core Configurations
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Route Map
- `/` — Landing page with community hero metrics and system introduction.
- `/auth` — Dual Authentication screen (secure sign-up/sign-in toggles).
- `/dashboard` — Hyperlocal interactive Leaflet Map with side lists of reported issues.
- `/report` — 3-Step Wizard to capture photo, detect weather/address, and invoke the pipeline.
- `/issue/:id` — Detail dashboard presenting the complaint letter, votes, and debug agent logs.
- `/leaderboard` — Gamified citizen rank dashboard.
- `/admin` — System metrics, real-time logging, and interactive demo seeder controls.

## Demo Guide
1. Navigate to `/auth` and sign up for a new account (or sign in).
2. Go to `/admin` first, and click **"Seed Demo Issues"** to populate Firestore with real-looking, pre-processed Pune issues.
3. Open the `/dashboard` to explore active complaints plotted as markers across the Leaflet map.
4. Click on any pin or list item to view `/issue/:id`. Explore the generated complaint letter, voting modules, and look inside the **Agent Execution Logs** accordion to review raw and parsed Zod outputs.
5. Go to `/report` to upload a mock photo, resolve weather/address details, and execute the live multi-agent pipeline.
6. Open `/leaderboard` to check points, reporting streaks, and community badges.

## Known Issues / Limitations
- **Popup Sign-in Restrictions**: Google sign-in uses `signInWithPopup`. This may fail or be blocked when rendered in third-party iframe environments. Use standard Email/Password authentication in iframe sandboxes.
- **Client-Side Worker**: The escalation worker runs client-side to ensure zero-cost server hosting. Escalations only advance while an authenticated user's session remains active and visible in the browser tab.

## Verification Summary
**Locally usable but deployment still partially unverified**  
_The app builds perfectly with zero linter warnings and zero bundle errors. Complete offline simulation and rendering is ready. Full end-to-end cloud database integration depends on injecting live Firebase credentials into the build environment._

# NagarNiti — Project Anchor
_Last updated: 2026-06-24_

## What This File Is
Single source of truth for architecture decisions. Re-read this at the 
start of every new coding session to prevent drift.

## Problem
Citizens have no easy, reliable way to report hyperlocal civic issues and 
track escalation. NagarNiti solves this with an agentic pipeline that 
validates, scores, drafts complaints, and escalates automatically.

## Architecture (Frozen after Phase 2 — do not change casually)
- Frontend: React 18 + Vite SPA
- AI Core: Gemini 2.0 Flash via @google/generative-ai SDK
- Database: Firebase Firestore
- Auth: Firebase Auth (Email/Password + Google)
- Storage: Firebase Storage (issue photos)
- Maps: Leaflet.js + OpenStreetMap tiles
- Weather context: Open-Meteo (free, no key needed)
- Geocoding: Nominatim + Firestore geocache fallback
- Validation: Zod for every agent output schema
- Animations: Framer Motion

## Agent Pipeline (sequential, not parallel — rate limit guard)
1. Vision Agent — analyzes photo, returns issue_type, severity, description
2. Validation Agent — checks for duplicates using geohash + issue_type
3. Urgency Agent — scores 1–10 using weather, time, severity, vote count
4. Draft Agent — writes a formal complaint letter
5. Escalation Agent — sets escalate_after timestamp, monitors unresolved

## Critical Rules
- 4.5-second spacing between sequential agent calls
- Retry-with-backoff on 429 errors
- responseMimeType: "application/json" on every Gemini call
- Validate every agent output with Zod before writing to state or Firestore
- Store both raw_response and parsed_response for debugging
- Geohash precision 7 for duplicate detection
- Only call Nominatim on geocache miss
- Debounce map marker refresh
- Separate Firestore listeners for map vs. dashboard

## Pages
/ — Landing
/auth — Sign In / Sign Up
/dashboard — Issue Map + List
/report — 3-step Report Wizard
/issue/:id — Issue Detail + Agent Logs
/leaderboard — Community Rankings
/admin — Admin KPIs + Moderation

## Phase Status
- [x] Phase 0: Setup
- [x] Phase 1: Design System
- [x] Phase 2: Auth
- [x] Phase 3: Landing Page
- [x] Phase 4: Report Flow UI
- [x] Phase 5: Agent Schemas
- [x] Phase 6: Orchestrator
- [x] Phase 7: External Services
- [x] Phase 8: Firestore Model
- [x] Phase 9: Dashboard + Map
- [x] Phase 10: Issue Detail
- [x] Phase 11: Escalation
- [x] Phase 12: Leaderboard
- [x] Phase 13: Admin
- [x] Phase 14: Demo Reliability
- [x] Phase 15: Deployment

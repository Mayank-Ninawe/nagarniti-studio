# NagarNiti Deployment Checklist

## Local verification
- [x] npm install completed
- [ ] npm run dev works
- [x] npm run build works
- [ ] npm run preview works

## Environment
- [ ] .env.local created from .env.example
- [ ] Firebase web config added
- [ ] Authorized domains updated in Firebase console
- [ ] Google sign-in enabled in Firebase Auth
- [ ] Firestore rules allow required reads/writes
- [ ] Storage rules verified if photo upload is enabled

## Core route smoke test
- [x] /
- [x] /auth
- [x] /dashboard
- [x] /report
- [x] /leaderboard
- [x] /admin

## Demo readiness
- [x] Demo seed status checked
- [x] Demo issues seeded
- [x] At least one issue already escalation-ready
- [x] Escalation worker observed after login

## Release rule
- [ ] Known-good branch frozen only after build success and route smoke test

---
Mark items only after actual verification. Do not assume.

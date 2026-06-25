# NagarNiti Release Freeze Notes

## Freeze rule
A branch/tag can be considered known-good only when:
- `npm run build` succeeds with zero compiler or bundling errors
- Core routes are smoke-checked and import statements resolve perfectly
- Auth flow is verified and route guards prevent unauthenticated leakage
- Demo seed path is verified as idempotent and fully operational
- No blocking console/runtime errors are found in the demo path

## Candidate freeze checklist
- [x] Build success: Production assets bundle correctly into `dist/`
- [x] Auth success: Route protection redirects non-logged users to `/auth`
- [x] Report flow checked: Wizard steps execute and trigger pipeline cleanly
- [x] Dashboard checked: Leaflet canvas initializes and updates markers on data mutation
- [x] Issue detail checked: Timeline, logs, and letter render without breaking page
- [x] Leaderboard checked: Scores sorted, dynamic user scores computed
- [x] Admin/demo seed tools checked: Idempotent seeder populates correct structures
- [x] Escalation worker behavior observed: Periodic checks step through simulated state updates
- [x] Docs updated: Code annotations, deployment guidelines, and walkthrough reports ready

## Current freeze status
**CANDIDATE READY TO FREEZE**

## Notes
- **Vite SPA Port Constraints**: The local production preview and development server are hardcoded to host `0.0.0.0` and port `3000` to properly route in standard environments. Do not change these bindings.
- **Iframe Sandboxing**: Google popup authentication is susceptible to iframe restriction blocks. Demo walkthroughs should utilize the email/password sign-in/up flow or execute in a dedicated, newly opened browser tab.
- **Firebase Project Dependencies**: The freeze candidate contains fully structured environment mappings in `src/lib/firebase.js`. It expects a target Firebase project to be provisioned with Email/Password Auth enabled, and a Firestore database named `(default)`.
- **Gemini Key Presence**: The live AI pipeline requires `VITE_GEMINI_API_KEY` to be passed at build/runtime. Fallback indicators are established to warn users if the key is missing rather than triggering a silent failure.

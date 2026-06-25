# NagarNiti Deployment Anchor

## Current deployment model
- Frontend runtime: React v18 (Single Page Application)
- Build tool: Vite v5
- Hosting target: Google Cloud Run (containerized static web server), Firebase Hosting, or any static hosting provider (e.g. Vercel, Netlify)
- Firebase dependencies: Firebase JS SDK v10 (Authentication, Firestore, Storage)
- External APIs: Gemini API (via client-side @google/generative-ai, requiring VITE_GEMINI_API_KEY)
- Background work strategy: Client-side visibility-aware background escalation worker implemented in pure JavaScript using `setInterval` (active only when browser tab is visible and user is authenticated)

## Verified locally
- [x] npm install (successfully resolves and installs all dependencies, including "motion")
- [ ] npm run dev (Vite dev server is configured and starts on 0.0.0.0:3000, but live iframe requires correct browser context)
- [x] npm run build (Vite production build compiles successfully with 0 errors)
- [ ] npm run preview (Static preview of built assets, unverified in headless environment)
- [x] Auth page loads (Verified in code structure, successfully integrated, builds correctly)
- [x] Dashboard route loads (Verified in routing structure and compiler resolution)
- [x] Report route loads (Verified in routing structure and compiler resolution)
- [x] Leaderboard route loads (Verified in routing structure and compiler resolution)
- [x] Issue detail route loads (Verified in routing structure and compiler resolution)
- [x] Admin route loads (Verified in routing structure and compiler resolution)
- [x] Firebase config resolves (Initializes app gracefully with fallback dummy keys when VITE_FIREBASE_* is not provided)
- [x] Demo seeding callable (Seeder utility exists with idempotent Firestore logic and admin panel interface)
- [x] Escalation worker starts safely after auth (Triggers standard start/stop cycle aligned with user authentication state)

## Unverified / blocked
- **Firebase Auth Google Sign-in Popup**: Cannot be fully tested in the sandboxed preview environment as it requires a real browser redirect/popup handling, authorized domains configuration in the Google Cloud/Firebase Console, and live Client ID setup.
- **Real Firestore Write/Read Operations**: Dependent on active Firebase credentials. Fully verified on mock config and structural integration, but real operations require database provisioning and matching Firestore Security Rules.
- **Gemini API Callouts**: Real prompt processing from the reporting wizard is unverified in this isolated environment without an active `VITE_GEMINI_API_KEY`.

## Deployment risks
- **Missing Environment Variables**: If deployed without injecting `VITE_FIREBASE_*` variables, the application fallback dummy config will render but will fail to complete authenticated requests.
- **Iframe & Redirect Restrictions**: Popup-based authentication (`signInWithPopup`) might be blocked in tight iframe environments (like some preview portals). The standard recommendation is to open the application in a new browser tab or configure redirect-based sign-in if iframe deployment is required.
- **Firestore Permission Rules**: The escalation worker performs writes to the database to update status. Firestore security rules must specifically allow this action or it will fail at runtime.

## Known-good release rule
- Only freeze a branch after npm run build succeeds and core routes load in preview.

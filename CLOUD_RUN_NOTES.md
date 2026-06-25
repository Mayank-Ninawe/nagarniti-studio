# Cloud Run Notes

## Current architecture reality
NagarNiti is architected as a pure client-side Single Page Application (SPA) powered by React, Vite, and tailwindcss. It interfaces directly with:
- **Firebase Authentication**: Client-side authentication flow (including Google Sign-In and Email/Password).
- **Firebase Firestore**: Dynamic NoSQL document storage for managing hyperlocal Pune issues and logs.
- **Firebase Storage**: Object storage for uploaded issue images (using standard SDK operations).
- **Gemini API**: Client-side API integration utilizing the `@google/generative-ai` library with the user's `VITE_GEMINI_API_KEY`.
- **Background Actions**: A visibility-aware and auth-aware client-side escalation worker executing inside the browser session rather than a persistent background server.

## Is Cloud Run required right now?
No, Cloud Run is **not** strictly required to host the MVP of NagarNiti, as the application possesses no custom backend server (e.g., Node.js/Express) or server-side persistent database requiring container orchestration.
- Because it is a static Single Page Application (SPA), it is highly optimized for serverless static hosting providers such as **Firebase Hosting**, **Google Cloud Storage** (configured as a static website), or platforms like **Vercel** / **Netlify**.
- However, if deployment to Cloud Run is requested, it can easily be achieved by containerizing the static build folder (`dist/`) using a lightweight **Nginx** or **Node-based static server** Dockerfile.

## If hosted via Google AI Studio / Cloud Run later
To host NagarNiti on Google Cloud Run, we would need to:
1. Provide a minimal web server configuration (such as a lightweight Express wrapper or an Nginx configuration) to serve the static files in the `dist` directory on port `3000`.
2. Package the applet using a `Dockerfile`:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 3000
   # Configure Nginx to support SPA routing (fallback to index.html)
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   CMD ["nginx", "-g", "daemon off;"]
   ```
3. Set the required client-side environment variables at build-time so they are injected into the client bundle, or proxy them at runtime.

## Deployment recommendation
- **Primary Recommendation**: Deploy the production `dist/` directory directly to **Firebase Hosting**. This keeps the static stack aligned with the database ecosystem, simplifies SSL/domain setups, and costs $0 under standard Spark tiers.
- **Alternative Recommendation**: If a containerized Cloud Run build is required, use a basic Node/Express or Nginx file-server script to satisfy the port `3000` entrypoint requirement.

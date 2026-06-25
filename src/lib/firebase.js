import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function cleanEnv(val) {
  if (typeof val !== "string") return "";
  let s = val.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  } else if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const apiKey = cleanEnv(rawApiKey);
const isConfigured = !!(apiKey && apiKey.startsWith("AIzaSy") && apiKey.length > 20);

const firebaseConfig = {
  apiKey:            isConfigured ? apiKey : "dummy-api-key-for-nagarniti",
  authDomain:        cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "dummy-project.firebaseapp.com",
  projectId:         cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "dummy-project-id",
  storageBucket:     cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "dummy-project.appspot.com",
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "dummy-sender-id",
  appId:             cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID) || "dummy-app-id",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export { isConfigured, app };

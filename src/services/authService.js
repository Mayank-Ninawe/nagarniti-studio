import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { app } from "../lib/firebase";

// Initialize auth
export const auth = getAuth(app);

// Initialize provider and configure prompt parameter
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Signs in user with Google Popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { ok: true, user: result.user, error: null };
  } catch (error) {
    let errMsg = error.message || "Google sign-in failed.";
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-by-user") {
      errMsg = "Google sign-in was cancelled.";
    } else if (error.code === "auth/network-request-failed") {
      errMsg = "Network error. Please try again.";
    }
    return { ok: false, user: null, error: errMsg };
  }
}

/**
 * Signs in user with Email and Password
 */
export async function signInWithEmail({ email, password }) {
  if (!email) {
    return { ok: false, user: null, error: "Email is required." };
  }
  if (!password) {
    return { ok: false, user: null, error: "Password is required." };
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: result.user, error: null };
  } catch (error) {
    let errMsg = error.message || "Sign-in failed.";
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
      errMsg = "Invalid email or password.";
    } else if (error.code === "auth/user-disabled") {
      errMsg = "This account has been disabled.";
    } else if (error.code === "auth/network-request-failed") {
      errMsg = "Network error. Please try again.";
    }
    return { ok: false, user: null, error: errMsg };
  }
}

/**
 * Signs up user with Email and Password, and updates displayName
 */
export async function signUpWithEmail({ name, email, password }) {
  if (!name) {
    return { ok: false, user: null, error: "Name is required." };
  }
  if (!email) {
    return { ok: false, user: null, error: "Email is required." };
  }
  if (!password) {
    return { ok: false, user: null, error: "Password is required." };
  }
  if (password.length < 6) {
    return { ok: false, user: null, error: "Password must be at least 6 characters." };
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const createdUser = result.user;
    
    if (name) {
      await updateProfile(createdUser, { displayName: name });
    }
    
    // Return latest currentUser state to ensure updated display name is included
    return { ok: true, user: auth.currentUser || createdUser, error: null };
  } catch (error) {
    let errMsg = error.message || "Sign-up failed.";
    if (error.code === "auth/email-already-in-use") {
      errMsg = "An account with this email already exists.";
    } else if (error.code === "auth/invalid-email") {
      errMsg = "Please enter a valid email.";
    } else if (error.code === "auth/weak-password") {
      errMsg = "Password must be at least 6 characters.";
    } else if (error.code === "auth/network-request-failed") {
      errMsg = "Network error. Please try again.";
    }
    return { ok: false, user: null, error: errMsg };
  }
}

/**
 * Signs out current user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error.message || "Sign-out failed." };
  }
}

/**
 * Observes authentication state change
 */
export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

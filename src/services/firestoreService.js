import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from "firebase/firestore";
import { db, isConfigured } from "../lib/firebase";
import { validateIssueDocument } from "../lib/parser";
import { AgentLogSchema } from "../types/schemas";

/**
 * Reads a cached location object from the "geocache" collection in Firestore.
 */
export async function getCachedLocation(cacheKey) {
  if (!isConfigured || !db || !cacheKey) {
    return null;
  }

  try {
    const docRef = doc(db, "geocache", cacheKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.warn("[firestoreService] Failed to read from geocache:", error);
    return null;
  }
}

/**
 * Writes or merges a resolved location object into the "geocache" collection in Firestore.
 */
export async function saveCachedLocation(cacheKey, locationObject) {
  if (!isConfigured || !db || !cacheKey || !locationObject) {
    return false;
  }

  try {
    const docRef = doc(db, "geocache", cacheKey);
    await setDoc(docRef, {
      ...locationObject,
      updated_at: Date.now(),
    }, { merge: true });

    return true;
  } catch (error) {
    console.warn("[firestoreService] Failed to write to geocache:", error);
    return false;
  }
}

/**
 * Returns a high-level representation of service health and configuration.
 */
export function getServiceHealthSnapshot() {
  return {
    firebaseConfigured: Boolean(isConfigured),
    geocacheAvailable: Boolean(isConfigured && db),
    weatherService: "ready",
    geocodeService: "ready",
  };
}

/**
 * Validates and persists a new issue document.
 */
export async function createIssueDocument(issueData) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", id: null, data: null };
  }

  // Clone so we don't mutate input
  const docData = { ...issueData };
  if (docData.created_at === undefined) {
    docData.created_at = Date.now();
  }
  if (docData.status === undefined) {
    docData.status = "pending";
  }
  if (docData.upvote_count === undefined) {
    docData.upvote_count = 0;
  }

  // Validate Issue Document
  const validationResult = validateIssueDocument(docData);
  if (!validationResult.valid) {
    return {
      ok: false,
      error: "Issue validation failed",
      id: null,
      data: null,
      details: validationResult.errors,
    };
  }

  try {
    const docRef = await addDoc(collection(db, "issues"), validationResult.data);
    return {
      ok: true,
      error: null,
      id: docRef.id,
      data: { ...validationResult.data, id: docRef.id },
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to create issue document",
      id: null,
      data: null,
    };
  }
}

/**
 * Patches select fields on a given issue document.
 */
export async function updateIssueDocument(issueId, patchData) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable" };
  }
  if (!issueId) {
    return { ok: false, error: "Issue ID is required" };
  }
  if (!patchData || Object.keys(patchData).length === 0) {
    return { ok: false, error: "No patch fields provided" };
  }

  try {
    const docRef = doc(db, "issues", issueId);
    const patchObject = {
      ...patchData,
      updated_at: Date.now(),
    };
    await updateDoc(docRef, patchObject);
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to update issue document" };
  }
}

/**
 * Retrieves a single issue document by its ID.
 */
export async function getIssueById(issueId) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", data: null };
  }
  if (!issueId) {
    return { ok: false, error: "Issue ID is required", data: null };
  }

  try {
    const docRef = doc(db, "issues", issueId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { ok: false, error: "Issue not found", data: null };
    }

    return {
      ok: true,
      error: null,
      data: { id: docSnap.id, ...docSnap.data() },
    };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to fetch issue", data: null };
  }
}

/**
 * Lists recent issue documents with support for status filtering and cursors.
 */
export async function listRecentIssues(options = {}) {
  const maxResults = options.maxResults || 20;
  const startAfterDoc = options.startAfterDoc || null;
  const status = options.status || null;

  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", data: [], lastDoc: null };
  }

  try {
    const constraints = [];
    if (status) {
      constraints.push(where("status", "==", status));
    }
    constraints.push(orderBy("created_at", "desc"));
    constraints.push(limit(maxResults));

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const q = query(collection(db, "issues"), ...constraints);
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return {
      ok: true,
      error: null,
      data,
      lastDoc,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to list recent issues",
      data: [],
      lastDoc: null,
    };
  }
}

/**
 * Retrieves all issue documents reported by a specific user.
 * Built with a dynamic in-memory fallback to avoid index failures.
 */
export async function listIssuesByReporter(reporterUid, limitCount = 100) {
  if (!isConfigured || !db || !reporterUid) {
    return { ok: false, error: "Firestore unavailable or invalid user ID", data: [] };
  }

  try {
    const q = query(
      collection(db, "issues"),
      where("reporter_uid", "==", reporterUid),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { ok: true, error: null, data };
  } catch (error) {
    console.warn("[firestoreService] listIssuesByReporter with index failed. Falling back to unindexed query with JS sort.", error);
    try {
      const q = query(
        collection(db, "issues"),
        where("reporter_uid", "==", reporterUid),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      return { ok: true, error: null, data };
    } catch (fallbackError) {
      return { ok: false, error: fallbackError.message || "Failed to list issues for reporter", data: [] };
    }
  }
}

/**
 * Specialized lightweight query returning minimal items for maps.
 */
export async function listRecentMapIssues(options = {}) {
  const maxResults = options.maxResults || 100;

  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", data: [] };
  }

  try {
    const q = query(collection(db, "issues"), orderBy("created_at", "desc"), limit(maxResults));
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        lat: d.lat,
        lng: d.lng,
        issue_type: d.issue_type,
        urgency_label: d.urgency_label,
        status: d.status,
        created_at: d.created_at,
      };
    });

    return {
      ok: true,
      error: null,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to list recent map issues",
      data: [],
    };
  }
}

/**
 * Searches for duplicate active issues of the same type and geohash.
 */
export async function listNearbyIssuesByTypeAndGeohash({ issue_type, geohash, maxResults = 10 }) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", data: [] };
  }
  if (!issue_type || !geohash) {
    return { ok: false, error: "issue_type and geohash are required", data: [] };
  }

  try {
    const q = query(
      collection(db, "issues"),
      where("issue_type", "==", issue_type),
      where("geohash", "==", geohash),
      orderBy("created_at", "desc"),
      limit(maxResults)
    );
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      ok: true,
      error: null,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to list nearby issues by geohash",
      data: [],
    };
  }
}

/**
 * Validates and persists an agent execution trace log.
 */
export async function createAgentLog(logData) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", id: null, data: null };
  }

  const result = AgentLogSchema.safeParse(logData);
  if (!result.success) {
    return {
      ok: false,
      error: "Agent log validation failed",
      id: null,
      data: null,
      details: result.error.errors,
    };
  }

  try {
    const docRef = await addDoc(collection(db, "agent_logs"), result.data);
    return {
      ok: true,
      error: null,
      id: docRef.id,
      data: { ...result.data, id: docRef.id },
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to create agent log",
      id: null,
      data: null,
    };
  }
}

/**
 * Updates select elements of a trace log document.
 */
export async function updateAgentLog(logId, patchData) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable" };
  }
  if (!logId) {
    return { ok: false, error: "Log ID is required" };
  }
  if (!patchData || Object.keys(patchData).length === 0) {
    return { ok: false, error: "No patch fields provided" };
  }

  try {
    const docRef = doc(db, "agent_logs", logId);
    const patchObject = {
      ...patchData,
      updated_at: Date.now(),
    };
    await updateDoc(docRef, patchObject);
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to update agent log" };
  }
}

/**
 * Fetches all log records recorded during the pipeline run for an issue.
 */
export async function listAgentLogsForIssue(issueId) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", data: [] };
  }
  if (!issueId) {
    return { ok: false, error: "Issue ID is required", data: [] };
  }

  try {
    const q = query(
      collection(db, "agent_logs"),
      where("issue_id", "==", issueId),
      orderBy("started_at", "asc")
    );
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      ok: true,
      error: null,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to list agent logs",
      data: [],
    };
  }
}

/**
 * Upserts a single user's leaderboard record in Firestore.
 */
export async function upsertLeaderboardEntry(entryData) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable" };
  }
  if (!entryData || !entryData.user_id) {
    return { ok: false, error: "user_id is required" };
  }

  try {
    const docRef = doc(db, "leaderboard", entryData.user_id);
    const mergedDoc = {
      user_id: entryData.user_id,
      name: entryData.name || "Anonymous",
      issues_reported: entryData.issues_reported ?? 0,
      issues_resolved: entryData.issues_resolved ?? 0,
      impact_score: entryData.impact_score ?? 0,
      updated_at: Date.now(),
    };

    await setDoc(docRef, mergedDoc, { merge: true });
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to upsert leaderboard entry" };
  }
}

/**
 * Fetch top leaderboard entries ordered by impact_score.
 */
export async function getLeaderboardTop(limitCount = 10) {
  if (!isConfigured || !db) {
    return { ok: false, error: "Firestore unavailable", data: [] };
  }

  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("impact_score", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      ok: true,
      error: null,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to fetch top leaderboard",
      data: [],
    };
  }
}

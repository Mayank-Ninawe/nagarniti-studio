import { db, isConfigured } from "../lib/firebase";
import { DEMO_ISSUES, DEMO_SEED_COLLECTION_ID } from "./demoSeedData";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function seedDemoIssues() {
  if (!isConfigured || !db) {
    return {
      ok: false,
      seeded: 0,
      skipped: 0,
      failed: DEMO_ISSUES.length,
      details: DEMO_ISSUES.map(issue => ({
        id: issue._demo_id,
        action: "failed",
        error: "Firestore is not configured or unavailable"
      }))
    };
  }

  let seeded = 0;
  let skipped = 0;
  let failed = 0;
  const details = [];

  try {
    for (const issue of DEMO_ISSUES) {
      const docId = issue._demo_id;
      // eslint-disable-next-line no-unused-vars
      const { _demo_id, ...issueData } = issue;

      try {
        const docRef = doc(db, DEMO_SEED_COLLECTION_ID, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          skipped++;
          details.push({ id: docId, action: "skipped" });
          if (import.meta.env.DEV) {
            console.log(`[DemoSeeder] Skipped issue: ${docId} (already exists)`);
          }
        } else {
          await setDoc(docRef, {
            ...issueData,
            created_at: Date.now() - (Date.now() - issueData.created_at) // relative to now
          });
          seeded++;
          details.push({ id: docId, action: "seeded" });
          if (import.meta.env.DEV) {
            console.log(`[DemoSeeder] Seeded issue: ${docId}`);
          }
        }
      } catch (err) {
        failed++;
        details.push({ id: docId, action: "failed", error: err.message });
        if (import.meta.env.DEV) {
          console.error(`[DemoSeeder] Failed to seed issue: ${docId}`, err);
        }
      }
    }

    return {
      ok: failed === 0,
      seeded,
      skipped,
      failed,
      details
    };
  } catch (error) {
    return {
      ok: false,
      seeded,
      skipped,
      failed: DEMO_ISSUES.length,
      details: DEMO_ISSUES.map(issue => ({
        id: issue._demo_id,
        action: "failed",
        error: error.message
      }))
    };
  }
}

export async function getDemoSeedStatus() {
  if (!isConfigured || !db) {
    return {
      total: DEMO_ISSUES.length,
      present: 0,
      missing: DEMO_ISSUES.length,
      details: DEMO_ISSUES.map(issue => ({ id: issue._demo_id, exists: false }))
    };
  }

  try {
    let present = 0;
    let missing = 0;
    const details = [];

    for (const issue of DEMO_ISSUES) {
      const docId = issue._demo_id;
      try {
        const docRef = doc(db, DEMO_SEED_COLLECTION_ID, docId);
        const docSnap = await getDoc(docRef);
        const exists = docSnap.exists();
        if (exists) {
          present++;
        } else {
          missing++;
        }
        details.push({ id: docId, exists });
      } catch (err) {
        missing++;
        details.push({ id: docId, exists: false });
      }
    }

    return {
      total: DEMO_ISSUES.length,
      present,
      missing,
      details
    };
  } catch (error) {
    return {
      total: DEMO_ISSUES.length,
      present: 0,
      missing: DEMO_ISSUES.length,
      details: DEMO_ISSUES.map(issue => ({ id: issue._demo_id, exists: false }))
    };
  }
}

import { listRecentIssues, updateIssueDocument } from "../services/firestoreService";

let workerIntervalId = null;
let isRunning = false;
let lastRunAt = null;
let runCount = 0;
const lastEscalatedIds = [];
let visibilityListenerAttached = false;

const ESCALATION_CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds

async function runEscalationCheck() {
  try {
    const res = await listRecentIssues({ maxResults: 50, status: "validated" });
    if (!res.ok) {
      if (import.meta.env.DEV) {
        console.warn("[EscalationWorker] Failed to fetch issues:", res.error);
      }
      return;
    }
    const now = Date.now();
    const dueIssues = (res.data || []).filter((issue) => {
      return (
        issue.escalate_after &&
        issue.escalate_after <= now &&
        issue.status === "validated"
      );
    });

    for (const issue of dueIssues) {
      const updateRes = await updateIssueDocument(issue.id, {
        status: "escalated",
        escalated_at: now
      });
      if (updateRes.ok) {
        if (!lastEscalatedIds.includes(issue.id)) {
          lastEscalatedIds.push(issue.id);
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn(`[EscalationWorker] Failed to escalate ${issue.id}:`, updateRes.error);
        }
      }
    }

    lastRunAt = now;
    runCount++;

    if (import.meta.env.DEV) {
      console.log(`[EscalationWorker] Checked at ${new Date(now).toLocaleTimeString()}, due: ${dueIssues.length}`);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[EscalationWorker] Error in runEscalationCheck:", error);
    }
  }
}

export async function startEscalationWorker() {
  if (isRunning) return;

  isRunning = true;

  if (typeof document !== "undefined" && !visibilityListenerAttached) {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopEscalationWorker();
      } else {
        startEscalationWorker();
      }
    });
    visibilityListenerAttached = true;
  }

  await runEscalationCheck();

  if (!isRunning) return;

  workerIntervalId = setInterval(runEscalationCheck, ESCALATION_CHECK_INTERVAL_MS);
}

export function stopEscalationWorker() {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
  }
  isRunning = false;
}

export function getWorkerStatus() {
  return {
    isRunning,
    lastRunAt,
    runCount,
    lastEscalatedIds: [...lastEscalatedIds],
    intervalMs: ESCALATION_CHECK_INTERVAL_MS
  };
}

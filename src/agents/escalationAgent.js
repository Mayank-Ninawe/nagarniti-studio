import { callGeminiJson } from "../lib/gemini";
import { parseAgentOutput, shouldRetry, getErrorMessage } from "../lib/parser";

/**
 * Decides escalation path and timing for unresolved issues.
 * 
 * @param {Object} payload
 * @param {Object} payload.issue
 * @param {number} [payload.now]
 */
export async function runEscalationAgent(payload) {
  if (!payload || !payload.issue || typeof payload.issue.created_at !== "number") {
    return {
      ok: false,
      agent: "escalation",
      raw: null,
      parsed: null,
      error: "Invalid payload: issue.created_at is required and must be a number.",
      retryable: false,
    };
  }

  const nowMs = payload.now || Date.now();
  const diffTime = Math.max(0, nowMs - payload.issue.created_at);
  const daysSinceReport = Math.round((diffTime / (1000 * 60 * 60 * 24)) * 10) / 10;

  try {
    const systemInstruction = "You are an Escalation Management Agent. Your job is to check unresolved or lagging civic complaints and decide if they require escalation to a higher tier of administration (Ward Officer -> Municipal Joint Commissioner -> District Collector -> State Urban Department) and specify the precise Unix epoch time in milliseconds when the next escalation threshold will trigger if left unresolved.";
    const taskInstruction = `Determine whether an unresolved civic issue should be escalated now or later. Choose an appropriate escalation level and next authority for an Indian municipal workflow. Be practical and conservative.
    
    Decision Guidance:
    - critical issues can escalate faster.
    - high urgency unresolved issues should move to municipal level sooner.
    - lower urgency issues may stay at ward level longer.
    - do not escalate to district or state unless fully justified by long neglect or heavy severity.
    - if status is already 'resolved', then should_escalate MUST be false.
    - escalate_after_timestamp should be a valid Unix epoch millisecond timestamp representing when the next escalation level activates (e.g., now + 24 to 72 hours in ms). Ensure it is in milliseconds (usually a 13-digit number).`;

    const inputData = {
      issue: {
        created_at: payload.issue.created_at,
        issue_type: payload.issue.issue_type,
        description: payload.issue.description,
        urgency_label: payload.issue.urgency_label || "medium",
        urgency_score: payload.issue.urgency_score || 5,
        status: payload.issue.status || "pending",
      },
      now: nowMs,
      computed_days_since_report: daysSinceReport,
    };

    const schemaHint = `{
  "should_escalate": "boolean",
  "escalation_level": "ward | municipal | district | state",
  "escalation_reason": "string, 10-400 chars",
  "next_authority": "string, 3-200 chars",
  "escalate_after_timestamp": "unix timestamp in milliseconds",
  "days_since_report": "number >= 0"
}`;

    const raw = await callGeminiJson({
      systemInstruction,
      taskInstruction,
      inputData,
      schemaHint,
    });

    const parseResult = parseAgentOutput("escalation", raw);

    if (parseResult.success) {
      return {
        ok: true,
        agent: "escalation",
        raw,
        parsed: parseResult.data,
        error: null,
        retryable: false,
      };
    } else {
      return {
        ok: false,
        agent: "escalation",
        raw,
        parsed: null,
        error: parseResult.error,
        retryable: false,
      };
    }
  } catch (error) {
    return {
      ok: false,
      agent: "escalation",
      raw: null,
      parsed: null,
      error: getErrorMessage(error),
      retryable: shouldRetry(error),
    };
  }
}

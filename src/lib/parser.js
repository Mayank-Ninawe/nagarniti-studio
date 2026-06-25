import {
  VisionAgentSchema,
  ValidationAgentSchema,
  UrgencyAgentSchema,
  DraftAgentSchema,
  EscalationAgentSchema,
  IssueDocumentSchema,
} from "../types/schemas";

const SCHEMA_MAP = {
  vision:     VisionAgentSchema,
  validation: ValidationAgentSchema,
  urgency:    UrgencyAgentSchema,
  draft:      DraftAgentSchema,
  escalation: EscalationAgentSchema,
};

/**
 * Parses and validates a raw Gemini response string for a given agent.
 * Returns { success: true, data } or { success: false, error, raw }
 * 
 * ALWAYS store the raw string alongside the parsed output (plan requirement).
 */
export function parseAgentOutput(agentName, rawString) {
  const schema = SCHEMA_MAP[agentName];
  if (!schema) {
    return {
      success: false,
      error: `Unknown agent: ${agentName}`,
      raw: rawString,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawString);
  } catch (jsonError) {
    return {
      success: false,
      error: `JSON parse failed: ${jsonError.message}`,
      raw: rawString,
    };
  }

  const result = schema.safeParse(parsed);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map(e => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return {
      success: false,
      error: `Schema validation failed: ${errorMessages}`,
      raw: rawString,
      partialData: parsed, // keep partial data for debugging
    };
  }

  return {
    success: true,
    data: result.data,
    raw: rawString,
  };
}

/**
 * Validates an Issue document before writing to Firestore.
 */
export function validateIssueDocument(issueData) {
  const result = IssueDocumentSchema.safeParse(issueData);
  if (!result.success) {
    console.error("Issue document validation failed:", result.error.errors);
    return { valid: false, errors: result.error.errors };
  }
  return { valid: true, data: result.data };
}

/**
 * Maps Gemini error codes to user-friendly retry decisions.
 */
export function shouldRetry(error) {
  if (!error) return false;
  const status = error?.status || error?.code;
  // Retry on rate limit (429) and server errors (5xx)
  return status === 429 || status === 500 || status === 503;
}

/**
 * Extracts a clean error message for logging.
 */
export function getErrorMessage(error) {
  if (typeof error === "string") return error;
  return error?.message || error?.error?.message || "Unknown error";
}

/*
MANUAL TEST CASES — paste into browser console to verify:

Test 1 — Valid Vision output:
parseAgentOutput("vision", JSON.stringify({
  issue_type: "pothole",
  severity: "high",
  description: "Large pothole on main road causing traffic disruption",
  confidence_score: 0.92,
  detected_objects: ["road", "vehicle", "crack"],
  requires_immediate_attention: true
}))
Expected: { success: true, data: { issue_type: "pothole", ... } }

Test 2 — Invalid Vision output (missing required field):
parseAgentOutput("vision", JSON.stringify({
  issue_type: "pothole",
  severity: "high"
}))
Expected: { success: false, error: "Schema validation failed: description: Required; ..." }

Test 3 — Malformed JSON:
parseAgentOutput("vision", "{ broken json")
Expected: { success: false, error: "JSON parse failed: ..." }

Test 4 — Valid Urgency output:
parseAgentOutput("urgency", JSON.stringify({
  urgency_score: 8,
  urgency_label: "high",
  factors: { severity_weight: 0.8, weather_impact: 0.6, time_sensitivity: 0.7, community_impact: 0.5 },
  reasoning: "High severity pothole during monsoon season with active traffic flow.",
  escalate_after_hours: 24
}))
Expected: { success: true, data: { urgency_score: 8, ... } }

Test 5 — Unknown agent name:
parseAgentOutput("unknown_agent", "{}")
Expected: { success: false, error: "Unknown agent: unknown_agent" }
*/

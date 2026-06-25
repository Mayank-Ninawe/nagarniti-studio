import { callGeminiJson } from "../lib/gemini";
import { parseAgentOutput, shouldRetry, getErrorMessage } from "../lib/parser";

/**
 * Checks whether a newly reported issue is a likely duplicate of an existing unresolved nearby issue.
 * 
 * @param {Object} payload
 * @param {Object} payload.newIssue
 * @param {Array} payload.nearbyIssues
 */
export async function runValidationAgent(payload) {
  if (!payload || !payload.newIssue) {
    return {
      ok: false,
      agent: "validation",
      raw: null,
      parsed: null,
      error: "Invalid payload: newIssue is required.",
      retryable: false,
    };
  }

  const nearbyIssues = payload.nearbyIssues || [];

  if (nearbyIssues.length === 0) {
    const parsed = {
      is_duplicate: false,
      duplicate_issue_id: null,
      similarity_score: 0.0,
      validation_status: "valid",
      validation_notes: "No nearby candidate issues found.",
    };
    return {
      ok: true,
      agent: "validation",
      raw: JSON.stringify(parsed),
      parsed,
      error: null,
      retryable: false,
    };
  }

  try {
    const systemInstruction = "You are a Verification and Duplicate Detection Agent specializing in civic complaints. Your goal is to review details and locations of reported issues and match new complaints against nearby existing unresolved cases to keep the database de-duplicated.";
    const taskInstruction = "Compare the new civic issue against nearby candidate issues. Determine whether the new issue is a likely duplicate. Use conservative judgment. If evidence is weak, return is_duplicate=false and validation_status='valid'.";
    
    const inputData = {
      newIssue: payload.newIssue,
      nearbyIssues,
    };

    const schemaHint = `{
  "is_duplicate": "boolean",
  "duplicate_issue_id": "string or null",
  "similarity_score": "number between 0 and 1",
  "validation_status": "valid | duplicate | insufficient_data",
  "validation_notes": "string up to 300 chars"
}`;

    const raw = await callGeminiJson({
      systemInstruction,
      taskInstruction,
      inputData,
      schemaHint,
    });

    const parseResult = parseAgentOutput("validation", raw);

    if (parseResult.success) {
      return {
        ok: true,
        agent: "validation",
        raw,
        parsed: parseResult.data,
        error: null,
        retryable: false,
      };
    } else {
      return {
        ok: false,
        agent: "validation",
        raw,
        parsed: null,
        error: parseResult.error,
        retryable: false,
      };
    }
  } catch (error) {
    return {
      ok: false,
      agent: "validation",
      raw: null,
      parsed: null,
      error: getErrorMessage(error),
      retryable: shouldRetry(error),
    };
  }
}

import { callGeminiJson } from "../lib/gemini";
import { parseAgentOutput, shouldRetry, getErrorMessage } from "../lib/parser";

/**
 * Scores the urgency and escalation delay of a civic issue.
 * 
 * @param {Object} payload
 * @param {Object} payload.issue
 * @param {Object} [payload.weatherContext]
 * @param {Object} [payload.communityContext]
 */
export async function runUrgencyAgent(payload) {
  if (!payload || !payload.issue) {
    return {
      ok: false,
      agent: "urgency",
      raw: null,
      parsed: null,
      error: "Invalid payload: issue is required.",
      retryable: false,
    };
  }

  const weatherContext = payload.weatherContext || {
    condition: "unknown",
    rainfall_mm: 0,
    alert: "none",
    temperature_c: 0,
  };

  const communityContext = payload.communityContext || {
    upvote_count: 0,
    affected_reports: 0,
  };

  try {
    const systemInstruction = "You are an Urgency Scoring Agent. Your goal is to evaluate reported civic issues based on their class, severity, local weather context, and community metrics, and determine an urgency level from 1 to 10 along with a custom time window before the issue is automatically escalated.";
    const taskInstruction = "Score civic issue urgency for a municipal escalation workflow. Use conservative but practical judgment. Output realistic urgency and escalation timing. Urgency labels must align with score: 1-3 = low, 4-6 = medium, 7-8 = high, 9-10 = critical. Escalate after hours must range between 6-12h for critical, 12-24h for high, 24-72h for medium, and 72-168h for low.";
    
    const inputData = {
      issue: payload.issue,
      weatherContext,
      communityContext,
    };

    const schemaHint = `{
  "urgency_score": "number between 1 and 10",
  "urgency_label": "low | medium | high | critical",
  "factors": {
    "severity_weight": "number between 0 and 1",
    "weather_impact": "number between 0 and 1",
    "time_sensitivity": "number between 0 and 1",
    "community_impact": "number between 0 and 1"
  },
  "reasoning": "string, 10-600 chars",
  "escalate_after_hours": "number between 1 and 168"
}`;

    const raw = await callGeminiJson({
      systemInstruction,
      taskInstruction,
      inputData,
      schemaHint,
    });

    const parseResult = parseAgentOutput("urgency", raw);

    if (parseResult.success) {
      return {
        ok: true,
        agent: "urgency",
        raw,
        parsed: parseResult.data,
        error: null,
        retryable: false,
      };
    } else {
      return {
        ok: false,
        agent: "urgency",
        raw,
        parsed: null,
        error: parseResult.error,
        retryable: false,
      };
    }
  } catch (error) {
    return {
      ok: false,
      agent: "urgency",
      raw: null,
      parsed: null,
      error: getErrorMessage(error),
      retryable: shouldRetry(error),
    };
  }
}

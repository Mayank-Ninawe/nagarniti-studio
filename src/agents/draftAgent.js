import { callGeminiJson } from "../lib/gemini";
import { parseAgentOutput, shouldRetry, getErrorMessage } from "../lib/parser";

/**
 * Generates a formal complaint letter addressed to the relevant local authority.
 * 
 * @param {Object} payload
 * @param {Object} payload.issue
 * @param {Object} [payload.reporter]
 */
export async function runDraftAgent(payload) {
  if (!payload || !payload.issue) {
    return {
      ok: false,
      agent: "draft",
      raw: null,
      parsed: null,
      error: "Invalid payload: issue is required.",
      retryable: false,
    };
  }

  const reporterName = payload.reporter?.name || "Concerned Citizen";
  const address = payload.issue.address || "";
  const city = payload.issue.city || "";

  try {
    const systemInstruction = "You are a Complaint Drafting Agent. Your task is to draft a perfectly structured, professional, and formal civic complaint letter addressed to appropriate municipal departments in India (like MCGM, PMC, BBMP, or general Ward Offices) given the details of a reported issue.";
    const taskInstruction = `Write a formal civic complaint letter suitable for submission to the relevant municipal authority in India. Keep it professional, specific, and concise. Do not use markdown format inside the complaint_letter string (e.g. no asterisks, no double-hashes). The letter is reported by "${reporterName}". Location is: "${address}, ${city}" if provided.
    
    Ensure:
    - addressed_to looks like an official department title or head of department (e.g. "The Ward Officer", "The Assistant Municipal Commissioner"), NOT a personal name.
    - subject_line is concise and references the problem.
    - recommended_department is exactly one matching municipal branch.
    - complaint_letter explains the issue clearly, details public risk or inconvenience, is polite but firm, and asks for prompt remediation.`;

    const inputData = {
      issue: {
        issue_type: payload.issue.issue_type,
        description: payload.issue.description,
        address,
        city,
        urgency_label: payload.issue.urgency_label || "medium"
      },
      reporter: {
        name: reporterName
      }
    };

    const schemaHint = `{
  "complaint_letter": "string, 100-2000 chars, free of markdown styling",
  "addressed_to": "string, 3-200 chars",
  "subject_line": "string, 5-150 chars",
  "recommended_department": "string, 3-100 chars",
  "reference_number_placeholder": "string"
}`;

    const raw = await callGeminiJson({
      systemInstruction,
      taskInstruction,
      inputData,
      schemaHint,
    });

    const parseResult = parseAgentOutput("draft", raw);

    if (parseResult.success) {
      return {
        ok: true,
        agent: "draft",
        raw,
        parsed: parseResult.data,
        error: null,
        retryable: false,
      };
    } else {
      return {
        ok: false,
        agent: "draft",
        raw,
        parsed: null,
        error: parseResult.error,
        retryable: false,
      };
    }
  } catch (error) {
    return {
      ok: false,
      agent: "draft",
      raw: null,
      parsed: null,
      error: getErrorMessage(error),
      retryable: shouldRetry(error),
    };
  }
}

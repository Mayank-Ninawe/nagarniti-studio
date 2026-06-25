import { geminiModel, createJsonPrompt } from "../lib/gemini";
import { parseAgentOutput, shouldRetry, getErrorMessage } from "../lib/parser";

/**
 * Analyzes the uploaded photo and classifies the civic issue.
 * 
 * @param {Object} payload
 * @param {string} payload.imageBase64 - Base64 string of the image (without data:image/... prefix normally, but inlineData takes it directly)
 * @param {string} payload.mimeType - Mime type of the image, e.g. "image/jpeg"
 * @param {string} [payload.userDescription] - User provided description
 * @param {string} [payload.locationHint] - User provided location hint
 */
export async function runVisionAgent(payload) {
  if (!payload || !payload.imageBase64 || !payload.mimeType) {
    return {
      ok: false,
      agent: "vision",
      raw: null,
      parsed: null,
      error: "Invalid payload: imageBase64 and mimeType are required.",
      retryable: false,
    };
  }

  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY environment variable is required but missing.");
    }

    const systemInstruction = "You are an AI Vision Agent specializing in Indian hyperlocal civic issues. Your job is to analyze the uploaded image of a civic issue and perform high-precision classification.";
    const taskInstruction = "Analyze the provided image along with any optional user description or location hints. Identify the issue type, determine the severity level, extract detected object names, write a concise description, and decide if immediate attention is required.";
    const inputData = {
      userDescription: payload.userDescription || "",
      locationHint: payload.locationHint || "",
    };
    const schemaHint = `{
  "issue_type": "pothole | garbage_overflow | broken_streetlight | waterlogging | open_drain | road_damage | illegal_dumping | damaged_footpath | other",
  "severity": "low | medium | high | critical",
  "description": "string, 10-500 chars",
  "confidence_score": "number between 0 and 1",
  "detected_objects": ["string"],
  "requires_immediate_attention": "boolean"
}`;

    const prompt = createJsonPrompt({
      systemInstruction,
      taskInstruction,
      inputData,
      schemaHint,
    });

    const result = await geminiModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: payload.mimeType,
                data: payload.imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const raw = result.response.text();
    const parseResult = parseAgentOutput("vision", raw);

    if (parseResult.success) {
      return {
        ok: true,
        agent: "vision",
        raw,
        parsed: parseResult.data,
        error: null,
        retryable: false,
      };
    } else {
      return {
        ok: false,
        agent: "vision",
        raw,
        parsed: null,
        error: parseResult.error,
        retryable: false,
      };
    }
  } catch (error) {
    return {
      ok: false,
      agent: "vision",
      raw: null,
      parsed: null,
      error: getErrorMessage(error),
      retryable: shouldRetry(error),
    };
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Missing VITE_GEMINI_API_KEY. Gemini calls will fail until .env is configured.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "MISSING_KEY");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export function createJsonPrompt({ systemInstruction, taskInstruction, inputData, schemaHint }) {
  return `You are a JSON-only civic intelligence agent.
Return ONLY valid JSON.
Do not wrap JSON in markdown.
Do not include explanations, notes, headings, or backticks.
If a field is unknown, still return the required field with the safest valid fallback.

SYSTEM ROLE:
${systemInstruction}

TASK:
${taskInstruction}

INPUT:
${JSON.stringify(inputData, null, 2)}

REQUIRED JSON SHAPE:
${schemaHint}`;
}

export async function callGeminiJson({ systemInstruction, taskInstruction, inputData, schemaHint }) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is required but missing.");
  }

  const prompt = createJsonPrompt({ systemInstruction, taskInstruction, inputData, schemaHint });

  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const rawText = result.response.text();
  return rawText;
}

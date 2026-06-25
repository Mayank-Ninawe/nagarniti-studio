import { runVisionAgent } from "./visionAgent";
import { runValidationAgent } from "./validationAgent";
import { runUrgencyAgent } from "./urgencyAgent";
import { runDraftAgent } from "./draftAgent";
import { runEscalationAgent } from "./escalationAgent";

/**
 * Simple async delay helper.
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns the standardized initial pipeline state object.
 */
export function buildInitialPipelineState() {
  return {
    startedAt: Date.now(),
    completedAt: null,
    success: false,
    currentStage: "queued",
    finalError: null,
    issueDraft: {
      vision: null,
      validation: null,
      urgency: null,
      draft: null,
      escalation: null,
    },
    raw: {
      vision: null,
      validation: null,
      urgency: null,
      draft: null,
      escalation: null,
    },
    statuses: {
      vision: {
        status: "queued",
        attempts: 0,
        startedAt: null,
        completedAt: null,
        durationMs: null,
        error: null,
      },
      validation: {
        status: "queued",
        attempts: 0,
        startedAt: null,
        completedAt: null,
        durationMs: null,
        error: null,
      },
      urgency: {
        status: "queued",
        attempts: 0,
        startedAt: null,
        completedAt: null,
        durationMs: null,
        error: null,
      },
      draft: {
        status: "queued",
        attempts: 0,
        startedAt: null,
        completedAt: null,
        durationMs: null,
        error: null,
      },
      escalation: {
        status: "queued",
        attempts: 0,
        startedAt: null,
        completedAt: null,
        durationMs: null,
        error: null,
      },
    },
    trace: []
  };
}

/**
 * Runs a single agent function with up to 2 retries and backoff delays of 2000ms / 5000ms.
 */
export async function runAgentWithRetry({ agentName, agentFn, payload, minDelayBeforeStart, onRetry }) {
  if (minDelayBeforeStart && minDelayBeforeStart > 0) {
    await sleep(minDelayBeforeStart);
  }

  const retryDelays = [2000, 5000];
  let attempts = 0;

  for (let attempt = 1; attempt <= 3; attempt++) {
    attempts = attempt;
    try {
      const result = await agentFn(payload);
      if (result.ok) {
        return {
          ok: true,
          agent: agentName,
          attempts,
          raw: result.raw,
          parsed: result.parsed,
          error: null,
          retryable: false,
        };
      }

      // If it returned an error, check if retryable (either result.retryable is true, or we check)
      if (!result.retryable || attempt === 3) {
        return {
          ok: false,
          agent: agentName,
          attempts,
          raw: result.raw,
          parsed: null,
          error: result.error,
          retryable: result.retryable || false,
        };
      }

      // We should retry
      const delay = retryDelays[attempt - 1];
      if (onRetry) {
        onRetry(delay, result.error);
      }
      await sleep(delay);

    } catch (err) {
      const errMsg = err?.message || "Unknown execution error";
      const isRetryable = err?.status === 429 || err?.code === 429 || err?.status >= 500;
      
      if (!isRetryable || attempt === 3) {
        return {
          ok: false,
          agent: agentName,
          attempts,
          raw: null,
          parsed: null,
          error: errMsg,
          retryable: isRetryable,
        };
      }

      // Retry
      const delay = retryDelays[attempt - 1];
      if (onRetry) {
        onRetry(delay, errMsg);
      }
      await sleep(delay);
    }
  }

  return {
    ok: false,
    agent: agentName,
    attempts,
    raw: null,
    parsed: null,
    error: "Max retry limit reached.",
    retryable: false,
  };
}

/**
 * The core orchestration pipeline for NagarNiti.
 * Executes: vision -> validation -> urgency -> draft -> escalation,
 * forcing a 4.5-second minimum spacing between agent starts.
 */
export async function runNagarNitiPipeline(input, onProgress) {
  const state = buildInitialPipelineState();

  const reportProgress = () => {
    if (onProgress) {
      try {
        onProgress(JSON.parse(JSON.stringify(state)));
      } catch (e) {
        // Safe deep copy copy-on-write
      }
    }
  };

  const pushTrace = (stage, message) => {
    state.trace.push({
      timestamp: Date.now(),
      stage,
      message,
    });
  };

  // Validate Input
  if (!input || !input.report || !input.report.imageBase64 || !input.report.mimeType) {
    state.currentStage = "failed";
    state.finalError = "Invalid input: report.imageBase64 and report.mimeType are required.";
    state.completedAt = Date.now();
    state.success = false;
    pushTrace("system", state.finalError);
    reportProgress();
    return state;
  }

  const { report } = input;

  // Define our 5 stages
  const STAGES = [
    {
      name: "vision",
      fn: runVisionAgent,
      getPayload: () => ({
        imageBase64: report.imageBase64,
        mimeType: report.mimeType,
        userDescription: report.userDescription || "",
        locationHint: report.locationHint || report.address || report.city || ""
      }),
      delayBefore: 0,
    },
    {
      name: "validation",
      fn: runValidationAgent,
      getPayload: () => ({
        newIssue: {
          issue_type: state.issueDraft.vision?.issue_type,
          description: state.issueDraft.vision?.description,
          lat: report.lat ?? 0,
          lng: report.lng ?? 0,
          geohash: report.geohash || "",
          created_at: report.created_at || Date.now(),
        },
        nearbyIssues: input.nearbyIssues || [],
      }),
      delayBefore: 4500,
    },
    {
      name: "urgency",
      fn: runUrgencyAgent,
      getPayload: () => ({
        issue: {
          issue_type: state.issueDraft.vision?.issue_type,
          severity: state.issueDraft.vision?.severity,
          description: state.issueDraft.vision?.description,
          created_at: report.created_at || Date.now(),
        },
        weatherContext: input.weatherContext || undefined,
        communityContext: input.communityContext || undefined,
      }),
      delayBefore: 4500,
    },
    {
      name: "draft",
      fn: runDraftAgent,
      getPayload: () => ({
        issue: {
          issue_type: state.issueDraft.vision?.issue_type,
          description: state.issueDraft.vision?.description,
          address: report.address || "",
          city: report.city || "",
          urgency_label: state.issueDraft.urgency?.urgency_label,
        },
        reporter: {
          name: input.reporter?.name || "Concerned Citizen",
        },
      }),
      delayBefore: 4500,
    },
    {
      name: "escalation",
      fn: runEscalationAgent,
      getPayload: () => ({
        issue: {
          created_at: report.created_at || Date.now(),
          issue_type: state.issueDraft.vision?.issue_type,
          description: state.issueDraft.vision?.description,
          urgency_label: state.issueDraft.urgency?.urgency_label,
          urgency_score: state.issueDraft.urgency?.urgency_score,
          status: state.issueDraft.validation?.is_duplicate ? "pending" : "validated",
        },
        now: Date.now(),
      }),
      delayBefore: 4500,
    },
  ];

  pushTrace("system", "Pipeline started.");
  reportProgress();

  for (const stage of STAGES) {
    const stageName = stage.name;
    
    // Set stage status to running
    state.currentStage = stageName;
    state.statuses[stageName].status = "running";
    state.statuses[stageName].startedAt = Date.now();
    pushTrace(stageName, `${stageName} started`);
    reportProgress();

    // Prepare payload dynamically after previous stages might have populated state
    let payload;
    try {
      payload = stage.getPayload();
    } catch (payloadError) {
      const errMessage = `Payload generation failed: ${payloadError.message}`;
      state.currentStage = "failed";
      state.finalError = errMessage;
      state.completedAt = Date.now();
      state.statuses[stageName].status = "failed";
      state.statuses[stageName].error = errMessage;
      pushTrace(stageName, `${stageName} failed to build payload: ${errMessage}`);
      reportProgress();
      return state;
    }

    // Attempt the step with retries
    const onRetry = (delay, errText) => {
      pushTrace(stageName, `${stageName} retrying after ${delay}msdue to error: ${errText}`);
      reportProgress();
    };

    const result = await runAgentWithRetry({
      agentName: stageName,
      agentFn: stage.fn,
      payload,
      minDelayBeforeStart: stage.delayBefore,
      onRetry,
    });

    // Record details
    state.statuses[stageName].attempts = result.attempts;
    state.raw[stageName] = result.raw;
    const completedAt = Date.now();
    state.statuses[stageName].completedAt = completedAt;
    state.statuses[stageName].durationMs = completedAt - state.statuses[stageName].startedAt;

    if (result.ok) {
      state.statuses[stageName].status = "success";
      state.issueDraft[stageName] = result.parsed;
      state.statuses[stageName].error = null;
      pushTrace(stageName, `${stageName} completed successfully`);
      reportProgress();
    } else {
      state.statuses[stageName].status = "failed";
      state.statuses[stageName].error = result.error;
      pushTrace(stageName, `${stageName} failed: ${result.error}`);
      
      // Fail-fast logic
      state.currentStage = "failed";
      state.success = false;
      state.finalError = `${stageName} agent failed: ${result.error}`;
      state.completedAt = Date.now();
      reportProgress();
      return state;
    }
  }

  // All 5 stages succeeded
  state.success = true;
  state.currentStage = "completed";
  state.completedAt = Date.now();
  pushTrace("system", "pipeline completed successfully");
  reportProgress();
  return state;
}

/**
 * Returns a concise summary object of the pipeline's execution state.
 */
export function summarizePipelineForConsole(state) {
  const completedStages = [];
  const failedStages = [];

  Object.entries(state.statuses).forEach(([name, def]) => {
    if (def.status === "success") {
      completedStages.push(name);
    } else if (def.status === "failed") {
      failedStages.push(name);
    }
  });

  return {
    success: state.success,
    currentStage: state.currentStage,
    finalError: state.finalError,
    completedStages,
    failedStages,
    attempts: {
      vision: state.statuses.vision.attempts,
      validation: state.statuses.validation.attempts,
      urgency: state.statuses.urgency.attempts,
      draft: state.statuses.draft.attempts,
      escalation: state.statuses.escalation.attempts,
    },
  };
}

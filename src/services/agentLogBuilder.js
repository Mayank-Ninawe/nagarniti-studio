/**
 * Convers pipeline state statuses and parsed/raw outputs into standardized Firestore Agent Log objects.
 */
export function buildAgentLogsFromPipeline({ issueId, pipelineState }) {
  if (!issueId) {
    throw new Error("issueId is required for buildAgentLogsFromPipeline");
  }
  if (!pipelineState || !pipelineState.statuses) {
    throw new Error("pipelineState.statuses is required for buildAgentLogsFromPipeline");
  }

  const agents = ["vision", "validation", "urgency", "draft", "escalation"];

  return agents.map(agentName => {
    const statusInfo = pipelineState.statuses[agentName] || {};
    
    // Status normalization
    let normalizedStatus = "failed";
    if (statusInfo.status === "queued" || statusInfo.status === "running" || statusInfo.status === "success" || statusInfo.status === "failed" || statusInfo.status === "retrying") {
      normalizedStatus = statusInfo.status;
    }

    return {
      issue_id: issueId,
      agent_name: agentName,
      status: normalizedStatus,
      started_at: statusInfo.startedAt || Date.now(),
      completed_at: statusInfo.completedAt || null,
      duration_ms: statusInfo.durationMs || null,
      input_summary: null,
      parsed_output: pipelineState.issueDraft?.[agentName] || null,
      raw_output: pipelineState.raw?.[agentName] || null,
      error_message: statusInfo.error || null,
      retry_count: Math.max(0, (statusInfo.attempts || 1) - 1),
    };
  });
}

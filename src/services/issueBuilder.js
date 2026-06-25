/**
 * Assembles a structured and valid Issue document from the output of the NagarNiti sequential pipeline.
 */
export function buildIssueDocumentFromPipeline(input) {
  if (!input) {
    throw new Error("Input is required for buildIssueDocumentFromPipeline");
  }

  const { reporter, report, pipelineState } = input;

  if (!reporter || !reporter.uid) {
    throw new Error("reporter.uid is required to build an issue document");
  }
  if (!reporter.name) {
    throw new Error("reporter.name is required to build an issue document");
  }

  if (!pipelineState || !pipelineState.issueDraft) {
    throw new Error("pipelineState.issueDraft is required to build an issue document");
  }

  const { vision, validation, urgency, draft, escalation } = pipelineState.issueDraft;

  if (!vision) {
    throw new Error("pipelineState.issueDraft.vision is required to build an issue document");
  }
  if (!validation) {
    throw new Error("pipelineState.issueDraft.validation is required to build an issue document");
  }
  if (!urgency) {
    throw new Error("pipelineState.issueDraft.urgency is required to build an issue document");
  }
  if (!draft) {
    throw new Error("pipelineState.issueDraft.draft is required to build an issue document");
  }
  if (!escalation) {
    throw new Error("pipelineState.issueDraft.escalation is required to build an issue document");
  }

  return {
    reporter_uid: reporter.uid,
    reporter_name: reporter.name,
    photo_url: report?.photo_url ?? null,
    geohash: report?.geohash || "",
    lat: Number(report?.lat) || 0,
    lng: Number(report?.lng) || 0,
    address: report?.address || "",
    city: report?.city || "",
    issue_type: vision.issue_type,
    description: vision.description,
    created_at: report?.created_at || Date.now(),
    status: validation.is_duplicate ? "pending" : "validated",
    urgency_label: urgency.urgency_label,
    urgency_score: urgency.urgency_score,
    escalate_after: escalation.escalate_after_timestamp ?? null,
    upvote_count: 0,

    vision_output: vision,
    validation_output: validation,
    urgency_output: urgency,
    draft_output: draft,
    escalation_output: escalation,

    raw_vision: pipelineState.raw?.vision ?? null,
    raw_validation: pipelineState.raw?.validation ?? null,
    raw_urgency: pipelineState.raw?.urgency ?? null,
    raw_draft: pipelineState.raw?.draft ?? null,
    raw_escalation: pipelineState.raw?.escalation ?? null,
  };
}

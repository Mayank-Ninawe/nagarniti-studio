// Manual development helpers for Firestore issue and agent log persistence. Do not import into production UI.

import { buildIssueDocumentFromPipeline } from "./issueBuilder";
import { createIssueDocument, listRecentIssues, upsertLeaderboardEntry } from "./firestoreService";

/**
 * Creates and returns a mocked pipelineState setup with valid mock data for all 5 agents.
 */
export function testIssueBuilderOnly() {
  const reporter = {
    uid: "demo_user_001",
    name: "Mayank Ninawe",
  };

  const report = {
    photo_url: "https://example.com/pothole.jpg",
    lat: 18.5204,
    lng: 73.8567,
    geohash: "te7ugh",
    address: "FC Road, Shivajinagar",
    city: "Pune",
    created_at: Date.now(),
  };

  const visionDraft = {
    issue_type: "pothole",
    severity: "high",
    description: "Deep pothole right in front of FC Road bus stop, causing extreme traffic slow-down.",
    confidence_score: 0.95,
    detected_objects: ["pothole", "asphalt", "shattered-road"],
    requires_immediate_attention: true,
  };

  const validationDraft = {
    is_duplicate: false,
    duplicate_issue_id: null,
    similarity_score: 0.12,
    validation_status: "valid",
    validation_notes: "No other potholes reported within the immediate 50-meter radius in the last 24 hours.",
  };

  const urgencyDraft = {
    urgency_score: 8,
    urgency_label: "high",
    factors: {
      severity_weight: 0.8,
      weather_impact: 0.7,
      time_sensitivity: 0.8,
      community_impact: 0.9,
    },
    reasoning: "Located on a high-traffic arterial road. Nearby rain forecasts would further widen the pothole.",
    escalate_after_hours: 24,
  };

  const draftOutput = {
    complaint_letter: "To Whom It May Concern,\n\nI am writing to formally report a dangerous pothole on FC Road in Pune, precisely near Shivajinagar. This major road hazard presents an immediate threat to commuter safety and vehicle condition.\n\nPlease mobilize local repair crews under Section 14 to address this post haste.\n\nSincerely,\nMayank Ninawe",
    addressed_to: "Pune Municipal Corporation Ward Officer",
    subject_line: "URGENT PUBLIC HAZARD REPORT: Severe Pothole on FC Road",
    recommended_department: "Road Repairs & Public Works Division",
    reference_number_placeholder: "REF-2026-NITI-01",
  };

  const escalationDraft = {
    should_escalate: true,
    escalation_level: "ward",
    escalation_reason: "This is a high-priority public danger that must be resolved within 24 hours or forwarded to district authority.",
    next_authority: "Assistant Municipal Commissioner, Pune",
    escalate_after_timestamp: Date.now() + 24 * 60 * 60 * 1000,
    days_since_report: 0,
  };

  const pipelineState = {
    statuses: {
      vision: { status: "success", startedAt: Date.now() - 5000, completedAt: Date.now() - 4000, durationMs: 1000, attempts: 1 },
      validation: { status: "success", startedAt: Date.now() - 4000, completedAt: Date.now() - 3000, durationMs: 1000, attempts: 1 },
      urgency: { status: "success", startedAt: Date.now() - 3000, completedAt: Date.now() - 2000, durationMs: 1000, attempts: 1 },
      draft: { status: "success", startedAt: Date.now() - 2000, completedAt: Date.now() - 1000, durationMs: 1000, attempts: 1 },
      escalation: { status: "success", startedAt: Date.now() - 1000, completedAt: Date.now(), durationMs: 1000, attempts: 1 },
    },
    issueDraft: {
      vision: visionDraft,
      validation: validationDraft,
      urgency: urgencyDraft,
      draft: draftOutput,
      escalation: escalationDraft,
    },
    raw: {
      vision: JSON.stringify(visionDraft),
      validation: JSON.stringify(validationDraft),
      urgency: JSON.stringify(urgencyDraft),
      draft: JSON.stringify(draftOutput),
      escalation: JSON.stringify(escalationDraft),
    },
  };

  return buildIssueDocumentFromPipeline({ reporter, report, pipelineState });
}

/**
 * Builds a sample issue and attempts to persist it in Firestore.
 */
export async function testCreateIssueDocument() {
  try {
    const builtDoc = testIssueBuilderOnly();
    const result = await createIssueDocument(builtDoc);
    console.log("testCreateIssueDocument Result:", result);
    return result;
  } catch (err) {
    console.error("testCreateIssueDocument Error:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Retrieves the 5 most recent issues from Firestore.
 */
export async function testGetRecentIssues() {
  try {
    const result = await listRecentIssues({ maxResults: 5 });
    console.log("testGetRecentIssues Result:", result);
    return result;
  } catch (err) {
    console.error("testGetRecentIssues Error:", err);
    return { ok: false, error: err.message, data: [], lastDoc: null };
  }
}

/**
 * Creates/Updates a leaderboard entry for a demo user.
 */
export async function testLeaderboardUpsert() {
  try {
    const entryData = {
      user_id: "demo_user_001",
      name: "Mayank Ninawe",
      issues_reported: 3,
      issues_resolved: 1,
      impact_score: 42,
    };
    const result = await upsertLeaderboardEntry(entryData);
    console.log("testLeaderboardUpsert Result:", result);
    return result;
  } catch (err) {
    console.error("testLeaderboardUpsert Error:", err);
    return { ok: false, error: err.message };
  }
}

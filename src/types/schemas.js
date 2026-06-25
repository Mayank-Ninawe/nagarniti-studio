import { z } from "zod";

// ------- AGENT 1: Vision Agent -------
// Analyzes the uploaded photo and classifies the issue.
export const VisionAgentSchema = z.object({
  issue_type: z.enum([
    "pothole",
    "garbage_overflow",
    "broken_streetlight",
    "waterlogging",
    "open_drain",
    "road_damage",
    "illegal_dumping",
    "damaged_footpath",
    "other"
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10).max(500),
  confidence_score: z.number().min(0).max(1),
  detected_objects: z.array(z.string()).optional().default([]),
  requires_immediate_attention: z.boolean(),
});

// ------- AGENT 2: Validation / Duplicate Agent -------
// Checks whether a near-identical issue already exists.
export const ValidationAgentSchema = z.object({
  is_duplicate: z.boolean(),
  duplicate_issue_id: z.string().nullable().default(null),
  similarity_score: z.number().min(0).max(1),
  validation_status: z.enum(["valid", "duplicate", "insufficient_data"]),
  validation_notes: z.string().max(300).optional().default(""),
});

// ------- AGENT 3: Urgency Scoring Agent -------
// Scores the issue from 1–10 using context signals.
export const UrgencyAgentSchema = z.object({
  urgency_score: z.number().min(1).max(10),
  urgency_label: z.enum(["low", "medium", "high", "critical"]),
  factors: z.object({
    severity_weight: z.number().min(0).max(1),
    weather_impact: z.number().min(0).max(1),
    time_sensitivity: z.number().min(0).max(1),
    community_impact: z.number().min(0).max(1),
  }),
  reasoning: z.string().min(10).max(600),
  escalate_after_hours: z.number().min(1).max(168),
});

// ------- AGENT 4: Complaint Draft Agent -------
// Writes a formal complaint letter to the relevant authority.
export const DraftAgentSchema = z.object({
  complaint_letter: z.string().min(100).max(2000),
  addressed_to: z.string().min(3).max(200),
  subject_line: z.string().min(5).max(150),
  recommended_department: z.string().min(3).max(100),
  reference_number_placeholder: z.string().optional().default("REF-XXXXXX"),
});

// ------- AGENT 5: Escalation Agent -------
// Decides escalation path and timing for unresolved issues.
export const EscalationAgentSchema = z.object({
  should_escalate: z.boolean(),
  escalation_level: z.enum(["ward", "municipal", "district", "state"]),
  escalation_reason: z.string().min(10).max(400),
  next_authority: z.string().min(3).max(200),
  escalate_after_timestamp: z.number(), // Unix timestamp in ms
  days_since_report: z.number().min(0),
});

// ------- ISSUE DOCUMENT (Firestore) -------
// The full structure of an issue stored in Firestore.
export const IssueDocumentSchema = z.object({
  id: z.string().optional(),
  reporter_uid: z.string(),
  reporter_name: z.string(),
  photo_url: z.string().url().nullable().default(null),
  geohash: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().default(""),
  city: z.string().default(""),
  issue_type: z.string(),
  description: z.string(),
  created_at: z.number(), // Unix timestamp ms
  status: z.enum(["pending", "validated", "in_progress", "escalated", "resolved"]),
  urgency_label: z.enum(["low", "medium", "high", "critical"]).optional(),
  urgency_score: z.number().min(1).max(10).optional(),
  escalate_after: z.number().nullable().default(null), // Unix timestamp ms
  upvote_count: z.number().default(0),
  
  // Agent outputs (nullable until that agent runs)
  vision_output: VisionAgentSchema.nullable().default(null),
  validation_output: ValidationAgentSchema.nullable().default(null),
  urgency_output: UrgencyAgentSchema.nullable().default(null),
  draft_output: DraftAgentSchema.nullable().default(null),
  escalation_output: EscalationAgentSchema.nullable().default(null),
  
  // Raw responses for debugging (required by execution plan)
  raw_vision: z.string().nullable().default(null),
  raw_validation: z.string().nullable().default(null),
  raw_urgency: z.string().nullable().default(null),
  raw_draft: z.string().nullable().default(null),
  raw_escalation: z.string().nullable().default(null),
});

// ------- AGENT LOG (Firestore) -------
export const AgentLogSchema = z.object({
  id: z.string().optional(),
  issue_id: z.string(),
  agent_name: z.enum(["vision", "validation", "urgency", "draft", "escalation"]),
  status: z.enum(["queued", "running", "success", "failed", "retrying"]),
  started_at: z.number(),
  completed_at: z.number().nullable().default(null),
  duration_ms: z.number().nullable().default(null),
  input_summary: z.string().nullable().default(null),
  parsed_output: z.unknown().nullable().default(null),
  raw_output: z.string().nullable().default(null),
  error_message: z.string().nullable().default(null),
  retry_count: z.number().default(0),
});

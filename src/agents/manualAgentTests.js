/**
 * These are manual development helpers only. Do not import into production UI.
 */

import { runVisionAgent } from "./visionAgent";
import { runValidationAgent } from "./validationAgent";
import { runUrgencyAgent } from "./urgencyAgent";
import { runDraftAgent } from "./draftAgent";
import { runEscalationAgent } from "./escalationAgent";

export async function testVisionAgent() {
  console.log("Starting testVisionAgent...");
  const payload = {
    imageBase64: "demo_base64_placeholder",
    mimeType: "image/jpeg",
    userDescription: "Large pothole near a busy intersection after rainfall.",
    locationHint: "FC Road, Pune",
  };
  const result = await runVisionAgent(payload);
  console.log("testVisionAgent result:", result);
  return result;
}

export async function testValidationAgent() {
  console.log("Starting testValidationAgent...");
  const payload = {
    newIssue: {
      issue_type: "pothole",
      description: "Large pothole near the corner causing traffic slowdown",
      lat: 18.5204,
      lng: 73.8567,
      geohash: "te7ud9x",
      created_at: Date.now(),
    },
    nearbyIssues: [
      {
        id: "issue_001",
        issue_type: "pothole",
        description: "Big pothole near junction affecting vehicles",
        lat: 18.5205,
        lng: 73.8568,
        geohash: "te7ud9x",
        created_at: Date.now() - 3600000,
        status: "pending",
      },
    ],
  };
  const result = await runValidationAgent(payload);
  console.log("testValidationAgent result:", result);
  return result;
}

export async function testUrgencyAgent() {
  console.log("Starting testUrgencyAgent...");
  const payload = {
    issue: {
      issue_type: "waterlogging",
      severity: "high",
      description: "Waterlogged road near school entrance causing unsafe movement",
      created_at: Date.now(),
    },
    weatherContext: {
      condition: "heavy_rain",
      rainfall_mm: 48,
      alert: "orange",
      temperature_c: 24,
    },
    communityContext: {
      upvote_count: 17,
      affected_reports: 5,
    },
  };
  const result = await runUrgencyAgent(payload);
  console.log("testUrgencyAgent result:", result);
  return result;
}

export async function testDraftAgent() {
  console.log("Starting testDraftAgent...");
  const payload = {
    issue: {
      issue_type: "garbage_overflow",
      description: "Garbage has overflowed onto the roadside and is causing foul smell and health risk.",
      address: "Lane 4, Kothrud",
      city: "Pune",
      urgency_label: "high",
    },
    reporter: {
      name: "Mayank Ninawe",
    },
  };
  const result = await runDraftAgent(payload);
  console.log("testDraftAgent result:", result);
  return result;
}

export async function testEscalationAgent() {
  console.log("Starting testEscalationAgent...");
  const payload = {
    issue: {
      created_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
      issue_type: "broken_streetlight",
      description: "Streetlight not working for three days near pedestrian crossing.",
      urgency_label: "medium",
      urgency_score: 5,
      status: "validated",
    },
    now: Date.now(),
  };
  const result = await runEscalationAgent(payload);
  console.log("testEscalationAgent result:", result);
  return result;
}

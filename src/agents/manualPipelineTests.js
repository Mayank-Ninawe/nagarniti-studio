/**
 * Manual development helpers for the full NagarNiti pipeline. Do not import into production UI.
 */

import { runNagarNitiPipeline, summarizePipelineForConsole } from "./orchestrator";

export async function testPipelineWithMinimalInput() {
  console.log("Starting testPipelineWithMinimalInput...");
  const input = {
    report: {
      imageBase64: "demo_base64_placeholder",
      mimeType: "image/jpeg",
      userDescription: "Large pothole near a traffic-heavy junction.",
      locationHint: "FC Road, Pune",
      created_at: Date.now(),
    },
    nearbyIssues: [],
    reporter: {
      name: "Mayank Ninawe",
    },
  };
  const result = await runNagarNitiPipeline(input);
  console.log("testPipelineWithMinimalInput complete:", result);
  return result;
}

export async function testPipelineWithContext() {
  console.log("Starting testPipelineWithContext...");
  const input = {
    report: {
      imageBase64: "demo_base64_placeholder",
      mimeType: "image/jpeg",
      userDescription: "Severe waterlogging outside a school gate after heavy rainfall.",
      locationHint: "Kothrud, Pune",
      lat: 18.5074,
      lng: 73.8077,
      geohash: "te7u8w1",
      address: "Near school gate, Kothrud",
      city: "Pune",
      created_at: Date.now() - 2 * 60 * 60 * 1000,
    },
    nearbyIssues: [
      {
        id: "issue_1001",
        issue_type: "waterlogging",
        description: "Roadside water accumulation near school entrance",
        lat: 18.5075,
        lng: 73.8078,
        geohash: "te7u8w1",
        created_at: Date.now() - 3 * 60 * 60 * 1000,
        status: "pending",
      },
    ],
    weatherContext: {
      condition: "heavy_rain",
      rainfall_mm: 52,
      alert: "orange",
      temperature_c: 23,
    },
    communityContext: {
      upvote_count: 21,
      affected_reports: 8,
    },
    reporter: {
      name: "Mayank Ninawe",
    },
  };
  const result = await runNagarNitiPipeline(input);
  console.log("testPipelineWithContext complete:", result);
  return result;
}

export async function printPipelineSummary() {
  console.log("Running printPipelineSummary...");
  const state = await testPipelineWithContext();
  const summary = summarizePipelineForConsole(state);
  console.log("Pipeline Summary Output:", summary);
  return summary;
}

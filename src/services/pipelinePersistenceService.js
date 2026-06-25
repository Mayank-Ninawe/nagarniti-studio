import { buildIssueDocumentFromPipeline } from "./issueBuilder";
import { buildAgentLogsFromPipeline } from "./agentLogBuilder";
import { createIssueDocument, createAgentLog } from "./firestoreService";

/**
 * Persists both the generated Issue document and all its corresponding Agent Log traces in Firestore.
 */
export async function persistPipelineResult({ reporter, report, pipelineState }) {
  let issueDoc;
  try {
    issueDoc = buildIssueDocumentFromPipeline({ reporter, report, pipelineState });
  } catch (buildError) {
    return {
      ok: false,
      error: `Failed to build issue document from pipeline: ${buildError.message}`,
      issue: null,
      logs: { created: [], failed: [] },
    };
  }

  // Clear or set created_at as needed
  const issueResult = await createIssueDocument(issueDoc);
  if (!issueResult.ok) {
    return {
      ok: false,
      error: `Issue persistence failed: ${issueResult.error}`,
      issue: null,
      logs: { created: [], failed: [] },
    };
  }

  const createdIssue = issueResult.data; // Includes Firestore ID
  const issueId = issueResult.id;

  let logsToBuild = [];
  try {
    logsToBuild = buildAgentLogsFromPipeline({ issueId, pipelineState });
  } catch (logBuildError) {
    return {
      ok: true,
      error: `Issue created, but failed to build agent logs: ${logBuildError.message}`,
      issue: createdIssue,
      logs: { created: [], failed: [] },
    };
  }

  const createdLogs = [];
  const failedLogs = [];

  for (const log of logsToBuild) {
    try {
      const logResult = await createAgentLog(log);
      if (logResult.ok) {
        createdLogs.push(logResult.data);
      } else {
        failedLogs.push({ log, error: logResult.error });
      }
    } catch (err) {
      failedLogs.push({ log, error: err.message || "Unknown error during log write" });
    }
  }

  const logsFailed = failedLogs.length > 0;
  return {
    ok: true,
    error: logsFailed ? "Issue created, but some agent logs failed to persist." : null,
    issue: createdIssue,
    logs: {
      created: createdLogs,
      failed: failedLogs,
    },
  };
}

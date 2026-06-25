import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/base.css";
import "./styles/components.css";
import App from "./App";

import * as manualTests from "./agents/manualAgentTests";
import * as manualPipelineTests from "./agents/manualPipelineTests";
import * as manualContextTests from "./services/manualContextTests";
import * as manualFirestoreTests from "./services/manualFirestoreTests";
import {
  startEscalationWorker,
  stopEscalationWorker,
  getWorkerStatus,
} from "./workers/escalationWorker";
import { seedDemoIssues, getDemoSeedStatus } from "./demo/demoSeeder";

function shouldSuppressRuntimeError(message = "", source = "") {
  const msg = String(message || "").toLowerCase();
  const src = String(source || "").toLowerCase();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";

  const blockedTerms = [
    "script error",
    "firebase",
    "api-key",
    "auth",
    "opener",
    "google",
    "recaptcha",
  ];

  const hasBlockedTerm = blockedTerms.some((term) => msg.includes(term));
  const isCrossOriginSource =
    !!src && !src.includes("localhost") && (!hostname || !src.includes(hostname));

  return !msg || hasBlockedTerm || isCrossOriginSource;
}

function setupGlobalErrorSuppression() {
  if (typeof window === "undefined") return;

  window.onerror = function (message, source) {
    const isObjectEvent =
      typeof message === "object" || String(message || "").includes("[object Event]");

    if (isObjectEvent || shouldSuppressRuntimeError(message, source)) {
      return true;
    }

    return false;
  };

  window.addEventListener(
    "error",
    (event) => {
      const msg = String(event?.message || "");
      const source = String(event?.filename || "");
      const isObjectEvent =
        typeof event === "object" && (!event.message || msg.includes("[object Event]"));

      if (isObjectEvent || shouldSuppressRuntimeError(msg, source)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true }
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event?.reason
        ? String(event.reason.message || event.reason)
        : "";

      if (shouldSuppressRuntimeError(reason)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true }
  );
}

function registerDevHelpers() {
  if (typeof window === "undefined") return;

  window.manualTests = manualTests;
  window.manualPipelineTests = manualPipelineTests;
  window.manualContextTests = manualContextTests;

  if (import.meta.env.DEV) {
    window.manualFirestoreTests = manualFirestoreTests;

    window.escalationWorker = {
      start: startEscalationWorker,
      stop: stopEscalationWorker,
      status: getWorkerStatus,
    };

    window.demoSeeder = {
      seed: seedDemoIssues,
      status: getDemoSeedStatus,
    };
  }
}

setupGlobalErrorSuppression();
registerDevHelpers();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
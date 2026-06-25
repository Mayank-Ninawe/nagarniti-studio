import { useState } from "react";
import { seedDemoIssues, getDemoSeedStatus } from "./demoSeeder";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Info,
  Check,
  AlertCircle
} from "lucide-react";

export default function DemoSeedPanel({ isAdminUser = false }) {
  // Only render if in dev mode or explicitly passed isAdminUser
  const isAllowed = import.meta.env.DEV || isAdminUser;
  if (!isAllowed) return null;

  const [seedStatus, setSeedStatus] = useState(null); // null | "loading" | "success" | "error"
  const [seedResult, setSeedResult] = useState(null);
  const [statusCheckResult, setStatusCheckResult] = useState(null);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);

  const handleCheckStatus = async () => {
    setStatusCheckLoading(true);
    try {
      const result = await getDemoSeedStatus();
      setStatusCheckResult(result);
    } catch (err) {
      console.error("Error checking seed status:", err);
    } finally {
      setStatusCheckLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedStatus("loading");
    setSeedResult(null);
    try {
      const result = await seedDemoIssues();
      setSeedResult(result);
      if (result.ok) {
        setSeedStatus("success");
      } else if (result.failed > 0) {
        setSeedStatus("error");
      } else {
        setSeedStatus("success");
      }
      // Refresh status automatically
      const updatedStatus = await getDemoSeedStatus();
      setStatusCheckResult(updatedStatus);
    } catch (err) {
      setSeedStatus("error");
      console.error("Error seeding demo issues:", err);
    }
  };

  return (
    <div id="demo-seed-panel" className="card border border-divider hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-divider">
        <Database className="text-teal-600 animate-pulse" size={20} />
        <h3 className="text-lg font-bold text-gray-900">Demo Data Seeder</h3>
      </div>

      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Populate your local or development Firestore database with pre-processed Pune-specific issues of varying types, status states, and critical escalations.
      </p>

      {/* Grid of Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Action 1: Check Status */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-divider flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Step 1: Check Database
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Query Firestore to see if any demo documents are already seeded.
            </p>
          </div>
          <button
            id="check-seed-status-btn"
            onClick={handleCheckStatus}
            disabled={statusCheckLoading}
            className="btn btn-outline btn-sm flex items-center justify-center gap-1.5 w-full text-xs font-bold"
          >
            <RotateCw size={14} className={statusCheckLoading ? "animate-spin" : ""} />
            Check Status
          </button>
        </div>

        {/* Action 2: Run Seeding */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-divider flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Step 2: Load Demo Set
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Inject 6 realistic issues including Monsoonal flooding, potholes, and waste.
            </p>
          </div>
          <button
            id="seed-demo-issues-btn"
            onClick={handleSeed}
            disabled={seedStatus === "loading"}
            className="btn btn-primary btn-sm flex items-center justify-center gap-1.5 w-full text-xs font-bold shadow-sm"
          >
            <Play size={14} className={seedStatus === "loading" ? "animate-pulse" : ""} />
            {seedStatus === "loading" ? "Seeding..." : "Seed Demo Issues"}
          </button>
        </div>
      </div>

      {/* Status Results Panel */}
      {statusCheckResult && (
        <div id="seed-status-results" className="mb-5 p-4 bg-teal-50/30 border border-teal-100 rounded-xl">
          <h5 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-teal-600" />
            Current Seed State
          </h5>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/80 p-2 rounded border border-teal-100/60">
              <p className="text-lg font-black text-teal-800">{statusCheckResult.total}</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold">Total Set</p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-teal-100/60">
              <p className="text-lg font-black text-green-700">{statusCheckResult.present}</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold">In DB</p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-teal-100/60">
              <p className="text-lg font-black text-amber-700">{statusCheckResult.missing}</p>
              <p className="text-[9px] text-gray-400 uppercase font-bold">Missing</p>
            </div>
          </div>
        </div>
      )}

      {/* Seeding Results Feedbacks */}
      {seedStatus === "success" && seedResult && (
        <div id="seed-success-feedback" className="mb-5 p-4 bg-green-50/60 border border-green-200 rounded-xl text-green-800">
          <div className="flex items-center gap-2 font-bold text-sm mb-2">
            <Check className="text-green-600" size={16} />
            Seeding Operation Completed!
          </div>
          <ul className="text-xs space-y-1">
            <li>• New Issues Seeded: <span className="font-bold">{seedResult.seeded}</span></li>
            <li>• Already Seated (Skipped): <span className="font-bold">{seedResult.skipped}</span></li>
            <li>• Operations Failed: <span className="font-bold">{seedResult.failed}</span></li>
          </ul>
          {seedResult.seeded === 0 && seedResult.skipped > 0 && (
            <p className="text-[11px] text-green-700 mt-2 font-medium">
              Neutral: All issues were already present in Firestore. No duplicates added.
            </p>
          )}
        </div>
      )}

      {seedStatus === "error" && seedResult && (
        <div id="seed-error-feedback" className="mb-5 p-4 bg-red-50/60 border border-red-200 rounded-xl text-red-800">
          <div className="flex items-center gap-2 font-bold text-sm mb-2">
            <AlertCircle className="text-red-600" size={16} />
            Seeding Encounted Errors
          </div>
          <p className="text-xs">
            Failed to seed <span className="font-bold">{seedResult.failed}</span> documents. Check firestore permissions or developer console for details.
          </p>
        </div>
      )}

      {/* Footer info strip */}
      <div className="flex gap-2 items-start mt-2 p-3 bg-gray-50/50 border border-gray-100 rounded-lg">
        <Info className="text-gray-400 shrink-0 mt-0.5" size={14} />
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Seeding is completely <strong className="text-gray-700 font-bold">idempotent</strong>. Running it multiple times compares deterministic document IDs and will not duplicate entries on your dashboard.
        </p>
      </div>
    </div>
  );
}

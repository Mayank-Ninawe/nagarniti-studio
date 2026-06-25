import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { getIssueById, listAgentLogsForIssue } from "../services";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  RefreshCw,
  AlertTriangle,
  User,
  ShieldAlert,
  FileText,
  Terminal,
  Code,
  Sparkles,
  Layers,
  Award,
  AlertCircle,
  Loader2,
  ThumbsUp
} from "lucide-react";

export default function IssueDetailPage() {
  const { id: issueId } = useParams();
  const navigate = useNavigate();

  // Issue States
  const [issueLoading, setIssueLoading] = useState(true);
  const [issueError, setIssueError] = useState(null);
  const [issueData, setIssueData] = useState(null);

  // Agent Logs States
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);

  // Accordion state (stores log index or agent_name)
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Clipboard Copy Feedback
  const [copiedField, setCopiedField] = useState(null); // 'complaint' | 'subject'

  // Load Issue Details
  const loadIssueData = async () => {
    setIssueLoading(true);
    setIssueError(null);
    try {
      const res = await getIssueById(issueId);
      if (res.ok && res.data) {
        setIssueData(res.data);
        // Load logs next
        loadAgentLogs();
      } else {
        setIssueError(res.error || "The requested issue could not be retrieved from the database.");
      }
    } catch (err) {
      setIssueError(err.message || "An unexpected error occurred loading issue details.");
    } finally {
      setIssueLoading(false);
    }
  };

  // Load Agent Logs
  const loadAgentLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await listAgentLogsForIssue(issueId);
      if (res.ok) {
        // Standard agent sequence order: vision, validation, urgency, draft, escalation
        const orderMap = {
          vision: 1,
          validation: 2,
          urgency: 3,
          draft: 4,
          escalation: 5
        };
        const sortedLogs = (res.data || []).sort((a, b) => {
          return (orderMap[a.agent_name] || 99) - (orderMap[b.agent_name] || 99);
        });
        setAgentLogs(sortedLogs);

        // Expand the first failed agent log if any, otherwise default to none or first one
        const failedLog = sortedLogs.find(log => log.status === "failed");
        if (failedLog) {
          setExpandedLogId(failedLog.agent_name);
        } else if (sortedLogs.length > 0) {
          setExpandedLogId(sortedLogs[0].agent_name); // Expand first log by default
        }
      } else {
        setLogsError(res.error || "Failed to load agent logs.");
      }
    } catch (err) {
      setLogsError(err.message || "An unexpected error occurred loading agent logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (issueId) {
      loadIssueData();
    }
  }, [issueId]);

  // Copy to clipboard helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  };

  // Local helper functions
  const formatIssueType = (val) => {
    if (!val) return "Unknown Issue";
    return val
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold";
      case "escalated":
        return "bg-rose-100 text-rose-800 border border-rose-200 font-bold animate-pulse";
      case "validated":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
  };

  const getUrgencyBadgeClass = (label) => {
    const l = label?.toLowerCase() || "";
    switch (l) {
      case "critical":
        return "bg-red-100 text-red-800 border border-red-200 font-extrabold";
      case "high":
        return "bg-orange-100 text-orange-800 border border-orange-200 font-bold";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-250 font-semibold";
      case "low":
      default:
        return "bg-green-100 text-green-800 border border-green-200";
    }
  };

  const formatAgentName = (name) => {
    if (!name) return "Unknown Agent";
    switch (name.toLowerCase()) {
      case "vision":
        return "Image Vision & Classification Agent";
      case "validation":
        return "Duplicate & Validity Detection Agent";
      case "urgency":
        return "Contextual Urgency Scoring Agent";
      case "draft":
        return "Civic Complaint Copywriter Agent";
      case "escalation":
        return "Jurisdiction Escalation Router Agent";
      default:
        return name.charAt(0).toUpperCase() + name.slice(1) + " Agent";
    }
  };

  const safePrettyJson = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value; // already plain text
      }
    }
    return JSON.stringify(value, null, 2);
  };

  // Toggle Accordion Rows
  const toggleLogExpansion = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  // Derived timeline configuration
  const timelineItems = useMemo(() => {
    if (!issueData) return [];

    const now = Date.now();
    const created = issueData.created_at;
    const validatedAt = issueData.validation_output?.validated_at || 
                        agentLogs.find(l => l.agent_name === "validation")?.completed_at;
    const scoredAt = issueData.urgency_output?.scored_at || 
                     agentLogs.find(l => l.agent_name === "urgency")?.completed_at;
    const draftedAt = issueData.draft_output?.drafted_at || 
                      agentLogs.find(l => l.agent_name === "draft")?.completed_at;
    const escalateAfter = issueData.escalate_after;
    const isEscalationPast = escalateAfter && escalateAfter <= now;

    return [
      {
        title: "Report Submitted",
        timestamp: created,
        description: "Citizen reported issue details with photographic evidence.",
        completed: true,
        type: "citizen"
      },
      {
        title: "Duplicate Checked & Validated",
        timestamp: validatedAt,
        description: issueData.validation_output?.is_duplicate 
          ? `Identified as potential duplicate. Similarity score: ${issueData.validation_output?.similarity_score}`
          : "Verified as an original reports. Context checking completed.",
        completed: !!validatedAt,
        type: "agent"
      },
      {
        title: "Urgency Multi-factor Scored",
        timestamp: scoredAt,
        description: issueData.urgency_score 
          ? `Scored ${issueData.urgency_score}/10 based on weather, safety, and community weights.`
          : "Urgency evaluation completed using district safety parameters.",
        completed: !!scoredAt,
        type: "agent"
      },
      {
        title: "Official Complaint Drafted",
        timestamp: draftedAt,
        description: "Civic appeal formulated, addressed to Ward Officer.",
        completed: !!draftedAt,
        type: "agent"
      },
      {
        title: "Escalation Deadline Scheduled",
        timestamp: escalateAfter,
        description: isEscalationPast 
          ? "Escalation ready! Past resolution threshold window." 
          : "Slated for higher authority transmission if not resolved by deadline.",
        completed: !!escalateAfter,
        type: "system",
        alert: isEscalationPast && issueData.status !== "resolved"
      }
    ];
  }, [issueData, agentLogs]);

  // Loading Screen Layout
  if (issueLoading) {
    return (
      <PageLayout>
        <div className="container--default" style={{ padding: "var(--space-8) var(--space-4)" }}>
          {/* Back button skeleton */}
          <div className="h-6 w-32 bg-gray-150 rounded animate-pulse mb-6"></div>
          {/* Main header skeleton */}
          <div className="card mb-8 animate-pulse" style={{ padding: "var(--space-6)" }}>
            <div className="flex gap-4 items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-6 w-2/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-3 w-full bg-gray-150 rounded"></div>
              <div className="h-3 w-5/6 bg-gray-150 rounded"></div>
            </div>
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="card h-64 bg-gray-50/50 border border-dashed animate-pulse"></div>
              <div className="card h-96 bg-gray-50/50 border border-dashed animate-pulse"></div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="card h-[400px] bg-gray-50/50 border border-dashed animate-pulse"></div>
              <div className="card h-48 bg-gray-50/50 border border-dashed animate-pulse"></div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error Screen Layout
  if (issueError) {
    return (
      <PageLayout>
        <div className="container--default flex flex-col items-center justify-center py-20 px-4">
          <div className="card max-w-md w-full text-center" style={{ padding: "var(--space-8)" }}>
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-extrabold text-gray-900" style={{ fontSize: "var(--text-xl)" }}>
              Could Not Fetch Case Record
            </h2>
            <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
              {issueError}
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate("/dashboard")} className="btn btn-outline btn-sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
              </button>
              <button onClick={loadIssueData} className="btn btn-primary btn-sm flex items-center">
                <RefreshCw className="w-4 h-4 mr-1.5" /> Retry Request
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Empty State
  if (!issueData) {
    return (
      <PageLayout>
        <div className="container--default flex flex-col items-center justify-center py-20 px-4">
          <div className="card max-w-md w-full text-center" style={{ padding: "var(--space-8)" }}>
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-gray-900" style={{ fontSize: "var(--text-xl)" }}>
              Case File Missing
            </h2>
            <p className="text-sm text-gray-400 mt-2 mb-6">
              The requested issue identifier does not match any current active logs.
            </p>
            <button onClick={() => navigate("/dashboard")} className="btn btn-primary btn-sm">
              Return to Dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const isEscalationReady =
    issueData.escalate_after &&
    issueData.escalate_after <= Date.now() &&
    issueData.status !== "resolved";

  const complaintLetter =
    issueData.draft_output?.complaint_letter ||
    issueData.draft_output?.letter ||
    "Complaint draft formulation unavailable.";

  const complaintSubject =
    issueData.draft_output?.subject_line ||
    issueData.draft_output?.subject ||
    "";

  return (
    <PageLayout>
      <div className="container--default" style={{ padding: "var(--space-8) var(--space-4)" }}>
        
        {/* Top Back & Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline btn-sm flex items-center hover:translate-x-[-2px] transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-outline btn-sm font-semibold flex items-center gap-1 text-gray-700 hover:bg-gray-50"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => navigate("/report")}
              className="btn btn-primary btn-sm font-semibold flex items-center gap-1.5"
            >
              Report Another Issue
            </button>
          </div>
        </div>

        {/* Main Summary Header Card */}
        <div className="card mb-8 shadow-md border-t-4 border-indigo-600" style={{ padding: "var(--space-6)" }}>
          
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            
            {/* Visual Header / Title & Description Block */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`badge text-xs uppercase font-extrabold px-2.5 py-0.5 ${getUrgencyBadgeClass(issueData.urgency_label)}`}>
                  {issueData.urgency_label || "low"} Urgency
                </span>
                <span className={`badge text-xs uppercase font-extrabold px-2.5 py-0.5 ${getStatusBadgeClass(issueData.status)}`}>
                  {issueData.status || "pending"}
                </span>
                {isEscalationReady && (
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 animate-pulse flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Escalation Ready
                  </span>
                )}
                {issueData.validation_output?.is_duplicate && (
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Duplicate Flagged
                  </span>
                )}
              </div>

              <h1 className="font-heading font-extrabold text-gray-900 leading-tight" style={{ fontSize: "var(--text-2xl)" }}>
                {formatIssueType(issueData.issue_type)}
              </h1>

              <p className="text-gray-650 text-sm leading-relaxed max-w-4xl" style={{ fontSize: "var(--text-md)" }}>
                {issueData.description || "No supplemental details supplied by reporting user."}
              </p>

              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-150 text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">LOCATION</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    {issueData.address ? `${issueData.address}, ` : ""}{issueData.city || "Pune"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">SUBMISSION TIME</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {formatTimestamp(issueData.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">REPORTER DETAIL</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    {issueData.reporter_name || "Anonymous Citizen"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">URGENCY SCORE</span>
                  <span className="font-extrabold text-indigo-700 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {issueData.urgency_score !== undefined ? `${issueData.urgency_score} / 10` : "Unrated"}
                  </span>
                </div>
              </div>

            </div>

            {/* Case Snapshot Photo Panel (if exists) */}
            {issueData.photo_url && (
              <div className="lg:w-64 w-full flex-shrink-0">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner h-44 lg:h-full min-h-[160px]">
                  <img
                    src={issueData.photo_url}
                    alt="Citizen uploaded civic grievance"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <MapPin class="w-8 h-8 mb-1" />
                          <span class="text-[10px]">Photo Unloadable</span>
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded-full font-mono">
                    CITIZEN EVIDENCE
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Two-Column Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Timeline + Complaint Preview */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Resolution Timeline */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div className="flex items-center gap-2 mb-6 pb-3 border-b">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-sans font-extrabold" style={{ fontSize: "var(--text-lg)" }}>
                  Resolution & Sequential Timeline
                </h3>
              </div>

              {/* Timeline list */}
              <div className="relative pl-6 border-l-2 border-gray-150 space-y-6">
                {timelineItems.map((item, idx) => {
                  const isActive = item.completed;
                  return (
                    <div key={idx} className="relative group">
                      
                      {/* Circle Dot node */}
                      <span
                        className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: item.alert 
                            ? "var(--color-error, #dc2626)" 
                            : isActive 
                              ? "var(--color-primary, #0a6e6b)" 
                              : "#ffffff",
                          borderColor: item.alert 
                            ? "#ffffff" 
                            : isActive 
                              ? "var(--color-primary, #0a6e6b)" 
                              : "var(--color-border)",
                          boxShadow: isActive ? "0 0 0 4px rgba(10, 110, 107, 0.15)" : "none"
                        }}
                      >
                        {isActive && !item.alert && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        )}
                      </span>

                      {/* Timeline Item Content */}
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                          <h4
                            className={`font-sans font-bold text-sm ${
                              item.alert 
                                ? "text-red-650" 
                                : isActive 
                                  ? "text-gray-900" 
                                  : "text-gray-400"
                            }`}
                          >
                            {item.title}
                          </h4>
                          {item.timestamp && (
                            <span className="text-[10px] font-mono text-gray-450 bg-gray-50 px-2 py-0.5 rounded">
                              {formatTimestamp(item.timestamp)}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isActive ? "text-gray-500" : "text-gray-400 italic"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Complaint Draft Card */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-sans font-extrabold" style={{ fontSize: "var(--text-lg)" }}>
                    Draft Complaint Letter
                  </h3>
                </div>
                
                {/* Actions strip */}
                <div className="flex items-center gap-2">
                  {complaintSubject && (
                    <button
                      type="button"
                      onClick={() => handleCopy(complaintSubject, "subject")}
                      className="btn btn-outline btn-xs py-1 px-2.5 text-[11px] flex items-center gap-1"
                    >
                      {copiedField === "subject" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Subject
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(complaintLetter, "complaint")}
                    className="btn btn-primary btn-xs py-1 px-2.5 text-[11px] flex items-center gap-1"
                  >
                    {copiedField === "complaint" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Letter
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metainfo header fields if available */}
              {(issueData.draft_output?.addressed_to || issueData.draft_output?.recommended_department) && (
                <div className="bg-gray-50 p-3 rounded-xl mb-4 text-xs space-y-1 border">
                  {issueData.draft_output?.addressed_to && (
                    <p className="text-gray-600">
                      <strong className="text-gray-800">Addressed To:</strong> {issueData.draft_output.addressed_to}
                    </p>
                  )}
                  {issueData.draft_output?.recommended_department && (
                    <p className="text-gray-600">
                      <strong className="text-gray-800">Department:</strong> {issueData.draft_output.recommended_department}
                    </p>
                  )}
                </div>
              )}

              {/* Subject box */}
              {complaintSubject && (
                <div className="mb-4 text-xs font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider">OFFICIAL SUBJECT</span>
                  {complaintSubject}
                </div>
              )}

              {/* Primary draft text body */}
              <div
                className="bg-gray-50 p-4 rounded-xl text-xs font-mono text-gray-700 border overflow-y-auto leading-relaxed max-h-[380px]"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {complaintLetter}
              </div>

            </div>

          </div>

          {/* Right Column: Agent Execution Log + Technical details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Agent Execution Log Card */}
            <div className="card" style={{ padding: "var(--space-6)" }}>
              
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-sans font-extrabold" style={{ fontSize: "var(--text-lg)" }}>
                    Agent Processing Chain
                  </h3>
                </div>
                <button
                  onClick={loadAgentLogs}
                  className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                  title="Reload pipeline status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* List accordion rows */}
              {logsLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : logsError ? (
                <div className="text-center py-6 bg-red-50 text-red-900 rounded-xl p-4 border border-red-150">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <h4 className="font-bold text-xs">Chain Load Failed</h4>
                  <p className="text-[11px] text-red-700 mt-1 mb-3">{logsError}</p>
                  <button onClick={loadAgentLogs} className="btn btn-outline btn-xs justify-center mx-auto">
                    Retry Fetching Logs
                  </button>
                </div>
              ) : agentLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-gray-55/50 border border-dashed rounded-xl">
                  <Info className="w-8 h-8 mx-auto mb-1.5 text-gray-350" />
                  <p className="text-xs italic">No agent execution trace records found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentLogs.map((log) => {
                    const isExpanded = expandedLogId === log.agent_name;
                    const isSuccess = log.status === "success";
                    const isFailed = log.status === "failed";
                    const isRunning = log.status === "running" || log.status === "retrying";

                    return (
                      <div
                        key={log.agent_name}
                        className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-all"
                      >
                        {/* Header block toggle button */}
                        <button
                          type="button"
                          onClick={() => toggleLogExpansion(log.agent_name)}
                          className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-gray-50/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            
                            {/* status dot */}
                            <span
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                isSuccess 
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                                  : isFailed 
                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" 
                                    : isRunning 
                                      ? "bg-amber-500 animate-bounce" 
                                      : "bg-gray-450"
                              }`}
                            ></span>

                            {/* Name info */}
                            <div className="min-w-0">
                              <span className="font-sans font-bold text-xs text-gray-850 block truncate">
                                {log.agent_name.toUpperCase()} AGENT
                              </span>
                              <span className="text-[10px] text-gray-450 block truncate font-medium">
                                {formatAgentName(log.agent_name)}
                              </span>
                            </div>

                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {log.duration_ms && (
                              <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                                {log.duration_ms}ms
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Expandable parsed/raw details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/80 text-xs space-y-3.5">
                            
                            {/* Failure details if available */}
                            {log.error_message && (
                              <div className="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-150 font-mono text-[11px] leading-relaxed">
                                <strong className="text-red-900 block font-sans mb-1 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> Pipeline Error Message
                                </strong>
                                {log.error_message}
                              </div>
                            )}

                            {/* Attempt metadata */}
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono border-b pb-1.5">
                              <span>RETRY ATTEMPTS: <strong className="text-gray-700">{log.retry_count || 0}</strong></span>
                              <span>STATUS: <strong className="uppercase text-gray-750">{log.status}</strong></span>
                            </div>

                            {/* Parsed JSON payload outputs */}
                            <div>
                              <span className="text-[10px] font-bold text-gray-450 tracking-wide uppercase flex items-center gap-1 mb-1.5">
                                <Code className="w-3 h-3" /> Struct Output (Parsed)
                              </span>
                              <div className="max-h-[220px] overflow-y-auto bg-white border rounded-lg p-2.5 font-mono text-[10px] text-gray-600 shadow-inner">
                                <pre>{safePrettyJson(log.parsed_output)}</pre>
                              </div>
                            </div>

                            {/* Raw trace payload */}
                            {log.raw_output && (
                              <div>
                                <span className="text-[10px] font-bold text-gray-450 tracking-wide uppercase flex items-center gap-1 mb-1.5">
                                  <Terminal className="w-3 h-3" /> Raw Engine Logs
                                </span>
                                <div className="max-h-[160px] overflow-y-auto bg-white border rounded-lg p-2.5 font-mono text-[10px] text-gray-500 shadow-inner">
                                  <pre className="whitespace-pre-wrap leading-relaxed">{log.raw_output}</pre>
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Technical Detail Card */}
            <div className="card text-xs" style={{ padding: "var(--space-6)" }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Code className="w-5 h-5 text-indigo-600" />
                <h3 className="font-sans font-extrabold" style={{ fontSize: "var(--text-lg)" }}>
                  Technical Deep-Dive
                </h3>
              </div>

              <div className="space-y-2.5">
                
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400 font-medium">Issue DB Reference ID</span>
                  <span className="font-mono text-[10px] text-gray-800 select-all font-bold">{issueData.id}</span>
                </div>

                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400 font-medium">Geospatial Geohash</span>
                  <span className="font-mono text-gray-800 font-bold">{issueData.geohash || "N/A"}</span>
                </div>

                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400 font-medium">Lat / Lng Latitude coordinates</span>
                  <span className="font-mono text-gray-800">
                    {issueData.lat?.toFixed(5) || 0} , {issueData.lng?.toFixed(5) || 0}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400 font-medium">Verified Community Upvotes</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                    {issueData.upvote_count || 0} votes
                  </span>
                </div>

                {/* Pipeline payloads summary lists */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-2">
                    Pipeline Persistence Checks (Firestore)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">vision_output</span>
                      <span className="font-bold text-emerald-600">{issueData.vision_output ? "YES" : "NO"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">raw_vision</span>
                      <span className="font-bold text-emerald-600">{issueData.raw_vision ? "YES" : "NO"}</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">validation_out</span>
                      <span className="font-bold text-emerald-600">{issueData.validation_output ? "YES" : "NO"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">raw_validation</span>
                      <span className="font-bold text-emerald-600">{issueData.raw_validation ? "YES" : "NO"}</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">urgency_output</span>
                      <span className="font-bold text-emerald-600">{issueData.urgency_output ? "YES" : "NO"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">raw_urgency</span>
                      <span className="font-bold text-emerald-600">{issueData.raw_urgency ? "YES" : "NO"}</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">draft_output</span>
                      <span className="font-bold text-emerald-600">{issueData.draft_output ? "YES" : "NO"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border">
                      <span className="text-gray-500 font-mono text-[10px]">raw_draft</span>
                      <span className="font-bold text-emerald-600">{issueData.raw_draft ? "YES" : "NO"}</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border col-span-2">
                      <span className="text-gray-500 font-mono text-[10px]">escalation_output</span>
                      <span className="font-bold text-emerald-600">{issueData.escalation_output ? "YES" : "NO"}</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </PageLayout>
  );
}

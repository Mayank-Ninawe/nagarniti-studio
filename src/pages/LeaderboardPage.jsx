import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useAppStore } from "../store/appStore";
import { getLeaderboardTop, listIssuesByReporter } from "../services/firestoreService";
import {
  Trophy,
  Award,
  RotateCw,
  PlusCircle,
  AlertTriangle,
  User,
  Users,
  FileText,
  CheckCircle,
  Sparkles,
  Info,
  ChevronRight,
} from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useAppStore();
  const navigate = useNavigate();

  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [myStatsLoading, setMyStatsLoading] = useState(false);
  const [myStatsError, setMyStatsError] = useState(null);
  const [myIssuesData, setMyIssuesData] = useState([]);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getTierLabel = (impact_score) => {
    const score = Number(impact_score) || 0;
    if (score >= 100) return "Platinum";
    if (score >= 50) return "Gold";
    if (score >= 20) return "Silver";
    return "Bronze";
  };

  const getTierBadgeStyle = (tier) => {
    switch (tier) {
      case "Platinum":
        return { backgroundColor: "#f3e8ff", color: "#6b21a8" };
      case "Gold":
        return { backgroundColor: "#fef3c7", color: "#b45309" };
      case "Silver":
        return { backgroundColor: "#f1f5f9", color: "#475569" };
      case "Bronze":
        return { backgroundColor: "#ffedd5", color: "#c2410c" };
      default:
        return { backgroundColor: "#f1f5f9", color: "#475569" };
    }
  };

  const computePersonalScore = ({ totalReported, totalResolved }) => {
    return totalReported * 5 + totalResolved * 10;
  };

  const formatLargeNumber = (value) => {
    const num = Number(value) || 0;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  };

  const loadLeaderboard = async (isRef = false) => {
    if (isRef) {
      setIsRefreshing(true);
    } else {
      setLeaderboardLoading(true);
    }

    setLeaderboardError(null);

    try {
      const result = await getLeaderboardTop(20);
      if (result.ok) {
        setLeaderboardData(result.data || []);
      } else {
        setLeaderboardError(result.error || "Failed to fetch top leaderboard.");
      }
    } catch (err) {
      setLeaderboardError(err.message || "An unexpected error occurred.");
    } finally {
      setLeaderboardLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMyIssues = async () => {
    if (!user) return;

    setMyStatsLoading(true);
    setMyStatsError(null);

    try {
      const result = await listIssuesByReporter(user.uid, 100);
      if (result.ok) {
        setMyIssuesData(result.data || []);
      } else {
        setMyStatsError(result.error || "Failed to load user stats.");
      }
    } catch (err) {
      setMyStatsError(err.message || "An unexpected error occurred loading stats.");
    } finally {
      setMyStatsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (user) {
      loadMyIssues();
    }
  }, [user]);

  const handleRefresh = () => {
    loadLeaderboard(true);
    if (user) loadMyIssues();
  };

  const handleRetry = () => {
    loadLeaderboard(false);
    if (user) loadMyIssues();
  };

  const topThree = useMemo(() => leaderboardData.slice(0, 3), [leaderboardData]);

  const personalStats = useMemo(() => {
    if (!user) return null;

    const totalReported = myIssuesData.length;
    const totalValidated = myIssuesData.filter((i) => i.status === "validated").length;
    const totalResolved = myIssuesData.filter((i) => i.status === "resolved").length;
    const totalCritical = myIssuesData.filter(
      (i) => i.urgency_label === "critical" || i.urgency_label === "high"
    ).length;

    const now = Date.now();
    const escalationReady = myIssuesData.filter(
      (i) => i.escalate_after && i.escalate_after <= now && i.status !== "resolved"
    ).length;

    const leaderboardIndex = leaderboardData.findIndex(
      (entry) => entry.user_id === user.uid
    );
    const personalRank = leaderboardIndex !== -1 ? leaderboardIndex + 1 : null;

    const matchedEntry = leaderboardData.find((entry) => entry.user_id === user.uid);
    const impactScore = matchedEntry
      ? matchedEntry.impact_score
      : computePersonalScore({ totalReported, totalResolved });

    const tier = getTierLabel(impactScore);
    const tierStyle = getTierBadgeStyle(tier);

    return {
      totalReported,
      totalValidated,
      totalResolved,
      totalCritical,
      escalationReady,
      personalRank,
      impactScore,
      tier,
      tierStyle,
    };
  }, [user, myIssuesData, leaderboardData]);

  const totalReporters = leaderboardData.length;
  const totalIssuesLogged = leaderboardData.reduce(
    (sum, e) => sum + (e.issues_reported || 0),
    0
  );
  const totalIssuesResolved = leaderboardData.reduce(
    (sum, e) => sum + (e.issues_resolved || 0),
    0
  );
  const topImpactScore = leaderboardData[0]?.impact_score || 0;

  const showCompactEmptyFlow = !leaderboardLoading && !leaderboardError && leaderboardData.length === 0;

  return (
    <PageLayout>
      <div className="leaderboard-page max-w-[1080px] mx-auto px-4 md:px-5 py-5 md:py-6">
        <header className="mb-4 md:mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Community recognition
              </p>

              <h1
                className="font-black"
                style={{
                  color: "var(--color-text)",
                  fontSize: "clamp(1.55rem, 1.3rem + 0.7vw, 2rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.045em",
                }}
              >
                Leaderboard
              </h1>

              <p
                className="mt-2 text-sm"
                style={{
                  maxWidth: "40rem",
                  lineHeight: 1.45,
                  color: "var(--color-text-muted)",
                }}
              >
                See who is driving the strongest civic impact through verified issue reporting and resolution.
              </p>
            </div>

            <button
              id="report-issue-btn"
              onClick={() => navigate("/report")}
              className="btn btn-primary btn-sm flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <PlusCircle size={15} />
              <span>Report an Issue</span>
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
          <div className="card card--compact-dashboard flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
              <Users size={17} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                Total Reporters
              </span>
              <span className="font-black text-slate-950 tracking-tight text-xl leading-none mt-1">
                {totalReporters}
              </span>
            </div>
          </div>

          <div className="card card--compact-dashboard flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-100 shrink-0">
              <FileText size={17} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                Issues Logged
              </span>
              <span className="font-black text-slate-950 tracking-tight text-xl leading-none mt-1">
                {totalIssuesLogged}
              </span>
            </div>
          </div>

          <div className="card card--compact-dashboard flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 border border-green-100 shrink-0">
              <CheckCircle size={17} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                Issues Resolved
              </span>
              <span className="font-black text-slate-950 tracking-tight text-xl leading-none mt-1">
                {totalIssuesResolved}
              </span>
            </div>
          </div>

          <div className="card card--compact-dashboard flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
              <Trophy size={17} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                Top Impact
              </span>
              <span className="font-black text-slate-950 tracking-tight text-xl leading-none mt-1">
                {topImpactScore}
              </span>
            </div>
          </div>
        </section>

        {showCompactEmptyFlow ? (
          <div className="grid grid-cols-1 gap-4">
            <section className="card card--dashboard">
              <div
                className="flex items-center justify-between gap-3 mb-3 pb-3"
                style={{ borderBottom: "1px solid var(--color-divider)" }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ background: "rgba(221, 122, 31, 0.09)" }}
                  >
                    <Trophy className="text-amber-600" size={13} />
                  </div>

                  <div>
                    <h2
                      className="font-bold"
                      style={{
                        fontSize: "0.95rem",
                        lineHeight: 1.1,
                        color: "var(--color-text)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Full rankings
                    </h2>
                    <p
                      className="mt-0.5"
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.35,
                      }}
                    >
                      Top contributors ranked by verified impact score.
                    </p>
                  </div>
                </div>

                {!leaderboardLoading && !leaderboardError && leaderboardData.length > 0 && (
                  <button
                    id="refresh-leaderboard-btn"
                    onClick={handleRefresh}
                    className="btn btn-ghost btn-sm flex items-center gap-1.5"
                    title="Refresh rankings"
                  >
                    <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                    Refresh
                  </button>
                )}
              </div>

              <div className="empty-state empty-state--center empty-state--dashboard">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100 mb-1">
                  <Award size={18} />
                </div>

                <div className="max-w-md mx-auto">
                  <h3 className="text-slate-950 font-bold text-[1rem] tracking-tight mb-1">
                    No rankings yet
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Verified contributors will appear here once the first civic reports are submitted and approved.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/report")}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 mt-2"
                >
                  <PlusCircle size={14} />
                  <span>Report Your First Issue</span>
                </button>
              </div>
            </section>

            {user ? (
              <div id="my-stats-card" className="card card--dashboard">
                <div
                  className="pb-3 mb-3 flex items-center justify-between gap-3"
                  style={{ borderBottom: "1px solid var(--color-divider)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                      <User size={15} />
                    </div>
                    <div>
                      <h2
                        className="font-bold"
                        style={{
                          fontSize: "0.95rem",
                          lineHeight: 1.1,
                          color: "var(--color-text)",
                        }}
                      >
                        My impact
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Your reporting activity and rank snapshot.
                      </p>
                    </div>
                  </div>

                  {personalStats && (
                    <span className="badge" style={{ ...personalStats.tierStyle, borderColor: "transparent" }}>
                      {personalStats.tier}
                    </span>
                  )}
                </div>

                {myStatsLoading ? (
                  <div id="my-stats-skeleton" className="space-y-3 animate-pulse py-1">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-12 h-6 bg-gray-200 rounded"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg flex flex-col gap-1">
                          <div className="w-8 h-4 bg-gray-200 rounded"></div>
                          <div className="w-12 h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full h-8 bg-gray-200 rounded mt-2"></div>
                  </div>
                ) : myStatsError ? (
                  <div id="my-stats-error" className="py-6 text-center">
                    <AlertTriangle className="text-red-500 mb-2 mx-auto" size={24} />
                    <p className="text-xs text-red-500 font-medium">
                      Failed to load personal stats
                    </p>
                  </div>
                ) : personalStats ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl flex items-center justify-between bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                          Rank
                        </p>
                        <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                          {personalStats.personalRank
                            ? `#${personalStats.personalRank}`
                            : "Unranked"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                          Impact Score
                        </p>
                        <p className="text-2xl font-black text-teal-700 mt-0.5 tracking-tight">
                          {personalStats.impactScore}{" "}
                          <span className="text-xs font-normal text-slate-400">pts</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                        <p className="text-xs text-slate-400 font-bold">Reported</p>
                        <p className="text-lg font-black text-slate-800 tracking-tight">
                          {personalStats.totalReported}
                        </p>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                        <p className="text-xs text-slate-400 font-bold">Validated</p>
                        <p className="text-lg font-black text-slate-800 tracking-tight">
                          {personalStats.totalValidated}
                        </p>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                        <p className="text-xs text-slate-400 font-bold">Resolved</p>
                        <p className="text-lg font-black text-slate-800 tracking-tight">
                          {personalStats.totalResolved}
                        </p>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                        <p className="text-xs text-red-500 font-bold">Critical / High</p>
                        <p className="text-lg font-black text-red-600 tracking-tight">
                          {personalStats.totalCritical}
                        </p>
                      </div>
                    </div>

                    {personalStats.escalationReady > 0 && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex justify-between items-center">
                        <p className="text-xs font-bold text-amber-800">Escalation Ready</p>
                        <p className="text-xs font-black text-amber-900">
                          {personalStats.escalationReady} issues
                        </p>
                      </div>
                    )}

                    <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-xl flex items-start gap-2.5">
                      <Info className="text-teal-600 mt-0.5 shrink-0" size={14} />
                      <p className="text-xs font-medium text-teal-800 leading-relaxed">
                        {personalStats.totalReported === 0
                          ? "Report your first civic issue to appear on the leaderboard."
                          : personalStats.totalReported < 5
                          ? "Keep reporting to climb the rankings."
                          : "Great work. Your reports are making a difference."}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div id="my-stats-promo-card" className="card card--dashboard">
                <div
                  className="pb-3 mb-3 flex items-center justify-between gap-3"
                  style={{ borderBottom: "1px solid var(--color-divider)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                      <Sparkles size={14} className="text-teal-600" />
                    </div>
                    <div>
                      <h2
                        className="font-bold"
                        style={{
                          fontSize: "0.95rem",
                          lineHeight: 1.1,
                          color: "var(--color-text)",
                        }}
                      >
                        Join the civic board
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Track your own reports and impact score.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sign in to log municipal issues, track active resolutions,
                    accumulate impact points, and claim civic badges.
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-100 shrink-0">
                        <FileText size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">5 Points</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Per verified civic issue report
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 border border-green-100 shrink-0">
                        <CheckCircle size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">10 Points</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Per resolved public hazard
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                        <Trophy size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          Contributor Tiers
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Bronze, Silver, Gold, Platinum badges
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/auth")}
                    className="btn btn-primary btn-block btn-sm flex items-center justify-center gap-2 mt-1"
                  >
                    <span>Sign In or Register</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
            <section className="min-w-0">
              <div id="rankings-card" className="card card--dashboard">
                <div
                  className="flex items-center justify-between gap-3 mb-3 pb-3"
                  style={{ borderBottom: "1px solid var(--color-divider)" }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ background: "rgba(221, 122, 31, 0.09)" }}
                    >
                      <Trophy className="text-amber-600" size={13} />
                    </div>

                    <div>
                      <h2
                        className="font-bold"
                        style={{
                          fontSize: "0.95rem",
                          lineHeight: 1.1,
                          color: "var(--color-text)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Full rankings
                      </h2>
                      <p
                        className="mt-0.5"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          lineHeight: 1.35,
                        }}
                      >
                        Top contributors ranked by verified impact score.
                      </p>
                    </div>
                  </div>

                  {!leaderboardLoading && !leaderboardError && leaderboardData.length > 0 && (
                    <button
                      id="refresh-leaderboard-btn"
                      onClick={handleRefresh}
                      className="btn btn-ghost btn-sm flex items-center gap-1.5"
                      title="Refresh rankings"
                    >
                      <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  )}
                </div>

                {leaderboardLoading ? (
                  <div id="rankings-skeleton" className="space-y-2 py-1">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 animate-pulse"
                        style={{ borderBottom: "1px solid var(--color-divider)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                            <div className="w-16 h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-3 bg-gray-200 rounded"></div>
                          <div className="w-14 h-5 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : leaderboardError ? (
                  <div
                    id="rankings-error"
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <AlertTriangle className="text-red-500 mb-3" size={28} />
                    <p className="text-gray-800 font-medium mb-1">Failed to load rankings</p>
                    <p className="text-sm text-gray-500 mb-4">{leaderboardError}</p>
                    <button
                      id="retry-leaderboard-btn"
                      onClick={handleRetry}
                      className="btn btn-primary btn-sm"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="empty-state empty-state--center empty-state--dashboard">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100 mb-1">
                      <Award size={18} />
                    </div>

                    <div className="max-w-md mx-auto">
                      <h3 className="text-slate-950 font-bold text-[1rem] tracking-tight mb-1">
                        No rankings yet
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Verified contributors will appear here once the first civic reports are submitted and approved.
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/report")}
                      className="btn btn-primary btn-sm flex items-center gap-1.5 mt-2"
                    >
                      <PlusCircle size={14} />
                      <span>Report Your First Issue</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topThree.length > 0 && (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                        aria-label="Top contributors"
                      >
                        {topThree.map((entry, index) => {
                          const rank = index + 1;
                          const initials = getInitials(entry.name);
                          const isCurrentUser = user && entry.user_id === user.uid;

                          return (
                            <div
                              key={entry.user_id}
                              className={`card card--compact ${
                                rank === 1 ? "border-amber-200" : ""
                              } ${isCurrentUser ? "bg-amber-50/30" : ""}`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className="badge text-[10px] px-2 py-1 font-bold flex items-center gap-1"
                                  style={{
                                    ...getTierBadgeStyle(getTierLabel(entry.impact_score)),
                                    borderColor: "transparent",
                                  }}
                                >
                                  {rank === 1 && <Sparkles size={10} className="text-amber-500" />}
                                  Rank #{rank}
                                </span>

                                {isCurrentUser && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center justify-center text-sm font-black w-9 h-9 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                                  {initials}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">
                                    {entry.name || "Anonymous"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {entry.issues_reported || 0} reports submitted
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-end justify-between gap-3 pt-2 border-t border-black/5">
                                <div>
                                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                                    Impact Score
                                  </p>
                                  <p className="text-xl font-black text-slate-900 leading-none mt-1">
                                    {entry.impact_score || 0}
                                  </p>
                                </div>

                                <span
                                  className="badge"
                                  style={{
                                    ...getTierBadgeStyle(getTierLabel(entry.impact_score)),
                                    textTransform: "uppercase",
                                    fontSize: "9px",
                                    padding: "0.22rem 0.5rem",
                                    borderColor: "transparent",
                                  }}
                                >
                                  {getTierLabel(entry.impact_score)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div id="rankings-table" className="overflow-x-auto mt-2">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                            style={{ borderBottom: "1px solid var(--color-divider)" }}
                          >
                            <th className="py-2.5 px-3">Rank</th>
                            <th className="py-2.5 px-3">Reporter</th>
                            <th className="py-2.5 px-3 hidden sm:table-cell">Reported</th>
                            <th className="py-2.5 px-3 hidden sm:table-cell">Resolved</th>
                            <th className="py-2.5 px-3">Tier</th>
                            <th className="py-2.5 px-3 text-right">Impact</th>
                          </tr>
                        </thead>

                        <tbody>
                          {leaderboardData.map((entry, index) => {
                            const rank = index + 1;
                            const initials = getInitials(entry.name);
                            const isCurrentUser = user && entry.user_id === user.uid;
                            const tier = getTierLabel(entry.impact_score);
                            const tierStyle = getTierBadgeStyle(tier);

                            return (
                              <tr
                                key={entry.user_id}
                                className={`transition-colors hover:bg-slate-50 ${
                                  isCurrentUser ? "bg-amber-50/30" : ""
                                }`}
                                style={{ borderBottom: "1px solid var(--color-divider)" }}
                              >
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`text-sm font-extrabold ${
                                      rank === 1
                                        ? "text-amber-500"
                                        : rank === 2
                                        ? "text-slate-400"
                                        : rank === 3
                                        ? "text-amber-700"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    #{rank}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="flex items-center justify-center text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200"
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "50%",
                                      }}
                                    >
                                      {initials}
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                      <span
                                        className={`text-sm truncate ${
                                          isCurrentUser
                                            ? "text-teal-800 font-bold"
                                            : "text-slate-800 font-medium"
                                        }`}
                                      >
                                        {entry.name || "Anonymous"}
                                      </span>

                                      {isCurrentUser && (
                                        <span className="inline-flex items-center text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded w-max mt-0.5">
                                          You
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-sm text-slate-500 font-medium hidden sm:table-cell">
                                  {entry.issues_reported || 0}
                                </td>

                                <td className="py-2.5 px-3 text-sm text-slate-500 font-medium hidden sm:table-cell">
                                  {entry.issues_resolved || 0}
                                </td>

                                <td className="py-2.5 px-3">
                                  <span
                                    className="badge"
                                    style={{
                                      ...tierStyle,
                                      padding: "0.22rem 0.48rem",
                                      fontSize: "9px",
                                      textTransform: "uppercase",
                                      borderColor: "transparent",
                                    }}
                                  >
                                    {tier}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3 text-right">
                                  <span className="text-sm font-black text-slate-900 tracking-tight">
                                    {formatLargeNumber(entry.impact_score)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="lg:sticky lg:top-[calc(var(--nav-height)+20px)] lg:self-start flex flex-col gap-4">
              {user ? (
                <div id="my-stats-card" className="card card--dashboard">
                  <div
                    className="pb-3 mb-3 flex items-center justify-between gap-3"
                    style={{ borderBottom: "1px solid var(--color-divider)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                        <User size={15} />
                      </div>
                      <div>
                        <h2
                          className="font-bold"
                          style={{
                            fontSize: "0.95rem",
                            lineHeight: 1.1,
                            color: "var(--color-text)",
                          }}
                        >
                          My impact
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Your reporting activity and rank snapshot.
                        </p>
                      </div>
                    </div>

                    {personalStats && (
                      <span className="badge" style={{ ...personalStats.tierStyle, borderColor: "transparent" }}>
                        {personalStats.tier}
                      </span>
                    )}
                  </div>

                  {myStatsLoading ? (
                    <div id="my-stats-skeleton" className="space-y-3 animate-pulse py-1">
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-12 h-6 bg-gray-200 rounded"></div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg flex flex-col gap-1">
                            <div className="w-8 h-4 bg-gray-200 rounded"></div>
                            <div className="w-12 h-3 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>

                      <div className="w-full h-8 bg-gray-200 rounded mt-2"></div>
                    </div>
                  ) : myStatsError ? (
                    <div id="my-stats-error" className="py-6 text-center">
                      <AlertTriangle className="text-red-500 mb-2 mx-auto" size={24} />
                      <p className="text-xs text-red-500 font-medium">
                        Failed to load personal stats
                      </p>
                    </div>
                  ) : personalStats ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl flex items-center justify-between bg-slate-50 border border-slate-200">
                        <div>
                          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                            Rank
                          </p>
                          <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                            {personalStats.personalRank
                              ? `#${personalStats.personalRank}`
                              : "Unranked"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                            Impact Score
                          </p>
                          <p className="text-2xl font-black text-teal-700 mt-0.5 tracking-tight">
                            {personalStats.impactScore}{" "}
                            <span className="text-xs font-normal text-slate-400">pts</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                          <p className="text-xs text-slate-400 font-bold">Reported</p>
                          <p className="text-lg font-black text-slate-800 tracking-tight">
                            {personalStats.totalReported}
                          </p>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                          <p className="text-xs text-slate-400 font-bold">Validated</p>
                          <p className="text-lg font-black text-slate-800 tracking-tight">
                            {personalStats.totalValidated}
                          </p>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                          <p className="text-xs text-slate-400 font-bold">Resolved</p>
                          <p className="text-lg font-black text-slate-800 tracking-tight">
                            {personalStats.totalResolved}
                          </p>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1">
                          <p className="text-xs text-red-500 font-bold">Critical / High</p>
                          <p className="text-lg font-black text-red-600 tracking-tight">
                            {personalStats.totalCritical}
                          </p>
                        </div>
                      </div>

                      {personalStats.escalationReady > 0 && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex justify-between items-center">
                          <p className="text-xs font-bold text-amber-800">Escalation Ready</p>
                          <p className="text-xs font-black text-amber-900">
                            {personalStats.escalationReady} issues
                          </p>
                        </div>
                      )}

                      <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-xl flex items-start gap-2.5">
                        <Info className="text-teal-600 mt-0.5 shrink-0" size={14} />
                        <p className="text-xs font-medium text-teal-800 leading-relaxed">
                          {personalStats.totalReported === 0
                            ? "Report your first civic issue to appear on the leaderboard."
                            : personalStats.totalReported < 5
                            ? "Keep reporting to climb the rankings."
                            : "Great work. Your reports are making a difference."}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div id="my-stats-promo-card" className="card card--dashboard">
                  <div
                    className="pb-3 mb-3 flex items-center justify-between gap-3"
                    style={{ borderBottom: "1px solid var(--color-divider)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                        <Sparkles size={14} className="text-teal-600" />
                      </div>
                      <div>
                        <h2
                          className="font-bold"
                          style={{
                            fontSize: "0.95rem",
                            lineHeight: 1.1,
                            color: "var(--color-text)",
                          }}
                        >
                          Join the civic board
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Track your own reports and impact score.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sign in to log municipal issues, track active resolutions, accumulate impact points, and claim civic badges.
                    </p>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-100 shrink-0">
                          <FileText size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">5 Points</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Per verified civic issue report
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 border border-green-100 shrink-0">
                          <CheckCircle size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">10 Points</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Per resolved public hazard
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                          <Trophy size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">
                            Contributor Tiers
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Bronze, Silver, Gold, Platinum badges
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/auth")}
                      className="btn btn-primary btn-block btn-sm flex items-center justify-center gap-2 mt-1"
                    >
                      <span>Sign In or Register</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
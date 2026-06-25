import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useAppStore } from "../store/appStore";
import { listRecentIssues, getLeaderboardTop } from "../services/firestoreService";
import { signOutUser } from "../services/authService";
import {
  Mail,
  Calendar,
  Award,
  MapPin,
  FileText,
  CheckCircle,
  AlertOctagon,
  Clock,
  LogOut,
  ChevronRight,
  RotateCw,
  Trophy,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAppStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (isRef = false) => {
    if (isRef) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const issuesRes = await listRecentIssues({ maxResults: 100 });
      if (issuesRes.ok) {
        const userIssues = (issuesRes.data || []).filter(
          (issue) => issue.reporter_uid === user?.uid
        );
        setMyIssues(userIssues);
      } else {
        setError(issuesRes.error || "Failed to fetch user issues.");
      }

      const leaderboardRes = await getLeaderboardTop(50);
      if (leaderboardRes.ok) {
        setLeaderboard(leaderboardRes.data || []);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred loading your profile.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.ok) {
      navigate("/");
    }
  };

  const getInitials = () => {
    if (!user) return "U";
    if (user.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  const stats = useMemo(() => {
    const totalReported = myIssues.length;
    const totalResolved = myIssues.filter(
      (i) => i.status?.toLowerCase() === "resolved"
    ).length;
    const totalValidated = myIssues.filter((i) =>
      ["validated", "escalated", "resolved"].includes(i.status?.toLowerCase())
    ).length;

    const now = Date.now();
    const escalationReady = myIssues.filter((i) => {
      const isPendingOrVal = ["pending", "validated", "escalated"].includes(
        i.status?.toLowerCase()
      );
      const isPastEscalation = i.escalate_after && i.escalate_after <= now;
      return isPendingOrVal && isPastEscalation;
    }).length;

    const impactScore = totalReported * 5 + totalResolved * 10;

    const userRankIndex = leaderboard.findIndex(
      (entry) => entry.reporter_uid === user?.uid
    );
    const leaderboardRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

    return {
      totalReported,
      totalResolved,
      totalValidated,
      escalationReady,
      impactScore,
      leaderboardRank,
    };
  }, [myIssues, leaderboard, user]);

  const tier = useMemo(() => {
    const score = stats.impactScore;
    if (score >= 100)
      return {
        name: "Platinum",
        color: "text-purple-600 bg-purple-50 border-purple-200",
        iconColor: "#9333ea",
      };
    if (score >= 50)
      return {
        name: "Gold",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        iconColor: "#d97706",
      };
    if (score >= 20)
      return {
        name: "Silver",
        color: "text-slate-600 bg-slate-50 border-slate-200",
        iconColor: "#475569",
      };
    return {
      name: "Bronze",
      color: "text-orange-600 bg-orange-50 border-orange-200",
      iconColor: "#ea580c",
    };
  }, [stats.impactScore]);

  return (
    <PageLayout>
      <div className="bg-[#fcfbfa] py-5 md:py-6 font-sans text-slate-800">
        <div className="max-w-[1120px] mx-auto px-4 md:px-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">
                Citizen Account
              </span>
              <h1 className="text-[clamp(2rem,1.7rem+1vw,2.8rem)] font-black tracking-tight text-slate-900 mt-1.5 leading-none">
                My Civic Profile
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="btn btn-outline btn-sm flex items-center gap-2 border-slate-300 hover:bg-slate-50 text-slate-600 min-h-[36px]"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm text-slate-700 flex items-center gap-2 min-h-[36px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
            <aside className="space-y-5">
              <div className="card">
                <div className="flex flex-col items-center text-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User Avatar"}
                      className="w-20 h-20 rounded-full object-cover border-4 border-teal-500/20 mb-3 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center text-3xl font-bold border-4 border-teal-500/20 mb-3 shadow-sm">
                      {getInitials()}
                    </div>
                  )}

                  <h2 className="text-[1.05rem] font-black text-slate-900 truncate max-w-full">
                    {user?.displayName || "Nagar Citizen"}
                  </h2>

                  <p className="text-sm text-slate-500 font-mono flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user?.email}</span>
                  </p>

                  <div className="mt-3 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reporter UID: {user?.uid?.slice(0, 8)}...</span>
                  </div>

                  <div className="w-full border-t border-slate-100 my-4" />

                  <div className="w-full flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500 font-medium">
                      Civic Standing
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-bold border rounded-full flex items-center gap-1 ${tier.color}`}
                    >
                      <Award className="w-3.5 h-3.5" style={{ color: tier.iconColor }} />
                      {tier.name}
                    </span>
                  </div>

                  <div className="w-full mt-3 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((stats.impactScore / 120) * 100, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="w-full flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>{stats.impactScore} XP</span>
                    <span>Next level at 120 XP</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-[0.98rem] font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-amber-500" />
                  <span>Leaderboard standing</span>
                </h3>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/60">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      City Rank
                    </p>
                    <p className="text-2xl font-black text-slate-800 leading-none mt-1">
                      {stats.leaderboardRank ? `#${stats.leaderboardRank}` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-teal-600" />
                      <span>Reporter Points</span>
                    </span>
                    <span className="font-bold text-slate-800">{stats.impactScore} pts</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Points per Report</span>
                    </span>
                    <span className="font-semibold text-slate-600">+5 pts</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>Points per Resolved issue</span>
                    </span>
                    <span className="font-semibold text-slate-600">+10 pts</span>
                  </div>
                </div>

                <Link
                  to="/leaderboard"
                  className="mt-4 w-full btn btn-outline btn-sm flex items-center justify-center gap-2 text-teal-700 border-teal-200 hover:bg-teal-50"
                >
                  <span>View Leaderboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>

            <section className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="card card--compact-dashboard text-left">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Reported
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                    {stats.totalReported}
                  </p>
                </div>

                <div className="card card--compact-dashboard text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Validated
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                    {stats.totalValidated}
                  </p>
                </div>

                <div className="card card--compact-dashboard text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Resolved
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                    {stats.totalResolved}
                  </p>
                </div>

                <div className="card card--compact-dashboard text-left">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Escalation Ready
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                    {stats.escalationReady}
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-[1rem] font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-teal-600" />
                    <span>My reported complaints</span>
                  </h3>
                  <span className="text-[11px] font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-500">
                    {stats.totalReported} entries
                  </span>
                </div>

                {loading ? (
                  <div className="py-10 flex flex-col items-center justify-center gap-3">
                    <RotateCw className="w-7 h-7 text-teal-600 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">
                      Retrieving activity timeline...
                    </p>
                  </div>
                ) : myIssues.length === 0 ? (
                  <div className="empty-state empty-state--center empty-state--dashboard py-8">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-1">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[0.98rem]">
                      No complaints reported yet
                    </h4>
                    <p className="text-sm text-slate-400 mt-1 mb-2 max-w-[34rem]">
                      Submit your first hyperlocal issue report and contribute to Pune's
                      development.
                    </p>
                    <Link to="/report" className="btn btn-primary btn-sm">
                      Report an Issue
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
                    {myIssues.map((issue) => {
                      const urgency = issue.urgency_label?.toLowerCase() || "low";
                      const status = issue.status?.toLowerCase() || "pending";

                      let urgencyBadgeClass = "badge-low";
                      if (urgency === "critical") urgencyBadgeClass = "badge-critical";
                      else if (urgency === "high") urgencyBadgeClass = "badge-high";
                      else if (urgency === "medium") urgencyBadgeClass = "badge-medium";

                      let statusBadgeClass = "badge-pending";
                      if (status === "validated") statusBadgeClass = "badge-resolved";
                      else if (status === "escalated") statusBadgeClass = "badge-warning";
                      else if (status === "resolved") statusBadgeClass = "badge-success";

                      const formattedDate = issue.created_at
                        ? new Date(issue.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A";

                      return (
                        <div
                          key={issue.id}
                          className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`badge ${urgencyBadgeClass} text-[10px] px-2 py-0.5 uppercase`}
                              >
                                {issue.urgency_label || "Low"} Priority
                              </span>
                              <span
                                className={`badge ${statusBadgeClass} text-[10px] px-2 py-0.5 uppercase`}
                              >
                                {issue.status || "Pending"}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {formattedDate}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-800 truncate mt-1.5">
                              {issue.title || issue.issue_type || "Civic Complaint"}
                            </h4>

                            <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-slate-300" />
                              <span className="truncate">
                                {issue.formatted_address || "Pune, Maharashtra"}
                              </span>
                            </p>
                          </div>

                          <Link
                            to={`/issue/${issue.id}`}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            title="View timeline & logs"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
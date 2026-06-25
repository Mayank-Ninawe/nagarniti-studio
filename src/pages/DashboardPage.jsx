import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { listRecentIssues, listRecentMapIssues } from "../services";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  Compass,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Flame,
  TrendingUp,
  Clock,
  X,
  ExternalLink,
  Loader2,
  Inbox,
  AlertOctagon,
  Calendar,
  CloudLightning,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();

  // Data States
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState(null);
  const [issuesData, setIssuesData] = useState([]);

  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [mapData, setMapData] = useState([]);

  // Selection & UI controllers
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Issue List data (filtered by status at Firestore query level if needed)
  const loadIssueList = async () => {
    setIssuesLoading(true);
    setIssuesError(null);
    try {
      const result = await listRecentIssues({
        maxResults: 30,
        status: statusFilter === "all" ? null : statusFilter
      });
      if (result.ok) {
        setIssuesData(result.data || []);
      } else {
        setIssuesError(result.error || "Failed to fetch issues list");
      }
    } catch (err) {
      setIssuesError(err.message || "An unexpected error occurred loading issues");
    } finally {
      setIssuesLoading(false);
    }
  };

  // Load Map lightweight markers
  const loadMapIssues = async () => {
    setMapLoading(true);
    setMapError(null);
    try {
      const result = await listRecentMapIssues({
        maxResults: 150
      });
      if (result.ok) {
        setMapData(result.data || []);
      } else {
        setMapError(result.error || "Failed to fetch map data");
      }
    } catch (err) {
      setMapError(err.message || "An unexpected error occurred loading map coordinates");
    } finally {
      setMapLoading(false);
    }
  };

  // Load everything on mount, and reload issues on status filter change
  useEffect(() => {
    loadIssueList();
  }, [statusFilter]);

  useEffect(() => {
    loadMapIssues();
  }, []);

  const handleManualRefresh = () => {
    loadIssueList();
    loadMapIssues();
  };

  // KPI Calculations using useMemo
  const kpis = useMemo(() => {
    const list = issuesData || [];
    const now = Date.now();
    let criticalCount = 0;
    let validatedCount = 0;
    let escalationReadyCount = 0;

    list.forEach((issue) => {
      const label = issue.urgency_label?.toLowerCase() || "";
      const status = issue.status?.toLowerCase() || "";
      
      if (label === "critical") criticalCount++;
      if (status === "validated" || status === "escalated" || status === "resolved") {
        validatedCount++;
      }
      
      const escalateAfter = issue.escalate_after;
      if (escalateAfter && escalateAfter <= now && status !== "resolved") {
        escalationReadyCount++;
      }
    });

    return {
      total: list.length,
      critical: criticalCount,
      validated: validatedCount,
      escalationReady: escalationReadyCount
    };
  }, [issuesData]);

  // Client side filters over loaded lists
  const filteredIssues = useMemo(() => {
    return issuesData.filter((issue) => {
      // 1. Urgency level filter
      if (urgencyFilter !== "all" && issue.urgency_label?.toLowerCase() !== urgencyFilter.toLowerCase()) {
        return false;
      }

      // 2. Search query matching
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        const type = formatIssueType(issue.issue_type).toLowerCase();
        const desc = (issue.description || "").toLowerCase();
        const address = (issue.address || "").toLowerCase();
        const city = (issue.city || "").toLowerCase();

        if (
          !type.includes(query) &&
          !desc.includes(query) &&
          !address.includes(query) &&
          !city.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [issuesData, urgencyFilter, debouncedSearchQuery]);

  // Client side filters over map data (urgency & status filters + query matches if fields exist)
  const filteredMapIssues = useMemo(() => {
    return mapData.filter((issue) => {
      // 1. Status Filter
      if (statusFilter !== "all" && issue.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // 2. Urgency Level Filter
      if (urgencyFilter !== "all" && issue.urgency_label?.toLowerCase() !== urgencyFilter.toLowerCase()) {
        return false;
      }

      // 3. Search query match (on limited fields returnable for maps)
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        const type = formatIssueType(issue.issue_type).toLowerCase();
        const statusText = (issue.status || "").toLowerCase();

        if (!type.includes(query) && !statusText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [mapData, statusFilter, urgencyFilter, debouncedSearchQuery]);

  // Lightweight Clustering coordinates regrouping (~110 meters precision)
  const groupedMarkers = useMemo(() => {
    const groups = {};

    filteredMapIssues.forEach((issue) => {
      const latVal = Number(issue.lat);
      const lngVal = Number(issue.lng);

      if (isNaN(latVal) || isNaN(lngVal) || latVal === 0 || lngVal === 0) {
        return; // Skip issues with invalid coordinates
      }

      // Group key using 3 decimal places accuracy
      const key = `${latVal.toFixed(3)}_${lngVal.toFixed(3)}`;

      if (!groups[key]) {
        groups[key] = {
          lat: latVal,
          lng: lngVal,
          issues: []
        };
      }

      groups[key].issues.push(issue);
    });

    return Object.values(groups);
  }, [filteredMapIssues]);

  // Helper formatting values
  function formatIssueType(val) {
    if (!val) return "Unknown Issue";
    return val
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatTimestamp(ts) {
    if (!ts) return "N/A";
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getUrgencyBadgeClass(label) {
    const l = label?.toLowerCase() || "";
    switch (l) {
      case "critical":
        return "bg-red-100 text-red-800 border border-red-200 font-bold";
      case "high":
        return "bg-orange-100 text-orange-850 border border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-850 border border-yellow-250";
      case "low":
      default:
        return "bg-green-100 text-green-800 border border-green-200";
    }
  }

  function getStatusBadgeClass(status) {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "resolved":
        return "bg-emerald-100 text-emerald-850 border border-emerald-200";
      case "escalated":
        return "bg-red-50 text-red-700 border border-red-200 font-semibold animate-pulse";
      case "validated":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border border-amber-250";
    }
  }

  const getUrgencyMarker = (issue) => {
    const urgency = issue.urgency_label?.toLowerCase() || "default";
    let color = "#3b82f6"; // Blue
    
    if (urgency === "critical") {
      color = "#dc2626"; // Red
    } else if (urgency === "high") {
      color = "#ea580c"; // Orange
    } else if (urgency === "medium") {
      color = "#ca8a04"; // Gold
    } else if (urgency === "low") {
      color = "#16a34a"; // Green
    }

    return L.divIcon({
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 5px; height: 5px; border-radius: 50%; background: white;"></div>
          </div>
          <div style="
            position: absolute;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid ${color};
            opacity: 0.5;
          " class="ping-pulse"></div>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  const getClusterIcon = (count) => {
    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-primary, #0a6e6b);
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          font-weight: bold;
        ">
          ${count}
        </div>
      `,
      className: "custom-cluster-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  return (
    <PageLayout>
      {/* Scoped CSS Injector for circular pin ripple */}
      <style>{`
        @keyframes ping-animate {
          0% { transform: scale(0.6); opacity: 0.8; }
          15% { opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .ping-pulse {
          animation: ping-animate 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: var(--radius-lg);
          font-family: var(--font-body), sans-serif;
          box-shadow: var(--shadow-md);
        }
      `}</style>

      <div className="container--default" style={{ padding: "var(--space-8) var(--space-4)" }}>
        
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading" style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-1)" }}>
              Civic Issue Dashboard
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
              Track recent citizen reports, sequential agent outcomes, and escalation deadlines.
            </p>
          </div>
          <button
            onClick={() => navigate("/report")}
            className="btn btn-primary btn-sm flex items-center shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Report New Issue
          </button>
        </div>

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div className="flex justify-between items-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Recent Reports</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            {issuesLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-2"></div>
            ) : (
              <p className="font-heading font-extrabold mt-1 text-gray-900" style={{ fontSize: "var(--text-xl)" }}>
                {kpis.total}
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">Queried from local district</p>
          </div>

          <div className="card" style={{ padding: "var(--space-4)", borderLeft: "4px solid var(--color-error, #c0392b)" }}>
            <div className="flex justify-between items-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Critical Hazards</span>
              <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            {issuesLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-2"></div>
            ) : (
              <p className="font-heading font-extrabold mt-1 text-red-600" style={{ fontSize: "var(--text-xl)" }}>
                {kpis.critical}
              </p>
            )}
            <p className="text-[10px] text-red-500 mt-1 font-semibold">Immediate action required</p>
          </div>

          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div className="flex justify-between items-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Verified Cases</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            {issuesLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-2"></div>
            ) : (
              <p className="font-heading font-extrabold mt-1 text-emerald-600" style={{ fontSize: "var(--text-xl)" }}>
                {kpis.validated}
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">Confirmed by validation agents</p>
          </div>

          <div className="card" style={{ padding: "var(--space-4)", borderLeft: "4px solid var(--color-saffron, #e07a1a)" }}>
            <div className="flex justify-between items-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Escalation Ready</span>
              <Clock className="w-4 h-4 text-amber-500 animate-spin-slow" />
            </div>
            {issuesLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-2"></div>
            ) : (
              <p className="font-heading font-extrabold mt-1 text-amber-600" style={{ fontSize: "var(--text-xl)" }}>
                {kpis.escalationReady}
              </p>
            )}
            <p className="text-[10px] text-amber-600 mt-1 font-semibold">Past escalation window</p>
          </div>

        </div>

        {/* Filter Strip */}
        <div className="card mb-8" style={{ padding: "var(--space-4)" }}>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by type, district landmark, or description..."
                style={{ paddingLeft: "var(--space-8)" }}
                className="form-input text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selection Selects & Refresh button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Status
                </span>
                <select
                  className="form-input text-xs"
                  style={{ minWidth: "120px", padding: "4px 8px" }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="validated">Validated</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Urgency
                </span>
                <select
                  className="form-input text-xs"
                  style={{ minWidth: "120px", padding: "4px 8px" }}
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="all">All Urgency</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <button
                onClick={handleManualRefresh}
                className="btn btn-outline btn-sm p-2 flex items-center justify-center cursor-pointer"
                style={{ minHeight: "34px", width: "34px" }}
                title="Refresh from cloud DB"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Map (takes 8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="card h-full flex flex-col" style={{ padding: 0 }}>
              
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <span className="font-sans font-bold" style={{ fontSize: "var(--text-md)" }}>Live District Hazard Map</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    Showing {filteredMapIssues.length} locations
                  </span>
                </div>
              </div>

              {/* Map Canvas viewport */}
              <div
                style={{
                  height: "560px",
                  borderRadius: "0 0 var(--radius-xl) var(--radius-xl)",
                  overflow: "hidden",
                  width: "100%",
                  position: "relative",
                  background: "var(--color-surface-2)"
                }}
              >
                {mapLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 gap-3 z-20">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-semibold text-gray-500">Loading geospatial marker matrices...</p>
                  </div>
                ) : mapError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6 text-center gap-4 z-20">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                    <div>
                      <h4 className="font-bold text-red-900">Map Loading Breakdown</h4>
                      <p className="text-xs text-red-700 mt-1 max-w-sm">{mapError}</p>
                    </div>
                    <button onClick={loadMapIssues} className="btn btn-primary btn-sm flex items-center">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Coordinates
                    </button>
                  </div>
                ) : filteredMapIssues.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 p-6 text-center gap-3 z-20">
                    <Inbox className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">No issues match current filter metrics.</p>
                  </div>
                ) : (
                  <MapContainer
                    center={[18.5204, 73.8567]}
                    zoom={12}
                    zoomControl={true}
                    className="h-full w-full"
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {groupedMarkers.map((group, idx) => {
                      if (group.issues.length === 1) {
                        const singleIssue = group.issues[0];
                        return (
                          <Marker
                            key={singleIssue.id || `single-${idx}`}
                            position={[group.lat, group.lng]}
                            icon={getUrgencyMarker(singleIssue)}
                          >
                            <Popup className="custom-popup">
                              <div style={{ minWidth: "180px", padding: "1px" }}>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <span className="font-sans font-bold text-gray-800 leading-tight block">
                                    {formatIssueType(singleIssue.issue_type)}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 mb-2.5">
                                  <span className={`badge text-[9px] uppercase px-1.5 py-0.5 ${getUrgencyBadgeClass(singleIssue.urgency_label)}`}>
                                    {singleIssue.urgency_label || "Unknown"}
                                  </span>
                                  <span className={`badge text-[9px] uppercase px-1.5 py-0.5 ${getStatusBadgeClass(singleIssue.status)}`}>
                                    {singleIssue.status || "Pending"}
                                  </span>
                                </div>
                                <div className="border-t border-gray-150 pt-2 flex justify-between items-center text-xs">
                                  <span className="text-gray-400 font-mono text-[10px]">
                                    {formatTimestamp(singleIssue.created_at)}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedIssueId(singleIssue.id);
                                      navigate(`/issue/${singleIssue.id}`);
                                    }}
                                    className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5 border-none bg-none p-0 cursor-pointer"
                                  >
                                    View file <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      } else {
                        // Render Lightweight Cluster Marker
                        return (
                          <Marker
                            key={`cluster-${idx}`}
                            position={[group.lat, group.lng]}
                            icon={getClusterIcon(group.issues.length)}
                          >
                            <Popup className="custom-popup">
                              <div style={{ minWidth: "220px" }}>
                                <h4 className="font-bold border-b pb-1.5 mb-2 text-sm flex justify-between items-center" style={{ color: "var(--color-primary)" }}>
                                  <span>Cluster Junction</span>
                                  <span className="bg-teal-50 text-teal-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                                    {group.issues.length} Hazards
                                  </span>
                                </h4>
                                <div className="flex flex-col gap-2.5" style={{ maxHeight: "160px", overflowY: "auto", paddingRight: "4px" }}>
                                  {group.issues.slice(0, 5).map((iss) => (
                                    <div key={iss.id} className="text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                      <div className="font-semibold flex justify-between gap-2 text-gray-800">
                                        <span className="truncate max-w-[124px]" title={formatIssueType(iss.issue_type)}>
                                          {formatIssueType(iss.issue_type)}
                                        </span>
                                        <span className="text-[9px] text-gray-400 uppercase font-mono tracking-tight flex-shrink-0 mt-0.5">
                                          {iss.urgency_label}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-gray-500 flex justify-between mt-1">
                                        <span className="capitalize">{iss.status}</span>
                                        <button
                                          onClick={() => {
                                            setSelectedIssueId(iss.id);
                                            navigate(`/issue/${iss.id}`);
                                          }}
                                          style={{ color: "var(--color-primary)", textDecoration: "underline", border: "none", background: "none", padding: 0, cursor: "pointer" }}
                                        >
                                          Open Detail
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {group.issues.length > 5 && (
                                    <div className="text-[10px] text-gray-400 italic text-center mt-1">
                                      + {group.issues.length - 5} additional reports in proximity
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      }
                    })}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Recent reports Sidebar (takes 4 cols on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="card max-h-[630px] flex flex-col" style={{ padding: 0 }}>
              
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="font-sans font-bold" style={{ fontSize: "var(--text-md)" }}>Recent Reports</h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {filteredIssues.length} listed
                </span>
              </div>

              {/* Scrollable list card content */}
              <div
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
                style={{
                  maxHeight: "560px",
                  background: "var(--color-surface-2)"
                }}
              >
                {issuesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-150 animate-pulse flex flex-col gap-3">
                      <div className="flex justify-between">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                      <div className="flex justify-between mt-2 pt-2 border-t">
                        <div className="h-2.5 w-16 bg-gray-100 rounded"></div>
                        <div className="h-2.5 w-10 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : issuesError ? (
                  <div className="bg-red-50 text-red-900 border border-red-200 p-4 rounded-xl text-center flex flex-col gap-3">
                    <AlertCircle className="w-8 h-8 text-red-550 mx-auto" />
                    <div>
                      <h4 className="font-semibold text-xs text-red-950">Query Failed</h4>
                      <p className="text-[11px] text-red-700 mt-1">{issuesError}</p>
                    </div>
                    <button onClick={loadIssueList} className="btn btn-outline btn-sm justify-center">
                      Retry Loading
                    </button>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-white border border-gray-150 rounded-xl flex flex-col gap-3">
                    <Inbox className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-xs font-semibold">No recent reports found.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const isSelected = selectedIssueId === issue.id;
                    const isEscalatedReady =
                      issue.escalate_after &&
                      issue.escalate_after <= Date.now() &&
                      issue.status !== "resolved";

                    return (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="bg-white p-4 rounded-xl border transition-all duration-150 cursor-pointer hover:shadow-md hover:border-gray-300 flex flex-col gap-2 relative"
                        style={{
                          border: isSelected
                            ? "2px solid var(--color-primary, #0a6e6b)"
                            : "1px solid var(--color-border)",
                          boxShadow: isSelected ? "var(--shadow-md)" : "none"
                        }}
                      >
                        {/* Title block */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-sans font-bold leading-tight text-gray-900 text-sm">
                            {formatIssueType(issue.issue_type)}
                          </h4>
                          {isEscalatedReady && (
                            <span
                              className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-800 border-red-200 flex items-center gap-0.5"
                              title="Pending past escalate threshold"
                            >
                              <ShieldAlert className="w-2.5 h-2.5 animate-pulse" /> Ready
                            </span>
                          )}
                        </div>

                        {/* Location address */}
                        <p className="text-xs text-gray-500 font-medium">
                          {issue.address ? `${issue.address}, ` : ""} {issue.city || "Pune"}
                        </p>

                        {/* supplemental user description snippet */}
                        {issue.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed bg-gray-50 p-2 rounded">
                            "{issue.description}"
                          </p>
                        )}

                        {/* Badges Strip */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className={`badge text-[9px] uppercase px-2 py-0.5 ${getUrgencyBadgeClass(issue.urgency_label)}`}>
                            {issue.urgency_label || "low"}
                          </span>
                          <span className={`badge text-[9px] uppercase px-2 py-0.5 ${getStatusBadgeClass(issue.status)}`}>
                            {issue.status || "pending"}
                          </span>
                        </div>

                        {/* Footer bottom metadata */}
                        <div className="divider" style={{ margin: "var(--space-2) 0" }}></div>

                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTimestamp(issue.created_at)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/issue/${issue.id}`);
                            }}
                            className="text-indigo-650 hover:text-indigo-850 hover:underline flex items-center gap-0.5 font-bold border-none bg-none p-0 cursor-pointer"
                          >
                            Open detail <ExternalLink className="w-3 h-3 ml-0.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}

const steps = [
  { number: 1, label: "Report Details" },
  { number: 2, label: "Processing Logs" },
  { number: 3, label: "Completed Review" }
];

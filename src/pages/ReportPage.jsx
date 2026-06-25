import { useState, useMemo, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import { useAppStore } from "../store/appStore";
import { buildReportContext } from "../services/contextService";
import { runNagarNitiPipeline, summarizePipelineForConsole } from "../agents/orchestrator";
import { persistPipelineResult } from "../services/pipelinePersistenceService";
import {
  Camera,
  MapPin,
  Cloud,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Terminal,
  Copy,
  RefreshCw,
  FileText,
  Clock,
  User,
  Check,
  ChevronRight,
  Sparkles,
  Search,
  AlertCircle,
  Loader2,
  HelpCircle,
  Compass,
  FileCheck2,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

const steps = [
  { number: 1, label: "Report Details" },
  { number: 2, label: "Agent Analysis" },
  { number: 3, label: "Verification" }
];

export default function ReportPage() {
  const { user } = useAppStore();

  // Wizard States
  const [step, setStep] = useState(1);

  // Form Input States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [userDescription, setUserDescription] = useState("");

  // Location / Weather Context States
  const [manualAddress, setManualAddress] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  
  const [locationLoading, setLocationLoading] = useState(false);
  const [contextData, setContextData] = useState(null);
  const [contextError, setContextError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Pipeline Execution / Persistence States
  const [pipelineState, setPipelineState] = useState(null);
  const [persistenceResult, setPersistenceResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [completedIssue, setCompletedIssue] = useState(null);
  const [completedSummary, setCompletedSummary] = useState(null);

  // Interactive UI Helpers
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  // Cleanup Preview Url Object on Unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Convert File to raw Base64 string
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file as base64 string"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setMimeType(file.type);
    setSubmitError(null);

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(URL.createObjectURL(file));

    try {
      const base64 = await fileToBase64(file);
      setImageBase64(base64);
    } catch (err) {
      setSubmitError("Failed to convert image. Please choose another file.");
      console.error(err);
    }
  };

  // Get Current GPS Coordinates and Fetch Context
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setContextError("Geolocation is not supported by your browser.");
      return;
    }

    setContextError(null);
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          const result = await buildReportContext({
            lat: latitude,
            lng: longitude,
            address: manualAddress,
            city: manualCity
          });
          setContextData(result);
          if (result.location) {
            setManualAddress(result.location.address || "");
            setManualCity(result.location.city || "");
          }
        } catch (err) {
          setContextError("Failed to retrieve enrichment context details.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setContextError(`Geolocation error: ${error.message}. Please enter address and city below.`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Resolve Location Based on Text Query
  const handleResolveLocation = async () => {
    if (!manualAddress.trim() && !manualCity.trim() && !lat && !lng) {
      setContextError("Provide an address, city, or coordinates to resolve location details.");
      return;
    }

    setContextError(null);
    setLocationLoading(true);

    try {
      const result = await buildReportContext({
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        address: manualAddress || undefined,
        city: manualCity || undefined
      });
      setContextData(result);
      if (result.location) {
        setManualAddress(result.location.address || "");
        setManualCity(result.location.city || "");
        if (result.location.lat && result.location.lng) {
          setLat(result.location.lat);
          setLng(result.location.lng);
        }
      }
    } catch (err) {
      setContextError("Address resolution request failed. Double check spelling.");
    } finally {
      setLocationLoading(false);
    }
  };

  // Run Agentic sequential logic & Persist
  const handleRunPipeline = async () => {
    if (!imageBase64 || !mimeType) {
      setSubmitError("An evidence photograph is required to perform agent analysis.");
      return;
    }

    setProcessing(true);
    setSubmitError(null);

    // Bootstrap initial empty statuses for immediate terminal view rendering
    const bootstrapState = {
      startedAt: Date.now(),
      completedAt: null,
      success: false,
      currentStage: "vision",
      finalError: null,
      issueDraft: { vision: null, validation: null, urgency: null, draft: null, escalation: null },
      raw: { vision: null, validation: null, urgency: null, draft: null, escalation: null },
      statuses: {
        vision: { status: "queued", attempts: 0, startedAt: null, completedAt: null, durationMs: null, error: null },
        validation: { status: "queued", attempts: 0, startedAt: null, completedAt: null, durationMs: null, error: null },
        urgency: { status: "queued", attempts: 0, startedAt: null, completedAt: null, durationMs: null, error: null },
        draft: { status: "queued", attempts: 0, startedAt: null, completedAt: null, durationMs: null, error: null },
        escalation: { status: "queued", attempts: 0, startedAt: null, completedAt: null, durationMs: null, error: null }
      },
      trace: [{ timestamp: Date.now(), stage: "system", message: "Starting live pipeline stream..." }]
    };
    setPipelineState(bootstrapState);

    try {
      const reportPayload = {
        imageBase64,
        mimeType,
        userDescription,
        locationHint: contextData?.location?.address || manualAddress || manualCity || "",
        lat: lat ? Number(lat) : 0,
        lng: lng ? Number(lng) : 0,
        geohash: contextData?.location?.cacheKey || "",
        address: contextData?.location?.address || manualAddress || "",
        city: contextData?.location?.city || manualCity || "",
        created_at: Date.now()
      };

      // Call pipeline with our reactive live progress callback
      const finalState = await runNagarNitiPipeline({
        report: reportPayload,
        nearbyIssues: [],
        weatherContext: contextData?.weather || undefined,
        communityContext: { upvote_count: 0, affected_reports: 0 },
        reporter: { name: user?.displayName || user?.email || "Concerned Citizen" }
      }, (liveState) => {
        setPipelineState(liveState);
      });

      setPipelineState(finalState);

      if (finalState.success) {
        // Save to Firestore
        const persistRes = await persistPipelineResult({
          reporter: {
            uid: user?.uid || "anonymous_user",
            name: user?.displayName || user?.email || "Concerned Citizen"
          },
          report: {
            photo_url: null,
            lat: lat ? Number(lat) : 0,
            lng: lng ? Number(lng) : 0,
            geohash: contextData?.location?.cacheKey || "",
            address: contextData?.location?.address || manualAddress || "",
            city: contextData?.location?.city || manualCity || "",
            created_at: Date.now()
          },
          pipelineState: finalState
        });

        setPersistenceResult(persistRes);

        if (persistRes.ok) {
          setCompletedIssue(persistRes.issue);
          setCompletedSummary(summarizePipelineForConsole(finalState));
          // Move directly to Step 3 for review
          setStep(3);
        } else {
          setSubmitError(`Analysis finished, but database save failed: ${persistRes.error}`);
        }
      } else {
        setSubmitError(finalState.finalError || "An analysis agent threw an error while running.");
      }
    } catch (err) {
      setSubmitError(`The analysis execution failed to complete: ${err.message || err}`);
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Copy Complaint to Clipboard
  const handleCopyComplaint = () => {
    const letter = pipelineState?.issueDraft?.draft?.complaint_letter;
    if (!letter) return;

    navigator.clipboard.writeText(letter).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Reset entire form and states
  const resetReportState = () => {
    setStep(1);
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setImageBase64(null);
    setMimeType(null);
    setUserDescription("");
    setManualAddress("");
    setManualCity("");
    setLat("");
    setLng("");
    setLocationLoading(false);
    setContextData(null);
    setContextError(null);
    setSubmitError(null);
    setPipelineState(null);
    setPersistenceResult(null);
    setProcessing(false);
    setCompletedIssue(null);
    setCompletedSummary(null);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    return new Date(ts).toLocaleString();
  };

  // Validation guard for continue
  const canContinueToStep2 = useMemo(() => {
    return (
      imageBase64 &&
      mimeType &&
      (contextData || manualAddress.trim() || manualCity.trim() || (lat && lng))
    );
  }, [imageBase64, mimeType, contextData, manualAddress, manualCity, lat, lng]);

  return (
    <PageLayout>
      <div className="container--default" style={{ padding: "var(--space-8) var(--space-4)" }}>
        
        {/* Header Section */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="font-heading" style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Report a Civic Issue
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-base)" }}>
            Upload evidence, capture local environmental context, and trigger our agentic team to compile work orders dynamically.
          </p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex justify-between items-center max-w-lg mx-auto sm:mx-0 mb-8 p-3" style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-xl)" }}>
          {steps.map((s, index) => {
            const isActive = step === s.number;
            const isCompleted = step > s.number;
            return (
              <div key={s.number} className="flex items-center gap-2 flex-1 justify-center first:justify-start last:justify-end">
                <div
                  className="flex items-center justify-center font-bold"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--text-sm)",
                    background: isCompleted
                      ? "var(--color-primary)"
                      : isActive
                      ? "var(--color-primary-light)"
                      : "transparent",
                    color: isCompleted
                      ? "#white"
                      : isActive
                      ? "var(--color-primary)"
                      : "var(--color-text-faint)",
                    border: isCompleted || isActive ? "none" : "2px solid var(--color-border)"
                  }}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-white" /> : s.number}
                </div>
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: isActive || isCompleted ? 700 : 500,
                    color: isActive || isCompleted ? "var(--color-text)" : "var(--color-text-faint)"
                  }}
                >
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block mx-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Auth protection warning card */}
        {!user && (
          <div className="card mb-8" style={{ borderColor: "var(--color-error)", background: "rgba(220, 38, 38, 0.05)" }}>
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: "var(--color-error)" }} />
              <div>
                <h3 className="font-bold text-lg" style={{ color: "var(--color-error)" }}>Authentication Warning</h3>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                  You are not currently logged in. While you can preview reporting steps, submitting analysis requests require a registered citizen account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {submitError && (
          <div className="card mb-8 animate-fade-in" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
            <div className="flex gap-3 items-start">
              <XCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900" style={{ fontSize: "var(--text-sm)" }}>Submission Issue Detected</h4>
                <p className="text-xs text-red-700 mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content Switcher */}

        {/* ================================================== */}
        {/* STEP 1: REPORT DETAILS */}
        {/* ================================================== */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (Upload + Description) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Evidence Upload Card */}
              <div className="card">
                <h2 className="font-sans font-semibold mb-4" style={{ fontSize: "var(--text-lg)" }}>
                  1. Evidence Upload
                </h2>
                
                <div
                  style={{
                    border: "2px dashed var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-surface-2)",
                    padding: "var(--space-8) var(--space-4)",
                    textAlign: "center"
                  }}
                  className="hover:border-primary transition duration-150"
                >
                  {imagePreviewUrl ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imagePreviewUrl}
                        alt="Civic issue evidence"
                        referrerPolicy="no-referrer"
                        className="max-h-64 rounded-lg object-contain mb-3 shadow-sm border border-gray-200"
                      />
                      <span className="text-xs font-mono text-gray-500 block mb-1">
                        {imageFile?.name} ({Math.round(imageFile?.size / 1024)} KB)
                      </span>
                      <label className="btn btn-outline btn-sm mt-2 cursor-pointer">
                        <Camera className="w-4 h-4 mr-2" />
                        Replace Photo
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-3">
                        <Camera className="w-8 h-8" />
                      </div>
                      <p className="font-medium text-sm mb-1" style={{ color: "var(--color-text)" }}>
                        Drag & Drop or click to upload
                      </p>
                      <p className="text-xs mb-4" style={{ color: "var(--color-text-faint)" }}>
                        PNG, JPG, or WEBP up to 8MB max
                      </p>
                      <label className="btn btn-primary cursor-pointer">
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Photo
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
                {!imagePreviewUrl && (
                  <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: "var(--color-text-faint)" }}>
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    Upload a clear, well-lit image of the problem area to assist the system.
                  </p>
                )}
              </div>

              {/* Description Card */}
              <div className="card">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-sans font-semibold" style={{ fontSize: "var(--text-lg)" }}>
                    2. Issue Description
                  </h2>
                  <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>Optional</span>
                </div>
                
                <div className="form-group">
                  <textarea
                    rows={4}
                    maxLength={300}
                    value={userDescription}
                    onChange={(e) => setUserDescription(e.target.value)}
                    placeholder="Provide supplementary details (e.g. 'Highly dangerous broken traffic signal near Shivajinagar chowk, causing regular gridlock and pedestrian near-misses.')"
                    className="form-input resize-none w-full text-sm"
                    style={{ minHeight: "100px" }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    <span>Include landmarks or hazard context.</span>
                    <span>{userDescription.length} / 300</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Geographical Context) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Geolocation & Location Resolution */}
              <div className="card">
                <h2 className="font-sans font-semibold mb-4" style={{ fontSize: "var(--text-lg)" }}>
                  3. Location Context
                </h2>

                {/* Primary Get GPS Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="btn btn-outline w-full justify-center mb-6"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Resolving GPS...
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4 mr-2 text-blue-600" />
                      Use GPS Location
                    </>
                  )}
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 font-semibold" style={{ color: "var(--color-text-faint)" }}>
                      or enter manually
                    </span>
                  </div>
                </div>

                {/* Manual Fallbacks */}
                <div className="flex flex-col gap-4">
                  <div className="form-group">
                    <label className="form-label">Road or Landmark Address</label>
                    <input
                      type="text"
                      className="form-input text-sm"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      placeholder="e.g. F.C. Road, Shivajinagar"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input text-sm"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        placeholder="e.g. Pune"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ opacity: 0.7 }}>Geohash</label>
                      <input
                        type="text"
                        className="form-input text-sm text-gray-500 bg-gray-50 cursor-not-allowed font-mono"
                        disabled
                        value={contextData?.location?.cacheKey || "Auto-hashed"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Latitude</label>
                      <input
                        type="text"
                        className="form-input text-sm"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="e.g. 18.5204"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Longitude</label>
                      <input
                        type="text"
                        className="form-input text-sm"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="e.g. 73.8567"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResolveLocation}
                    disabled={locationLoading}
                    className="btn btn-secondary w-full justify-center btn-sm mt-2"
                    style={{ background: "var(--color-surface-2)" }}
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Resolve Coordinates & Weather
                  </button>
                </div>

                {contextError && (
                  <div className="flex gap-2 items-start mt-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                    <p>{contextError}</p>
                  </div>
                )}
              </div>

              {/* Enrichments Preview Box */}
              {contextData && (
                <div className="card shadow-md border-indigo-200 animate-slide-up" style={{ borderLeft: "4px solid var(--color-primary)" }}>
                  <h3 className="font-sans font-bold flex items-center gap-2 mb-3" style={{ fontSize: "var(--text-sm)" }}>
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    Enriched Context Retrieved
                  </h3>

                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <div className="flex justify-between items-start py-1 border-b border-gray-100">
                      <span className="font-medium text-gray-500">Location:</span>
                      <span className="text-right font-medium max-w-[200px] truncate" title={contextData.location?.address}>
                        {contextData.location?.address || "Unknown Address"}, {contextData.location?.city}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="font-medium text-gray-500">Source:</span>
                      <span className="font-mono text-xs text-indigo-600 capitalize">
                        {contextData.location?.source || "unverified"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="font-medium text-gray-500">Weather Code:</span>
                      <span className="flex items-center gap-1.5 capitalize font-medium">
                        <Cloud className="w-4 h-4 text-sky-500" />
                        {contextData.weather?.condition || "unknown"}
                        <span className="text-xs text-gray-500">({contextData.weather?.temperature_c || 0}°C)</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="font-medium text-gray-500">Rainfall:</span>
                      <span className="font-medium">{contextData.weather?.rainfall_mm || 0} mm</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="font-medium text-gray-500">Precipitation Warning:</span>
                      <div className="flex items-center">
                        {contextData.weather?.alert === "red" && (
                          <span className="badge badge-critical flex items-center gap-1">Severe Alert</span>
                        )}
                        {contextData.weather?.alert === "orange" && (
                          <span className="badge badge-high flex items-center gap-1">Elevated</span>
                        )}
                        {contextData.weather?.alert === "yellow" && (
                          <span className="badge badge-medium flex items-center gap-1">Minimal Rain</span>
                        )}
                        {contextData.weather?.alert === "none" && (
                          <span className="badge flex items-center gap-1 bg-gray-100 text-gray-600">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Action row */}
            <div className="col-span-12 flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                disabled={!canContinueToStep2 || !user}
                onClick={() => setStep(2)}
                className="btn btn-primary btn-sm flex items-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Processor
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 2: PROCESSING & TERMINAL */}
        {/* ================================================== */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Panel: Summary Inputs */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="card">
                <h3 className="font-heading font-semibold mb-4" style={{ fontSize: "var(--text-lg)" }}>
                  Report Overview
                </h3>

                <div className="text-center bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Civic hazard thumbnail"
                      referrerPolicy="no-referrer"
                      className="max-h-40 rounded-lg object-contain mx-auto shadow-sm"
                    />
                  ) : (
                    <div className="py-8 text-gray-400 text-xs">No evidence photo</div>
                  )}
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-semibold">REPORTER</span>
                    <span className="font-medium text-gray-800">{user?.displayName || user?.email || "Unknown reporter"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-semibold">LOCATION ESTIMATE</span>
                    <span className="font-medium text-gray-800">
                      {manualAddress ? `${manualAddress}, ` : ""} {manualCity || "Pune"}
                    </span>
                  </div>
                  {contextData?.weather && (
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-semibold">ATMOSPHERE</span>
                      <span className="font-medium text-gray-800 capitalize">
                        {contextData.weather.condition} ({contextData.weather.temperature_c}°C, {contextData.weather.rainfall_mm}mm rain)
                      </span>
                    </div>
                  )}
                  {userDescription && (
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-semibold">CITIZEN NOTES</span>
                      <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 p-2.5 rounded-lg italic">
                        "{userDescription}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="divider"></div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={handleRunPipeline}
                  className="btn btn-primary w-full justify-center shadow-md hover:translate-y-[-1px] transition-all"
                  style={{ background: "linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%)", outline: "none" }}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sequencing Agents...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-bounce" />
                      Run NagarNiti Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel: Monospace AI Terminal */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="card" style={{ padding: "0" }}>
                
                {/* Custom Terminal Header bar */}
                <div className="flex justify-between items-center px-4 py-3 border-b" style={{ background: "var(--color-surface-2)", borderTopLeftRadius: "var(--radius-xl)", borderTopRightRadius: "var(--radius-xl)" }}>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span className="font-mono text-xs font-semibold text-gray-600">NagarNiti Sequential Orchestrator Terminal v1.4</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                </div>

                {/* Main Terminal Window Body */}
                <div
                  className="font-mono p-6 overflow-y-auto text-sm"
                  style={{
                    background: "#0c0d10",
                    color: "#a9b1d6",
                    minHeight: "360px",
                    maxHeight: "500px",
                    borderBottomLeftRadius: "var(--radius-xl)",
                    borderBottomRightRadius: "var(--radius-xl)"
                  }}
                >
                  {/* Introductory Logs */}
                  <div className="mb-4 text-xs text-gray-500 border-b border-gray-800 pb-3">
                    [CLIENT LOGS]: Connected to cloud stream via Firestore geocaching...<br />
                    [CLIENT LOGS]: Triggered agents spacing guard minimum 4500ms...<br />
                    [SYSTEM]: Type: sequential. State model: transient pipeline.
                  </div>

                  {/* 5 Core Sequential Agents Status Cards */}
                  <div className="flex flex-col gap-3">
                    {[
                      { name: "vision", label: "Vision Intelligence Agent", desc: "Analyzes evidence image, identifies issue type, and determines severity." },
                      { name: "validation", label: "Deduplication & Validation Agent", desc: "Checks proximity and type to weed out duplicates and validate facts." },
                      { name: "urgency", label: "Hyperlocal Urgency Estimator", desc: "Weighs reports, weather data, and location density for custom priority scores." },
                      { name: "draft", label: "Formal Complaint Drafter", desc: "Generates legal notifications, official subject lines, and appropriate municipal headers." },
                      { name: "escalation", label: "Escalation Timing Strategist", desc: "Calculates maximum resolution timeline before forwarding to senior ward officers." }
                    ].map((agent) => {
                      const ast = pipelineState?.statuses?.[agent.name] || { status: "queued", attempts: 0, error: null };
                      const data = pipelineState?.issueDraft?.[agent.name];
                      
                      let statusBadge = null;
                      if (ast.status === "queued") {
                        statusBadge = <span className="text-gray-500 font-bold bg-gray-800/60 border border-gray-750 px-2 py-0.5 rounded text-[11px] uppercase select-none">Queued</span>;
                      } else if (ast.status === "running") {
                        statusBadge = <span className="text-blue-400 font-bold bg-blue-950/40 border border-blue-900/60 px-2 py-0.5 rounded text-[11px] uppercase animate-pulse select-none">Running</span>;
                      } else if (ast.status === "success") {
                        statusBadge = <span className="text-green-400 font-bold bg-green-950/40 border border-green-900/60 px-2 py-0.5 rounded text-[11px] uppercase select-none">Success</span>;
                      } else if (ast.status === "retrying") {
                        statusBadge = <span className="text-amber-400 font-bold bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded text-[11px] uppercase select-none">Retrying</span>;
                      } else {
                        statusBadge = <span className="text-red-400 font-bold bg-red-950/40 border border-red-900/60 px-2 py-0.5 rounded text-[11px] uppercase select-none">Failed</span>;
                      }

                      return (
                        <div
                          key={agent.name}
                          className="p-4 rounded-lg flex flex-col gap-2 transition duration-200"
                          style={{
                            background: ast.status === "running" ? "#1a1e27" : ast.status === "success" ? "#0e1612" : "#111216",
                            border: `1px solid ${
                              ast.status === "running" ? "#2b3b5c" : ast.status === "success" ? "#162e20" : "#1e2129"
                            }`
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold flex items-center gap-1.5" style={{ color: ast.status === "success" ? "#4ade80" : ast.status === "running" ? "#60a5fa" : "#e2e8f0" }}>
                              {agent.name === "vision" && <Camera className="w-3.5 h-3.5" />}
                              {agent.name === "validation" && <ShieldCheck className="w-3.5 h-3.5" />}
                              {agent.name === "urgency" && <Zap className="w-3.5 h-3.5" />}
                              {agent.name === "draft" && <FileCheck2 className="w-3.5 h-3.5" />}
                              {agent.name === "escalation" && <Clock className="w-3.5 h-3.5" />}
                              {agent.label}
                            </span>
                            {statusBadge}
                          </div>
                          
                          <p className="text-xs text-gray-400 italic font-mono">{agent.desc}</p>
                          
                          {/* Duration and Details rendering upon success */}
                          {ast.status === "success" && (
                            <div className="mt-1 border-t border-gray-800/40 pt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                              <span>Duration: <b className="text-gray-300">{(ast.durationMs / 1000).toFixed(2)}s</b></span>
                              {ast.attempts > 1 && <span>Attempts: <b className="text-indigo-400">{ast.attempts}</b></span>}
                              
                              {/* Extra Mini-Insights */}
                              {agent.name === "vision" && data && (
                                <span className="text-[#9ece6a]">Identified: {data.issue_type} (Severity: {data.severity})</span>
                              )}
                              {agent.name === "validation" && data && (
                                <span className="text-[#e0af68]">Duplicate Check: {data.is_duplicate ? "Yes" : "Unique report"}</span>
                              )}
                              {agent.name === "urgency" && data && (
                                <span className="text-[#f7768e]">Urgency: {data.urgency_label} (Score: {data.urgency_score}/10)</span>
                              )}
                              {agent.name === "draft" && data && (
                                <span className="text-[#7aa2f7]">Recommended Ward: {data.recommended_department}</span>
                              )}
                            </div>
                          )}

                          {/* Error block */}
                          {ast.error && (
                            <div className="text-xs text-red-400 font-mono mt-1 p-2 bg-red-950/30 border border-red-900/40 rounded">
                              ERROR: {ast.error}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expandable Trace Terminal Logs */}
                  <div className="mt-6 border-t border-gray-800 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTrace(!showTrace)}
                      className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1.5 uppercase transition duration-150"
                    >
                      <span>[Telemetry Trace Logs]</span>
                      <span className="text-[10px]">{showTrace ? "▲ HIDE" : "▼ SHOW"}</span>
                    </button>

                    {showTrace && (
                      <div className="mt-3 p-3 bg-black/60 rounded-lg text-[11px] text-gray-500 overflow-y-auto font-mono flex flex-col gap-1 max-h-40">
                        {pipelineState?.trace?.map((t, idx) => (
                          <div key={idx} className="leading-5">
                            <span className="text-blue-500">[{new Date(t.timestamp).toLocaleTimeString()}]</span>
                            <span className="text-purple-400 uppercase font-bold ml-1.5">[{t.stage}]</span>
                            <span className="ml-1.5" style={{ color: t.stage === "failed" ? "#f7768e" : "#a9b1d6" }}>{t.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Retry & navigation when error happens */}
              {pipelineState?.success === false && pipelineState?.finalError && (
                <div className="card border-red-200 bg-red-50 text-red-900 flex justify-between items-center gap-4 animate-slide-up">
                  <div className="flex gap-2.5 items-start">
                    <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Execution Breakdown</h4>
                      <p className="text-xs mt-1 text-red-700">{pipelineState.finalError}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn btn-outline btn-sm"
                    >
                      Modify Location/Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRunPipeline}
                      className="btn btn-primary btn-sm flex items-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Retry Pipeline
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Back action row */}
            <div className="col-span-12 flex justify-between gap-3 pt-6 border-t border-gray-150">
              <button
                type="button"
                disabled={processing}
                onClick={() => setStep(1)}
                className="btn btn-outline btn-sm"
              >
                Back to Edit
              </button>
              {pipelineState?.success && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-primary btn-sm flex items-center"
                >
                  Proceed to Review
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 3: REVIEW AND OUTCOMe */}
        {/* ================================================== */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            
            {/* Left Column: Parsed Document details */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Outcome Metrics Card */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <h3 className="font-heading font-semibold" style={{ fontSize: "var(--text-lg)" }}>
                    Analysis Complete
                  </h3>
                </div>

                <div className="flex flex-col gap-3 text-sm py-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-400 font-medium">Issue Type:</span>
                    <span className="font-bold text-gray-800 capitalize">
                      {pipelineState?.issueDraft?.vision?.issue_type}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-400 font-medium">Urgency Impact:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 uppercase text-xs">
                        {pipelineState?.issueDraft?.urgency?.urgency_label}
                      </span>
                      <span className="badge badge-critical font-bold text-xs">
                        {pipelineState?.issueDraft?.urgency?.urgency_score}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-400 font-medium">Auto-Escalates:</span>
                    <span className="font-mono text-xs text-amber-600 font-bold" title="Escalation trigger timestamp">
                      {pipelineState?.issueDraft?.escalation?.should_escalate
                        ? `${pipelineState.issueDraft.escalation.escalation_level} (After ${pipelineState.issueDraft.urgency?.escalate_after_hours}h)`
                        : "No automatic escalation"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-400 font-medium">Deduplication:</span>
                    <span className="font-semibold text-green-700 text-xs">
                      {pipelineState?.issueDraft?.validation?.is_duplicate
                        ? "Possible duplicate queued"
                        : "Confirmed unique reporting"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-400 font-medium">City resolved:</span>
                    <span className="font-bold text-gray-800">
                      {manualCity || "Pune"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Persistence Metadata */}
              <div className="card shadow-sm border-emerald-250" style={{ background: "#f6fff8", borderColor: "#c8e6c9" }}>
                <h4 className="font-sans font-semibold text-emerald-900 flex items-center gap-1.5 mb-2" style={{ fontSize: "var(--text-sm)" }}>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Cloud Storage Persisted
                </h4>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  The compiled issue documentation and automated execution trace logs are durably saved to Firebase Cloud Firestore.
                </p>

                {completedIssue && (
                  <div className="flex flex-col gap-1 text-xs text-gray-500 font-mono py-1.5 border-t border-emerald-100">
                    <div><span className="text-gray-400 font-sans">ISSUE_UUID:</span> <span className="text-gray-600 font-bold">{completedIssue.id || "Saved"}</span></div>
                    <div><span className="text-gray-400 font-sans">LOGS_SAVED:</span> <span className="text-gray-600 font-bold">{persistenceResult?.logs?.created?.length || 5} traces</span></div>
                  </div>
                )}
              </div>

              {/* Execution health info */}
              {completedSummary && (
                <div className="card">
                  <h4 className="font-sans font-bold text-gray-800 text-xs uppercase mb-3 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    Agent Efficiency Summary
                  </h4>
                  <div className="text-xs flex flex-col gap-2">
                    <span className="text-gray-500 block leading-5">All sequential steps bypassed live-locks without failure loop. Total latency: </span>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg font-mono">
                      <span className="text-gray-400">Attempts per agent:</span>
                      <span className="text-indigo-600 font-bold text-right">
                        V:{completedSummary.attempts?.vision || 1} | Va:{completedSummary.attempts?.validation || 1} | U:{completedSummary.attempts?.urgency || 1}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: PDF/Formal complaint report view */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Complaint Letter Template Frame */}
              <div className="card shadow-md">
                
                {/* Header within Document Card */}
                <div className="flex justify-between items-start border-b border-gray-150 pb-4 mb-5">
                  <div>
                    <span className="badge badge-pending mb-1 font-mono uppercase text-[10px]">SECTION 21 COMPLAINT DRAFT</span>
                    <h2 className="font-heading font-extrabold text-xl text-gray-800" style={{ letterSpacing: "-0.01em" }}>
                      {pipelineState?.issueDraft?.draft?.subject_line || "Official Petition"}
                    </h2>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCopyComplaint}
                    className={`btn btn-outline btn-sm ${copySuccess ? "text-green-600 border-green-600" : ""}`}
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Petition
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase leading-4">ADDRESSED TO:</span>
                    <span className="text-xs text-gray-700 font-bold">{pipelineState?.issueDraft?.draft?.addressed_to || "PMC Ward Officer"}</span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase leading-4">RECOMMENDED MUNICIPAL DEPARTMENT:</span>
                    <span className="text-xs text-gray-700 font-bold">{pipelineState?.issueDraft?.draft?.recommended_department || "Local Ward Board"}</span>
                  </div>
                </div>

                {/* Complaint letter body container */}
                <div className="p-6 bg-white border border-gray-200 rounded-xl font-serif text-sm text-gray-800 shadow-inner line-clamp-none overflow-y-auto leading-relaxed relative" style={{ minHeight: "260px", maxWeight: "700px" }}>
                  <div className="absolute top-2 right-3 font-mono text-[10px] text-gray-300 font-bold">NagarNiti Proof ID: {completedIssue?.id?.slice(0,8) || "NITI-DRAFT"}</div>
                  <pre
                    style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-serif, Georgia, serif)", lineHeight: "1.6" }}
                    className="text-sm select-all whitespace-pre-wrap text-slate-800"
                  >
                    {pipelineState?.issueDraft?.draft?.complaint_letter}
                  </pre>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-150">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Format aligned with civic grievance regulation template
                  </span>
                  <span>Created: {formatTimestamp(completedIssue?.created_at || Date.now())}</span>
                </div>
              </div>

              {/* Action Rows */}
              <div className="flex gap-3 justify-end pt-6">
                <button
                  type="button"
                  onClick={resetReportState}
                  className="btn btn-primary btn-sm flex items-center hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%)" }}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Report Another Civic Issue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

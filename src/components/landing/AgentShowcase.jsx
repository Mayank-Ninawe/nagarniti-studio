import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  Eye,
  FileJson,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

const AGENTS = [
  {
    id: "agent-1",
    icon: Eye,
    name: "Vision Agent",
    title: "Multimodal hazard evaluator",
    status: "Active",
    desc: "Inspects uploaded images, identifies infrastructure damage, and extracts scene-level context for the pipeline.",
    schema: {
      inputs: "{ image, camera_meta, geotag_hint }",
      output: '{ category: "road_damage", severity_hint: 0.82 }',
    },
    terminal: [
      "Loading image metadata and visual context...",
      "Scanning road-surface damage patterns...",
      "Hazard signature matched with confidence above threshold.",
      "Location landmarks extracted for civic context.",
      "Visual classification complete. Forwarding structured payload.",
    ],
  },
  {
    id: "agent-2",
    icon: ShieldCheck,
    name: "Validation Agent",
    title: "Duplicate and location guard",
    status: "Active",
    desc: "Compares location and issue context against nearby active reports to prevent duplicate escalation.",
    schema: {
      inputs: "{ lat, lng, category, duplicate_radius: 150 }",
      output: '{ is_duplicate: false, nearby_open_reports: 0 }',
    },
    terminal: [
      "Loading coordinate set and duplicate radius rules...",
      "Checking nearby active submissions in the same ward...",
      "Cross-referencing recent issue history...",
      "No matching duplicate found in the configured radius.",
      "Validation passed. Queueing urgency assessment.",
    ],
  },
  {
    id: "agent-3",
    icon: Zap,
    name: "Urgency Agent",
    title: "Priority scoring engine",
    status: "Standby",
    desc: "Combines civic severity, area density, and weather signals to compute escalation urgency and SLA priority.",
    schema: {
      inputs: "{ severity_hint, density_score, weather_signal }",
      output: '{ urgency_factor: 8.7, sla_limit_hours: 24 }',
    },
    terminal: [
      "Collecting weather and local density signals...",
      "Applying weighted risk model to validated issue...",
      "Flood and traffic exposure factors increased final urgency.",
      "Priority score calibrated for ward-level escalation.",
      "Urgency scoring complete. Passing to drafting stage.",
    ],
  },
  {
    id: "agent-4",
    icon: FileJson,
    name: "Escalation Agent",
    title: "Municipal brief composer",
    status: "Standby",
    desc: "Builds a structured complaint brief using the validated issue data and routes it into the escalation workflow.",
    schema: {
      inputs: "{ structured_issue, urgency_factor, target_department }",
      output: '{ document_ready: true, route: "ward_engineering" }',
    },
    terminal: [
      "Loading municipal complaint format template...",
      "Drafting issue summary and location narrative...",
      "Embedding urgency markers and evidence references...",
      "Complaint brief compiled for routing and audit trail.",
      "Escalation package created successfully.",
    ],
  },
];

export default function AgentShowcase() {
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);

  const activeAgent = AGENTS[activeAgentIdx] || AGENTS[0];

  useEffect(() => {
    setConsoleLogs([]);
    const lines = activeAgent.terminal || [];
    let lineIndex = 0;

    const interval = window.setInterval(() => {
      if (lineIndex < lines.length) {
        setConsoleLogs((prev) => [...prev, lines[lineIndex]]);
        lineIndex += 1;
      } else {
        window.clearInterval(interval);
      }
    }, 420);

    return () => window.clearInterval(interval);
  }, [activeAgentIdx, activeAgent]);

  return (
    <section
      id="agent-showcase-section"
      className="page-section"
      style={{
        borderBottom: "1px solid var(--color-divider)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,245,240,0.72) 100%)",
      }}
    >
      <div className="container">
        <div
          className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]"
          style={{
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "start",
          }}
        >
          <div className="stack-lg">
            <div className="stack-md">
              <span className="eyebrow">Autonomous intelligence layer</span>
              <h2 className="section-title section-title--wide">
                Specialized agents working in one structured civic pipeline
              </h2>
              <p className="section-copy section-copy--sm">
                NagarNiti breaks the reporting workflow into focused agent stages so uploads can be
                validated, scored, formatted, and escalated with more consistency than a single
                generic model pass.
              </p>
            </div>

            <div style={{ display: "grid", gap: "var(--space-3)" }}>
              {AGENTS.map((agent, idx) => {
                const Icon = agent.icon;
                const isActive = activeAgentIdx === idx;

                return (
                  <button
                    key={agent.id}
                    id={`agent-tab-${idx}`}
                    type="button"
                    onClick={() => setActiveAgentIdx(idx)}
                    className={`card card--compact ${isActive ? "card--selected" : ""}`}
                    style={{
                      textAlign: "left",
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "var(--space-4)",
                      alignItems: "start",
                      cursor: "pointer",
                      background: isActive
                        ? "linear-gradient(180deg, rgba(228,243,241,0.72) 0%, rgba(255,255,255,0.96) 100%)"
                        : undefined,
                    }}
                  >
                    <span
                      style={{
                        width: "2.8rem",
                        height: "2.8rem",
                        borderRadius: "1rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isActive
                          ? "var(--color-primary)"
                          : "var(--color-surface-3)",
                        color: isActive ? "white" : "var(--color-text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </span>

                    <span style={{ minWidth: 0, display: "grid", gap: "0.22rem" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--color-text-faint)",
                        }}
                      >
                        Agent 0{idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--text-base)",
                          fontWeight: 800,
                          color: "var(--color-text)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {agent.name}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--color-text-muted)",
                          lineHeight: 1.55,
                        }}
                      >
                        {agent.desc}
                      </span>
                    </span>

                    <span className={`badge ${agent.status === "Active" ? "badge-info" : "badge-pending"}`}>
                      {agent.status}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="state-card"
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "var(--space-4)",
                alignItems: "start",
              }}
            >
              <span
                style={{
                  width: "2.4rem",
                  height: "2.4rem",
                  borderRadius: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                }}
              >
                <AlertCircle size={18} />
              </span>

              <div className="stack-sm">
                <h3
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Structured recovery guardrails
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  Schema checks keep the pipeline predictable. If one stage returns malformed or
                  incomplete data, the orchestrator can retry with correction prompts before the
                  issue moves forward.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{
              borderRadius: "var(--radius-2xl)",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.05)",
              background: "linear-gradient(180deg, #0f1720 0%, #091018 100%)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-4)",
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <div style={{ display: "flex", gap: "0.38rem" }}>
                  <span style={{ width: "0.72rem", height: "0.72rem", borderRadius: "999px", background: "#ef4444" }} />
                  <span style={{ width: "0.72rem", height: "0.72rem", borderRadius: "999px", background: "#f59e0b" }} />
                  <span style={{ width: "0.72rem", height: "0.72rem", borderRadius: "999px", background: "#10b981" }} />
                </div>

                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  NagarNiti agent console
                </div>
              </div>

              <span className={`badge ${activeAgent.status === "Active" ? "badge-info" : "badge-pending"}`}>
                {activeAgent.status}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "var(--space-5)",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  display: "grid",
                  gap: "0.55rem",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#5eead4",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <Terminal size={15} />
                  {activeAgent.title}
                </div>

                <p
                  style={{
                    fontSize: "0.92rem",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {activeAgent.desc}
                </p>
              </div>

              <div
                style={{
                  minHeight: "220px",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(2, 8, 14, 0.46)",
                  padding: "1rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: "0.7rem",
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {consoleLogs.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        display: "flex",
                        alignItems: "start",
                        gap: "0.6rem",
                      }}
                    >
                      <span style={{ color: "#2dd4bf", fontWeight: 700 }}>{">"}</span>
                      <span>{log}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2"
                style={{
                  gap: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.04)",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "0.45rem",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.48)",
                    }}
                  >
                    Inputs
                  </div>
                  <code
                    style={{
                      display: "block",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: "0.74rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {activeAgent.schema.inputs}
                  </code>
                </div>

                <div
                  style={{
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.04)",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "0.45rem",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.48)",
                    }}
                  >
                    Validated output
                  </div>
                  <code
                    style={{
                      display: "block",
                      color: "#5eead4",
                      fontSize: "0.74rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {activeAgent.schema.output}
                  </code>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #agent-showcase-section > div > div {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          #agent-showcase-section [style*="grid-template-columns: repeat(2, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
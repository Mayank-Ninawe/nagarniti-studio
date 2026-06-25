import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Clock3,
  Flame,
  Layers3,
  MapPin,
  ShieldAlert,
  Zap,
} from "lucide-react";

export default function DashboardPreviewSection() {
  const potholeImage =
    "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80";

  return (
    <section
      id="dashboard-preview-section"
      className="page-section"
      style={{
        borderBottom: "1px solid var(--color-divider)",
        background:
          "linear-gradient(180deg, rgba(247,245,240,0.96) 0%, rgba(255,255,255,0.92) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-8%",
          top: "18%",
          width: "26rem",
          height: "26rem",
          borderRadius: "999px",
          background: "rgba(11, 107, 105, 0.04)",
          filter: "blur(48px)",
          pointerEvents: "none",
        }}
      />

      <div className="container">
        <div
          className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]"
          style={{
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{
              order: 1,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(21, 32, 43, 0.08)",
                borderRadius: "2rem",
                padding: "clamp(1rem, 2vw, 1.4rem)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: "42rem",
                marginInline: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                  background: "var(--color-surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-4)",
                    padding: "1rem 1.1rem",
                    background: "rgba(255,255,255,0.82)",
                    borderBottom: "1px solid var(--color-divider)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <span style={{ width: "0.7rem", height: "0.7rem", borderRadius: "999px", background: "#ef4444" }} />
                      <span style={{ width: "0.7rem", height: "0.7rem", borderRadius: "999px", background: "#f59e0b" }} />
                      <span style={{ width: "0.7rem", height: "0.7rem", borderRadius: "999px", background: "#10b981" }} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--color-text)",
                        }}
                      >
                        Pune district dashboard
                      </div>
                      <div
                        style={{
                          marginTop: "0.12rem",
                          fontSize: "0.72rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Live ward monitoring · Central view
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-info">Auto sync</span>
                </div>

                <div style={{ paddingInline: "1rem", paddingBottom: "1rem", display: "grid", gap: "1rem" }}>
                  <div
                    style={{
                      height: "16rem",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "1.35rem",
                      border: "1px solid rgba(21, 32, 43, 0.08)",
                      background:
                        "linear-gradient(180deg, rgba(240,245,244,1) 0%, rgba(247,249,248,1) 100%)",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                          "linear-gradient(to right, rgba(21,32,43,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(21,32,43,0.04) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />

                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: "15%",
                        top: "18%",
                        width: "28%",
                        height: "18%",
                        borderRadius: "999px",
                        background: "rgba(11,107,105,0.06)",
                        filter: "blur(8px)",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: "32%",
                        right: "28%",
                        display: "grid",
                        justifyItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.42rem 0.55rem",
                          borderRadius: "0.8rem",
                          background: "rgba(15,23,42,0.88)",
                          color: "white",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        Shivajinagar hazard
                      </div>
                      <MapPin size={18} color="#ef4444" />
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        left: "22%",
                        bottom: "24%",
                        width: "0.95rem",
                        height: "0.95rem",
                        borderRadius: "999px",
                        background: "#0f766e",
                        boxShadow: "0 0 0 10px rgba(15,118,110,0.10)",
                        border: "2px solid white",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        right: "1rem",
                        bottom: "1rem",
                        padding: "0.5rem 0.65rem",
                        borderRadius: "0.8rem",
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(21, 32, 43, 0.08)",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Interactive civic map
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "0.8rem" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "var(--space-4)",
                        alignItems: "center",
                        padding: "0.95rem 1rem",
                        borderRadius: "1.15rem",
                        background: "rgba(247,245,240,0.72)",
                        border: "1px solid rgba(21, 32, 43, 0.07)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.45rem",
                            marginBottom: "0.45rem",
                          }}
                        >
                          <span className="badge badge-danger">
                            <ShieldAlert size={12} />
                            Urgent 8.7
                          </span>
                          <span className="badge badge-info">Escalated</span>
                        </div>

                        <div
                          style={{
                            fontSize: "var(--text-base)",
                            fontWeight: 800,
                            color: "var(--color-text)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          Shivajinagar road cavity
                        </div>

                        <div
                          style={{
                            marginTop: "0.2rem",
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <MapPin size={13} />
                          Senapati Bapat Road, Pune
                        </div>
                      </div>

                      <img
                        src={potholeImage}
                        alt="Road damage report preview"
                        referrerPolicy="no-referrer"
                        style={{
                          width: "3.5rem",
                          height: "3.5rem",
                          borderRadius: "1rem",
                          objectFit: "cover",
                          border: "1px solid rgba(21, 32, 43, 0.08)",
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "var(--space-4)",
                        alignItems: "center",
                        padding: "0.95rem 1rem",
                        borderRadius: "1.15rem",
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(21, 32, 43, 0.07)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.45rem",
                            marginBottom: "0.45rem",
                          }}
                        >
                          <span className="badge badge-warning">
                            <Zap size={12} />
                            High 7.2
                          </span>
                          <span className="badge badge-neutral">Validated</span>
                        </div>

                        <div
                          style={{
                            fontSize: "var(--text-base)",
                            fontWeight: 800,
                            color: "var(--color-text)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          Broken streetlight mast
                        </div>

                        <div
                          style={{
                            marginTop: "0.2rem",
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <MapPin size={13} />
                          Kalyani Nagar Road, Pune
                        </div>
                      </div>

                      <div
                        style={{
                          width: "3.5rem",
                          height: "3.5rem",
                          borderRadius: "1rem",
                          display: "grid",
                          placeItems: "center",
                          background: "rgba(11,107,105,0.06)",
                          border: "1px solid rgba(11,107,105,0.08)",
                          color: "var(--color-primary)",
                        }}
                      >
                        <Clock3 size={18} />
                      </div>
                    </div>
                  </div>

                  <Link to="/dashboard" className="btn btn-outline btn-lg" style={{ width: "100%" }}>
                    <span>Explore full district dashboard</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <div
            style={{
              order: 2,
              display: "grid",
              gap: "var(--space-7)",
            }}
          >
            <div className="stack-md">
              <span className="eyebrow">Interactive dashboard</span>
              <h2 className="section-title section-title--wide">
                Real-time visibility into ward-level issue progress
              </h2>
              <p className="section-copy section-copy--sm">
                Residents can track validated issues on a live map, inspect escalation status,
                follow location-based updates, and understand which local problems are gaining
                urgency or community support.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{
                gap: "var(--space-5)",
              }}
            >
              <article className="card card--compact">
                <div
                  style={{
                    width: "2.8rem",
                    height: "2.8rem",
                    borderRadius: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <Layers3 size={18} />
                </div>
                <h3
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Layer-based analysis
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: 1.65,
                    color: "var(--color-text-muted)",
                  }}
                >
                  Switch between issue types, density views, and active problem clusters across
                  wards.
                </p>
              </article>

              <article className="card card--compact">
                <div
                  style={{
                    width: "2.8rem",
                    height: "2.8rem",
                    borderRadius: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(245,158,11,0.10)",
                    color: "#b45309",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <Flame size={18} />
                </div>
                <h3
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Community pressure signals
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    lineHeight: 1.65,
                    color: "var(--color-text-muted)",
                  }}
                >
                  Multiple endorsements can raise visibility for issues affecting the same area.
                </p>
              </article>
            </div>

            <div>
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <span>Open live civic map</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #dashboard-preview-section .container > div {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          #dashboard-preview-section [style*="grid-template-columns: repeat(2, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
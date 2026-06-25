import { motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, Inbox, Timer, TrendingUp } from "lucide-react";

const stats = [
  {
    id: "stat-1",
    icon: TrendingUp,
    value: "1,482",
    label: "Issues indexed",
    desc: "Verified civic reports catalogued across active Pune corridors.",
    meta: "+12% this month",
  },
  {
    id: "stat-2",
    icon: CheckCircle2,
    value: "98.4%",
    label: "Validation accuracy",
    desc: "Structured duplicate filtering and classification confidence.",
    meta: "Near-zero false positives",
  },
  {
    id: "stat-3",
    icon: Inbox,
    value: "854",
    label: "Letters drafted",
    desc: "AI-generated complaint briefs formatted for municipal routing.",
    meta: "Direct escalation ready",
  },
  {
    id: "stat-4",
    icon: Timer,
    value: "64 hrs",
    label: "Average response",
    desc: "Faster ward-level civic action compared to manual reporting paths.",
    meta: "4.2x faster routing",
  },
];

export default function StatsStrip() {
  return (
    <section
      id="stats-strip-section"
      className="page-section page-section--tight"
      style={{
        paddingTop: "var(--space-8)",
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="surface-panel surface-panel--strong"
          style={{
            padding: "clamp(1.25rem, 2vw, 1.75rem)",
            borderRadius: "var(--radius-2xl)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "auto 0 0 auto",
              width: "18rem",
              height: "18rem",
              borderRadius: "999px",
              background: "rgba(11, 107, 105, 0.035)",
              filter: "blur(28px)",
              pointerEvents: "none",
            }}
          />

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{
              position: "relative",
              zIndex: 1,
              gap: "1px",
              background: "rgba(21, 32, 43, 0.06)",
              borderRadius: "calc(var(--radius-2xl) - 0.35rem)",
              overflow: "hidden",
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.id}
                  id={stat.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.94)",
                    padding: "clamp(1.25rem, 2vw, 1.6rem)",
                    display: "grid",
                    gap: "var(--space-4)",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      gap: "var(--space-3)",
                    }}
                  >
                    <span
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "0.95rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--color-primary-light)",
                        color: "var(--color-primary)",
                        border: "1px solid rgba(11, 107, 105, 0.10)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        minHeight: "1.8rem",
                        padding: "0.35rem 0.55rem",
                        borderRadius: "999px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        background: "rgba(11, 107, 105, 0.06)",
                        border: "1px solid rgba(11, 107, 105, 0.08)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stat.meta.includes("+") && <ArrowUpRight size={12} />}
                      {stat.meta}
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <div
                      style={{
                        fontSize: "clamp(2rem, 3vw, 2.6rem)",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        fontWeight: 900,
                        color: "var(--color-text)",
                      }}
                    >
                      {stat.value}
                    </div>

                    <div
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--color-text)",
                      }}
                    >
                      {stat.label}
                    </div>

                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: 1.65,
                        color: "var(--color-text-muted)",
                        maxWidth: "28ch",
                      }}
                    >
                      {stat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #stats-strip-section [style*="grid-template-columns: repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          #stats-strip-section [style*="grid-template-columns: repeat(4, minmax(0, 1fr))"],
          #stats-strip-section [style*="grid-template-columns: repeat(2, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
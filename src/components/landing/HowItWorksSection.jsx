import { motion } from "motion/react";
import { Camera, Eye, FileText, Send } from "lucide-react";

const steps = [
  {
    id: "step-1",
    number: "01",
    icon: Camera,
    title: "Capture the issue",
    desc: "Residents submit a photo of damaged roads, water leakage, debris, or local infrastructure hazards with location context.",
    badge: "Citizen input",
  },
  {
    id: "step-2",
    number: "02",
    icon: Eye,
    title: "Validate with agents",
    desc: "Vision, duplicate detection, and urgency scoring run in sequence to verify the report and classify its civic impact.",
    badge: "AI review",
  },
  {
    id: "step-3",
    number: "03",
    icon: FileText,
    title: "Draft a formal brief",
    desc: "Structured complaint language is generated in a format that matches municipal workflows and escalation requirements.",
    badge: "Report synthesis",
  },
  {
    id: "step-4",
    number: "04",
    icon: Send,
    title: "Escalate by ward",
    desc: "The issue enters the appropriate civic route, where reminders, SLA tracking, and follow-up escalation can continue automatically.",
    badge: "Ward dispatch",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works-section"
      className="page-section"
      style={{
        borderBottom: "1px solid var(--color-divider)",
        background: "rgba(255,255,255,0.34)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(11,107,105,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,107,105,0.02) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.45), transparent 92%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="page-header page-header--center">
          <span className="eyebrow">Citizen operational model</span>
          <h2 className="section-title section-title--wide">
            A transparent civic workflow from report to escalation
          </h2>
          <p className="section-copy">
            NagarNiti replaces fragmented reporting with one structured pipeline that validates,
            formats, and routes issues through a more accountable civic process.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{
            position: "relative",
            gap: "var(--space-6)",
          }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.id}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" },
                  },
                }}
                className="card"
                style={{
                  display: "grid",
                  gap: "var(--space-5)",
                  minHeight: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background:
                      index === 0
                        ? "rgba(11, 107, 105, 0.18)"
                        : "rgba(21, 32, 43, 0.06)",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-3)",
                  }}
                >
                  <span
                    style={{
                      width: "2.6rem",
                      height: "2.6rem",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--color-surface-3)",
                      color: "var(--color-text-muted)",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {step.number}
                  </span>

                  <span className="badge badge-info">{step.badge}</span>
                </div>

                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    border: "1px solid rgba(11, 107, 105, 0.10)",
                  }}
                >
                  <Icon size={20} />
                </div>

                <div className="stack-sm">
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      color: "var(--color-text)",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: 1.7,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          #how-it-works-section [style*="grid-template-columns: repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          #how-it-works-section [style*="grid-template-columns: repeat(4, minmax(0, 1fr))"],
          #how-it-works-section [style*="grid-template-columns: repeat(2, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
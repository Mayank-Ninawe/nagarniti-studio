import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { useAppStore } from "../store/appStore";
import PageLayout from "../components/layout/PageLayout";

import Hero3DScene from "../components/landing/Hero3DScene";
import StatsStrip from "../components/landing/StatsStrip";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import AgentShowcase from "../components/landing/AgentShowcase";
import DashboardPreviewSection from "../components/landing/DashboardPreviewSection";
import LeaderboardPreviewSection from "../components/landing/LeaderboardPreviewSection";
import FinalCTASection from "../components/landing/FinalCTASection";

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export default function LandingPage() {
  const { user } = useAppStore();

  return (
    <PageLayout>
      <div id="landing-page-root">
        <section
          id="hero-section"
          className="page-section page-section--hero"
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(247,245,240,0.96) 100%)",
            borderBottom: "1px solid var(--color-divider)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(to right, rgba(11,107,105,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,107,105,0.03) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent 92%)",
              pointerEvents: "none",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "auto auto 8% 50%",
              width: "42rem",
              height: "42rem",
              transform: "translateX(-10%)",
              background: "var(--hero-glow)",
              filter: "blur(8px)",
              pointerEvents: "none",
            }}
          />

          <div className="container--hero" style={{ position: "relative", zIndex: 2 }}>
            <div
              className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] items-center"
              style={{
                gap: "clamp(2rem, 5vw, 5rem)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "var(--space-6)",
                  maxWidth: "var(--hero-text-max)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <span className="eyebrow">
                    <Sparkles size={14} />
                    Sequential civic intelligence pipeline
                  </span>
                </motion.div>

                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                  <h1
                    style={{
                      maxWidth: "11ch",
                      color: "var(--color-text)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 900,
                    }}
                  >
                    Empowering Pune with autonomous civic coordination.
                  </h1>
                </motion.div>

                <motion.p
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  style={{
                    maxWidth: "62ch",
                    fontSize: "var(--text-md)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  NagarNiti helps residents report road, water, and public-space issues with a
                  single photo. Our multi-agent workflow validates duplicates, scores urgency,
                  drafts structured municipal complaints, and routes them into a transparent civic
                  action pipeline.
                </motion.p>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-4)",
                    alignItems: "center",
                    paddingTop: "var(--space-2)",
                  }}
                >
                  {user ? (
                    <Link to="/report" className="btn btn-primary btn-lg">
                      <span>Report an Issue</span>
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <Link to="/auth" className="btn btn-primary btn-lg">
                      <span>Create Citizen Account</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}

                  <Link
                    to={user ? "/dashboard" : "/auth"}
                    className="btn btn-outline btn-lg"
                  >
                    <span>Explore Interactive Map</span>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65, duration: 0.5 }}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-4)",
                    alignItems: "center",
                    color: "var(--color-text-muted)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <Shield size={14} color="var(--color-primary)" />
                    Ward-level civic verification active
                  </span>
                  <span style={{ color: "var(--color-text-faint)" }}>Pune districts connected</span>
                </motion.div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 0,
                }}
              >
                <Hero3DScene />
              </div>
            </div>
          </div>
        </section>

        <StatsStrip />
        <HowItWorksSection />
        <AgentShowcase />
        <DashboardPreviewSection />
        <LeaderboardPreviewSection />
        <FinalCTASection user={user} />

        <footer
          id="landing-footer"
          className="page-section page-section--tight"
          style={{
            borderTop: "1px solid var(--color-divider)",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <div className="container">
            <div
              className="grid grid-cols-1 md:grid-cols-2 items-end"
              style={{
                gap: "var(--space-8)",
              }}
            >
              <div style={{ display: "grid", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span
                    className="navbar-logo-wrapper"
                    aria-hidden="true"
                    style={{ width: "2.5rem", height: "2.5rem" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="40" height="40" rx="12" fill="currentColor" opacity="0.12" />
                      <path
                        d="M20 8.75c-4.97 0-9 4.03-9 9 0 5.57 7.03 12.67 8.38 13.9a.9.9 0 0 0 1.24 0C21.97 30.42 29 23.32 29 17.75c0-4.97-4.03-9-9-9Zm0 11.5a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>

                  <div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: "var(--text-base)",
                        letterSpacing: "-0.03em",
                        color: "var(--color-text)",
                      }}
                    >
                      NagarNiti
                    </div>
                    <div
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "var(--text-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Autonomous civic coordination
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    maxWidth: "56ch",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  A modern civic reporting experience designed to help residents document local
                  infrastructure issues, trigger structured AI review, and improve accountability
                  across ward-level systems.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  justifyItems: "end",
                  gap: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    gap: "var(--space-4)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <a href="#hero-section">Back to top</a>
                  <Link to={user ? "/dashboard" : "/auth"}>Map</Link>
                  <Link to="/leaderboard">Leaderboard</Link>
                  {user ? <Link to="/profile">Profile</Link> : <Link to="/auth">Sign in</Link>}
                </div>

                <p
                  style={{
                    textAlign: "right",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-faint)",
                  }}
                >
                  © 2026 NagarNiti. Built for transparent civic reporting and structured community
                  escalation.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageLayout>
  );
}
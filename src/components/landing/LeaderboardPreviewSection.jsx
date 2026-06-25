import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Star,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";

const leaders = [
  {
    rank: 1,
    name: "Rohan Deshmukh",
    initials: "RD",
    issues: 24,
    xp: "1,240 XP",
    standing: "Platinum",
    tone: "teal",
  },
  {
    rank: 2,
    name: "Shalini Mehta",
    initials: "SM",
    issues: 18,
    xp: "890 XP",
    standing: "Gold",
    tone: "amber",
  },
  {
    rank: 3,
    name: "Amit Joshi",
    initials: "AJ",
    issues: 11,
    xp: "580 XP",
    standing: "Silver",
    tone: "slate",
  },
];

function toneStyles(tone) {
  if (tone === "teal") {
    return {
      avatar: {
        background: "rgba(11,107,105,0.10)",
        color: "var(--color-primary)",
        border: "1px solid rgba(11,107,105,0.14)",
      },
      badge: "badge badge-info",
    };
  }

  if (tone === "amber") {
    return {
      avatar: {
        background: "rgba(245,158,11,0.12)",
        color: "#b45309",
        border: "1px solid rgba(245,158,11,0.18)",
      },
      badge: "badge badge-warning",
    };
  }

  return {
    avatar: {
      background: "rgba(100,116,139,0.10)",
      color: "#475569",
      border: "1px solid rgba(100,116,139,0.16)",
    },
    badge: "badge badge-neutral",
  };
}

export default function LeaderboardPreviewSection() {
  return (
    <section
      id="leaderboard-preview-section"
      className="page-section"
      style={{
        borderBottom: "1px solid var(--color-divider)",
        background: "rgba(255,255,255,0.95)",
      }}
    >
      <div className="container">
        <div
          className="grid grid-cols-1 lg:grid-cols-[0.96fr_1.04fr]"
          style={{
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "center",
          }}
        >
          <div className="stack-lg">
            <div className="stack-md">
              <span className="eyebrow">Community participation</span>
              <h2 className="section-title section-title--wide">
                Trusted residents can build visible civic momentum
              </h2>
              <p className="section-copy section-copy--sm">
                NagarNiti highlights verified contributors who consistently report issues, support
                valid neighborhood claims, and help push unresolved infrastructure problems into
                public view.
              </p>
            </div>

            <div className="stack-md">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "var(--space-4)",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Star size={18} />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: 800,
                      color: "var(--color-text)",
                      letterSpacing: "-0.02em",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Contribution-based reputation
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: 1.65,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Repeatedly verified reports and confirmed resolutions can increase a citizen’s
                    standing and make their endorsements more trusted in duplicate-heavy areas.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "var(--space-4)",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(245,158,11,0.10)",
                    color: "#b45309",
                  }}
                >
                  <Users size={18} />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: 800,
                      color: "var(--color-text)",
                      letterSpacing: "-0.02em",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Neighborhood collaboration
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: 1.65,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Residents can reinforce legitimate local complaints, helping recurring ward-level
                    problems gain faster visibility and stronger collective pressure.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Link to="/leaderboard" className="btn btn-outline btn-lg">
                <span>Explore citizen leaderboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div>
            <div
              style={{
                maxWidth: "36rem",
                marginInline: "auto",
                borderRadius: "2rem",
                background: "linear-gradient(180deg, rgba(248,247,243,1) 0%, rgba(255,255,255,1) 100%)",
                border: "1px solid rgba(21, 32, 43, 0.08)",
                boxShadow: "var(--shadow-xl)",
                padding: "clamp(1.1rem, 2vw, 1.5rem)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  marginBottom: "var(--space-5)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                  <span
                    style={{
                      width: "2.6rem",
                      height: "2.6rem",
                      borderRadius: "1rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(245,158,11,0.12)",
                      color: "#b45309",
                    }}
                  >
                    <Trophy size={18} />
                  </span>

                  <div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-text)",
                      }}
                    >
                      Ward 15 civic leaders
                    </div>
                    <div
                      style={{
                        marginTop: "0.12rem",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Verified local participation standings
                    </div>
                  </div>
                </div>

                <span className="badge badge-neutral">Active cycle</span>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {leaders.map((leader) => {
                  const styles = toneStyles(leader.tone);

                  return (
                    <article
                      key={leader.rank}
                      id={`leader-row-${leader.rank}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto auto 1fr auto",
                        gap: "var(--space-4)",
                        alignItems: "center",
                        padding: "0.95rem 1rem",
                        borderRadius: "1.15rem",
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(21, 32, 43, 0.07)",
                      }}
                    >
                      <div
                        style={{
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "999px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "var(--color-surface-3)",
                          color: "var(--color-text-muted)",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          letterSpacing: "0.05em",
                          flexShrink: 0,
                        }}
                      >
                        0{leader.rank}
                      </div>

                      <div
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          borderRadius: "999px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          flexShrink: 0,
                          ...styles.avatar,
                        }}
                      >
                        {leader.initials}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "var(--text-base)",
                            fontWeight: 800,
                            color: "var(--color-text)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {leader.name}
                        </div>
                        <div
                          style={{
                            marginTop: "0.18rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.38rem",
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          <Award size={13} />
                          {leader.issues} verified issues · {leader.xp}
                        </div>
                      </div>

                      <span className={styles.badge}>{leader.standing}</span>
                    </article>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "var(--space-5)",
                  paddingTop: "var(--space-5)",
                  borderTop: "1px solid var(--color-divider)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                <UserCheck size={16} color="var(--color-primary)" />
                More than 480 residents are actively contributing across Pune Ward 15.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #leaderboard-preview-section .container > div {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          #leaderboard-preview-section article[id^="leader-row-"] {
            grid-template-columns: auto 1fr !important;
            align-items: start !important;
          }

          #leaderboard-preview-section article[id^="leader-row-"] > :nth-child(3) {
            grid-column: 1 / -1;
          }

          #leaderboard-preview-section article[id^="leader-row-"] > :nth-child(4) {
            justify-self: start;
          }
        }
      `}</style>
    </section>
  );
}
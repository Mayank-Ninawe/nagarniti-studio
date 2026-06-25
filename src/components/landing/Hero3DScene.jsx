import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, MapPin, Radar } from "lucide-react";

export default function Hero3DScene() {
  const cityHeroImage =
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80";

  return (
    <div
      id="hero-3d-scene-container"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "var(--hero-visual-max)",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1600px",
        userSelect: "none",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "10% 12%",
          borderRadius: "999px",
          background: "var(--hero-glow)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "8%",
          borderRadius: "50%",
          border: "1px dashed rgba(11, 107, 105, 0.12)",
          transform: "translateZ(-40px)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "18%",
          borderRadius: "50%",
          border: "1px solid rgba(11, 107, 105, 0.08)",
          transform: "translateZ(-20px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 8, rotateY: -10 }}
        animate={{ opacity: 1, y: 0, rotateX: 4, rotateY: -6 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "9% 7% 7% 13%",
            borderRadius: "2rem",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(234,241,239,0.9) 100%)",
            border: "1px solid rgba(21, 32, 43, 0.06)",
            boxShadow: "var(--shadow-md)",
            transform: "translateZ(-52px)",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "6% 10% 10% 10%",
            borderRadius: "2rem",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(247,245,240,0.94) 100%)",
            border: "1px solid rgba(21, 32, 43, 0.07)",
            boxShadow: "var(--shadow-sm)",
            transform: "translateZ(-18px)",
          }}
        />

        <div
          className="card card--hero"
          style={{
            position: "relative",
            width: "82%",
            aspectRatio: "0.94 / 1",
            padding: "0.85rem",
            overflow: "hidden",
            transform: "translateZ(0)",
            borderRadius: "2rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              borderRadius: "1.4rem",
              background: "var(--color-surface-3)",
              border: "1px solid rgba(255,255,255,0.55)",
            }}
          >
            <img
              src={cityHeroImage}
              alt="NagarNiti live civic monitoring view"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(0.96) contrast(1.03) brightness(0.96)",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(10,18,28,0.08) 0%, rgba(10,18,28,0.04) 20%, rgba(10,18,28,0.68) 100%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
                right: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.45rem 0.7rem",
                  borderRadius: "999px",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#d7f6ef",
                  background: "rgba(7, 37, 36, 0.55)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span
                  style={{
                    width: "0.45rem",
                    height: "0.45rem",
                    borderRadius: "999px",
                    background: "#34d399",
                    boxShadow: "0 0 0 6px rgba(52,211,153,0.12)",
                  }}
                />
                Live civic grid
              </span>

              <span
                style={{
                  padding: "0.4rem 0.65rem",
                  borderRadius: "999px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.88)",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                }}
              >
                Ward 15 · Pune
              </span>
            </div>

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "32%",
                left: "58%",
                width: "1rem",
                height: "1rem",
                borderRadius: "999px",
                background: "rgba(16, 185, 129, 0.28)",
                border: "1px solid rgba(52, 211, 153, 0.9)",
                boxShadow: "0 0 0 12px rgba(16,185,129,0.10)",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "54%",
                left: "28%",
                width: "0.8rem",
                height: "0.8rem",
                borderRadius: "999px",
                background: "rgba(245, 158, 11, 0.25)",
                border: "1px solid rgba(251, 191, 36, 0.8)",
                boxShadow: "0 0 0 10px rgba(245,158,11,0.10)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "1rem",
                right: "1rem",
                bottom: "1rem",
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div style={{ color: "white" }}>
                <div
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    color: "#99f6e4",
                    marginBottom: "0.3rem",
                  }}
                >
                  Active monitoring corridor
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Pune infrastructure command layer
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.35rem",
                  alignItems: "end",
                  padding: "0.55rem",
                  borderRadius: "1rem",
                  background: "rgba(7, 18, 24, 0.62)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {[14, 24, 18, 28].map((height, index) => (
                  <span
                    key={index}
                    style={{
                      width: "0.34rem",
                      height: `${height}px`,
                      borderRadius: "999px",
                      background:
                        index === 3
                          ? "linear-gradient(180deg, #2dd4bf 0%, #0f766e 100%)"
                          : "rgba(45, 212, 191, 0.5)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ y: 6 }}
          animate={{ y: -8 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 4.6,
            ease: "easeInOut",
          }}
          className="card card--soft"
          style={{
            position: "absolute",
            top: "10%",
            left: "-2%",
            width: "clamp(180px, 36%, 220px)",
            padding: "0.9rem 1rem",
            borderRadius: "1.25rem",
            transform: "translateZ(48px)",
            zIndex: 3,
          }}
        >
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "start" }}>
            <div
              style={{
                width: "2.4rem",
                height: "2.4rem",
                borderRadius: "0.9rem",
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.66rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  marginBottom: "0.2rem",
                }}
              >
                Validation agent
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                }}
              >
                Duplicate-free report confirmed
              </div>
              <div
                style={{
                  marginTop: "0.28rem",
                  fontSize: "0.72rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Geotag match confidence: 99.2%
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: -6 }}
          animate={{ y: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 5.2,
            ease: "easeInOut",
            delay: 0.8,
          }}
          style={{
            position: "absolute",
            right: "-4%",
            bottom: "8%",
            width: "clamp(190px, 38%, 235px)",
            padding: "1rem",
            borderRadius: "1.25rem",
            background: "rgba(12, 18, 28, 0.9)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "blur(12px)",
            transform: "translateZ(58px)",
            zIndex: 4,
          }}
        >
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "start" }}>
            <div
              style={{
                width: "2.4rem",
                height: "2.4rem",
                borderRadius: "0.9rem",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#fbbf24",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid rgba(251,191,36,0.18)",
              }}
            >
              <AlertTriangle size={18} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.66rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#fbbf24",
                  }}
                >
                  Urgency engine
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    padding: "0.22rem 0.38rem",
                    borderRadius: "999px",
                    background: "rgba(239,68,68,0.12)",
                    color: "#fda4af",
                    border: "1px solid rgba(248,113,113,0.16)",
                  }}
                >
                  Critical
                </span>
              </div>

              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                Waterlogging risk elevated to 8.7
              </div>

              <div
                style={{
                  marginTop: "0.3rem",
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Weather, density, and impact signals fused live
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          style={{
            position: "absolute",
            right: "-1%",
            top: "34%",
            display: "flex",
            alignItems: "center",
            gap: "0.7rem",
            width: "clamp(150px, 28%, 180px)",
            padding: "0.8rem 0.9rem",
            borderRadius: "1rem",
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(21, 32, 43, 0.08)",
            boxShadow: "var(--shadow-sm)",
            backdropFilter: "blur(10px)",
            transform: "translateZ(34px)",
            zIndex: 2,
          }}
        >
          <span
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.8rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(11, 107, 105, 0.08)",
              color: "var(--color-primary)",
              flexShrink: 0,
            }}
          >
            <MapPin size={16} />
          </span>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                color: "var(--color-text)",
                lineHeight: 1.1,
              }}
            >
              Viman Nagar corridor
            </div>
            <div
              style={{
                marginTop: "0.16rem",
                fontSize: "0.68rem",
                color: "var(--color-text-muted)",
              }}
            >
              Dispatch route initiated
            </div>
          </div>
        </motion.div>

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "16%",
            bottom: "14%",
            width: "4.25rem",
            height: "4.25rem",
            borderRadius: "999px",
            border: "1px solid rgba(11,107,105,0.12)",
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(6px)",
            transform: "translateZ(10px)",
          }}
        >
          <Radar size={20} color="var(--color-primary)" />
        </div>
      </motion.div>
    </div>
  );
}
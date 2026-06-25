import { Link } from "react-router-dom";
import { ArrowRight, Map, Sparkles } from "lucide-react";

export default function FinalCTASection({ user }) {
  return (
    <section
      id="final-cta-section"
      className="page-section"
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0a6e6b 0%, #085a57 45%, #073f3d 100%)",
        color: "white",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "auto auto -28% -10%",
          width: "24rem",
          height: "24rem",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.06)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "12%",
          right: "-6%",
          width: "20rem",
          height: "20rem",
          borderRadius: "999px",
          background: "rgba(94,234,212,0.10)",
          filter: "blur(38px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "52rem",
            marginInline: "auto",
            textAlign: "center",
            display: "grid",
            gap: "var(--space-6)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginInline: "auto",
              padding: "0.5rem 0.85rem",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.82)",
            }}
          >
            <Sparkles size={14} />
            Active Pune civic initiative
          </div>

          <div className="stack-md" style={{ alignItems: "center" }}>
            <h2
              style={{
                color: "white",
                maxWidth: "14ch",
                marginInline: "auto",
              }}
            >
              Turn a local issue into visible civic action.
            </h2>

            <p
              style={{
                maxWidth: "44rem",
                marginInline: "auto",
                fontSize: "var(--text-md)",
                lineHeight: 1.75,
                color: "rgba(236, 253, 245, 0.82)",
              }}
            >
              Report road damage, water leakage, and neighborhood hazards with a structured
              workflow that validates evidence, drafts formal complaints, and tracks public
              escalation through the ward system.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "var(--space-4)",
              paddingTop: "var(--space-2)",
            }}
          >
            {user ? (
              <Link
                id="btn-final-cta-report"
                to="/report"
                className="btn btn-inverse btn-lg"
              >
                <span>Report an issue now</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                id="btn-final-cta-auth"
                to="/auth"
                className="btn btn-inverse btn-lg"
              >
                <span>Create citizen account</span>
                <ArrowRight size={16} />
              </Link>
            )}

            <Link
              id="btn-final-cta-map"
              to="/dashboard"
              className="btn btn-ghost-light btn-lg"
            >
              <Map size={16} />
              <span>Open ward map</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
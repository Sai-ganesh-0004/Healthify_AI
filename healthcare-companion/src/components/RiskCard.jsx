const riskConfig = {
  Low:    { icon: "✅", color: "low",    label: "Low Risk",    bg: "rgba(0,212,170,0.08)",   border: "rgba(0,212,170,0.2)"   },
  Medium: { icon: "⚠️", color: "medium", label: "Medium Risk", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)"  },
  High:   { icon: "🚨", color: "high",   label: "High Risk",   bg: "rgba(255,77,109,0.08)",  border: "rgba(255,77,109,0.2)"  },
};

export default function RiskCard({ result }) {
  if (!result) return null;

  const cfg = riskConfig[result.risk_level] || riskConfig["Medium"];

  return (
    <div className="result-card">
      {/* Header */}
      <div className="result-header">
        <div className={`result-icon ${cfg.color}`}>{cfg.icon}</div>
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "4px" }}>
            Possible Condition
          </div>
          <div style={{
            fontFamily: "Syne", fontWeight: 700,
            fontSize: "1.2rem", color: "var(--text)", marginBottom: "8px"
          }}>
            {result.disease}
          </div>
          <span className={`risk-badge ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      <div className="section-divider" />

      {/* Advice */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "8px", fontSize: "0.95rem" }}>
          💡 Medical Advice
        </div>
        <p style={{ color: "var(--text2)", fontSize: "0.9rem", lineHeight: "1.7" }}>
          {result.advice}
        </p>
      </div>

      {/* Diet tags */}
      {result.diet && result.diet.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>
            🥗 Recommended Foods
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {result.diet.map((d, i) => (
              <span key={i} className="diet-tag">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* High risk warning */}
      {result.risk_level === "High" && (
        <div style={{
          padding: "14px 16px",
          background: "rgba(255,77,109,0.08)",
          border: "1px solid rgba(255,77,109,0.2)",
          borderRadius: "var(--radius-sm)",
          color: "var(--danger)",
          fontSize: "0.9rem",
        }}>
          ⚠️ High risk detected. Please consult a doctor immediately.
        </div>
      )}
    </div>
  );
}
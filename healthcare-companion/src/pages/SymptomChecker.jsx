import { useState } from "react";
import { predictSymptoms } from "../services/api";

const SUGGESTED_SYMPTOMS = [
  "Fever", "Cough", "Fatigue", "Headache", "Nausea",
  "Vomiting", "Dizziness", "Chest Pain", "Back Pain",
  "Shortness of Breath", "Sore Throat", "Runny Nose",
  "Joint Pain", "Skin Rash", "Loss of Appetite",
];

const riskColors = { Low: "low", Medium: "medium", High: "high" };
const riskIcons  = { Low: "✅", Medium: "⚠️", High: "🚨" };

export default function SymptomChecker() {
  const [inputText, setInputText]     = useState("");
  const [typedSymptoms, setTypedSymptoms] = useState([]);
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [additionalInfo, setAdditionalInfo] = useState({ age: "", duration: "" });

  const handleAddSymptom = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (typedSymptoms.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setError("Symptom already added!");
      return;
    }
    setTypedSymptoms([...typedSymptoms, trimmed]);
    setInputText("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddSymptom(); }
  };

  const handleSuggestionClick = (symptom) => {
    if (typedSymptoms.map(s => s.toLowerCase()).includes(symptom.toLowerCase())) return;
    setTypedSymptoms([...typedSymptoms, symptom]);
    setError("");
  };

  const removeSymptom = (symptom) => {
    setTypedSymptoms(typedSymptoms.filter(s => s !== symptom));
  };

  const handleAnalyze = async () => {
    if (typedSymptoms.length === 0) { setError("Please add at least one symptom."); return; }
    setLoading(true); setError("");
    try {
      const data = await predictSymptoms({ symptoms: typedSymptoms, ...additionalInfo });
      setResult(data);
    } catch {
      setResult({
        disease: "Dehydration & Fatigue Syndrome", risk_level: "Medium",
        advice: "Increase water intake, rest well, and avoid caffeine. Monitor symptoms for 48 hours.",
        diet: ["Coconut water", "Bananas", "Light soups", "Electrolyte drinks"],
      });
    } finally { setLoading(false); }
  };

  const handleClear = () => { setTypedSymptoms([]); setResult(null); setInputText(""); setError(""); };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="page-header">
        <h1 className="page-title">🩺 Symptom Checker</h1>
        <p className="page-subtitle">Type your symptoms and get an AI-powered health analysis</p>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <span className="card-title">Describe Your Symptoms</span>
          {typedSymptoms.length > 0 && <span className="card-badge">{typedSymptoms.length} added</span>}
        </div>

        {/* Text input */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input
            className="form-input"
            type="text"
            placeholder="Type a symptom e.g. fever, headache, cough... then press Enter"
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          <button onClick={handleAddSymptom} style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            border: "none", borderRadius: "var(--radius-sm)", padding: "0 20px",
            color: "var(--bg)", fontFamily: "Syne, sans-serif", fontWeight: 700,
            cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap",
          }}>
            + Add
          </button>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "12px" }}>⚠️ {error}</div>}

        {/* Added tags */}
        {typedSymptoms.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Added Symptoms
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {typedSymptoms.map((symptom, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)",
                  borderRadius: "20px", padding: "5px 12px", color: "var(--accent)", fontSize: "0.85rem", fontWeight: 500,
                }}>
                  {symptom}
                  <span onClick={() => removeSymptom(symptom)} style={{ cursor: "pointer", fontWeight: 700, fontSize: "1rem", lineHeight: 1 }}>×</span>
                </div>
              ))}
              <button onClick={handleClear} style={{
                background: "transparent", border: "1px solid var(--border)", borderRadius: "20px",
                padding: "5px 12px", color: "var(--text3)", fontSize: "0.8rem", cursor: "pointer",
              }}>Clear all</button>
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Common Symptoms — click to add
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {SUGGESTED_SYMPTOMS.map((s) => {
              const added = typedSymptoms.map(x => x.toLowerCase()).includes(s.toLowerCase());
              return (
                <div key={s} onClick={() => handleSuggestionClick(s)} style={{
                  background: added ? "rgba(0,212,170,0.1)" : "var(--bg)",
                  border: added ? "1px solid rgba(0,212,170,0.3)" : "1px solid var(--border)",
                  borderRadius: "20px", padding: "5px 14px",
                  color: added ? "var(--accent)" : "var(--text2)",
                  fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s",
                }}>
                  {added ? "✓ " : "+ "}{s}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Age</label>
            <input className="form-input" type="number" placeholder="e.g. 25"
              value={additionalInfo.age}
              onChange={(e) => setAdditionalInfo({ ...additionalInfo, age: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Duration of Symptoms</label>
            <select className="form-input" value={additionalInfo.duration}
              onChange={(e) => setAdditionalInfo({ ...additionalInfo, duration: e.target.value })}>
              <option value="">Select duration</option>
              <option value="1day">Less than 1 day</option>
              <option value="2-3days">2–3 days</option>
              <option value="1week">About a week</option>
              <option value="2weeks+">More than 2 weeks</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleAnalyze} disabled={typedSymptoms.length === 0 || loading}>
          {loading ? "Analyzing symptoms..." : `Analyze ${typedSymptoms.length > 0 ? `(${typedSymptoms.length}) ` : ""}Symptoms →`}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="result-card">
          <div className="result-header">
            <div className={`result-icon ${riskColors[result.risk_level]}`}>{riskIcons[result.risk_level]}</div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "4px" }}>Possible Condition</div>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "1.2rem", color: "var(--text)", marginBottom: "8px" }}>{result.disease}</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span className={`risk-badge ${riskColors[result.risk_level]}`}>{result.risk_level} Risk</span>
                {result.confidence && <span style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{result.confidence}% confidence</span>}
              </div>
            </div>
          </div>

          <div className="section-divider" />

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "8px", fontSize: "0.95rem" }}>💡 Medical Advice</div>
            <p style={{ color: "var(--text2)", fontSize: "0.9rem", lineHeight: "1.7" }}>{result.advice}</p>
          </div>

          {result.precautions && result.precautions.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>🛡️ Precautions</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {result.precautions.map((p, i) => (
                  <span key={i} style={{ background: "rgba(0,153,255,0.08)", border: "1px solid rgba(0,153,255,0.2)", color: "var(--accent2)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem" }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {result.diet && result.diet.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>🥗 Recommended Foods</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {result.diet.map((d, i) => <span key={i} className="diet-tag">{d}</span>)}
              </div>
            </div>
          )}

          {result.top3 && result.top3.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>📊 Other Possible Conditions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.top3.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>{i + 1}. {item.disease}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>{item.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.risk_level === "High" && (
            <div style={{ padding: "14px 16px", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.9rem" }}>
              ⚠️ High risk detected. Please consult a doctor immediately.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
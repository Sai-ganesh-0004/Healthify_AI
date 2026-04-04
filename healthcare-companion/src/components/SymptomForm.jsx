const ALL_SYMPTOMS = [
  "Headache", "Fatigue", "Fever", "Cough", "Nausea", "Dizziness",
  "Chest Pain", "Shortness of Breath", "Back Pain", "Joint Pain",
  "Sore Throat", "Runny Nose", "Vomiting", "Diarrhea", "Loss of Appetite",
  "Insomnia", "Anxiety", "Dehydration", "Blurred Vision", "Rash",
  "Swelling", "Weakness", "Palpitations", "Abdominal Pain",
];

export default function SymptomForm({ selected, onToggle, onSubmit, loading, additionalInfo, onInfoChange }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Select Your Symptoms</span>
        {selected.length > 0 && (
          <span className="card-badge">{selected.length} selected</span>
        )}
      </div>

      <div className="symptom-grid">
        {ALL_SYMPTOMS.map((symptom) => (
          <div
            key={symptom}
            className={`symptom-chip ${selected.includes(symptom) ? "selected" : ""}`}
            onClick={() => onToggle(symptom)}
          >
            <span>{selected.includes(symptom) ? "✓" : "+"}</span>
            {symptom}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
        <div className="form-group">
          <label className="form-label">Your Age</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 25"
            value={additionalInfo.age}
            onChange={(e) => onInfoChange({ ...additionalInfo, age: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Duration of Symptoms</label>
          <select
            className="form-input"
            value={additionalInfo.duration}
            onChange={(e) => onInfoChange({ ...additionalInfo, duration: e.target.value })}
          >
            <option value="">Select duration</option>
            <option value="1day">Less than 1 day</option>
            <option value="2-3days">2–3 days</option>
            <option value="1week">About a week</option>
            <option value="2weeks+">More than 2 weeks</option>
          </select>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={onSubmit}
        disabled={selected.length === 0 || loading}
        style={{ marginTop: "8px" }}
      >
        {loading ? "Analyzing..." : `Analyze ${selected.length > 0 ? `(${selected.length}) ` : ""}Symptoms →`}
      </button>
    </div>
  );
}
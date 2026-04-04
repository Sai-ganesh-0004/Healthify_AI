export default function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">
      {/* Avatar with availability dot */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <div className="doctor-avatar">{doctor.avatar}</div>
        <div style={{
          position: "absolute",
          bottom: "-4px", right: "-4px",
          width: "14px", height: "14px",
          borderRadius: "50%",
          background: doctor.available ? "var(--accent)" : "var(--text3)",
          border: "2px solid var(--card)",
        }} />
      </div>

      <div className="doctor-name">{doctor.name}</div>
      <div className="doctor-spec">{doctor.specialty}</div>
      <div className="doctor-exp">{doctor.experience}</div>

      {/* Rating */}
      <div className="doctor-rating">
        ⭐ {doctor.rating}
        <span style={{ color: "var(--text3)" }}>({doctor.reviews} reviews)</span>
      </div>

      {/* Availability */}
      <div style={{ fontSize: "0.75rem", marginBottom: "14px" }}>
        <span style={{ color: doctor.available ? "var(--accent)" : "var(--text3)" }}>
          {doctor.available ? "● Available Today" : "● Not Available"}
        </span>
      </div>

      {/* Location if provided */}
      {doctor.location && (
        <div style={{
          fontSize: "0.78rem",
          color: "var(--text3)",
          marginBottom: "12px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
        }}>
          📍 {doctor.location}
        </div>
      )}

      <button className="btn-book" disabled={!doctor.available}>
        {doctor.available ? "Book Appointment" : "Unavailable"}
      </button>
    </div>
  );
}
import { useState, useEffect } from "react";
import { getHealthReports, getReportById, createReport, deleteReport } from "../services/api";

const RISK_COLORS = { Low: "#00d4aa", Medium: "#ffd93d", High: "#ff6b6b" };

export default function Reports() {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [form, setForm] = useState({
    reportName: "",
    doctorName: "",
    hospitalName: "",
    reportDate: "",
    risk: "Low",
    notes: "",
    file: null,
    filePreview: null,
    fileName: "",
    fileType: "",
  });

  const fetchReports = async () => {
    try {
      const data = await getHealthReports();
      setReports(data.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and PDF files are allowed");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        file,
        fileBase64:  reader.result,
        fileName:    file.name,
        fileType:    file.type,
        filePreview: file.type.startsWith("image/") ? reader.result : null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!form.reportName) { setError("Report name is required"); return; }
    if (!form.fileBase64) { setError("Please select a file to upload"); return; }

    setSubmitting(true);
    setError("");

    try {
      await createReport({
        title:        form.reportName,
        summary:      `Doctor: ${form.doctorName || "Not specified"} | Hospital: ${form.hospitalName || "Not specified"}`,
        risk:         form.risk,
        advice:       form.notes,
        tags:         [form.doctorName, form.hospitalName, form.reportDate].filter(Boolean),
        fileData:     form.fileBase64,
        fileName:     form.fileName,
        fileType:     form.fileType,
        doctorName:   form.doctorName,
        hospitalName: form.hospitalName,
        reportDate:   form.reportDate,
      });

      setSuccess("Report uploaded successfully!");
      setForm({ reportName: "", doctorName: "", hospitalName: "", reportDate: "", risk: "Low", notes: "", file: null, fileBase64: null, filePreview: null, fileName: "", fileType: "" });
      fetchReports();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to save report. Please try again.");
    } finally {
      setSubmitting(false);
    }
    if (false) {
      setError("Upload failed. Please try again.");
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await deleteReport(id);
      setReports(reports.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { setError("Failed to delete report."); }
  };

  const handleView = async (report) => {
    if (selected?._id === report._id) { setSelected(null); return; }
    // Set selected with _id only first so card expands immediately
    setSelected({ ...report, _loading: true });
    try {
      const data = await getReportById(report._id);
      setSelected(data.report);
    } catch (err) {
      console.error("View report error:", err);
      setSelected({ ...report, _loading: false });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Health Reports</h1>
        <p className="page-subtitle">Upload and manage your doctor's health reports</p>
      </div>

      {/* Upload Section */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <span className="card-title">📤 Upload Doctor's Report</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>JPG, PNG, PDF • Max 5MB</span>
        </div>

        {error   && <div style={{ padding: "10px 14px", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "var(--radius-sm)", color: "#ff4d6d", fontSize: "0.85rem", marginBottom: "16px" }}>⚠️ {error}</div>}
        {success && <div style={{ padding: "10px 14px", background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: "var(--radius-sm)", color: "var(--accent)", fontSize: "0.85rem", marginBottom: "16px" }}>✅ {success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Report Name */}
          <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
            <label className="form-label">Report Name *</label>
            <input className="form-input" placeholder="e.g. Blood Test Report, X-Ray Report, ECG Report"
              value={form.reportName} onChange={e => setForm({ ...form, reportName: e.target.value })} />
          </div>

          {/* Doctor Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Doctor Name</label>
            <input className="form-input" placeholder="e.g. Dr. Rajesh Kumar"
              value={form.doctorName} onChange={e => setForm({ ...form, doctorName: e.target.value })} />
          </div>

          {/* Hospital */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Hospital / Clinic</label>
            <input className="form-input" placeholder="e.g. Apollo Hospital"
              value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} />
          </div>

          {/* Report Date */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Report Date</label>
            <input className="form-input" type="date"
              value={form.reportDate} onChange={e => setForm({ ...form, reportDate: e.target.value })} />
          </div>

          {/* Risk Level */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Risk Level</label>
            <select className="form-input" value={form.risk}
              onChange={e => setForm({ ...form, risk: e.target.value })}>
              <option value="Low">Low — Normal / Routine</option>
              <option value="Medium">Medium — Needs Attention</option>
              <option value="High">High — Urgent / Critical</option>
            </select>
          </div>

          {/* Notes */}
          <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
            <label className="form-label">Doctor's Notes / Remarks</label>
            <textarea className="form-input" rows={2} placeholder="Any notes or remarks from the doctor..."
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{ resize: "vertical" }} />
          </div>

          {/* File Upload */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Upload Report File *</label>
            <div
              onClick={() => document.getElementById("fileInput").click()}
              style={{
                border: "2px dashed var(--border)", borderRadius: "var(--radius-sm)",
                padding: "32px", textAlign: "center", cursor: "pointer",
                background: form.file ? "rgba(0,212,170,0.05)" : "var(--bg)",
                borderColor: form.file ? "var(--accent)" : "var(--border)",
                transition: "all 0.2s",
              }}
            >
              {form.filePreview ? (
                <img src={form.filePreview} alt="Preview" style={{ maxHeight: "200px", borderRadius: "8px", marginBottom: "8px" }} />
              ) : (
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                  {form.file && form.fileType === "application/pdf" ? "📄" : "📁"}
                </div>
              )}
              {form.file ? (
                <div>
                  <div style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>✓ {form.fileName}</div>
                  <div style={{ color: "var(--text3)", fontSize: "0.78rem", marginTop: "4px" }}>Click to change file</div>
                </div>
              ) : (
                <div>
                  <div style={{ color: "var(--text2)", fontWeight: 600 }}>Click to upload report</div>
                  <div style={{ color: "var(--text3)", fontSize: "0.8rem", marginTop: "4px" }}>JPG, PNG or PDF • Max 5MB</div>
                </div>
              )}
            </div>
            <input id="fileInput" type="file" accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange} style={{ display: "none" }} />
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button className="btn-primary" onClick={handleUpload}
            disabled={!form.reportName || !form.fileBase64 || submitting}
            style={{ width: "auto", padding: "12px 28px" }}>
            {submitting ? "Uploading..." : "📤 Upload & Save Report →"}
          </button>
        </div>
      </div>

      {/* Stats */}
      {reports.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Reports", value: reports.length,                                  icon: "📋", color: "var(--accent)" },
            { label: "High Risk",     value: reports.filter(r => r.risk === "High").length,   icon: "🚨", color: "#ff6b6b" },
            { label: "Medium Risk",   value: reports.filter(r => r.risk === "Medium").length, icon: "⚠️", color: "#ffd93d" },
            { label: "Low Risk",      value: reports.filter(r => r.risk === "Low").length,    icon: "✅", color: "#00d4aa" },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{stat.icon}</div>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "1.4rem", color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-text">Loading reports...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-text">No reports yet. Upload your first doctor's report above.</div>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((r) => (
            <div key={r._id} className="report-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div className="report-date">
                  {r.reportDate || new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "20px",
                    background: `${RISK_COLORS[r.risk]}22`, color: RISK_COLORS[r.risk],
                    border: `1px solid ${RISK_COLORS[r.risk]}44`,
                  }}>
                    {r.risk} Risk
                  </span>
                  <button onClick={() => handleDelete(r._id)} title="Delete" style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--text3)", fontSize: "1rem", padding: "2px",
                  }}>🗑️</button>
                </div>
              </div>

              {/* Report file icon */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
                  background: r.fileType === "application/pdf" ? "rgba(255,107,107,0.1)" : "rgba(0,153,255,0.1)",
                }}>
                  {r.fileType === "application/pdf" ? "📄" : "🖼️"}
                </div>
                <div>
                  <div className="report-title" style={{ marginBottom: "2px" }}>{r.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{r.fileName}</div>
                </div>
              </div>

              {/* Doctor & Hospital */}
              {(r.doctorName || r.hospitalName) && (
                <div style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: "10px" }}>
                  {r.doctorName   && <span>👨‍⚕️ {r.doctorName}</span>}
                  {r.doctorName && r.hospitalName && <span style={{ margin: "0 6px", color: "var(--border)" }}>|</span>}
                  {r.hospitalName && <span>🏥 {r.hospitalName}</span>}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button onClick={() => handleView(r)} style={{
                  flex: 1, padding: "8px", background: "transparent",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                  color: "var(--accent)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
                }}>
                  {selected?._id === r._id ? "▲ Hide" : "👁️ View"}
                </button>
                {selected?._id === r._id && selected.fileData && !selected._loading && (
                  <a href={selected.fileData} download={selected.fileName} style={{
                    flex: 1, padding: "8px", background: "transparent",
                    border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                    color: "var(--text2)", cursor: "pointer", fontSize: "0.82rem",
                    textDecoration: "none", textAlign: "center", fontWeight: 600,
                  }}>
                    ⬇️ Download
                  </a>
                )}
              </div>

              {/* Expanded View */}
              {selected?._id === r._id && (
                <div style={{ marginTop: "12px", padding: "14px", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  {/* Loading */}
                  {selected._loading && (
                    <div style={{ textAlign: "center", color: "var(--accent)", fontSize: "0.85rem", padding: "12px" }}>
                      ⏳ Loading report...
                    </div>
                  )}
                  {/* Image preview */}
                  {!selected._loading && selected.fileData && selected.fileType?.startsWith("image/") && (
                    <img src={selected.fileData} alt={selected.title}
                      style={{ width: "100%", borderRadius: "8px", marginBottom: "12px", maxHeight: "400px", objectFit: "contain" }} />
                  )}
                  {/* PDF */}
                  {!selected._loading && selected.fileData && selected.fileType === "application/pdf" && (
                    <div style={{ textAlign: "center", padding: "20px", background: "rgba(255,107,107,0.05)", borderRadius: "8px", marginBottom: "12px" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "8px" }}>📄</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "10px" }}>{selected.fileName}</div>
                      <a href={selected.fileData} download={selected.fileName}
                        style={{ padding: "8px 20px", background: "var(--accent)", color: "#000",
                          borderRadius: "var(--radius-sm)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 700 }}>
                        ⬇️ Download PDF
                      </a>
                    </div>
                  )}
                  {/* No file */}
                  {!selected._loading && !selected.fileData && (
                    <div style={{ textAlign: "center", color: "var(--text3)", fontSize: "0.85rem", padding: "8px" }}>
                      No file attached to this report.
                    </div>
                  )}
                  {/* Doctor notes */}
                  {!selected._loading && selected.advice && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text2)", lineHeight: "1.7", marginTop: "8px" }}>
                      <strong style={{ color: "var(--text)" }}>💡 Doctor's Notes:</strong> {selected.advice}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
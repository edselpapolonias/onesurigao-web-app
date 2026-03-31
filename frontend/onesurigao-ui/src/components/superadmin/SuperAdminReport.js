// src/components/superadmin/SuperAdminReport.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import SuperAdminLayout from "../ReusableBar/SuperAdminLayout";

const BASE = "http://127.0.0.1:8000/public";
const ADMINS_URL = "http://127.0.0.1:8000/api/admins/";

const statusColor = { pending: "#f59e0b", approved: "#1976d2", declined: "#e53935", responded: "#16a34a" };
const statusLabel = { pending: "Pending", approved: "Approved", declined: "Declined", responded: "Responded" };

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const XIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

// ─── Report Detail Modal ──────────────────────────────────────────────────────
const ReportDetailModal = ({ report, admins, superAdminID, onClose, onApprove, onDecline }) => {
  const [assignedTo, setAssignedTo] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [mode, setMode] = useState(null); // "approve" | "decline"
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!assignedTo) { alert("Please select an office to assign this report."); return; }
    setSubmitting(true);
    await onApprove(report.reportID, Number(assignedTo), superAdminID);
    setSubmitting(false);
    onClose();
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) { alert("Please provide a reason for declining."); return; }
    setSubmitting(true);
    await onDecline(report.reportID, declineReason, superAdminID);
    setSubmitting(false);
    onClose();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", fontSize: 13, border: "1.5px solid #dde3ec", borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", background: "#fff" };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 620, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0d3b7a, #1976d2)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>Report #{report.reportID}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "'Segoe UI', sans-serif" }}>{report.report} · {report.barangay}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "24px" }}>
          {/* Details */}
          <div style={{ background: "#f8fafd", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Submitted By</span><div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>{report.publicUser ? `${report.publicUser.name} ${report.publicUser.lastName}` : "Anonymous"}</div></div>
              <div><span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Date</span><div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>{new Date(report.submittedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div></div>
              <div><span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Barangay</span><div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>{report.barangay}</div></div>
              <div><span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Location</span><div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>{report.location}</div></div>
            </div>
            <div><span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Description</span><div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", marginTop: 4, lineHeight: 1.6 }}>{report.description}</div></div>
          </div>

          {/* Media */}
          {report.media && report.media.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, fontFamily: "'Segoe UI', sans-serif" }}>Attached Evidence</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {report.media.map((m, i) => (
                  m.mediaType === "image" ? (
                    <img key={i} src={m.file} alt="" style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e8ecf0", cursor: "pointer" }} onClick={() => window.open(m.file, "_blank")} />
                  ) : (
                    <video key={i} src={m.file} controls style={{ width: 160, height: 100, borderRadius: 8, background: "#000" }} />
                  )
                ))}
              </div>
            </div>
          )}

          {/* Action — only for pending reports */}
          {report.status === "pending" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 12, fontFamily: "'Segoe UI', sans-serif" }}>Validate this Report</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button onClick={() => setMode(mode === "approve" ? null : "approve")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: mode === "approve" ? "linear-gradient(135deg, #0d7c3d, #16a34a)" : "#f0fdf4", border: `1.5px solid ${mode === "approve" ? "#16a34a" : "#bbf7d0"}`, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: mode === "approve" ? "#fff" : "#166534", fontFamily: "'Segoe UI', sans-serif" }}>
                  <CheckIcon /> Approve
                </button>
                <button onClick={() => setMode(mode === "decline" ? null : "decline")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: mode === "decline" ? "linear-gradient(135deg, #c62828, #e53935)" : "#fff3f3", border: `1.5px solid ${mode === "decline" ? "#e53935" : "#ffcdd2"}`, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: mode === "decline" ? "#fff" : "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>
                  <XIcon /> Decline
                </button>
              </div>

              {mode === "approve" && (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "16px" }}>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 12, color: "#166534", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Assign to Office <span style={{ color: "#e53935" }}>*</span>
                  </label>
                  <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={{ ...inputStyle, marginBottom: 12, cursor: "pointer" }}>
                    <option value="">Select Office</option>
                    {admins.map(a => <option key={a.adminID} value={a.adminID}>{a.officeName}</option>)}
                  </select>
                  <button onClick={handleApprove} disabled={submitting || !assignedTo} style={{ width: "100%", padding: "11px", fontSize: 13, fontWeight: 700, background: submitting || !assignedTo ? "#9ab8e0" : "linear-gradient(135deg, #0d7c3d, #16a34a)", color: "#fff", border: "none", borderRadius: 8, cursor: submitting || !assignedTo ? "not-allowed" : "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
                    {submitting ? "Approving..." : "✅ Confirm Approval"}
                  </button>
                </div>
              )}

              {mode === "decline" && (
                <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 10, padding: "16px" }}>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 12, color: "#c62828", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Reason for Declining <span style={{ color: "#e53935" }}>*</span>
                  </label>
                  <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3} placeholder="Explain why this report is being declined..." style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} />
                  <button onClick={handleDecline} disabled={submitting || !declineReason.trim()} style={{ width: "100%", padding: "11px", fontSize: 13, fontWeight: 700, background: submitting || !declineReason.trim() ? "#f08080" : "linear-gradient(135deg, #c62828, #e53935)", color: "#fff", border: "none", borderRadius: 8, cursor: submitting || !declineReason.trim() ? "not-allowed" : "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
                    {submitting ? "Declining..." : "❌ Confirm Decline"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Already validated */}
          {report.status !== "pending" && (
            <div style={{ background: report.status === "declined" ? "#fff3f3" : "#f0fdf4", border: `1.5px solid ${report.status === "declined" ? "#ffcdd2" : "#bbf7d0"}`, borderRadius: 10, padding: "14px 16px", fontSize: 13, color: report.status === "declined" ? "#c62828" : "#166534", fontFamily: "'Segoe UI', sans-serif" }}>
              {report.status === "declined" ? `❌ Declined: ${report.rejectionReason}` : report.status === "responded" ? `✅ Responded by ${report.assignedTo?.officeName}` : `✅ Approved and assigned to ${report.assignedTo?.officeName}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Report Card ──────────────────────────────────────────────────────────────
const ReportCard = ({ report, onClick }) => (
  <div onClick={() => onClick(report)} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", cursor: "pointer", borderLeft: `4px solid ${statusColor[report.status] || "#ddd"}`, transition: "box-shadow 0.2s" }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.12)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>{report.report}</span>
          {report.media?.length > 0 && <span style={{ fontSize: 11, background: "#eef2fb", color: "#1976d2", borderRadius: 12, padding: "2px 8px", fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>📎 {report.media.length} file{report.media.length > 1 ? "s" : ""}</span>}
        </div>
        <div style={{ fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif", marginBottom: 4 }}>
          {report.barangay} · {report.location?.length > 40 ? report.location.slice(0, 40) + "..." : report.location}
        </div>
        <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Segoe UI', sans-serif" }}>
          By {report.publicUser ? `${report.publicUser.name} ${report.publicUser.lastName}` : "Anonymous"} · {new Date(report.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>
      <span style={{ background: statusColor[report.status] + "20", color: statusColor[report.status], fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif", whiteSpace: "nowrap", border: `1px solid ${statusColor[report.status]}40`, flexShrink: 0 }}>
        {statusLabel[report.status]}
      </span>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
function SuperAdminReport() {
  const location = useLocation();
  const superAdminID = location.state?.superAdminID || Number(sessionStorage.getItem("superAdminID")) || null;

  const [reports, setReports] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${BASE}/reports/`),
      axios.get(ADMINS_URL),
    ]).then(([repRes, admRes]) => {
      setReports(Array.isArray(repRes.data) ? repRes.data : repRes.data.results || []);
      setAdmins(Array.isArray(admRes.data) ? admRes.data : admRes.data.results || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (reportID, assignedToID, superAdminID) => {
    await axios.patch(`${BASE}/reports/${reportID}/approve/`, { assignedTo_id: assignedToID, superAdminID });
    fetchAll();
  };

  const handleDecline = async (reportID, reason, superAdminID) => {
    await axios.patch(`${BASE}/reports/${reportID}/decline/`, { rejectionReason: reason, superAdminID });
    fetchAll();
  };

  const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter);
  const pendingCount = reports.filter(r => r.status === "pending").length;

  const FilterBtn = ({ val, label }) => (
    <button onClick={() => setFilter(val)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: filter === val ? 700 : 500, background: filter === val ? "linear-gradient(135deg, #0d3b7a, #1976d2)" : "#fff", color: filter === val ? "#fff" : "#555", fontFamily: "'Segoe UI', sans-serif", boxShadow: filter === val ? "0 2px 8px rgba(13,59,122,0.3)" : "0 1px 4px rgba(0,0,0,0.07)", transition: "all 0.2s" }}>
      {label}
    </button>
  );

  return (
    <SuperAdminLayout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>Community Reports</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Validate and assign community reports from residents</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#92400e", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            ⏳ <strong>{pendingCount}</strong> report{pendingCount > 1 ? "s" : ""} pending validation
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <FilterBtn val="all" label={`All (${reports.length})`} />
        <FilterBtn val="pending" label={`Pending (${reports.filter(r => r.status === "pending").length})`} />
        <FilterBtn val="approved" label={`Approved (${reports.filter(r => r.status === "approved").length})`} />
        <FilterBtn val="declined" label={`Declined (${reports.filter(r => r.status === "declined").length})`} />
        <FilterBtn val="responded" label={`Responded (${reports.filter(r => r.status === "responded").length})`} />
      </div>

      {loading && <div style={{ color: "#aaa", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>Loading reports...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          No {filter === "all" ? "" : filter} reports found.
        </div>
      )}

      {!loading && filtered.map(r => <ReportCard key={r.reportID} report={r} onClick={setSelectedReport} />)}

      {selectedReport && (
        <ReportDetailModal report={selectedReport} admins={admins} superAdminID={superAdminID}
          onClose={() => { setSelectedReport(null); fetchAll(); }}
          onApprove={handleApprove} onDecline={handleDecline} />
      )}
    </SuperAdminLayout>
  );
}

export default SuperAdminReport;
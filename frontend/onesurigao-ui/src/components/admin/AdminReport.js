// src/components/admin/AdminReport.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../ReusableBar/Layout";
import MediaGallery from "../ReusableBar/MediaGallery";

const BASE = "http://127.0.0.1:8000/public";

const statusColor = { pending: "#f59e0b", approved: "#1976d2", declined: "#e53935", responded: "#1976d2", resolved: "#16a34a" };
const statusLabel = { pending: "Pending", approved: "Awaiting Response", declined: "Declined", responded: "Responded", resolved: "Resolved ✅" };

// ─── Resolve Confirm Modal ────────────────────────────────────────────────────
const ResolveModal = ({ report, onClose, onConfirm }) => {
  const [resolving, setResolving] = useState(false);
  const handleConfirm = async () => {
    setResolving(true);
    await onConfirm(report.reportID);
    setResolving(false);
    onClose();
  };
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #0d7c3d, #16a34a)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>Mark as Resolved</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>Confirm Resolution</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.6 }}>
            Are you sure this report has been fully resolved? The community member will be notified that their concern has been addressed.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#f0f2f5", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555", fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
            <button onClick={handleConfirm} disabled={resolving} style={{ flex: 2, padding: "11px", background: resolving ? "#9ab8e0" : "linear-gradient(135deg, #0d7c3d, #16a34a)", color: "#fff", border: "none", borderRadius: 9, cursor: resolving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif" }}>
              {resolving ? "Resolving..." : "✅ Yes, Mark as Resolved"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Report Detail Modal ──────────────────────────────────────────────────────
const ReportDetailModal = ({ report, onClose, onRespond, onResolve, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const isResolved = report.isResolved || report.status === "resolved";
  const responseCount = report.adminResponses?.length || 0;

  // Convert media to MediaGallery format
  const galleryMedia = (report.media || []).map(m => ({
    file: m.file,
    mediaType: m.mediaType,
  }));

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) { alert("Please enter a response."); return; }
    setSubmitting(true);
    await onRespond(report.reportID, newResponse);
    setNewResponse("");
    setSubmitting(false);
    onRefresh();
  };

  const handleResolveConfirm = async (reportID) => {
    await onResolve(reportID);
    onRefresh();
  };

  const TabBtn = ({ id, label, badge }) => (
    <button onClick={() => setActiveTab(id)} style={{ flex: 1, padding: "12px 8px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === id ? 700 : 500, background: "transparent", color: activeTab === id ? "#1976d2" : "#888", fontFamily: "'Segoe UI', sans-serif", borderBottom: `2.5px solid ${activeTab === id ? "#1976d2" : "transparent"}`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {label}
      {badge > 0 && <span style={{ background: activeTab === id ? "#1976d2" : "#e0e7ef", color: activeTab === id ? "#fff" : "#555", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  return (
    <>
      <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 640, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #1a56a0, #1976d2)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>Report #{report.reportID}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>{report.report} · {report.barangay}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: statusColor[report.status] + "30", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif", border: "1px solid rgba(255,255,255,0.3)" }}>
                {statusLabel[report.status]}
              </span>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", background: "#fff", flexShrink: 0 }}>
            <TabBtn id="details" label="📋 Report Details" />
            <TabBtn id="response" label="💬 Responses" badge={responseCount} />
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1 }}>

            {/* ── DETAILS TAB ── */}
            {activeTab === "details" && (
              <div style={{ padding: "20px 24px" }}>
                {/* Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Submitted By", value: report.publicUser ? `${report.publicUser.name} ${report.publicUser.lastName}` : "Anonymous" },
                    { label: "Date Submitted", value: new Date(report.submittedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                    { label: "Barangay", value: report.barangay },
                    { label: "Exact Location", value: report.location },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#f8fafd", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Problem Category */}
                <div style={{ background: "#eef5ff", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Problem</div>
                  <div style={{ fontSize: 14, color: "#1a56a0", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700 }}>{report.report}</div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Description</div>
                  <div style={{ fontSize: 13, color: "#444", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.75, background: "#f8fafd", borderRadius: 8, padding: "12px 14px" }}>
                    {report.description}
                  </div>
                </div>

                {/* Media using MediaGallery */}
                {galleryMedia.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                      Attached Evidence ({galleryMedia.length} file{galleryMedia.length > 1 ? "s" : ""})
                    </div>
                    {/* Wrap MediaGallery — it uses padding "0 18px 14px" internally */}
                    <div style={{ margin: "0 -4px" }}>
                      <MediaGallery media={galleryMedia} />
                    </div>
                  </div>
                )}

                {galleryMedia.length === 0 && (
                  <div style={{ background: "#f8fafd", borderRadius: 8, padding: "20px", textAlign: "center", color: "#aaa", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>
                    No media attached to this report.
                  </div>
                )}
              </div>
            )}

            {/* ── RESPONSE TAB ── */}
            {activeTab === "response" && (
              <div style={{ padding: "20px 24px" }}>

                {/* Resolved banner */}
                {isResolved && (
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#166534", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    ✅ <span><strong>Resolved</strong> on {new Date(report.resolvedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}

                {/* Response History */}
                {responseCount > 0 ? (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, fontFamily: "'Segoe UI', sans-serif" }}>
                      Response History ({responseCount})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {report.adminResponses.map((r, i) => (
                        <div key={i} style={{ background: "#f8fafd", border: "1px solid #e8ecf0", borderRadius: 10, padding: "12px 16px", fontFamily: "'Segoe UI', sans-serif" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#1976d2", background: "#eef5ff", padding: "2px 8px", borderRadius: 10 }}>Response #{i + 1} — {r.office}</span>
                            <span style={{ fontSize: 11, color: "#aaa" }}>{new Date(r.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "#333", lineHeight: 1.7 }}>{r.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  !isResolved && (
                    <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "14px 16px", marginBottom: 18, fontSize: 13, color: "#92400e", fontFamily: "'Segoe UI', sans-serif" }}>
                      ⏳ No responses yet. Add the first response below.
                    </div>
                  )
                )}

                {/* Add Response */}
                {!isResolved && (
                  <div style={{ background: "#f8fafd", borderRadius: 10, padding: "16px", border: "1.5px solid #e8ecf0" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, fontFamily: "'Segoe UI', sans-serif" }}>
                      {responseCount > 0 ? "Add Another Response" : "Add Response"}
                    </div>
                    <textarea
                      value={newResponse}
                      onChange={e => setNewResponse(e.target.value)}
                      rows={4}
                      placeholder="Describe the action taken, progress update, or additional information for the community member..."
                      style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #dde3ec", borderRadius: 9, outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", resize: "vertical", minHeight: 100, background: "#fff" }}
                      onFocus={e => e.target.style.borderColor = "#1976d2"}
                      onBlur={e => e.target.style.borderColor = "#dde3ec"}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button
                        onClick={handleSubmitResponse}
                        disabled={submitting || !newResponse.trim()}
                        style={{ flex: 2, padding: "11px", background: submitting || !newResponse.trim() ? "#9ab8e0" : "linear-gradient(135deg, #1a56a0, #1976d2)", color: "#fff", border: "none", borderRadius: 9, cursor: submitting || !newResponse.trim() ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif" }}
                      >
                        {submitting ? "Sending..." : "💬 Send Response"}
                      </button>
                      {responseCount > 0 && (
                        <button
                          onClick={() => setShowResolveModal(true)}
                          style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg, #0d7c3d, #16a34a)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}
                        >
                          ✅ Resolve
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showResolveModal && (
        <ResolveModal
          report={report}
          onClose={() => setShowResolveModal(false)}
          onConfirm={async (id) => { await handleResolveConfirm(id); setShowResolveModal(false); onClose(); }}
        />
      )}
    </>
  );
};

// ─── Report Card (simple, clickable) ─────────────────────────────────────────
const ReportCard = ({ report, onClick }) => {
  const responseCount = report.adminResponses?.length || 0;

  return (
    <div
      onClick={() => onClick(report)}
      style={{ background: "#fff", borderRadius: 12, marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: `4px solid ${statusColor[report.status] || "#ddd"}`, cursor: "pointer", transition: "box-shadow 0.2s, transform 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.13)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>{report.report}</span>
            {report.media?.length > 0 && (
              <span style={{ fontSize: 11, background: "#eef2fb", color: "#1976d2", borderRadius: 12, padding: "2px 8px", fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>📎 {report.media.length}</span>
            )}
            {responseCount > 0 && (
              <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", borderRadius: 12, padding: "2px 8px", fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>💬 {responseCount}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif", marginBottom: 2 }}>{report.barangay} · {report.location?.length > 40 ? report.location.slice(0, 40) + "..." : report.location}</div>
          <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Segoe UI', sans-serif" }}>
            By {report.publicUser ? `${report.publicUser.name} ${report.publicUser.lastName}` : "Anonymous"} · {new Date(report.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{ background: statusColor[report.status] + "20", color: statusColor[report.status], fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif", border: `1px solid ${statusColor[report.status]}40` }}>
            {statusLabel[report.status]}
          </span>
          <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'Segoe UI', sans-serif" }}>Click to view →</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminReport() {
  const location = useLocation();
  const adminID    = location.state?.adminID || Number(sessionStorage.getItem("adminID")) || null;
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = () => {
    setLoading(true);
    axios.get(`${BASE}/reports/`)
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : res.data.results || [];
        setReports(all.filter(r => r.assignedTo?.adminID === adminID));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [adminID]);

  const handleRespond = async (reportID, response) => {
    await axios.patch(`${BASE}/reports/${reportID}/respond/`, { adminResponse: response });
  };

  const handleResolve = async (reportID) => {
    await axios.patch(`${BASE}/reports/${reportID}/resolve/`);
  };

  const handleRefresh = () => {
    fetchReports();
    // Also refresh the selected report data
    if (selectedReport) {
      axios.get(`${BASE}/reports/${selectedReport.reportID}/`)
        .then(res => setSelectedReport(res.data))
        .catch(() => {});
    }
  };

  const filtered = filter === "all" ? reports
    : filter === "active" ? reports.filter(r => r.status === "approved" || r.status === "responded")
    : reports.filter(r => r.status === "resolved");

  const awaitingCount = reports.filter(r => r.status === "approved" || r.status === "responded").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;

  const FilterBtn = ({ val, label, count }) => (
    <button onClick={() => setFilter(val)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: filter === val ? 700 : 500, background: filter === val ? "linear-gradient(135deg, #1a56a0, #1976d2)" : "#fff", color: filter === val ? "#fff" : "#555", fontFamily: "'Segoe UI', sans-serif", boxShadow: filter === val ? "0 2px 8px rgba(25,118,210,0.3)" : "0 1px 4px rgba(0,0,0,0.07)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
      {label}
      {count > 0 && <span style={{ background: filter === val ? "rgba(255,255,255,0.25)" : "#e0e7ef", color: filter === val ? "#fff" : "#555", borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>{count}</span>}
    </button>
  );

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>Assigned Reports</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Community reports assigned to your office</p>
          {officeName && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 }}>Logged in as: {officeName}</p>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <FilterBtn val="all" label="All" count={reports.length} />
        <FilterBtn val="active" label="Active" count={awaitingCount} />
        <FilterBtn val="resolved" label="Resolved" count={resolvedCount} />
      </div>

      {loading && <div style={{ color: "#aaa", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>Loading reports...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          {filter === "all" ? "No reports assigned to your office yet." : `No ${filter === "resolved" ? "resolved" : "active"} reports.`}
        </div>
      )}

      {!loading && filtered.map(r => (
        <ReportCard key={r.reportID} report={r} onClick={setSelectedReport} />
      ))}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => { setSelectedReport(null); fetchReports(); }}
          onRespond={handleRespond}
          onResolve={handleResolve}
          onRefresh={handleRefresh}
        />
      )}
    </Layout>
  );
}

export default AdminReport;
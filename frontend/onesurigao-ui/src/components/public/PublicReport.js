// src/components/public/PublicReport.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../ReusableBar/PublicLayout";

const BASE = "http://127.0.0.1:8000/public";

// ─── Data ─────────────────────────────────────────────────────────────────────
const BARANGAYS = ["Anomar","Balibayon","Bonifacio","Cagniog","Canlanipa","Capalayan","Day-asan","Ipil","Lipata","Mabini","Mabua","Mapawa","Mat-i","Punta Bilar","Quezon","Rizal","Sabang","Serna","Silop","Taft","Togbongon","Washington"];

const PROBLEM_CATEGORIES = {
  "🚧 Infrastructure Issues": ["Damaged Road / Potholes","Flooding / Poor Drainage","Broken Streetlights","Sidewalk Obstruction","Unsafe Bridges"],
  "🚦 Transportation Problems": ["Traffic Congestion","Illegal Parking","Tricycle / Multicab Overloading","No Proper Loading/Unloading Zone","Reckless Driving"],
  "🗑️ Environmental Issues": ["Improper Waste Disposal","Uncollected Garbage","Water Pollution","Air Pollution","Clogged Canals"],
  "💡 Public Utilities": ["Power Interruption","Water Supply Problem","Internet Connectivity Issue"],
  "🔒 Safety & Security": ["Theft / Robbery","Vandalism","Noise Complaint","Public Disturbance","Lack of Police Presence"],
  "🏥 Health & Sanitation": ["Unsanitary Area","Standing Water (Mosquito Risk)","Stray Animals","Lack of Clean Water"],
  "🏫 Public Services": ["Slow Government Service","Lack of Facilities","School-related Issues","Health Center Concerns"],
  "🧑‍🤝‍🧑 Social Concerns": ["Poverty","Homelessness","Youth-related Issues","Community Conflicts"],
  "📝 Others": ["Other (please specify)"],
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const XIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const CheckIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = ["Submit Report", "Verify Identity", "Track Progress"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, fontFamily: "'Segoe UI', sans-serif", background: done ? "#16a34a" : active ? "linear-gradient(135deg, #1a56a0, #1976d2)" : "#e8ecf0", color: done || active ? "#fff" : "#aaa", transition: "all 0.3s", boxShadow: active ? "0 4px 12px rgba(25,118,210,0.4)" : "none" }}>
                {done ? <CheckIcon /> : idx}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "#1976d2" : done ? "#16a34a" : "#aaa", fontFamily: "'Segoe UI', sans-serif", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 3, background: idx < currentStep ? "#16a34a" : "#e8ecf0", maxWidth: 80, margin: "0 8px", marginBottom: 22, borderRadius: 2, transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Vertical Stepper (Track Progress) ───────────────────────────────────────
const VerticalStepper = ({ report }) => {
  const isDeclined = report.status === "declined";
  const isResolved = report.isResolved || report.status === "resolved";
  const hasResponses = report.adminResponses && report.adminResponses.length > 0;
  const isApproved = ["approved", "responded", "resolved"].includes(report.status);

  const steps = [
    {
      key: "submitted",
      label: "Report Submitted",
      desc: `Your report "${report.report}" was submitted on ${new Date(report.submittedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
      done: true,
      color: "#1976d2",
    },
    {
      key: "validated",
      label: isDeclined ? "Report Declined" : report.status === "pending" ? "Awaiting Validation" : "Report Approved",
      desc: report.status === "pending"
        ? "Your report is currently being reviewed by the Super Admin."
        : isDeclined
          ? `Your report was declined. Reason: ${report.rejectionReason}`
          : `Your report was approved and assigned to ${report.assignedTo?.officeName || "the concerned office"}.`,
      done: report.status !== "pending",
      color: isDeclined ? "#e53935" : "#16a34a",
      icon: isDeclined ? "❌" : report.status === "pending" ? "⏳" : "✅",
    },
    {
      key: "responded",
      label: hasResponses ? `Office Response (${report.adminResponses.length})` : "Awaiting Office Response",
      desc: !isApproved
        ? "This step will be available once your report is approved."
        : !hasResponses
          ? `Waiting for ${report.assignedTo?.officeName || "the assigned office"} to respond.`
          : null,
      done: hasResponses,
      color: "#f59e0b",
    },
    {
      key: "resolved",
      label: isResolved ? "Issue Resolved ✅" : "Resolution",
      desc: isResolved
        ? `This issue was marked as resolved on ${new Date(report.resolvedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} by ${report.assignedTo?.officeName || "the office"}.`
        : "The issue will be marked as resolved once the concerned office confirms it has been addressed.",
      done: isResolved,
      color: "#16a34a",
      icon: isResolved ? "🎉" : null,
    },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: step.done ? step.color : "#e8ecf0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: step.icon ? 16 : 13, fontWeight: 700, color: step.done ? "#fff" : "#aaa", flexShrink: 0, transition: "all 0.3s", boxShadow: step.done ? `0 2px 8px ${step.color}55` : "none" }}>
              {step.icon || (step.done ? <CheckIcon /> : i + 1)}
            </div>
            {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 36, background: step.done ? step.color : "#e8ecf0", margin: "4px 0", transition: "background 0.3s" }} />}
          </div>
          <div style={{ paddingBottom: 24, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: step.done ? "#1a1a1a" : "#aaa", fontFamily: "'Segoe UI', sans-serif", marginBottom: 4 }}>{step.label}</div>
            {step.desc && (
              <div style={{ fontSize: 13, color: step.done ? "#555" : "#bbb", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.6, background: step.done ? "#f8fafd" : "transparent", borderRadius: 8, padding: step.done ? "8px 12px" : 0, border: step.done ? "1px solid #e8ecf0" : "none" }}>
                {step.desc}
              </div>
            )}
            {/* Multiple responses timeline */}
            {step.key === "responded" && hasResponses && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {report.adminResponses.map((r, idx) => (
                  <div key={idx} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#166534", fontFamily: "'Segoe UI', sans-serif" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#0d7c3d" }}>Update #{idx + 1} — {r.office}</span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{new Date(r.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Resolved banner */}
            {step.key === "resolved" && isResolved && (
              <div style={{ marginTop: 8, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#166534", fontFamily: "'Segoe UI', sans-serif" }}>
                🎉 Your concern has been fully addressed. Thank you for helping improve Surigao City!
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Report Card ──────────────────────────────────────────────────────────────
const ReportCard = ({ report, onClick }) => {
  const statusColor = { pending: "#f59e0b", approved: "#1976d2", declined: "#e53935", responded: "#16a34a", resolved: "#16a34a" };
  const statusLabel = { pending: "Pending", approved: "Approved", declined: "Declined", responded: "Responded", resolved: "Resolved ✅" };
  const responseCount = report.adminResponses?.length || 0;

  return (
    <div
      onClick={() => onClick(report)}
      style={{ background: "#fff", borderRadius: 12, marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", cursor: "pointer", borderLeft: `4px solid ${statusColor[report.status] || "#ddd"}`, transition: "box-shadow 0.2s, transform 0.15s" }}
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
          <div style={{ fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif", marginBottom: 2 }}>
            {report.barangay} · {new Date(report.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div style={{ fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {report.description}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{ background: (statusColor[report.status] || "#ddd") + "20", color: statusColor[report.status] || "#888", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif", whiteSpace: "nowrap", border: `1px solid ${(statusColor[report.status] || "#ddd")}40` }}>
            {statusLabel[report.status] || report.status}
          </span>
          <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'Segoe UI', sans-serif" }}>Click to view →</span>
        </div>
      </div>
    </div>
  );
};

// ─── Report Detail Modal (2-tab) ──────────────────────────────────────────────
const ReportDetailModal = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");
  const responseCount = report.adminResponses?.length || 0;

  const statusColor = { pending: "#f59e0b", approved: "#1976d2", declined: "#e53935", responded: "#16a34a", resolved: "#16a34a" };
  const statusLabel = { pending: "Pending", approved: "Approved", declined: "Declined", responded: "Responded", resolved: "Resolved ✅" };

  // Build media array for display
  const mediaList = report.media || [];

  const TabBtn = ({ id, label, badge }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{ flex: 1, padding: "12px 8px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === id ? 700 : 500, background: "transparent", color: activeTab === id ? "#1976d2" : "#888", fontFamily: "'Segoe UI', sans-serif", borderBottom: `2.5px solid ${activeTab === id ? "#1976d2" : "transparent"}`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
    >
      {label}
      {badge > 0 && (
        <span style={{ background: activeTab === id ? "#1976d2" : "#e0e7ef", color: activeTab === id ? "#fff" : "#555", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
    >
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 600, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(135deg, #1a56a0, #1976d2)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>
              Report #{report.reportID}
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>
              {report.report} · {report.barangay}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif", border: "1px solid rgba(255,255,255,0.3)" }}>
              {statusLabel[report.status] || report.status}
            </span>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", background: "#fff", flexShrink: 0 }}>
          <TabBtn id="details" label="📋 Report Details" />
          <TabBtn id="progress" label="📍 Track Progress" badge={responseCount} />
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* ── DETAILS TAB ── */}
          {activeTab === "details" && (
            <div style={{ padding: "20px 24px" }}>

              {/* Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Date Submitted", value: new Date(report.submittedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Barangay", value: report.barangay },
                  { label: "Exact Location", value: report.location },
                  { label: "Assigned To", value: report.assignedTo?.officeName || "Not yet assigned" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#f8fafd", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Problem */}
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

              {/* Media */}
              {mediaList.length > 0 ? (
                <div>
                  <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                    Attached Evidence ({mediaList.length} file{mediaList.length > 1 ? "s" : ""})
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: mediaList.length === 1 ? "1fr" : "1fr 1fr", gap: 8 }}>
                    {mediaList.slice(0, 4).map((m, i) => {
                      const isVideo = m.mediaType === "video" || m.file?.match(/\.(mp4|webm|ogg)$/i);
                      const isLast = i === 3 && mediaList.length > 4;
                      return (
                        <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", background: "#1a1a2e" }}>
                          {isVideo ? (
                            <video src={m.file} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <img src={m.file} alt={`evidence-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          )}
                          {isLast && (
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800, fontFamily: "'Segoe UI', sans-serif" }}>
                              +{mediaList.length - 4} more
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#f8fafd", borderRadius: 8, padding: "20px", textAlign: "center", color: "#aaa", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>
                  No media attached to this report.
                </div>
              )}
            </div>
          )}

          {/* ── PROGRESS TAB ── */}
          {activeTab === "progress" && (
            <div style={{ padding: "20px 24px" }}>

              {/* Status summary pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, background: "#f8fafd", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #e8ecf0" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor[report.status] || "#ddd", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Current Status</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: statusColor[report.status] || "#888", fontFamily: "'Segoe UI', sans-serif" }}>
                    {statusLabel[report.status] || report.status}
                  </div>
                </div>
                {report.assignedTo?.officeName && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif" }}>Assigned to</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif" }}>{report.assignedTo.officeName}</div>
                  </div>
                )}
              </div>

              <VerticalStepper report={report} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Step 1: Report Form ──────────────────────────────────────────────────────
const Step1Form = ({ form, setForm, mediaFiles, setMediaFiles, mediaPreviews, setMediaPreviews, onNext }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const inputStyle = { width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #dde3ec", borderRadius: 9, outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", background: "#fff", transition: "border-color 0.2s" };
  const labelStyle = { display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 };

  const handleFiles = (files) => {
    const arr = Array.from(files);
    const previews = arr.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f), file: f }));
    setMediaPreviews(prev => [...prev, ...previews]);
    setMediaFiles(prev => [...prev, ...arr]);
  };

  const removeMedia = (idx) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== idx));
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const canNext = form.barangay && form.location && form.category && form.report && form.description;

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>Report a Problem</h3>

      {/* Barangay */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Barangay <span style={{ color: "#e53935" }}>*</span></label>
        <select value={form.barangay} onChange={e => setForm({ ...form, barangay: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}
          onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"}>
          <option value="">Select Barangay</option>
          {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Location */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Exact Location <span style={{ color: "#e53935" }}>*</span></label>
        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Near Surigao City Hall, in front of..." style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
      </div>

      {/* Problem Category */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Problem Category <span style={{ color: "#e53935" }}>*</span></label>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, report: "" })} style={{ ...inputStyle, cursor: "pointer" }}
          onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"}>
          <option value="">Select Category</option>
          {Object.keys(PROBLEM_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Specific Problem */}
      {form.category && (
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Specific Problem <span style={{ color: "#e53935" }}>*</span></label>
          <select value={form.report} onChange={e => setForm({ ...form, report: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}
            onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"}>
            <option value="">Select Problem</option>
            {PROBLEM_CATEGORIES[form.category].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Description <span style={{ color: "#e53935" }}>*</span></label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
          placeholder="Describe the problem in detail..." style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
          onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
      </div>

      {/* Media Upload */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Attach Evidence <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400, textTransform: "none" }}>(photos/videos, optional)</span></label>
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? "#1976d2" : "#c8d6e8"}`, borderRadius: 10, padding: "22px 16px", textAlign: "center", cursor: "pointer", background: dragOver ? "#eef5ff" : "#f8fafd", transition: "all 0.2s" }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          <div style={{ color: "#1976d2", display: "flex", justifyContent: "center", marginBottom: 6 }}><UploadIcon /></div>
          <p style={{ margin: 0, fontSize: 13, color: "#666", fontFamily: "'Segoe UI', sans-serif" }}><span style={{ color: "#1976d2", fontWeight: 600 }}>Click to upload</span> or drag & drop</p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif" }}>PNG, JPG, MP4 supported</p>
        </div>
        {mediaPreviews.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {mediaPreviews.map((m, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1.5px solid #e0e8f4" }}>
                {m.type.startsWith("image/") ? (
                  <img src={m.url} alt={m.name} style={{ width: 80, height: 64, objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: 80, height: 64, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 20 }}>▶</span>
                  </div>
                )}
                <button onClick={e => { e.stopPropagation(); removeMedia(i); }} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onNext} disabled={!canNext} style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, background: canNext ? "linear-gradient(135deg, #1a56a0, #1976d2)" : "#c8d6e8", color: "#fff", border: "none", borderRadius: 10, cursor: canNext ? "pointer" : "not-allowed", fontFamily: "'Segoe UI', sans-serif", transition: "all 0.2s" }}>
        Next →
      </button>
    </div>
  );
};

// ─── Step 2: Auth ─────────────────────────────────────────────────────────────
const Step2Auth = ({ onLoggedIn, onBack }) => {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", lastName: "", username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: "11px 14px", fontSize: 13, border: "1.5px solid #dde3ec", borderRadius: 9, outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", background: "#fff", transition: "border-color 0.2s" };
  const labelStyle = { display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${BASE}/login/`, loginForm);
      if (res.data.success) {
        sessionStorage.setItem("publicUserID", res.data.publicUserID);
        sessionStorage.setItem("publicUserName", `${res.data.name} ${res.data.lastName}`);
        onLoggedIn({ publicUserID: res.data.publicUserID, name: `${res.data.name} ${res.data.lastName}` });
      } else setError(res.data.message || "Invalid credentials.");
    } catch { setError("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regForm.name || !regForm.lastName || !regForm.username || !regForm.password || !regForm.email) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${BASE}/users/`, regForm);
      sessionStorage.setItem("publicUserID", res.data.publicUserID);
      sessionStorage.setItem("publicUserName", `${res.data.name} ${res.data.lastName}`);
      onLoggedIn({ publicUserID: res.data.publicUserID, name: `${res.data.name} ${res.data.lastName}` });
    } catch (err) {
      const data = err.response?.data;
      if (data?.username) setError("Username already taken.");
      else if (data?.email) setError("Email already in use.");
      else setError("Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>Verify Your Identity</h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>You need an account to track your report and receive updates.</p>

      <div style={{ display: "flex", background: "#f0f2f5", borderRadius: 10, padding: 4, marginBottom: 20 }}>
        {["login", "register"].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: mode === m ? 700 : 500, background: mode === m ? "#fff" : "transparent", color: mode === m ? "#1976d2" : "#888", fontFamily: "'Segoe UI', sans-serif", boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
            {m === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {error && <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>⚠️ {error}</div>}

      {mode === "login" ? (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Username</label>
            <input value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="Enter username" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Enter password" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, background: loading ? "#9ab8e0" : "linear-gradient(135deg, #1a56a0, #1976d2)", color: "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
            {loading ? "Signing in..." : "Sign In & Continue"}
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} placeholder="Juan" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} placeholder="dela Cruz" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} placeholder="username" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} placeholder="email@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} placeholder="••••••••" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>
          <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, background: loading ? "#9ab8e0" : "linear-gradient(135deg, #1a56a0, #1976d2)", color: "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
            {loading ? "Creating account..." : "Register & Continue"}
          </button>
        </>
      )}
      <button onClick={onBack} style={{ width: "100%", marginTop: 10, padding: "11px", fontSize: 13, fontWeight: 600, background: "#f0f2f5", color: "#555", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>← Back</button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function PublicReport() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ barangay: "", location: "", category: "", report: "", description: "" });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [user, setUser] = useState(() => {
    const id = sessionStorage.getItem("publicUserID");
    const name = sessionStorage.getItem("publicUserName");
    return id ? { publicUserID: Number(id), name } : null;
  });
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = (uid) => {
    setLoadingReports(true);
    axios.get(`${BASE}/reports/?publicUserID=${uid}`)
      .then(res => setReports(Array.isArray(res.data) ? res.data : res.data.results || []))
      .finally(() => setLoadingReports(false));
  };

  useEffect(() => { if (user) fetchReports(user.publicUserID); }, [user]);

  const openModal = () => {
    setStep(1);
    setForm({ barangay: "", location: "", category: "", report: "", description: "" });
    setMediaFiles([]); setMediaPreviews([]);
    setShowModal(true);
  };

  const handleLoggedIn = (u) => { setUser(u); setStep(3); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("barangay", form.barangay);
      fd.append("location", form.location);
      fd.append("report", form.report);
      fd.append("description", form.description);
      fd.append("publicUser_id", user.publicUserID);
      mediaFiles.forEach(f => fd.append("mediaFiles", f));
      const res = await axios.post(`${BASE}/reports/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setReports(prev => [res.data, ...prev]);
      setShowModal(false);
    } catch { alert("Failed to submit report. Please try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <Layout>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>Report a Problem</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>
            Help us improve Surigao City by reporting community issues
          </p>
        </div>
        <button onClick={openModal} style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #1a56a0, #1976d2)", border: "none", padding: "11px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 8px rgba(25,118,210,0.3)" }}>
          🚨 Report a Problem
        </button>
      </div>

      {/* Logged in as */}
      {user && (
        <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#166534", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>✅ Logged in as <strong>{user.name}</strong></span>
          <button onClick={() => { setUser(null); sessionStorage.removeItem("publicUserID"); sessionStorage.removeItem("publicUserName"); setReports([]); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif", textDecoration: "underline" }}>Sign out</button>
        </div>
      )}

      {/* My Reports */}
      {user && (
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>My Reports</h3>
          {loadingReports && <div style={{ color: "#aaa", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>Loading reports...</div>}
          {!loadingReports && reports.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              You haven't submitted any reports yet.
            </div>
          )}
          {!loadingReports && reports.map(r => <ReportCard key={r.reportID} report={r} onClick={setSelectedReport} />)}
        </div>
      )}

      {!user && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🚨</div>
          <strong style={{ color: "#555", fontSize: 15 }}>See something wrong in your community?</strong>
          <p style={{ margin: "8px 0 20px", color: "#aaa" }}>Click <strong>Report a Problem</strong> to submit an issue and track its progress.</p>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {/* Report Submission Modal */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            {/* Modal Header */}
            <div style={{ background: "linear-gradient(135deg, #1a56a0, #1976d2)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>Community Report</div>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "24px" }}>
              <StepIndicator currentStep={step} />

              {step === 1 && (
                <Step1Form form={form} setForm={setForm} mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} mediaPreviews={mediaPreviews} setMediaPreviews={setMediaPreviews}
                  onNext={() => { if (user) setStep(3); else setStep(2); }} />
              )}

              {step === 2 && <Step2Auth onLoggedIn={handleLoggedIn} onBack={() => setStep(1)} />}

              {step === 3 && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>Ready to Submit</h3>
                  <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Logged in as <strong>{user?.name}</strong>. Your report is ready to be submitted.</p>
                  <div style={{ background: "#f8fafd", borderRadius: 10, padding: "14px 16px", marginBottom: 20, textAlign: "left" }}>
                    <div style={{ fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>Report Summary</div>
                    <div style={{ fontSize: 13, color: "#333", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column", gap: 4 }}>
                      <span><strong>Barangay:</strong> {form.barangay}</span>
                      <span><strong>Location:</strong> {form.location}</span>
                      <span><strong>Problem:</strong> {form.report}</span>
                      <span><strong>Description:</strong> {form.description}</span>
                      {mediaFiles.length > 0 && <span><strong>Attachments:</strong> {mediaFiles.length} file{mediaFiles.length > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                  <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, background: submitting ? "#9ab8e0" : "linear-gradient(135deg, #1a56a0, #1976d2)", color: "#fff", border: "none", borderRadius: 10, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
                    {submitting ? "Submitting..." : "Submit Report 🚨"}
                  </button>
                  <button onClick={() => setStep(1)} style={{ width: "100%", marginTop: 10, padding: "11px", fontSize: 13, fontWeight: 600, background: "#f0f2f5", color: "#555", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>← Edit Report</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default PublicReport;
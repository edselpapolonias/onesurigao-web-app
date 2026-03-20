// src/components/admin/AdminEvent.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../ReusableBar/Layout";

const API_URL = "http://127.0.0.1:8000/api/events/";

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const LocationIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const CalendarIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const UserIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const ExpandIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>);
const UploadIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
const XIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const StatusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
    <span style={{ color: "#1976d2", marginTop: 1, flexShrink: 0 }}>{icon}</span>
    <div style={{ fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>
      <span style={{ color: "#1976d2", fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#555", marginLeft: 6 }}>- {value}</span>
    </div>
  </div>
);

// ─── Add Event Modal ──────────────────────────────────────────────────────────
const AddEventModal = ({ onClose, onSubmit, adminOfficeName }) => {
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", location: "", posterFile: null });
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (file) => { if (!file || !file.type.startsWith("image/")) return; setForm(f => ({ ...f, posterFile: file })); setPreview(URL.createObjectURL(file)); };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  const handleSubmit = async () => {
    if (!form.title || !form.eventDate || !form.location) { alert("Please fill in Title, Event Date, and Location."); return; }
    setSubmitting(true);
    try { await onSubmit(form); onClose(); } catch { alert("Failed to submit event."); } finally { setSubmitting(false); }
  };

  const inputStyle = { width: "100%", padding: "10px 14px", fontSize: 13, border: "1.5px solid #dde3ec", borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", background: "#fff", transition: "border-color 0.2s" };
  const labelStyle = { display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 680, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #1a56a0, #1976d2)", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, fontFamily: "'Segoe UI', sans-serif" }}>Add New Event</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>Submit for Super Admin approval before publishing</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}>
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#92400e", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
            <StatusIcon /> This event will be <strong style={{ marginLeft: 2 }}>pending approval</strong> from a Super Admin before it becomes visible to the public.
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Event Title <span style={{ color: "#e53935" }}>*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Bonok-Bonok Festival" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Event Date & Time <span style={{ color: "#e53935" }}>*</span></label>
              <input type="datetime-local" name="eventDate" value={form.eventDate} onChange={handleChange} style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
            <div>
              <label style={labelStyle}>Location <span style={{ color: "#e53935" }}>*</span></label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Surigao Provincial Sports..." style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the event..." style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Posted By</label>
            <input value={adminOfficeName || "Your Office"} readOnly style={{ ...inputStyle, background: "#f5f7fa", color: "#888", cursor: "not-allowed" }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Event Poster <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400, textTransform: "none" }}>(one image)</span></label>
            {preview ? (
              <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid #dde3ec" }}>
                <img src={preview} alt="poster" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                <button onClick={() => { setPreview(null); setForm(f => ({ ...f, posterFile: null })); }} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
              </div>
            ) : (
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${dragOver ? "#1976d2" : "#c8d6e8"}`, borderRadius: 10, padding: "32px 16px", textAlign: "center", cursor: "pointer", background: dragOver ? "#eef5ff" : "#f8fafd", transition: "all 0.2s" }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                <div style={{ color: "#1976d2", display: "flex", justifyContent: "center", marginBottom: 8 }}><UploadIcon /></div>
                <p style={{ margin: 0, fontSize: 13, color: "#666", fontFamily: "'Segoe UI', sans-serif" }}><span style={{ color: "#1976d2", fontWeight: 700 }}>Click to upload</span> or drag & drop</p>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "#fafbfc" }}>
          <button onClick={onClose} style={{ background: "#f0f2f5", border: "none", padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555", fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ background: submitting ? "#9ab8e0" : "linear-gradient(135deg, #1a56a0, #1976d2)", color: "#fff", border: "none", padding: "10px 26px", fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
            {submitting ? "Submitting..." : "Submit Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Event Details Modal ──────────────────────────────────────────────────────
const EventDetailsModal = ({ event, onClose }) => {
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";
  const timeStr = event.eventDate ? new Date(event.eventDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 560, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        {event.posterUrl ? (
          <div style={{ position: "relative", height: 220, flexShrink: 0 }}>
            <img src={event.posterUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))" }} />
            <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        ) : (
          <div style={{ background: "linear-gradient(135deg, #1a56a0, #1976d2)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>Event Details</span>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        )}
        <div style={{ overflowY: "auto", flex: 1, padding: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase" }}>{event.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            <InfoRow icon={<LocationIcon />} label="Location" value={event.location} />
            <InfoRow icon={<CalendarIcon />} label="Event Date" value={`${dateStr}${timeStr ? " at " + timeStr : ""}`} />
            <InfoRow icon={<UserIcon />} label="Posted By" value={event.postedBy || "Surigao PIO"} />
          </div>
          {event.description && <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, fontFamily: "'Segoe UI', sans-serif", margin: 0 }}>{event.description}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Event Card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.13)" : "0 2px 10px rgba(0,0,0,0.08)", transition: "box-shadow 0.2s, transform 0.2s", transform: hovered ? "translateY(-2px)" : "translateY(0)", cursor: "pointer" }}>
      <div style={{ height: 120, background: "linear-gradient(135deg, #1a56a0, #0d3b7a)", overflow: "hidden", position: "relative" }}>
        {event.posterUrl ? <img src={event.posterUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }} /> : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: "#1a1a1a", marginBottom: 7, fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.3, lineHeight: 1.3 }}>{event.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 9 }}>
          <InfoRow icon={<LocationIcon />} label="Location" value={event.location?.length > 20 ? event.location.slice(0, 20) + "..." : event.location} />
          <InfoRow icon={<CalendarIcon />} label="Event Date" value={dateStr} />
          <InfoRow icon={<UserIcon />} label="Posted By" value={event.postedBy || "Surigao PIO"} />
        </div>
        <button onClick={() => onClick(event)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#555", fontFamily: "'Segoe UI', sans-serif", padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = "#1976d2"} onMouseLeave={e => e.currentTarget.style.color = "#555"}>
          <ExpandIcon /> VIEW MORE DETAILS
        </button>
      </div>
    </div>
  );
};

// ─── Add Event Card ───────────────────────────────────────────────────────────
const AddEventCard = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,0,0,0.07)", transition: "all 0.2s", transform: hovered ? "translateY(-2px)" : "translateY(0)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, border: `2px dashed ${hovered ? "#1976d2" : "#c8d6e8"}` }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: hovered ? "linear-gradient(135deg, #1a56a0, #1976d2)" : "#1976d2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, transition: "all 0.2s", boxShadow: "0 3px 12px rgba(25,118,210,0.3)", color: "#fff" }}><PlusIcon /></div>
      <span style={{ fontSize: 14, fontWeight: 800, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>ADD EVENT</span>
    </div>
  );
};

// ─── Pending Event Card ───────────────────────────────────────────────────────
const PendingEventCard = ({ event }) => {
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const isDeclined = !event.isApproved && event.declineReason;
  const isApproved = event.isApproved;

  return (
    <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: `1.5px solid ${isDeclined ? "#ffcdd2" : isApproved ? "#bbf7d0" : "#fde68a"}` }}>
      <div style={{ height: 100, background: "linear-gradient(135deg, #1a56a0, #0d3b7a)", overflow: "hidden", position: "relative" }}>
        {event.posterUrl ? <img src={event.posterUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        {/* Status badge */}
        <div style={{ position: "absolute", top: 8, right: 8, background: isDeclined ? "#e53935" : isApproved ? "#16a34a" : "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif" }}>
          {isDeclined ? "DECLINED" : isApproved ? "APPROVED" : "PENDING"}
        </div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: "#1a1a1a", marginBottom: 6, fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.3 }}>{event.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
          <InfoRow icon={<LocationIcon />} label="Location" value={event.location?.length > 20 ? event.location.slice(0, 20) + "..." : event.location} />
          <InfoRow icon={<CalendarIcon />} label="Event Date" value={dateStr} />
        </div>
        {/* Status message */}
        {isApproved && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#166534", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            ✅ Your event has been <strong style={{ marginLeft: 3 }}>approved</strong> and is now visible to the public.
          </div>
        )}
        {isDeclined && (
          <div style={{ background: "#fff3f3", border: "1px solid #ffcdd2", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>
            ❌ <strong>Declined:</strong> {event.declineReason}
          </div>
        )}
        {!isApproved && !isDeclined && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#92400e", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            ⏳ Waiting for Super Admin approval.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const EventSkeleton = () => (
  <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
    <div style={{ height: 120, background: "#f0f2f5", animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ padding: "14px 16px" }}>
      {[90, 70, 60, 50].map((w, i) => (<div key={i} style={{ height: 12, width: `${w}%`, background: "#f0f2f5", borderRadius: 6, marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />))}
    </div>
  </div>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabButton = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, background: active ? "linear-gradient(135deg, #1a56a0, #1976d2)" : "#fff", color: active ? "#fff" : "#555", fontFamily: "'Segoe UI', sans-serif", boxShadow: active ? "0 2px 8px rgba(25,118,210,0.3)" : "0 1px 4px rgba(0,0,0,0.07)", transition: "all 0.2s" }}>
    {label}
    {count !== undefined && count > 0 && (
      <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#e53935", color: "#fff", borderRadius: 12, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>
    )}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminEvent() {
  const location = useLocation();
  const adminID = location.state?.adminID || Number(sessionStorage.getItem("adminID")) || null;
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  const [activeTab, setActiveTab] = useState("EVENT");
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = adminID ? { adminID } : {};
    axios.get(API_URL, { params })
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : res.data.results || [];
        setApprovedEvents(all.filter(e => e.isApproved));
        setMyEvents(all.filter(e => !e.isApproved || e.admin?.adminID === adminID));
        setError(null);
      })
      .catch(() => setError("Failed to load events."))
      .finally(() => setLoading(false));
  }, [adminID]);

  const handleSubmitEvent = async (form) => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("eventDate", form.eventDate);
    formData.append("location", form.location);
    formData.append("admin_id", adminID);
    if (form.posterFile) formData.append("posterPath", form.posterFile);
    const res = await axios.post(API_URL, formData, { headers: { "Content-Type": "multipart/form-data" } });
    const newEvent = { ...res.data, posterUrl: form.posterFile ? URL.createObjectURL(form.posterFile) : null, postedBy: officeName, isPending: true };
    setMyEvents(prev => [newEvent, ...prev]);
    setActiveTab("PENDING");
  };

  const enrich = (e) => ({ ...e, posterUrl: e.posterUrl || e.posterPath || null, postedBy: e.admin?.officeName || officeName || "Surigao PIO" });

  // For PENDING tab: all events this admin posted that are not yet approved, plus declined ones
  const pendingEvents = myEvents.filter(e => !e.isApproved).map(enrich);
  const pendingCount = pendingEvents.filter(e => !e.declineReason).length;

  return (
    <Layout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Title + Tabs */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>Upcoming Events</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Community Gathering, Holidays, Official Schedules</p>
          {officeName && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 }}>Logged in as: {officeName}</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TabButton label="EVENT" active={activeTab === "EVENT"} onClick={() => setActiveTab("EVENT")} />
          <TabButton label="PENDING EVENT" active={activeTab === "PENDING"} onClick={() => setActiveTab("PENDING")} count={pendingCount} />
        </div>
      </div>

      {error && <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>⚠️ {error}</div>}

      {/* ── EVENT TAB ── */}
      {activeTab === "EVENT" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <AddEventCard onClick={() => setShowAddModal(true)} />
          {loading && [1, 2, 3].map(i => <EventSkeleton key={i} />)}
          {!loading && approvedEvents.map(e => enrich(e)).map(event => (
            <EventCard key={event.eventID || event.id} event={event} onClick={setSelectedEvent} />
          ))}
          {!loading && approvedEvents.length === 0 && (
            <div style={{ gridColumn: "2 / -1", background: "#fff", borderRadius: 10, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗓️</div>
              No approved events yet.
            </div>
          )}
        </div>
      )}

      {/* ── PENDING TAB ── */}
      {activeTab === "PENDING" && (
        <>
          {pendingEvents.length === 0 && !loading ? (
            <div style={{ background: "#fff", borderRadius: 10, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              No pending events. Click <strong>ADD EVENT</strong> in the Event tab to submit one.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {pendingEvents.map(event => <PendingEventCard key={event.eventID || event.id} event={event} />)}
            </div>
          )}
        </>
      )}

      {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} onSubmit={handleSubmitEvent} adminOfficeName={officeName} />}
      {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </Layout>
  );
}

export default AdminEvent;
// src/components/superadmin/SuperAdminEvent.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import SuperAdminLayout from "../ReusableBar/SuperAdminLayout";

const EVENTS_URL = "http://127.0.0.1:8000/superadmin/events/";
const APPROVE_URL = (id) => `http://127.0.0.1:8000/superadmin/events/${id}/approve/`;
const DECLINE_URL = (id) => `http://127.0.0.1:8000/superadmin/events/${id}/decline/`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const LocationIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const CalendarIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const UserIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const CheckIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const XIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const ExpandIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>);

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <span style={{ color: "#1976d2", marginTop: 1, flexShrink: 0 }}>{icon}</span>
    <div style={{ fontSize: 12, fontFamily: "'Segoe UI', sans-serif" }}>
      <span style={{ color: "#1976d2", fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#555", marginLeft: 5 }}>- {value}</span>
    </div>
  </div>
);

// ─── Decline Modal ────────────────────────────────────────────────────────────
const DeclineModal = ({ event, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) { alert("Please provide a reason for declining."); return; }
    setSubmitting(true);
    await onConfirm(event.eventID, reason);
    setSubmitting(false);
    onClose();
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #c62828, #e53935)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>Decline Event</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "'Segoe UI', sans-serif", marginTop: 2 }}>Provide a reason so the admin can improve their submission</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 4, fontFamily: "'Segoe UI', sans-serif" }}>Event: {event.title}</div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 18, fontFamily: "'Segoe UI', sans-serif" }}>Posted by: {event.admin?.officeName || "Unknown Office"}</div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Reason for Declining <span style={{ color: "#e53935" }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. Incomplete information, duplicate event, inappropriate content..."
            style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: "1.5px solid #dde3ec", borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", resize: "vertical", minHeight: 100 }}
            onFocus={e => e.target.style.borderColor = "#e53935"}
            onBlur={e => e.target.style.borderColor = "#dde3ec"}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={onClose} style={{ background: "#f0f2f5", border: "none", padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555", fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
            <button onClick={handleConfirm} disabled={submitting} style={{ background: submitting ? "#f08080" : "linear-gradient(135deg, #c62828, #e53935)", color: "#fff", border: "none", padding: "10px 22px", fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
              {submitting ? "Declining..." : "Confirm Decline"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Approved Event Card ──────────────────────────────────────────────────────
const ApprovedEventCard = ({ event, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const posterUrl = event.posterPath || null;
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.13)" : "0 2px 10px rgba(0,0,0,0.08)", transition: "box-shadow 0.2s, transform 0.2s", transform: hovered ? "translateY(-2px)" : "translateY(0)" }}>
      <div style={{ height: 120, background: "linear-gradient(135deg, #1a56a0, #0d3b7a)", overflow: "hidden" }}>
        {posterUrl ? <img src={posterUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }} /> : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: "#1a1a1a", marginBottom: 7, fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.3, lineHeight: 1.3 }}>{event.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 9 }}>
          <InfoRow icon={<LocationIcon />} label="Location" value={event.location?.length > 20 ? event.location.slice(0, 20) + "..." : event.location} />
          <InfoRow icon={<CalendarIcon />} label="Event Date" value={dateStr} />
          <InfoRow icon={<UserIcon />} label="Posted By" value={event.admin?.officeName || "Surigao PIO"} />
        </div>
        <button onClick={() => onClick({ ...event, posterUrl })} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#555", fontFamily: "'Segoe UI', sans-serif", padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = "#1976d2"} onMouseLeave={e => e.currentTarget.style.color = "#555"}>
          <ExpandIcon /> VIEW MORE DETAILS
        </button>
      </div>
    </div>
  );
};

// ─── Validation Card ──────────────────────────────────────────────────────────
const ValidationCard = ({ event, onApprove, onDecline }) => {
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const timeStr = event.eventDate ? new Date(event.eventDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
  const posterUrl = event.posterPath || null;
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    await onApprove(event.eventID);
    setApproving(false);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.09)", overflow: "hidden", border: "1.5px solid #fde68a" }}>
      {/* Poster */}
      <div style={{ height: 140, background: "linear-gradient(135deg, #1a56a0, #0d3b7a)", overflow: "hidden", position: "relative" }}>
        {posterUrl ? <img src={posterUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        <div style={{ position: "absolute", top: 8, left: 8, background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif" }}>PENDING APPROVAL</div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#1a1a1a", marginBottom: 10, fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.3 }}>{event.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
          <InfoRow icon={<LocationIcon />} label="Location" value={event.location} />
          <InfoRow icon={<CalendarIcon />} label="Date" value={`${dateStr}${timeStr ? " at " + timeStr : ""}`} />
          <InfoRow icon={<UserIcon />} label="Submitted by" value={event.admin?.officeName || "Unknown Office"} />
        </div>
        {event.description && (
          <div style={{ fontSize: 12, color: "#666", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.6, marginBottom: 12, background: "#f8fafd", borderRadius: 6, padding: "8px 10px" }}>
            {event.description.length > 120 ? event.description.slice(0, 120) + "..." : event.description}
          </div>
        )}
        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleApprove}
            disabled={approving}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: approving ? "#9ab8e0" : "linear-gradient(135deg, #0d7c3d, #16a34a)", border: "none", borderRadius: 8, padding: "9px", cursor: approving ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}
          >
            <CheckIcon /> {approving ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => onDecline(event)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "linear-gradient(135deg, #c62828, #e53935)", border: "none", borderRadius: 8, padding: "9px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 8px rgba(229,57,53,0.3)" }}
          >
            <XIcon /> Decline
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
          <div style={{ background: "linear-gradient(135deg, #0d3b7a, #1976d2)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'Segoe UI', sans-serif" }}>Event Details</span>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        )}
        <div style={{ overflowY: "auto", flex: 1, padding: "24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase" }}>{event.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            <InfoRow icon={<LocationIcon />} label="Location" value={event.location} />
            <InfoRow icon={<CalendarIcon />} label="Event Date" value={`${dateStr}${timeStr ? " at " + timeStr : ""}`} />
            <InfoRow icon={<UserIcon />} label="Posted By" value={event.admin?.officeName || "Surigao PIO"} />
          </div>
          {event.description && <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, fontFamily: "'Segoe UI', sans-serif", margin: 0 }}>{event.description}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const EventSkeleton = () => (
  <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
    <div style={{ height: 120, background: "#f0f2f5", animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ padding: "10px 12px" }}>
      {[90, 70, 60, 50].map((w, i) => (<div key={i} style={{ height: 11, width: `${w}%`, background: "#f0f2f5", borderRadius: 6, marginBottom: 9, animation: "pulse 1.5s ease-in-out infinite" }} />))}
    </div>
  </div>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabButton = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, background: active ? "linear-gradient(135deg, #0d3b7a, #1976d2)" : "#fff", color: active ? "#fff" : "#555", fontFamily: "'Segoe UI', sans-serif", boxShadow: active ? "0 2px 8px rgba(13,59,122,0.3)" : "0 1px 4px rgba(0,0,0,0.07)", transition: "all 0.2s" }}>
    {label}
    {count !== undefined && count > 0 && (
      <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#e53935", color: "#fff", borderRadius: 12, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>
    )}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
function SuperAdminEvent() {
  const location = useLocation();
  const superAdminID = location.state?.superAdminID || Number(sessionStorage.getItem("superAdminID")) || null;

  const [activeTab, setActiveTab] = useState("EVENT");
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [error, setError] = useState(null);

  const fetchEvents = () => {
    setLoading(true);
    Promise.all([
      axios.get(EVENTS_URL),
      axios.get(EVENTS_URL, { params: { status: "pending" } }),
    ]).then(([approvedRes, pendingRes]) => {
      setApprovedEvents(Array.isArray(approvedRes.data) ? approvedRes.data : approvedRes.data.results || []);
      setPendingEvents(Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data.results || []);
      setError(null);
    }).catch(() => setError("Failed to load events."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleApprove = async (eventID) => {
    await axios.patch(APPROVE_URL(eventID), { superAdminID });
    fetchEvents();
  };

  const handleDecline = async (eventID, reason) => {
    await axios.patch(DECLINE_URL(eventID), { declineReason: reason });
    fetchEvents();
  };

  return (
    <SuperAdminLayout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Title + Tabs */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>Events</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Manage and validate city events</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TabButton label="EVENT" active={activeTab === "EVENT"} onClick={() => setActiveTab("EVENT")} />
          <TabButton label="EVENT VALIDATION" active={activeTab === "VALIDATION"} onClick={() => setActiveTab("VALIDATION")} count={pendingEvents.length} />
        </div>
      </div>

      {error && <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>⚠️ {error}</div>}

      {/* ── EVENT TAB ── */}
      {activeTab === "EVENT" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {loading && [1, 2, 3].map(i => <EventSkeleton key={i} />)}
          {!loading && approvedEvents.map(event => (
            <ApprovedEventCard key={event.eventID} event={event} onClick={setSelectedEvent} />
          ))}
          {!loading && approvedEvents.length === 0 && (
            <div style={{ gridColumn: "1 / -1", background: "#fff", borderRadius: 10, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗓️</div>
              No approved events yet. Go to <strong>Event Validation</strong> to approve events.
            </div>
          )}
        </div>
      )}

      {/* ── VALIDATION TAB ── */}
      {activeTab === "VALIDATION" && (
        <>
          {pendingEvents.length === 0 && !loading ? (
            <div style={{ background: "#fff", borderRadius: 10, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              All events have been reviewed. No pending approvals.
            </div>
          ) : (
            <>
              <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#92400e", fontFamily: "'Segoe UI', sans-serif" }}>
                📋 <strong>{pendingEvents.length} event{pendingEvents.length > 1 ? "s" : ""}</strong> waiting for your approval. Approved events are immediately visible to the public.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {pendingEvents.map(event => (
                  <ValidationCard key={event.eventID} event={event} onApprove={handleApprove} onDecline={setDeclineTarget} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
      {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {declineTarget && <DeclineModal event={declineTarget} onClose={() => setDeclineTarget(null)} onConfirm={handleDecline} />}
    </SuperAdminLayout>
  );
}

export default SuperAdminEvent;
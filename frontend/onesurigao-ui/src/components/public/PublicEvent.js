// src/components/public/PublicEvent.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../ReusableBar/PublicLayout";

const API_URL = "http://127.0.0.1:8000/public/events/";

// ─── Icons ────────────────────────────────────────────────────────────────────

const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <span style={{ color: "#1976d2", marginTop: 1, flexShrink: 0 }}>{icon}</span>
    <div style={{ fontSize: 12, fontFamily: "'Segoe UI', sans-serif" }}>
      <span style={{ color: "#1976d2", fontWeight: 700 }}>{label}</span>
      <span style={{ color: "#555", marginLeft: 5 }}>- {value}</span>
    </div>
  </div>
);

// ─── Event Details Modal ──────────────────────────────────────────────────────

const EventDetailsModal = ({ event, onClose }) => {
  const dateStr = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "";
  const timeStr = event.eventDate
    ? new Date(event.eventDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
    >
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 560, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        {/* Poster */}
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
          <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {event.title}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            <InfoRow icon={<LocationIcon />} label="Location" value={event.location} />
            <InfoRow icon={<CalendarIcon />} label="Event Date" value={`${dateStr}${timeStr ? " at " + timeStr : ""}`} />
            <InfoRow icon={<UserIcon />} label="Posted By" value={event.admin?.officeName || "Surigao PIO"} />
          </div>
          {event.description && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, fontFamily: "'Segoe UI', sans-serif" }}>
                About this Event
              </div>
              <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, fontFamily: "'Segoe UI', sans-serif", margin: 0 }}>
                {event.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Event Card ───────────────────────────────────────────────────────────────

const EventCard = ({ event, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const dateStr = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";
  const posterUrl = event.posterPath || null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.13)" : "0 2px 10px rgba(0,0,0,0.08)", transition: "box-shadow 0.2s, transform 0.2s", transform: hovered ? "translateY(-2px)" : "translateY(0)" }}
    >
      {/* Poster */}
      <div style={{ height: 120, background: "linear-gradient(135deg, #1a56a0, #0d3b7a)", overflow: "hidden", position: "relative" }}>
        {posterUrl ? (
          <img src={posterUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: "#1a1a1a", marginBottom: 7, fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.3, lineHeight: 1.3 }}>
          {event.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 9 }}>
          <InfoRow icon={<LocationIcon />} label="Location" value={event.location?.length > 20 ? event.location.slice(0, 20) + "..." : event.location} />
          <InfoRow icon={<CalendarIcon />} label="Event Date" value={dateStr} />
          <InfoRow icon={<UserIcon />} label="Posted By" value={event.admin?.officeName || "Surigao PIO"} />
        </div>
        <button
          onClick={() => onClick({ ...event, posterUrl })}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#555", fontFamily: "'Segoe UI', sans-serif", padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "#1976d2"}
          onMouseLeave={e => e.currentTarget.style.color = "#555"}
        >
          <ExpandIcon /> VIEW MORE DETAILS
        </button>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const EventSkeleton = () => (
  <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
    <div style={{ height: 120, background: "#f0f2f5", animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ padding: "10px 12px" }}>
      {[90, 70, 60, 50].map((w, i) => (
        <div key={i} style={{ height: 11, width: `${w}%`, background: "#f0f2f5", borderRadius: 6, marginBottom: 9, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

function PublicEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setEvents(Array.isArray(res.data) ? res.data : res.data.results || []);
        setError(null);
      })
      .catch(() => setError("Failed to load events."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>
          Upcoming Events
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>
          Community Gatherings, Holidays, Official Schedules
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {loading && [1, 2, 3, 4, 5, 6].map(i => <EventSkeleton key={i} />)}

        {!loading && events.map(event => (
          <EventCard key={event.eventID || event.id} event={event} onClick={setSelectedEvent} />
        ))}

        {!loading && !error && events.length === 0 && (
          <div style={{ gridColumn: "1 / -1", background: "#fff", borderRadius: 10, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗓️</div>
            No upcoming events at the moment.
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </Layout>
  );
}

export default PublicEvent;
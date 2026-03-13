// src/components/public/PublicAnnouncement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../ReusableBar/PublicLayout";

const API_URL = "http://127.0.0.1:8000/public/announcements/";

// ─── Icons ────────────────────────────────────────────────────────────────────

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const OfficeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Announcement Card ────────────────────────────────────────────────────────

const AnnouncementCard = ({ announcement }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = announcement.content?.length > 300;
  const displayContent = expanded || !isLong
    ? announcement.content
    : announcement.content?.slice(0, 300) + "...";

  const dateStr = announcement.createdDate
    ? new Date(announcement.createdDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";
  const timeStr = announcement.createdDate
    ? new Date(announcement.createdDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      marginBottom: 16,
      overflow: "hidden",
      borderLeft: announcement.isPinned ? "4px solid #f59e0b" : "4px solid transparent",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.11)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        {/* Avatar + Meta */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #1a56a0, #1976d2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif",
          }}>
            {announcement.admin?.officeName?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SG"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>
                {announcement.admin?.officeName || "City of Surigao"}
              </span>
              {announcement.isPinned && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, background: "#fef3c7", color: "#92400e", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: "'Segoe UI', sans-serif" }}>
                  <PinIcon /> PINNED
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, color: "#aaa", fontSize: 11, fontFamily: "'Segoe UI', sans-serif" }}>
              <ClockIcon /> {dateStr} at {timeStr}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "0 20px 8px", fontWeight: 800, fontSize: 16, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.3 }}>
        {announcement.title}
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px 14px", fontSize: 14, color: "#444", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
        {displayContent}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", padding: 0 }}
          >
            {expanded ? "Show less" : "Read more"} <ChevronIcon open={expanded} />
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 6 }}>
        <OfficeIcon />
        <span style={{ fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>
          {announcement.admin?.officeName || "City Government of Surigao"}
        </span>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const AnnouncementSkeleton = () => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#f0f2f5", animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 13, width: "40%", background: "#f0f2f5", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 11, width: "25%", background: "#f0f2f5", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
    {[100, 90, 75, 60].map((w, i) => (
      <div key={i} style={{ height: 12, width: `${w}%`, background: "#f0f2f5", borderRadius: 6, marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

function PublicAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setAnnouncements(Array.isArray(res.data) ? res.data : res.data.results || []);
        setError(null);
      })
      .catch(() => setError("Failed to load announcements."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>
          Announcements
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>
          Official announcements from the City of Surigao
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Skeletons */}
      {loading && [1, 2, 3].map(i => <AnnouncementSkeleton key={i} />)}

      {/* Cards */}
      {!loading && announcements.map(a => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}

      {/* Empty */}
      {!loading && !error && announcements.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📢</div>
          No announcements yet.
        </div>
      )}
    </Layout>
  );
}

export default PublicAnnouncement;
// src/components/admin/PinnedAnnouncement.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../ReusableBar/Layout";

const API_URL = "http://127.0.0.1:8000/api/announcements/";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ThumbUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DotsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const PinIcon = ({ filled = false }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Office Seal ──────────────────────────────────────────────────────────────

const OfficeSeal = () => (
  <div style={{
    width: 44, height: 44, borderRadius: "50%",
    background: "linear-gradient(135deg, #c0392b 0%, #8b0000 100%)",
    border: "2px solid #ddd",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width="26" height="26" viewBox="0 0 50 50" fill="none">
      <path d="M25 5 L42 14 L42 30 Q42 42 25 47 Q8 42 8 30 L8 14 Z" fill="#d4a017" opacity="0.9" />
      <path d="M25 10 L38 17 L38 29 Q38 39 25 43 Q12 39 12 29 L12 17 Z" fill="#8b0000" />
      <polygon points="25,14 26.5,19 31.5,19 27.5,22 29,27 25,24 21,27 22.5,22 18.5,19 23.5,19" fill="#d4a017" />
    </svg>
  </div>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div style={{ background: "#fff", borderRadius: 10, padding: "18px", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 16 }}>
    {[80, 100, 60].map((w, i) => (
      <div key={i} style={{ height: i === 0 ? 16 : 12, width: `${w}%`, background: "#f0f2f5", borderRadius: 6, marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

// ─── Pinned Announcement Card ─────────────────────────────────────────────────

const PinnedCard = ({ announcement, currentAdminID, onUnpin }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLike = () => {
    if (liked) { setLikes(l => l - 1); setLiked(false); }
    else { setLikes(l => l + 1); setLiked(true); if (disliked) { setDislikes(d => d - 1); setDisliked(false); } }
  };
  const handleDislike = () => {
    if (disliked) { setDislikes(d => d - 1); setDisliked(false); }
    else { setDislikes(d => d + 1); setDisliked(true); if (liked) { setLikes(l => l - 1); setLiked(false); } }
  };

  const officeName = announcement.admin?.officeName || "Unknown Office";
  const createdDate = announcement.createdDate ? new Date(announcement.createdDate) : null;
  const dateStr = createdDate?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) || "";
  const timeStr = createdDate?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) || "";

  // ✅ Only owner can unpin
  const isOwner = announcement.admin?.adminID === currentAdminID;

  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
      marginBottom: 20, overflow: "visible", position: "relative",
      borderLeft: "4px solid #f59e0b", // ✅ gold left border to indicate pinned
    }}>
      {/* Pinned badge */}
      <div style={{
        position: "absolute", top: -10, left: 16,
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#fff", fontSize: 10, fontWeight: 700,
        padding: "3px 10px", borderRadius: 20,
        fontFamily: "'Segoe UI', sans-serif", letterSpacing: 0.5,
        display: "flex", alignItems: "center", gap: 4,
        boxShadow: "0 2px 6px rgba(217,119,6,0.4)",
      }}>
        📌 PINNED
      </div>

      {/* Header */}
      <div style={{ padding: "18px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <OfficeSeal />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>{officeName}</div>
            <div style={{ fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>{dateStr} {timeStr && `| ${timeStr}`}</div>
          </div>
        </div>

        {/* 3-dots menu — unpin option for owner only */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 4, borderRadius: 6 }}>
            <DotsIcon />
          </button>
          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0,
              background: "#fff", borderRadius: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
              border: "1px solid #e8ecf0",
              minWidth: 170, zIndex: 50, overflow: "hidden",
            }}>
              {isOwner ? (
                <button
                  onClick={() => { onUnpin(announcement); setMenuOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", background: "none", border: "none",
                    cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: "#d97706", fontFamily: "'Segoe UI', sans-serif", textAlign: "left",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fffbeb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <span style={{ color: "#d97706", display: "flex" }}><PinIcon filled /></span>
                  Unpin Post
                </button>
              ) : (
                <div style={{ padding: "10px 14px", fontSize: 12, color: "#aaa", fontFamily: "'Segoe UI', sans-serif", textAlign: "center" }}>
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "0 18px 6px", fontWeight: 700, fontSize: 15, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>
        {announcement.title}
      </div>

      {/* Content */}
      <div style={{ padding: "0 18px 14px" }}>
        {announcement.content.split("\n\n").map((para, i) => (
          <p key={i} style={{ fontSize: 14, color: "#333", lineHeight: 1.75, fontFamily: "'Segoe UI', sans-serif", textAlign: "justify", margin: i === 0 ? "0 0 10px 0" : "0" }}>{para}</p>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 18px" }} />

      {/* Footer */}
      <div style={{ padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: liked ? "#1976d2" : "#666", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", fontWeight: liked ? 700 : 400 }}><ThumbUp /> {likes}</button>
          <button onClick={handleDislike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: disliked ? "#e53935" : "#666", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", fontWeight: disliked ? 700 : 400 }}><ThumbDown /> {dislikes}</button>
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#666", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}><CommentIcon /> COMMENT</button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

function PinnedAnnouncement() {
  const location = useLocation();
  // ✅ Always fall back to sessionStorage — location.state is lost when switching tabs
  const adminID = location.state?.adminID || Number(sessionStorage.getItem("adminID")) || null;
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  const [pinned, setPinned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch only pinned announcements
  useEffect(() => {
    setLoading(true);
    axios.get(API_URL)
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : res.data.results || [];
        setPinned(all.filter(a => a.isPinned));
        setError(null);
      })
      .catch(() => setError("Failed to load pinned announcements. Is your Django server running?"))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Unpin — PATCH isPinned: false, then remove from this list
  const handleUnpin = (announcement) => {
    axios.patch(`${API_URL}${announcement.id}/`, { isPinned: false })
      .then(() => {
        setPinned(pinned.filter(a => a.id !== announcement.id));
      })
      .catch((err) => {
        alert(`Failed to unpin: ${JSON.stringify(err.response?.data || err.message)}`);
      });
  };

  return (
    <Layout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* ── Title Bar ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>📌</span>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>
            Pinned Announcements
          </h2>
        </div>
        <p style={{ margin: "0 0 0 32px", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>
          Important announcements pinned by city office administrators.
        </p>
        {officeName && (
          <p style={{ margin: "4px 0 0 32px", fontSize: 12, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 }}>
            Logged in as: {officeName}
          </p>
        )}
      </div>

      {/* ── Info Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
        border: "1.5px solid #fde68a",
        borderRadius: 8, padding: "10px 16px", marginBottom: 20,
        fontSize: 13, color: "#92400e", fontFamily: "'Segoe UI', sans-serif",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span>💡</span>
        Only administrators who posted an announcement can pin or unpin it. Use the <strong>⋯</strong> menu on any card to unpin it.
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Skeletons ── */}
      {loading && [1, 2].map(i => <CardSkeleton key={i} />)}

      {/* ── Empty State ── */}
      {!loading && !error && pinned.length === 0 && (
        <div style={{
          background: "#fff", borderRadius: 10, padding: "56px 20px",
          textAlign: "center", color: "#aaa", fontSize: 14,
          fontFamily: "'Segoe UI', sans-serif",
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        }}>
          <div style={{ fontSize: 42, marginBottom: 14 }}>📌</div>
          <strong style={{ color: "#555", fontSize: 15 }}>No pinned announcements yet.</strong>
          <p style={{ marginTop: 8, color: "#aaa" }}>
            Go to the <strong>Announcement</strong> tab, click <strong>⋯</strong> on your post, and select <strong>Pin Post</strong>.
          </p>
        </div>
      )}

      {/* ── Pinned Cards ── */}
      {!loading && pinned.map((a) => (
        <PinnedCard
          key={a.id}
          announcement={a}
          currentAdminID={adminID}
          onUnpin={handleUnpin}
        />
      ))}
    </Layout>
  );
}

export default PinnedAnnouncement;
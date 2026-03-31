// src/components/public/PublicHotlines.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../ReusableBar/PublicLayout";

const API_URL = "http://127.0.0.1:8000/public/hotline-categories/";

// ─── Icons ────────────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const HeadsetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

// ─── Hotline Card ─────────────────────────────────────────────────────────────
const HotlineCard = ({ hotline }) => (
  <div style={{ background: "#fff", border: "1.5px solid #e8ecf0", borderRadius: 10, padding: "16px 18px", transition: "border-color 0.2s, box-shadow 0.2s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#1976d2"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(25,118,210,0.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8ecf0"; e.currentTarget.style.boxShadow = "none"; }}>
    <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>
      {hotline.name}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#555", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>
      <span style={{ color: "#1976d2" }}><PhoneIcon /></span>
      <a href={`tel:${hotline.contactNumber}`} style={{ color: "#333", textDecoration: "none", fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = "#1976d2"}
        onMouseLeave={e => e.currentTarget.style.color = "#333"}>
        {hotline.contactNumber}
      </a>
    </div>
  </div>
);

// ─── Category Accordion ───────────────────────────────────────────────────────
const CategoryAccordion = ({ category, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 14, overflow: "hidden" }}>
      {/* Header */}
      <div onClick={() => setOpen(!open)} style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: open ? "#f8fafd" : "#fff", transition: "background 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
        onMouseLeave={e => e.currentTarget.style.background = open ? "#f8fafd" : "#fff"}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #eef5ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            {category.icon}
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {category.name}
          </span>
          <span style={{ fontSize: 11, background: "#eef5ff", color: "#1976d2", borderRadius: 12, padding: "2px 8px", fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>
            {category.hotlines.length}
          </span>
        </div>
        <span style={{ color: "#aaa" }}><ChevronIcon open={open} /></span>
      </div>

      {/* Hotlines Grid */}
      {open && (
        <div style={{ padding: "4px 20px 20px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 14 }}>
            {category.hotlines.map(h => <HotlineCard key={h.id} hotline={h} />)}
          </div>
          {category.hotlines.length === 0 && (
            <div style={{ textAlign: "center", color: "#aaa", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", padding: "20px 0" }}>No hotlines in this category yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
    <div style={{ height: 14, width: "40%", background: "#f0f2f5", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
function PublicHotlines() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => { setCategories(Array.isArray(res.data) ? res.data : res.data.results || []); setError(null); })
      .catch(() => setError("Failed to load hotlines."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>Hotlines</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>
          Emergency contacts and city service hotlines
        </p>
      </div>

      {/* Emergency Banner */}
      <div style={{ background: "linear-gradient(135deg, #fff0f0, #ffe4e4)", border: "1.5px solid #ffcdd2", borderRadius: 12, padding: "18px 22px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #e53935, #c62828)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(229,57,53,0.3)" }}>
          <span style={{ fontSize: 22 }}>🚨</span>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#c62828", fontFamily: "'Segoe UI', sans-serif", marginBottom: 4 }}>Emergency Response Center</div>
          <div style={{ fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.6, marginBottom: 8 }}>
            In case of immediate emergency, please dial 911 or the local emergency hotline immediately. Keep these numbers saved in your phone.
          </div>
          <div style={{ fontWeight: 900, fontSize: 36, color: "#c62828", fontFamily: "'Segoe UI', sans-serif", letterSpacing: 2 }}>911</div>
        </div>
      </div>

      {/* Directory Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", borderLeft: "4px solid #1976d2", paddingLeft: 12 }}>
          Directory of Services
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #1a56a0, #1976d2)", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>
          <HeadsetIcon /> Customer Service
        </div>
      </div>

      {error && <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>⚠️ {error}</div>}

      {loading && [1, 2, 3].map(i => <Skeleton key={i} />)}

      {!loading && categories.length === 0 && !error && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📞</div>
          No hotlines available yet.
        </div>
      )}

      {!loading && categories.map((cat, i) => (
        <CategoryAccordion key={cat.id} category={cat} defaultOpen={i === 0} />
      ))}
    </Layout>
  );
}

export default PublicHotlines;
// src/components/ReusableBar/DepartmentSidebar.jsx
import { useState } from "react";

// ─── Fallback seal icon ───────────────────────────────────────────────────────

const DefaultSeal = () => (
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

// ─── Hardcoded office list ────────────────────────────────────────────────────

const OFFICES = [
  { id: 1,  name: "OFFICE OF THE CITY ADMINISTRATOR", short: "ADMIN Office" },
  { id: 2,  name: "CITY ENGINEERING OFFICE",          short: "CEO Office" },
  { id: 3,  name: "CITY HEALTH OFFICE",               short: "CHO Office" },
  { id: 4,  name: "CITY TOURISM & CULTURAL AFFAIRS",  short: "TOURISM Office" },
  { id: 5,  name: "CITY VETERINARY OFFICE",           short: "VET Office" },
  { id: 6,  name: "CITY DISASTER RISK REDUCTION",     short: "CDRRMO Office" },
  { id: 7,  name: "CITY TRAFFIC MANAGEMENT OFFICE",   short: "CTMO Office" },
  { id: 8,  name: "CITY ENVIRONMENT & NATURAL RESOURCES", short: "ENRO Office" },
  { id: 9,  name: "CITY SOCIAL WELFARE AND DEVELOPMENT",  short: "CSWDO Office" },
  { id: 10, name: "CITY AGRICULTURE'S OFFICE",        short: "AGRI Office" },
];

const truncate = (str, max = 28) =>
  str.length > max ? str.slice(0, max) + "..." : str;

// ─── DepartmentSidebar Component ─────────────────────────────────────────────

export const DepartmentSidebar = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={{
      width: 260,
      flexShrink: 0,
      background: "#ffffff",
      borderRadius: 10,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      overflow: "hidden",
      alignSelf: "flex-start",
      // ✅ Sticky — stays fixed while main content scrolls independently
      position: "sticky",
      top: 172,  // header (96px) + navbar (56px) + page padding (20px) = 172px
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a56a0, #1976d2)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.2)",
          borderRadius: 6,
          width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <span style={{
          color: "#ffffff",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 0.5,
          fontFamily: "'Segoe UI', sans-serif",
          textTransform: "uppercase",
        }}>
          City Department Offices
        </span>
      </div>

      {/* ── Office List — scrolls independently inside the fixed sidebar ── */}
      <div style={{
        maxHeight: "calc(100vh - 240px)", // ✅ fills remaining viewport height
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#dde3ec #f5f7fa",
      }}>
        {OFFICES.map((office) => (
          <div
            key={office.id}
            onMouseEnter={() => setHoveredId(office.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: hoveredId === office.id ? "#f5f7fa" : "#ffffff",
              borderLeft: hoveredId === office.id ? "3px solid #1976d2" : "3px solid transparent",
              borderBottom: "1px solid #f0f0f0",
              transition: "background 0.15s ease, border-left 0.15s ease",
              cursor: "pointer",
            }}
          >
            <DefaultSeal />
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: hoveredId === office.id ? "#1976d2" : "#222",
                fontFamily: "'Segoe UI', sans-serif",
                lineHeight: 1.3,
                textTransform: "uppercase",
                letterSpacing: 0.2,
                transition: "color 0.15s",
              }}>
                {truncate(office.name, 28)}
              </div>
              <div style={{
                fontSize: 11,
                color: "#888",
                fontFamily: "'Segoe UI', sans-serif",
                marginTop: 2,
              }}>
                {office.short}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DepartmentSidebar;
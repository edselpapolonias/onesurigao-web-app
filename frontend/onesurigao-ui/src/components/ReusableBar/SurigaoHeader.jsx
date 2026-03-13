import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";  // ✅ added useLocation

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─── Seal Logos ───────────────────────────────────────────────────────────────

const CipSealLogo = () => (
  <div style={{
    width: 72, height: 72, borderRadius: "50%",
    background: "linear-gradient(135deg, #1a56a0 0%, #0d3b7a 100%)",
    border: "3px solid #fff",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    flexShrink: 0,
  }}>
    <svg width="38" height="38" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="22" r="13" stroke="#7ec8f7" strokeWidth="1.5" fill="none" />
      <ellipse cx="25" cy="22" rx="6" ry="13" stroke="#7ec8f7" strokeWidth="1.5" fill="none" />
      <line x1="12" y1="22" x2="38" y2="22" stroke="#7ec8f7" strokeWidth="1.5" />
      <path d="M16 36 Q25 42 34 36" stroke="#7ec8f7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
    <span style={{ color: "#fff", fontSize: 6, fontWeight: 700, letterSpacing: 0.3, marginTop: 1 }}>EST 2026</span>
  </div>
);

const SurigaoSealLogo = () => (
  <div style={{
    width: 72, height: 72, borderRadius: "50%",
    background: "linear-gradient(135deg, #c0392b 0%, #8b0000 100%)",
    border: "3px solid #fff",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    flexShrink: 0,
  }}>
    <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
      <path d="M25 5 L42 14 L42 30 Q42 42 25 47 Q8 42 8 30 L8 14 Z" fill="#d4a017" opacity="0.9" />
      <path d="M25 10 L38 17 L38 29 Q38 39 25 43 Q12 39 12 29 L12 17 Z" fill="#8b0000" />
      <polygon points="25,14 26.5,19 31.5,19 27.5,22 29,27 25,24 21,27 22.5,22 18.5,19 23.5,19" fill="#d4a017" />
    </svg>
    <span style={{ color: "#fff", fontSize: 5.5, fontWeight: 700, letterSpacing: 0.3, marginTop: 1 }}>PILIPINAS</span>
  </div>
);

// ─── Header Component ─────────────────────────────────────────────────────────

export const SurigaoHeader = () => (
  <header style={{
    background: "linear-gradient(90deg, #1a56a0 0%, #1565c0 40%, #1976d2 100%)",
    padding: "12px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    minHeight: 96,
    width: "100%",
    boxSizing: "border-box",
    gap: 16,
    position: "sticky",
    top: 0,
    zIndex: 100,
  }}>
    <CipSealLogo />
    <div style={{ textAlign: "center", padding: "0 16px" }}>
      <p style={{ color: "#c9e0ff", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 2px 0", fontFamily: "'Segoe UI', sans-serif", fontWeight: 400 }}>
        Republic of the Philippines
      </p>
      <h1 style={{ color: "#ffffff", fontSize: 32, fontWeight: 900, fontStyle: "italic", letterSpacing: 2, fontFamily: "'Georgia', 'Times New Roman', serif", margin: "0 0 4px 0", textShadow: "0 1px 4px rgba(0,0,0,0.3)", lineHeight: 1.1 }}>
        CITY OF SURIGAO
      </h1>
      <a href="#" style={{ color: "#c9e0ff", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", textDecoration: "underline", fontFamily: "'Segoe UI', sans-serif", fontWeight: 400 }}>
        Community Information &amp; Public Service Platform
      </a>
    </div>
    <SurigaoSealLogo />
  </header>
);

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

const ProfileDropdown = ({ officeName, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = officeName
    ? officeName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        title={officeName || "Account"}
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #1a56a0, #1976d2)",
          border: "2px solid #dde3ec",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#fff",
          fontSize: 13, fontWeight: 700,
          fontFamily: "'Segoe UI', sans-serif",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          transition: "box-shadow 0.2s, transform 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 3px 10px rgba(25,118,210,0.4)"; e.currentTarget.style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
      >
        {initials}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: "#fff", borderRadius: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          border: "1px solid #e8ecf0",
          minWidth: 220, zIndex: 999,
          overflow: "hidden",
          animation: "fadeDown 0.15s ease",
        }}>
          <style>{`
            @keyframes fadeDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", background: "#f9fafb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #1a56a0, #1976d2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>
                  {officeName || "Admin"}
                </div>
                <div style={{ fontSize: 11, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Office Account</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "6px 0" }}>
            <DropdownItem icon={<UserIcon />} label="My Profile" onClick={() => setOpen(false)} />
            <DropdownItem icon={<SettingsIcon />} label="Account Settings" onClick={() => setOpen(false)} />
            <div style={{ borderTop: "1px solid #f0f0f0", margin: "6px 0" }} />
            <DropdownItem icon={<LogoutIcon />} label="Sign Out" danger onClick={() => { setOpen(false); onLogout(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "9px 16px", background: "none", border: "none",
      cursor: "pointer", fontSize: 13, fontWeight: 500,
      color: danger ? "#e53935" : "#333",
      fontFamily: "'Segoe UI', sans-serif",
      textAlign: "left", transition: "background 0.15s",
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = danger ? "#fff5f5" : "#f5f7fa"}
    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
  >
    <span style={{ color: danger ? "#e53935" : "#888", display: "flex" }}>{icon}</span>
    {label}
  </button>
);

// ─── NavBar Component ─────────────────────────────────────────────────────────

export const SurigaoNavBar = ({
  onSearch = () => {},
  officeName = "",
}) => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();  // ✅ read current URL

  const tabRoutes = {
    "ANNOUNCEMENT":   "/announcements",
    "PINNED":         "/pinnedAnnouncements",
    "EVENT":          "/events",
    "REPORT PROBLEM": "/report-problem",
    "HOTLINES":       "/hotlines",
  };

  const routeToTab = {
    "/announcements":      "ANNOUNCEMENT",
    "/pinnedAnnouncements": "PINNED",       // ✅ fixed typo (was pinnedAnnouncememnts)
    "/events":             "EVENT",
    "/report-problem":     "REPORT PROBLEM",
    "/hotlines":           "HOTLINES",
  };
  const activeTab = routeToTab[location.pathname] || "ANNOUNCEMENT";

  const tabs = ["ANNOUNCEMENT", "PINNED", "EVENT", "REPORT PROBLEM", "HOTLINES"];

  const handleTabClick = (tab) => {
    if (tabRoutes[tab]) navigate(tabRoutes[tab]);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminID");
    sessionStorage.removeItem("officeName");
    sessionStorage.removeItem("announcement_drafts");
    navigate("/");
  };

  return (
    <nav style={{
      background: "#ffffff",
      borderBottom: "1px solid #e0e0e0",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 56,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      width: "100%",
      boxSizing: "border-box",
      gap: 24,
      position: "sticky",
      top: 96,
      zIndex: 99,
    }}>

      <ProfileDropdown officeName={officeName} onLogout={handleLogout} />

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              style={{
                height: 36, padding: "0 20px", border: "none",
                background: isActive ? "linear-gradient(135deg, #1a56a0, #1976d2)" : "transparent",
                color: isActive ? "#ffffff" : "#555555",
                fontWeight: isActive ? 700 : 500,
                fontSize: 12, letterSpacing: 0.8, cursor: "pointer",
                borderRadius: 8, textTransform: "uppercase",
                fontFamily: "'Segoe UI', sans-serif",
                transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 2px 8px rgba(25,118,210,0.35)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) { e.currentTarget.style.background = "#eef2fb"; e.currentTarget.style.color = "#1a56a0"; }
              }}
              onMouseLeave={(e) => {
                if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555555"; }
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={{
        display: "flex", alignItems: "center",
        background: "#f5f7fa", border: "1.5px solid #dde3ec",
        borderRadius: 24, padding: "0 16px", height: 38,
        minWidth: 280, maxWidth: 380,
        transition: "border-color 0.2s", boxSizing: "border-box",
      }}>
        <span style={{ color: "#999", marginRight: 8, display: "flex" }}><SearchIcon /></span>
        <input
          type="text"
          placeholder="Search announcements, pages..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(searchValue)}
          style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#333", width: "100%", fontFamily: "'Segoe UI', sans-serif" }}
        />
      </div>
    </nav>
  );
};

// ─── Public NavBar Component ──────────────────────────────────────────────────

export const PublicNavBar = ({ onSearch = () => {} }) => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const tabRoutes = {
    "ANNOUNCEMENT":   "/home",
    "PINNED":         "/home/pinned",
    "EVENT":          "/home/events",
    "REPORT PROBLEM": "/home/report",
    "HOTLINES":       "/home/hotlines",
  };

  const routeToTab = {
    "/home":           "ANNOUNCEMENT",
    "/home/pinned":    "PINNED",
    "/home/events":    "EVENT",
    "/home/report":    "REPORT PROBLEM",
    "/home/hotlines":  "HOTLINES",
  };

  const activeTab = routeToTab[location.pathname] || "ANNOUNCEMENT";
  const tabs = ["ANNOUNCEMENT", "PINNED", "EVENT", "REPORT PROBLEM", "HOTLINES"];

  return (
    <nav style={{
      background: "#ffffff",
      borderBottom: "1px solid #e0e0e0",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 56,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      width: "100%",
      boxSizing: "border-box",
      gap: 24,
      position: "sticky",
      top: 96,
      zIndex: 99,
    }}>
      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => navigate(tabRoutes[tab])}
              style={{
                height: 36, padding: "0 20px", border: "none",
                background: isActive ? "linear-gradient(135deg, #1a56a0, #1976d2)" : "transparent",
                color: isActive ? "#ffffff" : "#555555",
                fontWeight: isActive ? 700 : 500,
                fontSize: 12, letterSpacing: 0.8, cursor: "pointer",
                borderRadius: 8, textTransform: "uppercase",
                fontFamily: "'Segoe UI', sans-serif",
                transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 2px 8px rgba(25,118,210,0.35)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) { e.currentTarget.style.background = "#eef2fb"; e.currentTarget.style.color = "#1a56a0"; }
              }}
              onMouseLeave={(e) => {
                if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555555"; }
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={{
        display: "flex", alignItems: "center",
        background: "#f5f7fa", border: "1.5px solid #dde3ec",
        borderRadius: 24, padding: "0 16px", height: 38,
        minWidth: 280, maxWidth: 380,
        transition: "border-color 0.2s", boxSizing: "border-box",
      }}>
        <span style={{ color: "#999", marginRight: 8, display: "flex" }}><SearchIcon /></span>
        <input
          type="text"
          placeholder="Search announcements, events..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(searchValue)}
          style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#333", width: "100%", fontFamily: "'Segoe UI', sans-serif" }}
        />
      </div>
    </nav>
  );
};

// ─── Default Export ───────────────────────────────────────────────────────────

export default function SurigaoHeaderDemo() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "200vh", background: "#f0f2f5" }}>
      <SurigaoHeader />
      <SurigaoNavBar
        onSearch={(q) => console.log("Search:", q)}
        officeName="City Health Office"
      />
      <div style={{
        maxWidth: 700, margin: "40px auto", background: "#fff",
        borderRadius: 12, padding: 32,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        textAlign: "center", color: "#888", fontSize: 14,
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🏛️</div>
        <strong style={{ color: "#333", fontSize: 16 }}>Scroll down to test sticky header & nav</strong>
        <p style={{ marginTop: 8 }}>Both the header and navbar stay fixed at the top while scrolling.</p>
      </div>
    </div>
  );
}
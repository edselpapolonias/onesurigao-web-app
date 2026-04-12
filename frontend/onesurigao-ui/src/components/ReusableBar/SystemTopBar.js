import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import oneSurigaoLogo from "../../assets/one-surigao-logo.png";
import { usePublicAuth, useTheme, AdminProfileDropdown, PublicProfileDropdown } from "./SurigaoHeader";

const DS = {
  primary: "#0f6adf",
  border: "#e2e8f0",
  textPrimary: "#191919",
  textMuted: "#718096",
  font: "'Segoe UI', system-ui, sans-serif",
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17a2 2 0 0 1-.6 1.42L4 17h5" />
    <path d="M10 17a2 2 0 0 0 4 0" />
  </svg>
);

const resolveSearchRoute = pathname => {
  if (pathname.startsWith("/superadmin")) return "/superadmin/search";
  if (pathname.startsWith("/home")) return "/home/search";
  return "/search";
};

const resolvePlaceholder = pathname => {
  if (pathname.startsWith("/superadmin")) return "Search offices, reports, events, announcements...";
  if (pathname.startsWith("/home")) return "Search offices, updates, announcements...";
  return "Search reports, offices, announcements...";
};

const resolveBadge = (pathname, publicUser) => {
  if (pathname.startsWith("/superadmin")) return "SA";
  if (pathname.startsWith("/home")) {
    const name = publicUser?.name || "Guest";
    return name.split(" ").filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "GU";
  }
  const name = sessionStorage.getItem("officeName") || "Office";
  return name.split(" ").filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "OF";
};

const SystemTopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { user } = usePublicAuth() || { user: null };
  const [query, setQuery] = useState("");

  const searchRoute = useMemo(() => resolveSearchRoute(location.pathname), [location.pathname]);
  const placeholder = useMemo(() => resolvePlaceholder(location.pathname), [location.pathname]);
  const badge = useMemo(() => resolveBadge(location.pathname, user), [location.pathname, user]);

  const handleSearch = event => {
    event.preventDefault();
    const normalized = query.trim();
    navigate(normalized ? `${searchRoute}?q=${encodeURIComponent(normalized)}` : searchRoute);
  };

  const handleAdminLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };
  const handleSuperadminLogout = () => {
    sessionStorage.clear();
    navigate("/superadmin");
  };

  const isSuper = location.pathname.startsWith("/superadmin");
  const isPublic = location.pathname.startsWith("/home");

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px",
        background: isDark ? "#0F1724" : "#FFFFFF",
        borderBottom: `1px solid ${isDark ? "#223046" : "#e2e8f0"}`,
        boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
        zIndex: 200,
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(location.pathname.startsWith("/home") ? "/home" : location.pathname.startsWith("/superadmin") ? "/superadmin/announcements" : "/announcements")}
        style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", padding: 0, cursor: "pointer", flexShrink: 0 }}
      >
        <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={oneSurigaoLogo} alt="One Surigao" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, #2AD4FF 0%, #004AAD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: DS.font, letterSpacing: -0.3, whiteSpace: "nowrap", paddingRight: 4 }}>
          ONE SURIGAO
        </div>
      </button>

      <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 0, maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: isDark ? "#162131" : "#f0f2f5", border: "none", borderRadius: 999, padding: "0 14px", height: 36 }}>
          <span style={{ color: isDark ? "#94a3b8" : DS.textMuted, display: "flex" }}>
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={placeholder}
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", color: isDark ? "#f8fafc" : DS.textPrimary, fontSize: 13, fontFamily: DS.font }}
          />
        </div>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto", flexShrink: 0 }}>
        <button
          type="button"
          style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: isDark ? "#162131" : "#f0f2f5", color: isDark ? "#e2e8f0" : "#4a5568", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
        >
          <BellIcon />
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: DS.primary, border: `2px solid ${isDark ? "#0F1724" : "#fff"}` }} />
        </button>

        {isPublic ? (
          <PublicProfileDropdown />
        ) : isSuper ? (
          <AdminProfileDropdown
            name={sessionStorage.getItem("superAdminName") || "Super Admin"}
            grad="linear-gradient(135deg, #1A365D 0%, #2C5282 100%)"
            role="System Administrator"
            onLogout={handleSuperadminLogout}
          />
        ) : (
          <AdminProfileDropdown
            name={sessionStorage.getItem("officeName") || "Office"}
            profilePic={sessionStorage.getItem("adminProfilePic") || null}
            grad="linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)"
            role="Admin"
            onLogout={handleAdminLogout}
          />
        )}
      </div>
    </header>
  );
};

export default SystemTopBar;

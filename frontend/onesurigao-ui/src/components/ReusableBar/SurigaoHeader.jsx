// src/components/ReusableBar/SurigaoHeader.jsx
import { useState, useRef, useEffect, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { loginPublicUser, logoutAll } from "../../services/authService";
import oneSurigaoLogo from "../../assets/one-surigao-logo.png";

// ─── Public Auth Context (shared across app) ──────────────────────────────────
export const PublicAuthContext = createContext(null);
export const usePublicAuth = () => useContext(PublicAuthContext);

export const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("one-surigao-theme") || "light");

  useEffect(() => {
    localStorage.setItem("one-surigao-theme", theme);
    document.body.style.background = theme === "dark" ? "#0B1220" : "#f0f2f5";
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const PublicAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const id = sessionStorage.getItem("publicUserID");
    const name = sessionStorage.getItem("publicUserName");
    const pic = sessionStorage.getItem("publicUserPic");
    return id ? { publicUserID: Number(id), name, pic } : null;
  });

  const login = (u) => {
    logoutAll();
    sessionStorage.setItem("publicUserID", u.publicUserID);
    sessionStorage.setItem("publicUserName", u.name);
    if (u.pic) sessionStorage.setItem("publicUserPic", u.pic);
    else sessionStorage.removeItem("publicUserPic");
    setUser(u);
  };
  const logout = () => {
    sessionStorage.removeItem("publicUserID");
    sessionStorage.removeItem("publicUserName");
    sessionStorage.removeItem("publicUserPic");
    setUser(null);
  };

  return (
    <PublicAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </PublicAuthContext.Provider>
  );
};

// ─── Design System ────────────────────────────────────────────────────────────
const DS = {
  primary: "#2B6CB0",
  primaryDark: "#1E4E8C",
  primaryLight: "#EBF4FF",
  primaryGrad: "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  accent: "#66B7F0",
  accentSoft: "#EAF5FF",
  bg: "#f0f2f5",
  card: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#1A202C",
  textSecondary: "#4A5568",
  textMuted: "#718096",
  shadowModal: "0 24px 80px rgba(0,0,0,0.28)",
  font: "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const FeedTabIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>);
const PinTabIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5" /><path d="M5 3h14" /><path d="M7 3c0 5 2 7 5 8-3 1-5 3-5 8" /><path d="M17 3c0 5-2 7-5 8 3 1 5 3 5 8" /></svg>);
const CalendarTabIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const ReportTabIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const HotlineTabIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 8.9a16 16 0 0 0 6 6l.8-.8a2 2 0 0 1 2.12-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.92z" /></svg>);
const SparkleTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
    <path d="M12 10V4" /><path d="M12 20v-6" /><path d="M8 12H2" /><path d="M22 12h-6" />
  </svg>
);
const UserIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const SettingsIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const LogoutIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
const LoginIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>);
const UserPlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>);
const XIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const AlertIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const UploadIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
const MoonIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3c0 .37 0 .73.05 1.08A7 7 0 0 0 19.92 12c.36.05.72.05 1.08.05z" /></svg>);
const SunIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>);

// ─── Seals ────────────────────────────────────────────────────────────────────
const CipSeal = () => (
  <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#1a56a0,#0d3b7a)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", flexShrink: 0 }}>
    <svg width="36" height="36" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="22" r="13" stroke="#7ec8f7" strokeWidth="1.5" fill="none" />
      <ellipse cx="25" cy="22" rx="6" ry="13" stroke="#7ec8f7" strokeWidth="1.5" fill="none" />
      <line x1="12" y1="22" x2="38" y2="22" stroke="#7ec8f7" strokeWidth="1.5" />
      <path d="M16 36 Q25 42 34 36" stroke="#7ec8f7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 6, fontWeight: 700, letterSpacing: 0.4, marginTop: 1, fontFamily: DS.font }}>EST 2026</span>
  </div>
);
const SurigaoSeal = () => (
  <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#c0392b,#8b0000)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", flexShrink: 0 }}>
    <svg width="38" height="38" viewBox="0 0 50 50" fill="none">
      <path d="M25 5 L42 14 L42 30 Q42 42 25 47 Q8 42 8 30 L8 14 Z" fill="#d4a017" opacity="0.9" />
      <path d="M25 10 L38 17 L38 29 Q38 39 25 43 Q12 39 12 29 L12 17 Z" fill="#8b0000" />
      <polygon points="25,14 26.5,19 31.5,19 27.5,22 29,27 25,24 21,27 22.5,22 18.5,19 23.5,19" fill="#d4a017" />
    </svg>
    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 5.5, fontWeight: 700, letterSpacing: 0.4, marginTop: 1, fontFamily: DS.font }}>PILIPINAS</span>
  </div>
);

// ─── Header ───────────────────────────────────────────────────────────────────
export const SurigaoHeader = () => (
  <header style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#123b72 0%,#1f5da8 48%,#6dd3ff 130%)", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 28, boxShadow: "0 24px 50px rgba(16,54,97,0.18)", minHeight: 138, width: "100%", boxSizing: "border-box", gap: 18, border: "1px solid rgba(255,255,255,0.22)" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(255,255,255,0.16), transparent 28%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: -8, right: 48, width: 190, height: 190, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.16)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: -52, left: 120, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none" }} />

    <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", zIndex: 1 }}>
      <CipSeal />
      <div style={{ paddingRight: 8 }}>
        <p style={{ color: "rgba(226,244,255,0.88)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 6px", fontFamily: DS.font, fontWeight: 600 }}>Republic of the Philippines</p>
        <h1 style={{ color: "#fff", fontSize: 33, fontWeight: 900, letterSpacing: 1.4, fontFamily: "'Georgia','Times New Roman',serif", margin: "0 0 6px", textShadow: "0 10px 24px rgba(7,22,44,0.28)", lineHeight: 1 }}>CITY OF SURIGAO</h1>
        <p style={{ color: "rgba(224,242,255,0.78)", fontSize: 11, letterSpacing: 1.4, margin: 0, fontFamily: DS.font, fontWeight: 500, maxWidth: 420, lineHeight: 1.6 }}>Community information, office updates, public reports, and service access in one unified city platform.</p>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
      <div style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)", padding: "14px 16px", borderRadius: 22, minWidth: 180 }}>
        <div style={{ color: "#fff", fontSize: 12, fontWeight: 800, fontFamily: DS.font, marginBottom: 3 }}>Daily Civic Feed</div>
        <div style={{ color: "rgba(230,245,255,0.78)", fontSize: 11, lineHeight: 1.5, fontFamily: DS.font }}>A cleaner dashboard for announcements, events, reports, and local office directories.</div>
      </div>
      <SurigaoSeal />
    </div>
  </header>
);

// ─── Auth Modal (Login / Register for public) ─────────────────────────────────
const inputSt = { width: "100%", padding: "10px 14px", fontSize: 13, border: `1.5px solid ${DS.border}`, borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: DS.font, background: DS.card, transition: "border-color 0.2s", color: DS.textPrimary };
const labelSt = { display: "block", marginBottom: 6, fontWeight: 600, fontSize: 11, color: DS.textMuted, fontFamily: DS.font, textTransform: "uppercase", letterSpacing: 0.6 };

const AuthModal = ({ onClose, onLoggedIn }) => {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // login fields
  const [lf, setLf] = useState({ username: "", password: "" });
  // register fields
  const [rf, setRf] = useState({ name: "", lastName: "", username: "", password: "", email: "", profilePic: null });
  const [picPreview, setPicPreview] = useState(null);
  const picRef = useRef(null);

  const handlePic = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setRf(p => ({ ...p, profilePic: file }));
    setPicPreview(URL.createObjectURL(file));
  };

  const handleLogin = async () => {
    if (!lf.username || !lf.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await loginPublicUser(lf);
      if (res.data.success) {
        onLoggedIn({ publicUserID: res.data.publicUserID, name: `${res.data.name} ${res.data.lastName}`, pic: res.data.profilePic || null });
        onClose();
      } else setError(res.data.message || "Invalid credentials.");
    } catch { setError("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!rf.name || !rf.lastName || !rf.username || !rf.password || !rf.email) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(rf).forEach(([k, v]) => { if (v && k !== "profilePic") fd.append(k, v); });
      if (rf.profilePic) fd.append("profilePic", rf.profilePic);
      const res = await axios.post("http://127.0.0.1:8000/public/users/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      logoutAll();
      onLoggedIn({ publicUserID: res.data.publicUserID, name: `${res.data.name} ${res.data.lastName}`, pic: res.data.profilePic || null });
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.username ? "Username already taken." : d?.email ? "Email already in use." : "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(2px)" }}>
      <div style={{ background: DS.card, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: DS.shadowModal, overflow: "hidden", animation: "slideUp 0.24s ease" }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{ background: DS.primaryGrad, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: DS.font }}>Welcome to One Surigao</div>
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, fontFamily: DS.font, marginTop: 2 }}>Sign in or create your resident account</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.18)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#EDF2F7", margin: "16px 24px 0", borderRadius: 10, padding: 4, flexShrink: 0 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: mode === m ? 700 : 500, background: mode === m ? DS.card : "transparent", color: mode === m ? DS.primary : DS.textMuted, fontFamily: DS.font, boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px 24px" }}>
          {error && <div style={{ background: "#FFF5F5", border: "1.5px solid #FEB2B2", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#C53030", fontFamily: DS.font, display: "flex", alignItems: "center", gap: 6 }}><AlertIcon />{error}</div>}

          {mode === "login" ? (
            <>
              <div style={{ marginBottom: 12 }}><label style={labelSt}>Username</label><input value={lf.username} onChange={e => setLf({ ...lf, username: e.target.value })} placeholder="Enter username" style={inputSt} onFocus={e => e.target.style.borderColor = DS.primary} onBlur={e => e.target.style.borderColor = DS.border} /></div>
              <div style={{ marginBottom: 18 }}><label style={labelSt}>Password</label><input type="password" value={lf.password} onChange={e => setLf({ ...lf, password: e.target.value })} placeholder="Enter password" style={inputSt} onFocus={e => e.target.style.borderColor = DS.primary} onBlur={e => e.target.style.borderColor = DS.border} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
              <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: loading ? "#9AB8E0" : DS.primaryGrad, color: "#fff", border: "none", borderRadius: 9, cursor: loading ? "not-allowed" : "pointer", fontFamily: DS.font }}>{loading ? "Signing in..." : "Sign In"}</button>
            </>
          ) : (
            <>
              {/* Profile pic uploader */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
                <div onClick={() => picRef.current?.click()} style={{ width: 80, height: 80, borderRadius: "50%", border: `2px dashed ${DS.border}`, background: DS.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", marginBottom: 6, transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = DS.primary} onMouseLeave={e => e.currentTarget.style.borderColor = DS.border}>
                  {picPreview ? <img src={picPreview} alt="pic" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: DS.textMuted, display: "flex" }}><UploadIcon /></span>}
                </div>
                <input ref={picRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePic(e.target.files[0])} />
                <span style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.font }}>Profile photo (optional)</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={labelSt}>First Name *</label><input value={rf.name} onChange={e => setRf({ ...rf, name: e.target.value })} placeholder="Juan" style={inputSt} onFocus={e => e.target.style.borderColor = DS.primary} onBlur={e => e.target.style.borderColor = DS.border} /></div>
                <div><label style={labelSt}>Last Name *</label><input value={rf.lastName} onChange={e => setRf({ ...rf, lastName: e.target.value })} placeholder="dela Cruz" style={inputSt} onFocus={e => e.target.style.borderColor = DS.primary} onBlur={e => e.target.style.borderColor = DS.border} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={labelSt}>Username *</label><input value={rf.username} onChange={e => setRf({ ...rf, username: e.target.value })} placeholder="username" style={inputSt} onFocus={e => e.target.style.borderColor = DS.primary} onBlur={e => e.target.style.borderColor = DS.border} /></div>
                <div><label style={labelSt}>Email *</label><input type="email" value={rf.email} onChange={e => setRf({ ...rf, email: e.target.value })} placeholder="email@example.com" style={inputSt} onFocus={e => e.target.style.borderColor = DS.primary} onBlur={e => e.target.style.borderColor = DS.border} /></div>
              </div>
              <div style={{ marginBottom: 18 }}><label style={labelSt}>Password *</label><input type="password" value={rf.password} onChange={e => setRf({ ...rf, password: e.target.value })} placeholder="••••••••" style={inputSt} onFocus={e => e.target.style.borderColor = DS.primary} onBlur={e => e.target.style.borderColor = DS.border} /></div>
              <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: loading ? "#9AB8E0" : DS.primaryGrad, color: "#fff", border: "none", borderRadius: 9, cursor: loading ? "not-allowed" : "pointer", fontFamily: DS.font }}>{loading ? "Creating account..." : "Create Account"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dropdown Item ─────────────────────────────────────────────────────────────
const DropdownItem = ({ icon, label, onClick, danger }) => (
  <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: danger ? "#C53030" : DS.textPrimary, fontFamily: DS.font, textAlign: "left", transition: "background 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? "#FFF5F5" : "#F7FAFF"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}>
    <span style={{ color: danger ? "#C53030" : DS.textMuted, display: "flex" }}>{icon}</span>{label}
  </button>
);

// ─── Admin Profile Dropdown ────────────────────────────────────────────────────
const AdminProfileDropdown = ({ name, grad, role, onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const initials = name?.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, borderRadius: "50%", background: grad, border: `2px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: DS.font, boxShadow: "0 1px 4px rgba(0,0,0,0.15)", transition: "box-shadow 0.2s, transform 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "scale(1.07)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}>
        {initials}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: DS.card, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: `1px solid ${DS.border}`, minWidth: 220, zIndex: 999, overflow: "hidden", animation: "fadeDown 0.16s ease" }}>
          <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${DS.border}`, background: "#F7FAFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: DS.primary, fontFamily: DS.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{name || "Account"}</div>
                <div style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.font }}>{role}</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "6px 0" }}>
            <DropdownItem icon={<UserIcon />} label="My Profile" onClick={() => { setOpen(false); const adminID = Number(sessionStorage.getItem('adminID')); if (adminID) navigate('/profile'); }} />
            <DropdownItem icon={<SettingsIcon />} label="Account Settings" onClick={() => setOpen(false)} />
            <div style={{ borderTop: `1px solid ${DS.border}`, margin: "4px 0" }} />
            <DropdownItem icon={<LogoutIcon />} label="Sign Out" danger onClick={() => { setOpen(false); onLogout(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Public Profile Dropdown (with auth modal) ────────────────────────────────
const PublicProfileDropdown = () => {
  const { user, logout } = usePublicAuth();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // unused now — modal handles its own mode
  const ref = useRef(null);
  const { login } = usePublicAuth();

  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

  const initials = user?.name?.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <>
      <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
        {user ? (
          /* Logged-in avatar */
          <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, borderRadius: "50%", background: DS.primaryGrad, border: `2px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: DS.font, boxShadow: "0 1px 4px rgba(0,0,0,0.15)", transition: "box-shadow 0.2s, transform 0.15s", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "scale(1.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}>
            {user.pic ? <img src={user.pic} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
          </button>
        ) : (
          /* Guest icon */
          <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, borderRadius: "50%", background: "#EDF2F7", border: `2px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: DS.textMuted, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = DS.primaryLight; e.currentTarget.style.color = DS.primary; e.currentTarget.style.borderColor = DS.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#EDF2F7"; e.currentTarget.style.color = DS.textMuted; e.currentTarget.style.borderColor = DS.border; }}>
            <UserIcon />
          </button>
        )}

        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: DS.card, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: `1px solid ${DS.border}`, minWidth: 220, zIndex: 999, overflow: "hidden", animation: "fadeDown 0.16s ease" }}>
            {user ? (
              <>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${DS.border}`, background: "#F7FAFF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: DS.primaryGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                      {user.pic ? <img src={user.pic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: DS.primary, fontFamily: DS.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.font }}>Resident Account</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "6px 0" }}>
                  <DropdownItem icon={<UserIcon />} label="My Profile" onClick={() => setOpen(false)} />
                  <DropdownItem icon={<SettingsIcon />} label="Account Settings" onClick={() => setOpen(false)} />
                  <div style={{ borderTop: `1px solid ${DS.border}`, margin: "4px 0" }} />
                  <DropdownItem icon={<LogoutIcon />} label="Sign Out" danger onClick={() => { setOpen(false); logout(); }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${DS.border}`, background: "#F7FAFF" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, fontFamily: DS.font }}>Welcome, Resident!</div>
                  <div style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.font, marginTop: 2 }}>Sign in to track reports and get updates.</div>
                </div>
                <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => { setOpen(false); setShowAuth(true); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px", background: DS.primaryGrad, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: DS.font, boxShadow: "0 2px 8px rgba(43,108,176,0.25)" }}>
                    <LoginIcon /> Sign In
                  </button>
                  <button onClick={() => { setOpen(false); setShowAuth(true); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px", background: DS.card, border: `1.5px solid ${DS.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: DS.textPrimary, fontFamily: DS.font }}>
                    <UserPlusIcon /> Create Account
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLoggedIn={u => { login(u); setShowAuth(false); }} />}
    </>
  );
};

// ─── Search Bar ────────────────────────────────────────────────────────────────

// ─── Tab ──────────────────────────────────────────────────────────────────────
const NavTab = ({ label, icon, active, onClick, grad }) => {
  const { isDark } = useTheme();
  return (
    <button onClick={onClick} style={{ width: "100%", minHeight: 42, padding: "10px 14px", border: "none", background: active ? (isDark ? "#18314A" : "#edf2f7") : "transparent", color: active ? (isDark ? "#F8FBFF" : "#1A202C") : (isDark ? "#A7B4C7" : "#6B7280"), fontWeight: active ? 700 : 500, fontSize: 14, cursor: "pointer", borderRadius: 10, textTransform: "none", fontFamily: DS.font, transition: "all 0.18s", whiteSpace: "nowrap", boxShadow: "none", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10 }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = isDark ? "#111D2E" : "#f0f2f5"; e.currentTarget.style.color = isDark ? "#F8FBFF" : "#1A202C"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isDark ? "#A7B4C7" : "#6B7280"; } }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 8, background: "transparent", color: active ? "#2B6CB0" : "inherit", flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const ThemeToggle = () => {
  const { theme, setTheme, isDark } = useTheme();
  const tabStyle = (mode) => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    border: "none",
    background: theme === mode ? (isDark ? "#22496E" : "#D7EEFF") : "transparent",
    color: theme === mode ? (isDark ? "#EAF4FF" : "#1E4E8C") : isDark ? "#98A5B8" : "#667085",
    borderRadius: 12,
    minHeight: 34,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: DS.font,
    transition: "all 0.2s",
  });

  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 4, background: isDark ? "#111827" : "#F1F5F9", border: "none", borderRadius: 12, padding: 4 }}>
      <button onClick={() => setTheme("dark")} style={tabStyle("dark")}>
        <MoonIcon /> Dark
      </button>
      <button onClick={() => setTheme("light")} style={tabStyle("light")}>
        <SunIcon /> Light
      </button>
    </div>
  );
};

// ─── NavBar shell ─────────────────────────────────────────────────────────────
const NavBar = ({ tabs, activeTab, onTabClick, grad, tone = "public" }) => {
  const { isDark } = useTheme();

  // Split tabs: main tabs vs "quick access" tabs (Search, AI Chat)
  const quickAccessLabels = ["Search", "AI Chat"];
  const mainTabs = tabs.filter(tab => !quickAccessLabels.includes(tab.label));
  const quickTabs = tabs.filter(tab => quickAccessLabels.includes(tab.label));

  return (
    <nav style={{ width: 250, position: "fixed", top: 56, left: 0, bottom: 0, background: isDark ? "#0F1724" : "#FFFFFF", borderRight: `1px solid ${isDark ? "#223046" : "#e2e8f0"}`, padding: "16px 14px 14px", display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden", zIndex: 100 }}>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {mainTabs.map(tab => <NavTab key={tab.label} label={tab.label} icon={tab.icon} active={activeTab === tab.label} onClick={() => onTabClick(tab.label)} grad={grad} />)}
        </div>
        {quickTabs.length > 0 && (
          <>
            <div style={{ padding: "16px 12px 6px", fontSize: 10, fontWeight: 700, color: isDark ? "#6B7B90" : "#9CA3AF", fontFamily: DS.font, textTransform: "uppercase", letterSpacing: 1.2 }}>
              Quick Access
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {quickTabs.map(tab => <NavTab key={tab.label} label={tab.label === "Search" ? "Search Services" : tab.label} icon={tab.icon} active={activeTab === tab.label} onClick={() => onTabClick(tab.label)} grad={grad} />)}
            </div>
          </>
        )}
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${isDark ? "#223046" : "#e2e8f0"}`, display: "flex", justifyContent: "stretch", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

// ─── Admin NavBar ──────────────────────────────────────────────────────────────
export const SurigaoNavBar = ({ officeName = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const ROUTES = { "Announcements": "/announcements", "Pinned": "/pinnedAnnouncements", "Events": "/events", "Report Problem": "/report-problem", "Hotlines": "/hotlines", "Search": "/search" };
  const R2T = { "/announcements": "Announcements", "/pinnedAnnouncements": "Pinned", "/events": "Events", "/report-problem": "Report Problem", "/hotlines": "Hotlines", "/search": "Search" };
  const activeTab = R2T[location.pathname] || "Announcements";
  return (
    <NavBar
      tabs={[
        { label: "Announcements", icon: <FeedTabIcon /> },
        { label: "Pinned", icon: <PinTabIcon /> },
        { label: "Events", icon: <CalendarTabIcon /> },
        { label: "Report Problem", icon: <ReportTabIcon /> },
        { label: "Hotlines", icon: <HotlineTabIcon /> },
        { label: "Search", icon: <SearchIcon /> },
      ]}
      activeTab={activeTab} onTabClick={t => navigate(ROUTES[t])} grad={DS.primaryGrad}
      tone="admin" />
  );
};

// ─── Super Admin NavBar ────────────────────────────────────────────────────────
export const SuperAdminNavBar = ({ superAdminName = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const GRAD = "linear-gradient(135deg, #1A365D 0%, #2C5282 100%)";
  const ROUTES = { "Announcements": "/superadmin/announcements", "Pinned": "/superadmin/pinned", "Events": "/superadmin/events", "Report Problem": "/superadmin/reports", "Hotlines": "/superadmin/hotlines", "Search": "/superadmin/search" };
  const R2T = { "/superadmin/announcements": "Announcements", "/superadmin/pinned": "Pinned", "/superadmin/events": "Events", "/superadmin/reports": "Report Problem", "/superadmin/hotlines": "Hotlines", "/superadmin/search": "Search" };
  const activeTab = R2T[location.pathname] || "Announcements";
  return (
    <NavBar
      tabs={[
        { label: "Announcements", icon: <FeedTabIcon /> },
        { label: "Pinned", icon: <PinTabIcon /> },
        { label: "Events", icon: <CalendarTabIcon /> },
        { label: "Report Problem", icon: <ReportTabIcon /> },
        { label: "Hotlines", icon: <HotlineTabIcon /> },
        { label: "Search", icon: <SearchIcon /> },
      ]}
      activeTab={activeTab} onTabClick={t => navigate(ROUTES[t])} grad={GRAD}
      tone="superadmin" />
  );
};

// ─── Public NavBar (now with profile dropdown) ────────────────────────────────
export const PublicNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ROUTES = { "Announcements": "/home", "Pinned": "/home/pinned", "Events": "/home/events", "Report Problem": "/home/report", "Hotlines": "/home/hotlines", "AI Chat": "/home/chat", "Search": "/home/search" };
  const R2T = { "/home": "Announcements", "/home/pinned": "Pinned", "/home/events": "Events", "/home/report": "Report Problem", "/home/hotlines": "Hotlines", "/home/chat": "AI Chat", "/home/search": "Search" };
  const activeTab = R2T[location.pathname] || "Announcements";

  return (
    <NavBar
      tabs={[
        { label: "Announcements", icon: <FeedTabIcon /> },
        { label: "Pinned", icon: <PinTabIcon /> },
        { label: "Events", icon: <CalendarTabIcon /> },
        { label: "Report Problem", icon: <ReportTabIcon /> },
        { label: "Hotlines", icon: <HotlineTabIcon /> },
        { label: "AI Chat", icon: <SparkleTabIcon /> },
        { label: "Search", icon: <SearchIcon /> },
      ]}
      activeTab={activeTab} onTabClick={t => navigate(ROUTES[t])} grad={DS.primaryGrad}
      tone="public" />
  );
};

export default function SurigaoHeaderDemo() {
  return (
    <PublicAuthProvider>
      <div style={{ fontFamily: DS.font, minHeight: "200vh", background: DS.bg }}>
        <SurigaoHeader />
        <PublicNavBar />
      </div>
    </PublicAuthProvider>
  );
}

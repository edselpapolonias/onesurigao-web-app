// src/components/ReusableBar/SurigaoHeader.jsx
import { useState, useRef, useEffect, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// ─── Public Auth Context (shared across app) ──────────────────────────────────
export const PublicAuthContext = createContext(null);
export const usePublicAuth = () => useContext(PublicAuthContext);

export const PublicAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const id   = sessionStorage.getItem("publicUserID");
    const name = sessionStorage.getItem("publicUserName");
    const pic  = sessionStorage.getItem("publicUserPic");
    return id ? { publicUserID: Number(id), name, pic } : null;
  });

  const login  = (u) => {
    sessionStorage.setItem("publicUserID",  u.publicUserID);
    sessionStorage.setItem("publicUserName", u.name);
    if (u.pic) sessionStorage.setItem("publicUserPic", u.pic);
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
  primary:    "#2B6CB0",
  primaryDark:"#1E4E8C",
  primaryLight:"#EBF4FF",
  primaryGrad:"linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg:         "#F5F7FA",
  card:       "#FFFFFF",
  border:     "#E2E8F0",
  textPrimary:"#1A202C",
  textSecondary:"#4A5568",
  textMuted:  "#718096",
  shadowModal:"0 24px 80px rgba(0,0,0,0.28)",
  font:       "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon   = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const UserIcon     = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const SettingsIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
const LogoutIcon   = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const LoginIcon    = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>);
const UserPlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>);
const XIcon        = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const AlertIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);
const UploadIcon   = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);

// ─── Seals ────────────────────────────────────────────────────────────────────
const CipSeal = () => (
  <div style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#1a56a0,#0d3b7a)",border:"3px solid rgba(255,255,255,0.4)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.3)",flexShrink:0}}>
    <svg width="36" height="36" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="22" r="13" stroke="#7ec8f7" strokeWidth="1.5" fill="none"/>
      <ellipse cx="25" cy="22" rx="6" ry="13" stroke="#7ec8f7" strokeWidth="1.5" fill="none"/>
      <line x1="12" y1="22" x2="38" y2="22" stroke="#7ec8f7" strokeWidth="1.5"/>
      <path d="M16 36 Q25 42 34 36" stroke="#7ec8f7" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
    <span style={{color:"rgba(255,255,255,0.8)",fontSize:6,fontWeight:700,letterSpacing:0.4,marginTop:1,fontFamily:DS.font}}>EST 2026</span>
  </div>
);
const SurigaoSeal = () => (
  <div style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#c0392b,#8b0000)",border:"3px solid rgba(255,255,255,0.4)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.3)",flexShrink:0}}>
    <svg width="38" height="38" viewBox="0 0 50 50" fill="none">
      <path d="M25 5 L42 14 L42 30 Q42 42 25 47 Q8 42 8 30 L8 14 Z" fill="#d4a017" opacity="0.9"/>
      <path d="M25 10 L38 17 L38 29 Q38 39 25 43 Q12 39 12 29 L12 17 Z" fill="#8b0000"/>
      <polygon points="25,14 26.5,19 31.5,19 27.5,22 29,27 25,24 21,27 22.5,22 18.5,19 23.5,19" fill="#d4a017"/>
    </svg>
    <span style={{color:"rgba(255,255,255,0.8)",fontSize:5.5,fontWeight:700,letterSpacing:0.4,marginTop:1,fontFamily:DS.font}}>PILIPINAS</span>
  </div>
);

// ─── Header ───────────────────────────────────────────────────────────────────
export const SurigaoHeader = () => (
  <header style={{background:"linear-gradient(135deg,#1E4E8C 0%,#2B6CB0 60%,#3182CE 100%)",padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 16px rgba(0,0,0,0.25)",minHeight:92,width:"100%",boxSizing:"border-box",gap:20,position:"sticky",top:0,zIndex:100}}>
    <CipSeal/>
    <div style={{textAlign:"center",padding:"0 12px"}}>
      <p style={{color:"rgba(201,224,255,0.85)",fontSize:10,letterSpacing:3.5,textTransform:"uppercase",margin:"0 0 3px",fontFamily:DS.font,fontWeight:400}}>Republic of the Philippines</p>
      <h1 style={{color:"#fff",fontSize:30,fontWeight:900,fontStyle:"italic",letterSpacing:2.5,fontFamily:"'Georgia','Times New Roman',serif",margin:"0 0 5px",textShadow:"0 2px 8px rgba(0,0,0,0.25)",lineHeight:1.1}}>CITY OF SURIGAO</h1>
      <p style={{color:"rgba(201,224,255,0.75)",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",margin:0,fontFamily:DS.font,fontWeight:400}}>Community Information &amp; Public Service Platform</p>
    </div>
    <SurigaoSeal/>
  </header>
);

// ─── Auth Modal (Login / Register for public) ─────────────────────────────────
const inputSt = {width:"100%",padding:"10px 14px",fontSize:13,border:`1.5px solid ${DS.border}`,borderRadius:8,outline:"none",boxSizing:"border-box",fontFamily:DS.font,background:DS.card,transition:"border-color 0.2s",color:DS.textPrimary};
const labelSt = {display:"block",marginBottom:6,fontWeight:600,fontSize:11,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6};

const AuthModal = ({ onClose, onLoggedIn }) => {
  const [mode, setMode]   = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // login fields
  const [lf, setLf] = useState({ username:"", password:"" });
  // register fields
  const [rf, setRf] = useState({ name:"", lastName:"", username:"", password:"", email:"", profilePic:null });
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
      const res = await axios.post("http://127.0.0.1:8000/public/login/", lf);
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
      onLoggedIn({ publicUserID: res.data.publicUserID, name: `${res.data.name} ${res.data.lastName}`, pic: res.data.profilePic || null });
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.username ? "Username already taken." : d?.email ? "Email already in use." : "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20,backdropFilter:"blur(2px)"}}>
      <div style={{background:DS.card,borderRadius:16,width:"100%",maxWidth:480,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:DS.shadowModal,overflow:"hidden",animation:"slideUp 0.24s ease"}}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{background:DS.primaryGrad,padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:16,fontFamily:DS.font}}>Welcome to One Surigao</div>
            <div style={{color:"rgba(255,255,255,0.72)",fontSize:12,fontFamily:DS.font,marginTop:2}}>Sign in or create your resident account</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex",background:"#EDF2F7",margin:"16px 24px 0",borderRadius:10,padding:4,flexShrink:0}}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{flex:1,padding:"9px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:mode===m?700:500,background:mode===m?DS.card:"transparent",color:mode===m?DS.primary:DS.textMuted,fontFamily:DS.font,boxShadow:mode===m?"0 1px 6px rgba(0,0,0,0.1)":"none",transition:"all 0.2s"}}>
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{overflowY:"auto",flex:1,padding:"16px 24px 24px"}}>
          {error && <div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#C53030",fontFamily:DS.font,display:"flex",alignItems:"center",gap:6}}><AlertIcon/>{error}</div>}

          {mode === "login" ? (
            <>
              <div style={{marginBottom:12}}><label style={labelSt}>Username</label><input value={lf.username} onChange={e=>setLf({...lf,username:e.target.value})} placeholder="Enter username" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <div style={{marginBottom:18}}><label style={labelSt}>Password</label><input type="password" value={lf.password} onChange={e=>setLf({...lf,password:e.target.value})} placeholder="Enter password" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></div>
              <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"12px",fontSize:14,fontWeight:700,background:loading?"#9AB8E0":DS.primaryGrad,color:"#fff",border:"none",borderRadius:9,cursor:loading?"not-allowed":"pointer",fontFamily:DS.font}}>{loading?"Signing in...":"Sign In"}</button>
            </>
          ) : (
            <>
              {/* Profile pic uploader */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:18}}>
                <div onClick={()=>picRef.current?.click()} style={{width:80,height:80,borderRadius:"50%",border:`2px dashed ${DS.border}`,background:DS.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",marginBottom:6,transition:"border-color 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=DS.primary} onMouseLeave={e=>e.currentTarget.style.borderColor=DS.border}>
                  {picPreview ? <img src={picPreview} alt="pic" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{color:DS.textMuted,display:"flex"}}><UploadIcon/></span>}
                </div>
                <input ref={picRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handlePic(e.target.files[0])}/>
                <span style={{fontSize:11,color:DS.textMuted,fontFamily:DS.font}}>Profile photo (optional)</span>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><label style={labelSt}>First Name *</label><input value={rf.name} onChange={e=>setRf({...rf,name:e.target.value})} placeholder="Juan" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
                <div><label style={labelSt}>Last Name *</label><input value={rf.lastName} onChange={e=>setRf({...rf,lastName:e.target.value})} placeholder="dela Cruz" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><label style={labelSt}>Username *</label><input value={rf.username} onChange={e=>setRf({...rf,username:e.target.value})} placeholder="username" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
                <div><label style={labelSt}>Email *</label><input type="email" value={rf.email} onChange={e=>setRf({...rf,email:e.target.value})} placeholder="email@example.com" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              </div>
              <div style={{marginBottom:18}}><label style={labelSt}>Password *</label><input type="password" value={rf.password} onChange={e=>setRf({...rf,password:e.target.value})} placeholder="••••••••" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <button onClick={handleRegister} disabled={loading} style={{width:"100%",padding:"12px",fontSize:14,fontWeight:700,background:loading?"#9AB8E0":DS.primaryGrad,color:"#fff",border:"none",borderRadius:9,cursor:loading?"not-allowed":"pointer",fontFamily:DS.font}}>{loading?"Creating account...":"Create Account"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dropdown Item ─────────────────────────────────────────────────────────────
const DropdownItem = ({ icon, label, onClick, danger }) => (
  <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 16px",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:500,color:danger?"#C53030":DS.textPrimary,fontFamily:DS.font,textAlign:"left",transition:"background 0.15s"}}
    onMouseEnter={e=>e.currentTarget.style.background=danger?"#FFF5F5":"#F7FAFF"}
    onMouseLeave={e=>e.currentTarget.style.background="none"}>
    <span style={{color:danger?"#C53030":DS.textMuted,display:"flex"}}>{icon}</span>{label}
  </button>
);

// ─── Admin Profile Dropdown ────────────────────────────────────────────────────
const AdminProfileDropdown = ({ name, grad, role, onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const initials = name?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"?";
  useEffect(()=>{ const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  return (
    <div ref={ref} style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setOpen(!open)} style={{width:36,height:36,borderRadius:"50%",background:grad,border:`2px solid ${DS.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700,fontFamily:DS.font,boxShadow:"0 1px 4px rgba(0,0,0,0.15)",transition:"box-shadow 0.2s, transform 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 3px 12px rgba(0,0,0,0.2)";e.currentTarget.style.transform="scale(1.07)";}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.15)";e.currentTarget.style.transform="scale(1)";}}>
        {initials}
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,background:DS.card,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.14)",border:`1px solid ${DS.border}`,minWidth:220,zIndex:999,overflow:"hidden",animation:"fadeDown 0.16s ease"}}>
          <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${DS.border}`,background:"#F7FAFF"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:700,flexShrink:0}}>{initials}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:DS.primary,fontFamily:DS.font,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:150}}>{name||"Account"}</div>
                <div style={{fontSize:11,color:DS.textMuted,fontFamily:DS.font}}>{role}</div>
              </div>
            </div>
          </div>
          <div style={{padding:"6px 0"}}>
            <DropdownItem icon={<UserIcon/>} label="My Profile" onClick={()=>{setOpen(false); const adminID = Number(sessionStorage.getItem('adminID')); if(adminID) navigate('/profile'); }}/>
            <DropdownItem icon={<SettingsIcon/>} label="Account Settings" onClick={()=>setOpen(false)}/>
            <div style={{borderTop:`1px solid ${DS.border}`,margin:"4px 0"}}/>
            <DropdownItem icon={<LogoutIcon/>} label="Sign Out" danger onClick={()=>{setOpen(false);onLogout();}}/>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Public Profile Dropdown (with auth modal) ────────────────────────────────
const PublicProfileDropdown = () => {
  const { user, logout } = usePublicAuth();
  const [open, setOpen]       = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // unused now — modal handles its own mode
  const ref = useRef(null);
  const { login } = usePublicAuth();

  useEffect(()=>{ const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);

  const initials = user?.name?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"?";

  return (
    <>
      <div ref={ref} style={{position:"relative",flexShrink:0}}>
        {user ? (
          /* Logged-in avatar */
          <button onClick={()=>setOpen(!open)} style={{width:36,height:36,borderRadius:"50%",background:DS.primaryGrad,border:`2px solid ${DS.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700,fontFamily:DS.font,boxShadow:"0 1px 4px rgba(0,0,0,0.15)",transition:"box-shadow 0.2s, transform 0.15s",overflow:"hidden"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 3px 12px rgba(0,0,0,0.2)";e.currentTarget.style.transform="scale(1.07)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.15)";e.currentTarget.style.transform="scale(1)";}}>
            {user.pic ? <img src={user.pic} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : initials}
          </button>
        ) : (
          /* Guest icon */
          <button onClick={()=>setOpen(!open)} style={{width:36,height:36,borderRadius:"50%",background:"#EDF2F7",border:`2px solid ${DS.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:DS.textMuted,transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;e.currentTarget.style.borderColor=DS.primary;}}
            onMouseLeave={e=>{e.currentTarget.style.background="#EDF2F7";e.currentTarget.style.color=DS.textMuted;e.currentTarget.style.borderColor=DS.border;}}>
            <UserIcon/>
          </button>
        )}

        {open && (
          <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,background:DS.card,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.14)",border:`1px solid ${DS.border}`,minWidth:220,zIndex:999,overflow:"hidden",animation:"fadeDown 0.16s ease"}}>
            {user ? (
              <>
                <div style={{padding:"14px 16px",borderBottom:`1px solid ${DS.border}`,background:"#F7FAFF"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:700,flexShrink:0,overflow:"hidden"}}>
                      {user.pic ? <img src={user.pic} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : initials}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:DS.primary,fontFamily:DS.font,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:150}}>{user.name}</div>
                      <div style={{fontSize:11,color:DS.textMuted,fontFamily:DS.font}}>Resident Account</div>
                    </div>
                  </div>
                </div>
                <div style={{padding:"6px 0"}}>
                  <DropdownItem icon={<UserIcon/>} label="My Profile" onClick={()=>setOpen(false)}/>
                  <DropdownItem icon={<SettingsIcon/>} label="Account Settings" onClick={()=>setOpen(false)}/>
                  <div style={{borderTop:`1px solid ${DS.border}`,margin:"4px 0"}}/>
                  <DropdownItem icon={<LogoutIcon/>} label="Sign Out" danger onClick={()=>{setOpen(false);logout();}}/>
                </div>
              </>
            ) : (
              <>
                <div style={{padding:"14px 16px",borderBottom:`1px solid ${DS.border}`,background:"#F7FAFF"}}>
                  <div style={{fontSize:13,fontWeight:700,color:DS.textPrimary,fontFamily:DS.font}}>Welcome, Resident!</div>
                  <div style={{fontSize:11,color:DS.textMuted,fontFamily:DS.font,marginTop:2}}>Sign in to track reports and get updates.</div>
                </div>
                <div style={{padding:"10px 12px",display:"flex",flexDirection:"column",gap:6}}>
                  <button onClick={()=>{setOpen(false);setShowAuth(true);}}
                    style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"9px",background:DS.primaryGrad,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff",fontFamily:DS.font,boxShadow:"0 2px 8px rgba(43,108,176,0.25)"}}>
                    <LoginIcon/> Sign In
                  </button>
                  <button onClick={()=>{setOpen(false);setShowAuth(true);}}
                    style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"9px",background:DS.card,border:`1.5px solid ${DS.border}`,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textPrimary,fontFamily:DS.font}}>
                    <UserPlusIcon/> Create Account
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onLoggedIn={u=>{login(u);setShowAuth(false);}}/>}
    </>
  );
};

// ─── Search Bar ────────────────────────────────────────────────────────────────
const SearchBar = ({ placeholder, onSearch }) => {
  const [val, setVal] = useState("");
  const [focused, setFocused] = useState(false);
  return (
    <div style={{display:"flex",alignItems:"center",background:focused?"#fff":DS.bg,border:`1.5px solid ${focused?DS.primary:DS.border}`,borderRadius:22,padding:"0 14px",height:36,minWidth:260,maxWidth:360,transition:"all 0.2s",boxSizing:"border-box"}}>
      <span style={{color:focused?DS.primary:DS.textMuted,marginRight:8,display:"flex",transition:"color 0.2s"}}><SearchIcon/></span>
      <input type="text" placeholder={placeholder} value={val} onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&onSearch(val)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{border:"none",background:"transparent",outline:"none",fontSize:13,color:DS.textPrimary,width:"100%",fontFamily:DS.font}}/>
    </div>
  );
};

// ─── Tab ──────────────────────────────────────────────────────────────────────
const NavTab = ({ label, active, onClick, grad }) => (
  <button onClick={onClick} style={{height:34,padding:"0 18px",border:"none",background:active?grad:"transparent",color:active?"#fff":"#4A5568",fontWeight:active?700:500,fontSize:12,letterSpacing:0.7,cursor:"pointer",borderRadius:8,textTransform:"uppercase",fontFamily:DS.font,transition:"all 0.2s",whiteSpace:"nowrap",boxShadow:active?"0 2px 8px rgba(0,0,0,0.2)":"none"}}
    onMouseEnter={e=>{if(!active){e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}}
    onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#4A5568";}}}>
    {label}
  </button>
);

// ─── NavBar shell ─────────────────────────────────────────────────────────────
const NavBar = ({ left, tabs, activeTab, onTabClick, grad, search }) => (
  <nav style={{background:DS.card,borderBottom:`1px solid ${DS.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"center",height:52,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",width:"100%",boxSizing:"border-box",gap:20,position:"sticky",top:92,zIndex:99}}>
    {left}
    <div style={{display:"flex",alignItems:"center",gap:4,height:"100%"}}>
      {tabs.map(t=><NavTab key={t} label={t} active={activeTab===t} onClick={()=>onTabClick(t)} grad={grad}/>)}
    </div>
    {search}
  </nav>
);

// ─── Admin NavBar ──────────────────────────────────────────────────────────────
export const SurigaoNavBar = ({ onSearch=()=>{}, officeName="" }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const ROUTES    = { "ANNOUNCEMENT":"/announcements","PINNED":"/pinnedAnnouncements","EVENT":"/events","REPORT PROBLEM":"/report-problem","HOTLINES":"/hotlines" };
  const R2T       = { "/announcements":"ANNOUNCEMENT","/pinnedAnnouncements":"PINNED","/events":"EVENT","/report-problem":"REPORT PROBLEM","/hotlines":"HOTLINES" };
  const activeTab = R2T[location.pathname]||"ANNOUNCEMENT";
  const handleLogout = () => { sessionStorage.removeItem("adminID"); sessionStorage.removeItem("officeName"); sessionStorage.removeItem("announcement_drafts"); navigate("/"); };
  return (
    <NavBar left={<AdminProfileDropdown name={officeName||"Admin"} grad={DS.primaryGrad} role="Office Account" onLogout={handleLogout}/>}
      tabs={["ANNOUNCEMENT","PINNED","EVENT","REPORT PROBLEM","HOTLINES"]}
      activeTab={activeTab} onTabClick={t=>navigate(ROUTES[t])} grad={DS.primaryGrad}
      search={<SearchBar placeholder="Search announcements, reports..." onSearch={onSearch}/>}/>
  );
};

// ─── Super Admin NavBar ────────────────────────────────────────────────────────
export const SuperAdminNavBar = ({ onSearch=()=>{}, superAdminName="" }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const GRAD      = "linear-gradient(135deg, #1A365D 0%, #2C5282 100%)";
  const ROUTES    = { "ANNOUNCEMENT":"/superadmin/announcements","PINNED":"/superadmin/pinned","EVENT":"/superadmin/events","REPORT PROBLEM":"/superadmin/reports","HOTLINES":"/superadmin/hotlines" };
  const R2T       = { "/superadmin/announcements":"ANNOUNCEMENT","/superadmin/pinned":"PINNED","/superadmin/events":"EVENT","/superadmin/reports":"REPORT PROBLEM","/superadmin/hotlines":"HOTLINES" };
  const activeTab = R2T[location.pathname]||"ANNOUNCEMENT";
  const handleLogout = () => { sessionStorage.removeItem("superAdminID"); sessionStorage.removeItem("superAdminName"); navigate("/superadmin"); };
  return (
    <NavBar left={<AdminProfileDropdown name={superAdminName||"Super Admin"} grad={GRAD} role="Super Admin Account" onLogout={handleLogout}/>}
      tabs={["ANNOUNCEMENT","PINNED","EVENT","REPORT PROBLEM","HOTLINES"]}
      activeTab={activeTab} onTabClick={t=>navigate(ROUTES[t])} grad={GRAD}
      search={<SearchBar placeholder="Search announcements, reports..." onSearch={onSearch}/>}/>
  );
};

// ─── Public NavBar (now with profile dropdown) ────────────────────────────────
export const PublicNavBar = ({ onSearch=()=>{} }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const ROUTES    = { "ANNOUNCEMENT":"/home","PINNED":"/home/pinned","EVENT":"/home/events","REPORT PROBLEM":"/home/report","HOTLINES":"/home/hotlines" };
  const R2T       = { "/home":"ANNOUNCEMENT","/home/pinned":"PINNED","/home/events":"EVENT","/home/report":"REPORT PROBLEM","/home/hotlines":"HOTLINES" };
  const activeTab = R2T[location.pathname]||"ANNOUNCEMENT";
  return (
    <NavBar left={<PublicProfileDropdown/>}
      tabs={["ANNOUNCEMENT","PINNED","EVENT","REPORT PROBLEM","HOTLINES"]}
      activeTab={activeTab} onTabClick={t=>navigate(ROUTES[t])} grad={DS.primaryGrad}
      search={<SearchBar placeholder="Search announcements, events..." onSearch={onSearch}/>}/>
  );
};

export default function SurigaoHeaderDemo() {
  return (
    <PublicAuthProvider>
      <div style={{fontFamily:DS.font,minHeight:"200vh",background:DS.bg}}>
        <SurigaoHeader/>
        <PublicNavBar/>
      </div>
    </PublicAuthProvider>
  );
}
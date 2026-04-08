// src/components/ReusableBar/DepartmentSidebar.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "./SurigaoHeader";

const ADMINS_URL = "http://127.0.0.1:8000/api/admins/";

const DS = {
  primary:      "#2B6CB0",
  primaryLight: "#EBF4FF",
  primaryGrad:  "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  accent:       "#D7EEFF",
  bg:           "#F5F7FA",
  card:         "#FFFFFF",
  border:       "#E2E8F0",
  textPrimary:  "#1A202C",
  textSecondary:"#4A5568",
  textMuted:    "#718096",
  shadow:       "0 10px 26px rgba(15,23,42,0.08)",
  font:         "'Segoe UI', system-ui, sans-serif",
};

const OfficeAvatar = ({ officeName, profilePic, size=38 }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"OF";
  if (profilePic) return <img src={profilePic} alt={officeName} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}/>;
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*0.3,fontWeight:700,fontFamily:DS.font,flexShrink:0,boxShadow:"0 2px 6px rgba(43,108,176,0.25)"}}>
      {initials}
    </div>
  );
};

const GridIcon   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>);
const RefreshIcon= () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>);
const PlusIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);

const Skel = () => (
  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 12px",marginBottom:10,border:"none",borderRadius:16,background:"#F8FAFD"}}>
    <div style={{width:36,height:36,borderRadius:"50%",background:"#EDF2F7",animation:"pulse 1.5s ease-in-out infinite",flexShrink:0}}/>
    <div style={{flex:1}}>
      <div style={{height:11,width:"70%",background:"#EDF2F7",borderRadius:6,marginBottom:6,animation:"pulse 1.5s ease-in-out infinite"}}/>
      <div style={{height:9,width:"45%",background:"#EDF2F7",borderRadius:6,animation:"pulse 1.5s ease-in-out infinite"}}/>
    </div>
  </div>
);

// Detect which role by current path prefix
const detectRole = (pathname) => {
  if (pathname.startsWith("/superadmin")) return "superadmin";
  if (pathname.startsWith("/home")) return "public";
  return "admin";
};

const getDeptPath = (role, adminID) => {
  if (role === "superadmin") return `/superadmin/department/${adminID}`;
  if (role === "public") return `/home/department/${adminID}`;
  return `/department/${adminID}`;
};

export const DepartmentSidebar = ({ selectedAdminID = null, onOfficeFilter = null }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark } = useTheme();
  const role      = detectRole(location.pathname);

  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [hoveredID, setHoveredID] = useState(null);

  // Detect active department from URL
  const routeAdminID = (() => {
    const m = location.pathname.match(/\/department\/(\d+)/);
    return m ? Number(m[1]) : null;
  })();
  const activeAdminID = role === "public" && !routeAdminID ? selectedAdminID : routeAdminID;

  const fetchAdmins = () => {
    setLoading(true); setError(null);
    axios.get(ADMINS_URL)
      .then(res => setAdmins((Array.isArray(res.data)?res.data:res.data.results||[]).filter(a=>a.isActive!==false)))
      .catch(() => setError("Could not load offices."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const goHome = () => {
    if (role==="public") {
      onOfficeFilter?.(null);
      navigate("/home");
      return;
    }

    if (role==="superadmin") navigate("/superadmin/announcements");
    else navigate("/announcements");
  };

  const handleOfficeClick = (adminID) => {
    if (role === "public") {
      onOfficeFilter?.(adminID);
      navigate(`/home?office=${adminID}`);
      return;
    }

    navigate(getDeptPath(role, adminID));
  };

  return (
    <div style={{width:280,flexShrink:0,background:isDark?"#0F1724":DS.card,borderRadius:20,boxShadow:isDark?"0 16px 34px rgba(0,0,0,0.24)":DS.shadow,border:"none",overflow:"hidden",alignSelf:"flex-start",position:"sticky",top:14}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
        <div style={{flex:1}}>
          <div style={{color:isDark?"#F8FBFF":DS.textPrimary,fontWeight:800,fontSize:15,fontFamily:DS.font}}>Suggested Offices</div>
          <div style={{color:isDark?"#8FA1B9":DS.textMuted,fontSize:11.5,fontFamily:DS.font,marginTop:3,lineHeight:1.45}}>Quick connect and discover active offices</div>
        </div>
        <div style={{background:isDark?"#182435":"#F3F6FA",border:"none",borderRadius:12,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:isDark?"#A7B4C7":DS.textSecondary}}><GridIcon/></div>
      </div>

      <div style={{padding:"0 16px 10px"}}>
        <div style={{height:1,background:isDark?"#223046":"#EDF2F7"}} />
      </div>

      <div onClick={goHome} onMouseEnter={()=>setHoveredID("all")} onMouseLeave={()=>setHoveredID(null)}
        style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",margin:"0 12px 10px",border:"none",borderRadius:14,background:!activeAdminID?"#E7F2FF":hoveredID==="all"?(isDark?"#111D2E":"#F8FAFC"):"transparent",cursor:"pointer",transition:"all 0.15s",boxShadow:!activeAdminID?"0 8px 18px rgba(37,99,235,0.14)":"none"}}>
        <div style={{width:42,height:42,borderRadius:14,background:!activeAdminID?DS.accent:(isDark?"#182435":"#f4f6f9"),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s",color:!activeAdminID?DS.textPrimary:(isDark?"#8FA1B9":DS.textMuted)}}>
          <GridIcon/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:isDark?"#F8FBFF":DS.textPrimary,fontFamily:DS.font,transition:"color 0.15s"}}>Explore All Offices</div>
          <div style={{fontSize:11,color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font,marginTop:3}}>{admins.length} available suggestions</div>
        </div>
        {!activeAdminID&&<span style={{fontSize:11,fontWeight:700,color:isDark?"#EAF4FF":"#1E4E8C",background:isDark?"#22496E":"#D8EAFE",padding:"5px 10px",borderRadius:999}}>Viewing</span>}
      </div>

      <div style={{padding:"2px 16px 10px",fontSize:10.5,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font}}>
        Active Offices
      </div>

      <div style={{maxHeight:"calc(100vh - 244px)",overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:"#CBD5E0 #F5F7FA",padding:"0 12px 12px"}}>
        {loading && [1,2,3,4,5].map(i=><Skel key={i}/>)}
        {error && (
          <div style={{padding:"16px 14px",textAlign:"center",fontSize:12,color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font,background:isDark?"#111D2E":"#f8fafc",border:"none",borderRadius:14}}>
            <div style={{marginBottom:8}}>{error}</div>
            <button onClick={fetchAdmins} style={{display:"inline-flex",alignItems:"center",gap:5,background:"none",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:11,color:DS.primary,fontFamily:DS.font}}>
              <RefreshIcon/> Retry
            </button>
          </div>
        )}
        {!loading && !error && admins.map((admin, index) => {
          const isActive  = activeAdminID === admin.adminID;
          const isHovered = hoveredID === admin.adminID;
          return (
            <div key={admin.adminID}
              onClick={()=>handleOfficeClick(admin.adminID)}
              onMouseEnter={()=>setHoveredID(admin.adminID)}
              onMouseLeave={()=>setHoveredID(null)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"12px 12px",marginBottom:8,border:"none",borderRadius:14,background:isActive?"#E7F2FF":isHovered?(isDark?"#111D2E":"#F8FAFC"):"transparent",cursor:"pointer",transition:"all 0.15s",boxShadow:isActive?"0 8px 16px rgba(37,99,235,0.12)":"none"}}>
              <OfficeAvatar officeName={admin.officeName} profilePic={admin.profilePic||null}/>
              <div style={{overflow:"hidden",flex:1}}>
                <div style={{fontSize:12,fontWeight:800,color:isDark?"#F8FBFF":DS.textPrimary,fontFamily:DS.font,lineHeight:1.35,transition:"color 0.15s",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {admin.officeName}
                </div>
                <div style={{fontSize:11,color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font,marginTop:3}}>{index < 3 ? "Suggested office" : "Recently active department"}</div>
              </div>
              <span style={{display:"inline-flex",alignItems:"center",gap:4,flexShrink:0,fontSize:10.5,fontWeight:700,color:isDark?"#EAF4FF":"#1E4E8C",background:isDark?"#22496E":"#D8EAFE",padding:"5px 9px",borderRadius:999}}><PlusIcon/> Connect</span>
            </div>
          );
        })}
        {!loading && !error && admins.length===0 && (
          <div style={{padding:"28px 14px",textAlign:"center",fontSize:12,color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font,background:isDark?"#111D2E":"#f8fafc",border:"none",borderRadius:14}}>No offices found.</div>
        )}
      </div>
    </div>
  );
};

export default DepartmentSidebar;

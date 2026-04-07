// src/components/ReusableBar/DepartmentSidebar.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const ADMINS_URL = "http://127.0.0.1:8000/api/admins/";

const DS = {
  primary:      "#2B6CB0",
  primaryLight: "#EBF4FF",
  primaryGrad:  "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg:           "#F5F7FA",
  card:         "#FFFFFF",
  border:       "#E2E8F0",
  textPrimary:  "#1A202C",
  textMuted:    "#718096",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
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
const ChevronRightIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);

const Skel = () => (
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${DS.border}`}}>
    <div style={{width:38,height:38,borderRadius:"50%",background:"#EDF2F7",animation:"pulse 1.5s ease-in-out infinite",flexShrink:0}}/>
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
    <div style={{width:260,flexShrink:0,background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`,overflow:"hidden",alignSelf:"flex-start",position:"sticky",top:164}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div style={{background:DS.primaryGrad,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{background:"rgba(255,255,255,0.18)",borderRadius:7,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}><GridIcon/></div>
        <span style={{color:"#fff",fontWeight:700,fontSize:12,letterSpacing:0.6,fontFamily:DS.font,textTransform:"uppercase",flex:1}}>City Departments</span>
      </div>

      {/* All Offices row */}
      <div onClick={goHome} onMouseEnter={()=>setHoveredID("all")} onMouseLeave={()=>setHoveredID(null)}
        style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${DS.border}`,borderLeft:`3px solid ${!activeAdminID?DS.primary:"transparent"}`,background:!activeAdminID?"#F7FAFF":hoveredID==="all"?"#F7FAFF":DS.card,cursor:"pointer",transition:"all 0.15s"}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:!activeAdminID?DS.primaryGrad:"#EDF2F7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
          <span style={{color:!activeAdminID?"#fff":DS.textMuted,display:"flex"}}><GridIcon/></span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:!activeAdminID?DS.primary:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.3,transition:"color 0.15s"}}>All Departments</div>
          <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,marginTop:1}}>{admins.length} offices</div>
        </div>
        {!activeAdminID&&<span style={{color:DS.primary,display:"flex"}}><ChevronRightIcon/></span>}
      </div>

      {/* Office list */}
      <div style={{maxHeight:"calc(100vh - 310px)",overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:"#CBD5E0 #F5F7FA"}}>
        {loading && [1,2,3,4,5].map(i=><Skel key={i}/>)}
        {error && (
          <div style={{padding:"16px 14px",textAlign:"center",fontSize:12,color:DS.textMuted,fontFamily:DS.font}}>
            <div style={{marginBottom:8}}>{error}</div>
            <button onClick={fetchAdmins} style={{display:"inline-flex",alignItems:"center",gap:5,background:"none",border:`1px solid ${DS.border}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,color:DS.primary,fontFamily:DS.font}}>
              <RefreshIcon/> Retry
            </button>
          </div>
        )}
        {!loading && !error && admins.map(admin => {
          const isActive  = activeAdminID === admin.adminID;
          const isHovered = hoveredID === admin.adminID;
          return (
            <div key={admin.adminID}
              onClick={()=>handleOfficeClick(admin.adminID)}
              onMouseEnter={()=>setHoveredID(admin.adminID)}
              onMouseLeave={()=>setHoveredID(null)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:`1px solid ${DS.border}`,borderLeft:`3px solid ${isActive?DS.primary:"transparent"}`,background:isActive?"#F7FAFF":isHovered?"#F7FAFF":DS.card,cursor:"pointer",transition:"all 0.15s"}}>
              <OfficeAvatar officeName={admin.officeName} profilePic={admin.profilePic||null}/>
              <div style={{overflow:"hidden",flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:isActive?DS.primary:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.3,lineHeight:1.35,transition:"color 0.15s",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {admin.officeName}
                </div>
                <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,marginTop:2}}>City Government Office</div>
              </div>
              {isActive&&<span style={{color:DS.primary,display:"flex",flexShrink:0}}><ChevronRightIcon/></span>}
            </div>
          );
        })}
        {!loading && !error && admins.length===0 && (
          <div style={{padding:"28px 14px",textAlign:"center",fontSize:12,color:DS.textMuted,fontFamily:DS.font}}>No offices found.</div>
        )}
      </div>
    </div>
  );
};

export default DepartmentSidebar;

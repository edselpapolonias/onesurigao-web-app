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
  bg:           "#f0f2f5",
  card:         "#FFFFFF",
  border:       "#E2E8F0",
  textPrimary:  "#1A202C",
  textSecondary:"#4A5568",
  textMuted:    "#718096",
  shadow:       "0 1px 3px rgba(0,0,0,0.08)",
  font:         "'Segoe UI', system-ui, sans-serif",
};

const OfficeAvatar = ({ officeName, profilePic, size=42 }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"OF";
  if (profilePic) return <img src={profilePic} alt={officeName} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}/>;
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*0.3,fontWeight:700,fontFamily:DS.font,flexShrink:0,boxShadow:"0 2px 6px rgba(43,108,176,0.25)"}}>
      {initials}
    </div>
  );
};

const TrendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const Skel = () => (
  <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",marginBottom:6,border:"none",borderRadius:12,background:"#F8FAFD"}}>
    <div style={{width:42,height:42,borderRadius:"50%",background:"#EDF2F7",animation:"pulse 1.5s ease-in-out infinite",flexShrink:0}}/>
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
    <div style={{width:320,flexShrink:0,background:isDark?"#0F1724":DS.card,borderRadius:16,boxShadow:isDark?"0 1px 4px rgba(0,0,0,0.2)":DS.shadow,border:`1px solid ${isDark?"#223046":DS.border}`,overflow:"hidden",alignSelf:"flex-start",position:"sticky",top:76}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{padding:"18px 20px 10px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,color:DS.primary,fontWeight:800,fontSize:13.5,fontFamily:DS.font}}>
            <span style={{display:"flex"}}><TrendIcon/></span>
            Active Departments
          </div>
          <div style={{color:isDark?"#8FA1B9":DS.textMuted,fontSize:12,fontFamily:DS.font,marginTop:6,lineHeight:1.5}}>Browse active city offices and open their public service pages.</div>
        </div>
      </div>

      <div style={{padding:"0 20px 8px"}}>
        <div style={{height:1,background:isDark?"#223046":"#e2e8f0"}} />
      </div>

      <div style={{maxHeight:"calc(100vh - 240px)",overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:"#CBD5E0 #F5F7FA",padding:"0 14px 10px"}}>
        {loading && [1,2,3].map(i=><Skel key={i}/>)}
        {error && (
          <div style={{padding:"16px 14px",textAlign:"center",fontSize:12,color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font,background:isDark?"#111D2E":"#f8fafc",border:"none",borderRadius:12}}>
            <div style={{marginBottom:8}}>{error}</div>
            <button onClick={fetchAdmins} style={{display:"inline-flex",alignItems:"center",gap:5,background:"none",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:11,color:DS.primary,fontFamily:DS.font}}>
              Retry
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
              style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",marginBottom:2,border:"none",borderRadius:12,background:isActive?(isDark?"#18314A":"#edf2f7"):isHovered?(isDark?"#111D2E":"#f7f8fa"):"transparent",cursor:"pointer",transition:"all 0.15s",boxShadow:"none"}}>
              <div style={{position:"relative"}}>
                <OfficeAvatar officeName={admin.officeName} profilePic={admin.profilePic||null} size={42}/>
                <span style={{position:"absolute",right:0,bottom:0,width:12,height:12,borderRadius:"50%",background:"#16C35B",border:`2px solid ${isDark?"#0F1724":"#fff"}`}} />
              </div>
              <div style={{overflow:"hidden",flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:isDark?"#F8FBFF":DS.textPrimary,fontFamily:DS.font,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {admin.officeName}
                </div>
                <div style={{fontSize:11.5,color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font,marginTop:2}}>{index < 3 ? "Health & Wellness" : "Community Services"}</div>
              </div>
              <span style={{display:"inline-flex",alignItems:"center",flexShrink:0,fontSize:18,color:isDark?"#6B7B90":"#CBD5E0"}}>&rsaquo;</span>
            </div>
          );
        })}
        {!loading && !error && admins.length===0 && (
          <div style={{padding:"28px 14px",textAlign:"center",fontSize:12,color:isDark?"#8FA1B9":DS.textMuted,fontFamily:DS.font,background:isDark?"#111D2E":"#f8fafc",border:"none",borderRadius:12}}>No offices found.</div>
        )}
      </div>

      <div style={{padding:"8px 16px 16px"}}>
        <button onClick={goHome} style={{width:"100%",minHeight:40,borderRadius:12,border:`1px solid ${isDark?"#2B3A4F":DS.border}`,background:isDark?"#111D2E":"#fff",cursor:"pointer",fontSize:13,fontWeight:700,color:isDark?"#F8FBFF":DS.textPrimary,fontFamily:DS.font,transition:"background 0.15s"}}>
          Explore All Offices
        </button>
      </div>
    </div>
  );
};

export default DepartmentSidebar;

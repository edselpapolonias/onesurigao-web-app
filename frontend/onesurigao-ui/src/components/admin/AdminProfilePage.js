// src/components/admin/AdminProfilePage.js
// Facebook-style profile page for logged-in admin
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../ReusableBar/Layout";
import MediaGallery from "../ReusableBar/MediaGallery";

const DS = {
  primary:       "#2B6CB0",
  primaryDark:   "#1E4E8C",
  primaryLight:  "#EBF4FF",
  primaryGrad:   "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg:            "#F5F7FA",
  card:          "#FFFFFF",
  border:        "#E2E8F0",
  borderFocus:   "#2B6CB0",
  textPrimary:   "#1A202C",
  textSecondary: "#4A5568",
  textMuted:     "#718096",
  shadow:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover:   "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal:   "0 20px 60px rgba(0,0,0,0.25)",
  font:          "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const EditIcon         = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const SaveIcon         = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);
const XIcon            = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const MailIcon         = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const PhoneIcon        = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const CalendarIcon     = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const UserIcon         = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const BuildingIcon     = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>);
const ThumbsUpIcon     = ({filled}) => (<svg width="15" height="15" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>);
const ClockIcon        = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const MessageCircleIcon= () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const CameraIcon       = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);
const LockIcon         = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const CheckIcon        = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);

const inputSt = {width:"100%",padding:"9px 12px",fontSize:13,border:`1.5px solid ${DS.border}`,borderRadius:8,outline:"none",boxSizing:"border-box",fontFamily:DS.font,background:DS.card,transition:"border-color 0.2s",color:DS.textPrimary};
const labelSt = {display:"block",marginBottom:5,fontWeight:600,fontSize:11,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6};

// ─── Office Avatar ─────────────────────────────────────────────────────────────
const OfficeAvatar = ({ officeName, profilePic, size=80 }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"OF";
  if (profilePic) return <img src={profilePic} alt={officeName} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"3px solid #fff",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}/>;
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*0.28,fontWeight:800,fontFamily:DS.font,border:"3px solid #fff",boxShadow:"0 4px 16px rgba(43,108,176,0.3)"}}>
      {initials}
    </div>
  );
};

// ─── Mini Announcement Card (for profile feed) ─────────────────────────────────
const MiniCard = ({ announcement }) => {
  const dateStr = announcement.createdDate ? new Date(announcement.createdDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  return (
    <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,marginBottom:12,overflow:"hidden",border:`1px solid ${DS.border}`,transition:"box-shadow 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=DS.shadowHover}
      onMouseLeave={e=>e.currentTarget.style.boxShadow=DS.shadow}>
      <div style={{padding:"12px 16px 8px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font,lineHeight:1.35}}>{announcement.title}</div>
          <div style={{display:"flex",alignItems:"center",gap:4,color:DS.textMuted,fontSize:11,fontFamily:DS.font,marginTop:3}}>
            <ClockIcon/> {dateStr}
            {announcement.isPinned&&<span style={{marginLeft:4,background:"#FFFBEB",color:"#D97706",fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10,border:"1px solid #FDE68A"}}>Pinned</span>}
          </div>
        </div>
        {announcement.media?.length>0&&<span style={{fontSize:11,background:DS.primaryLight,color:DS.primary,borderRadius:10,padding:"2px 8px",fontWeight:600,fontFamily:DS.font,flexShrink:0}}>{announcement.media.length} file{announcement.media.length>1?"s":""}</span>}
      </div>
      <div style={{padding:"0 16px 12px",fontSize:13,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.65,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>
        {announcement.content}
      </div>
      <div style={{padding:"8px 16px",borderTop:`1px solid ${DS.border}`,display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:5,color:DS.textMuted,fontSize:12,fontFamily:DS.font}}><ThumbsUpIcon/> Like</div>
        <div style={{display:"flex",alignItems:"center",gap:5,color:DS.textMuted,fontSize:12,fontFamily:DS.font}}><MessageCircleIcon/> Comment</div>
      </div>
    </div>
  );
};

// ─── Edit Profile Modal ────────────────────────────────────────────────────────
const EditProfileModal = ({ admin, onClose, onSaved }) => {
  const [form, setForm]       = useState({ officeName:admin.officeName||"", email:admin.email||"", contactNumber:admin.contactNumber||"", username:admin.username||"" });
  const [pwForm, setPwForm]   = useState({ current:"", next:"", confirm:"" });
  const [tab, setTab]         = useState("info"); // "info" | "password"
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  const handleSaveInfo = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      await axios.patch(`http://127.0.0.1:8000/api/admins/${admin.adminID}/`, form);
      setSuccess("Profile updated successfully.");
      onSaved({ ...admin, ...form });
    } catch { setError("Failed to save changes."); }
    finally { setSaving(false); }
  };

  const handleSavePassword = async () => {
    if (!pwForm.current) { setError("Enter your current password."); return; }
    if (pwForm.next !== pwForm.confirm) { setError("New passwords do not match."); return; }
    if (pwForm.next.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      // Verify current password and update
      await axios.patch(`http://127.0.0.1:8000/api/admins/${admin.adminID}/`, { password: pwForm.next });
      setSuccess("Password changed successfully."); setPwForm({ current:"", next:"", confirm:"" });
    } catch { setError("Failed to change password."); }
    finally { setSaving(false); }
  };

  const Tab = ({ id, label }) => (
    <button onClick={()=>{setTab(id);setError("");setSuccess("");}} style={{flex:1,padding:"10px",border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===id?700:500,background:"transparent",color:tab===id?DS.primary:DS.textMuted,fontFamily:DS.font,borderBottom:`2.5px solid ${tab===id?DS.primary:"transparent"}`,transition:"all 0.2s"}}>
      {label}
    </button>
  );

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20,backdropFilter:"blur(2px)"}}>
      <div style={{background:DS.card,borderRadius:16,width:"100%",maxWidth:500,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:DS.shadowModal,overflow:"hidden",animation:"slideUp 0.22s ease"}}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div style={{background:DS.primaryGrad,padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{color:"#fff",fontWeight:800,fontSize:15,fontFamily:DS.font}}>Edit Profile</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
        </div>

        <div style={{display:"flex",borderBottom:`1px solid ${DS.border}`,flexShrink:0}}>
          <Tab id="info" label="Profile Info"/>
          <Tab id="password" label="Change Password"/>
        </div>

        <div style={{overflowY:"auto",flex:1,padding:"18px 22px"}}>
          {success&&<div style={{background:"#F0FDF4",border:"1.5px solid #9AE6B4",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#276749",fontFamily:DS.font,display:"flex",alignItems:"center",gap:6}}><CheckIcon/>{success}</div>}
          {error&&<div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#C53030",fontFamily:DS.font}}>{error}</div>}

          {tab==="info"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label style={labelSt}>Office Name</label><input value={form.officeName} onChange={e=>setForm({...form,officeName:e.target.value})} style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <div><label style={labelSt}>Username</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <div><label style={labelSt}>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <div><label style={labelSt}>Contact Number</label><input value={form.contactNumber} onChange={e=>setForm({...form,contactNumber:e.target.value})} style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <button onClick={handleSaveInfo} disabled={saving} style={{width:"100%",padding:"11px",background:saving?"#9AB8E0":DS.primaryGrad,color:"#fff",border:"none",borderRadius:8,cursor:saving?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:4}}>
                <SaveIcon/>{saving?"Saving...":"Save Changes"}
              </button>
            </div>
          )}

          {tab==="password"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label style={labelSt}>Current Password</label><input type="password" value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} placeholder="••••••••" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <div><label style={labelSt}>New Password</label><input type="password" value={pwForm.next} onChange={e=>setPwForm({...pwForm,next:e.target.value})} placeholder="••••••••" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <div><label style={labelSt}>Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} placeholder="••••••••" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
              <button onClick={handleSavePassword} disabled={saving} style={{width:"100%",padding:"11px",background:saving?"#9AB8E0":"linear-gradient(135deg,#276749,#38A169)",color:"#fff",border:"none",borderRadius:8,cursor:saving?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:4}}>
                <LockIcon/>{saving?"Saving...":"Change Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
function AdminProfilePage() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const adminID    = location.state?.adminID || Number(sessionStorage.getItem("adminID"));
  const [admin, setAdmin]           = useState(null);
  const [announcements, setAnn]     = useState([]);
  const [loadingAdmin, setLAdmin]   = useState(true);
  const [loadingAnn, setLAnn]       = useState(true);
  const [showEdit, setShowEdit]     = useState(false);
  const [profilePic, setProfilePic] = useState(null); // local preview or saved URL
  const picRef = useRef(null);

  useEffect(() => {
    if (!adminID) { navigate("/"); return; }
    axios.get(`http://127.0.0.1:8000/api/admins/${adminID}/`)
      .then(res => { setAdmin(res.data); setProfilePic(res.data.profilePic||null); })
      .finally(() => setLAdmin(false));
    axios.get(`http://127.0.0.1:8000/api/announcements/?admin_id=${adminID}`)
      .then(res => setAnn(Array.isArray(res.data)?res.data:res.data.results||[]))
      .finally(() => setLAnn(false));
  }, [adminID]);

  const handlePicChange = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setProfilePic(preview);
    // Upload
    const fd = new FormData(); fd.append("profilePic", file);
    try { await axios.patch(`http://127.0.0.1:8000/api/admins/${adminID}/`, fd, { headers:{"Content-Type":"multipart/form-data"} }); }
    catch { console.error("Failed to upload profile pic"); }
  };

  const memberSince = admin?.createdDate
    ? new Date(admin.createdDate).toLocaleDateString("en-US",{month:"long",year:"numeric"})
    : "";

  const InfoRow = ({ icon, label, value }) => (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${DS.border}`}}>
      <span style={{color:DS.primary,display:"flex",flexShrink:0}}>{icon}</span>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6,marginBottom:2}}>{label}</div>
        <div style={{fontSize:13,color:DS.textPrimary,fontFamily:DS.font,fontWeight:500}}>{value||"—"}</div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>

        {/* ── Left sidebar: profile card (sticky) ── */}
        <div style={{width:290,flexShrink:0,position:"sticky",top:164}}>

          {/* Profile card */}
          <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`,overflow:"hidden",marginBottom:14}}>
            {/* Cover */}
            <div style={{height:90,background:DS.primaryGrad,position:"relative"}}>
              {/* Profile pic */}
              <div style={{position:"absolute",bottom:-36,left:20,cursor:"pointer"}} onClick={()=>picRef.current?.click()}>
                <div style={{position:"relative"}}>
                  {loadingAdmin
                    ? <div style={{width:72,height:72,borderRadius:"50%",background:"#EDF2F7",border:"3px solid #fff",animation:"pulse 1.5s ease-in-out infinite"}}/>
                    : profilePic
                      ? <img src={profilePic} alt="profile" style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"3px solid #fff",boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}/>
                      : <div style={{width:72,height:72,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,fontWeight:800,fontFamily:DS.font,border:"3px solid #fff",boxShadow:"0 4px 12px rgba(43,108,176,0.3)"}}>
                          {admin?.officeName?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"OF"}
                        </div>
                  }
                  {/* Camera overlay */}
                  <div style={{position:"absolute",bottom:2,right:2,width:24,height:24,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.2)",border:"2px solid #fff"}}>
                    <CameraIcon/>
                  </div>
                </div>
                <input ref={picRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handlePicChange(e.target.files[0])}/>
              </div>
            </div>

            <div style={{padding:"42px 20px 16px"}}>
              {loadingAdmin
                ? <>
                    <div style={{height:16,width:"70%",background:"#EDF2F7",borderRadius:6,marginBottom:6,animation:"pulse 1.5s ease-in-out infinite"}}/>
                    <div style={{height:11,width:"40%",background:"#EDF2F7",borderRadius:6,animation:"pulse 1.5s ease-in-out infinite"}}/>
                  </>
                : <>
                    <div style={{fontWeight:800,fontSize:15,color:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.3}}>{admin?.officeName}</div>
                    <div style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font,marginTop:3}}>City Government Department</div>
                    <div style={{display:"flex",gap:16,marginTop:10}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontWeight:800,fontSize:16,color:DS.primary,fontFamily:DS.font}}>{announcements.length}</div>
                        <div style={{fontSize:11,color:DS.textMuted,fontFamily:DS.font}}>Posts</div>
                      </div>
                    </div>
                    <button onClick={()=>setShowEdit(true)} style={{width:"100%",marginTop:12,padding:"9px",background:DS.primaryLight,border:`1.5px solid ${DS.primary}`,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.primary,fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryGrad;e.currentTarget.style.color="#fff";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}>
                      <EditIcon/> Edit Profile
                    </button>
                  </>
              }
            </div>
          </div>

          {/* About */}
          <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`,padding:"14px 18px"}}>
            <div style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>Account Info</div>
            {loadingAdmin
              ? [1,2,3].map(i=><div key={i} style={{height:11,background:"#EDF2F7",borderRadius:6,marginBottom:10,animation:"pulse 1.5s ease-in-out infinite"}}/>)
              : <>
                  <InfoRow icon={<BuildingIcon/>} label="Office" value={admin?.officeName}/>
                  <InfoRow icon={<UserIcon/>} label="Username" value={admin?.username}/>
                  <InfoRow icon={<MailIcon/>} label="Email" value={admin?.email}/>
                  <InfoRow icon={<PhoneIcon/>} label="Contact" value={admin?.contactNumber}/>
                  <InfoRow icon={<CalendarIcon/>} label="Member Since" value={memberSince}/>
                </>
            }
          </div>
        </div>

        {/* ── Right: Announcements feed ── */}
        <div style={{flex:1}}>
          <div style={{marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <h2 style={{margin:0,fontSize:18,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>My Announcements</h2>
              <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>All announcements posted by your office</p>
            </div>
          </div>

          {loadingAnn && [1,2,3].map(i=>(
            <div key={i} style={{background:DS.card,borderRadius:12,padding:16,marginBottom:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
              {[80,95,65].map((w,j)=><div key={j} style={{height:12,width:`${w}%`,background:"#EDF2F7",borderRadius:6,marginBottom:9,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
            </div>
          ))}

          {!loadingAnn && announcements.length===0 && (
            <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><BuildingIcon/></div>
              No announcements posted yet. Go to Announcements to create one.
            </div>
          )}

          {!loadingAnn && announcements.map(a=><MiniCard key={a.id} announcement={a}/>)}
        </div>
      </div>

      {showEdit && admin && (
        <EditProfileModal
          admin={admin}
          onClose={()=>setShowEdit(false)}
          onSaved={updated=>{ setAdmin(updated); setShowEdit(false); sessionStorage.setItem("officeName",updated.officeName); }}/>
      )}
    </Layout>
  );
}

export default AdminProfilePage;
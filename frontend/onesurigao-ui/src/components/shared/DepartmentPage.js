// src/components/shared/DepartmentPage.js
// Shared Facebook-style department/office page — used by Public, Admin, SuperAdmin
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import MediaGallery from "../ReusableBar/MediaGallery";

const DS = {
  primary:       "#2B6CB0",
  primaryDark:   "#1E4E8C",
  primaryLight:  "#EBF4FF",
  primaryGrad:   "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg:            "#F5F7FA",
  card:          "#FFFFFF",
  border:        "#E2E8F0",
  textPrimary:   "#1A202C",
  textSecondary: "#4A5568",
  textMuted:     "#718096",
  shadow:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover:   "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal:   "0 20px 60px rgba(0,0,0,0.25)",
  font:          "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeftIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const BuildingIcon     = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>);
const MailIcon         = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const PhoneIcon        = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const CalendarIcon     = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const ThumbsUpIcon     = ({filled}) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>);
const ThumbsDownIcon   = ({filled}) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>);
const MessageCircleIcon= () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const ClockIcon        = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const PinIcon          = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>);
const ChevronDownIcon  = ({open}) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}><polyline points="6 9 12 15 18 9"/></svg>);
const SendIcon         = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const XIcon            = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const OfficeAvatar = ({ officeName, size=64 }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"OF";
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*0.28,fontWeight:800,fontFamily:DS.font,flexShrink:0,boxShadow:"0 4px 16px rgba(43,108,176,0.3)",border:"3px solid #fff"}}>
      {initials}
    </div>
  );
};

// ─── Comment Modal ─────────────────────────────────────────────────────────────
const CommentModal = ({ announcement, onClose }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const post = () => { if(!text.trim()) return; setComments(p=>[...p,{id:Date.now(),text,date:new Date()}]); setText(""); };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20,backdropFilter:"blur(2px)"}}>
      <div style={{background:DS.card,borderRadius:14,width:"100%",maxWidth:540,maxHeight:"78vh",display:"flex",flexDirection:"column",boxShadow:DS.shadowModal,overflow:"hidden",animation:"slideUp 0.22s ease"}}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${DS.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontWeight:700,fontSize:14,color:DS.textPrimary,fontFamily:DS.font}}>{announcement.title}</div>
          <button onClick={onClose} style={{background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:DS.textMuted}}><XIcon/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
          {comments.length===0
            ? <div style={{textAlign:"center",padding:"28px 0",color:DS.textMuted,fontSize:13,fontFamily:DS.font}}>No comments yet. Be the first!</div>
            : comments.map(c=>(
                <div key={c.id} style={{display:"flex",gap:10,marginBottom:12}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:DS.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:DS.primary,fontSize:13,fontWeight:700}}>U</div>
                  <div style={{background:DS.bg,borderRadius:12,padding:"8px 14px",flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:DS.textPrimary,fontFamily:DS.font,marginBottom:2}}>Resident</div>
                    <div style={{fontSize:13,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.5}}>{c.text}</div>
                  </div>
                </div>
              ))
          }
        </div>
        <div style={{padding:"10px 20px",borderTop:`1px solid ${DS.border}`,display:"flex",gap:10,alignItems:"flex-end",flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:DS.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",color:DS.primary,fontSize:13,fontWeight:700}}>U</div>
          <div style={{flex:1,background:DS.bg,borderRadius:20,border:`1.5px solid ${DS.border}`,display:"flex",alignItems:"flex-end",padding:"7px 12px",gap:8}}>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..." onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();post();}}}
              style={{flex:1,background:"none",border:"none",outline:"none",resize:"none",fontSize:13,fontFamily:DS.font,color:DS.textPrimary,lineHeight:1.5,maxHeight:80,minHeight:20}} rows={1}/>
            <button onClick={post} style={{background:text.trim()?DS.primaryGrad:"#E2E8F0",border:"none",borderRadius:"50%",width:28,height:28,cursor:text.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><SendIcon/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reaction Bar ──────────────────────────────────────────────────────────────
const ReactionBar = ({ announcement }) => {
  const [st, setSt] = useState({liked:false,disliked:false,likes:0,dislikes:0});
  const [showComments, setShowComments] = useState(false);
  const handleLike    = () => setSt(s=>s.liked?{...s,liked:false,likes:s.likes-1}:{...s,liked:true,likes:s.likes+1,...(s.disliked?{disliked:false,dislikes:s.dislikes-1}:{})});
  const handleDislike = () => setSt(s=>s.disliked?{...s,disliked:false,dislikes:s.dislikes-1}:{...s,disliked:true,dislikes:s.dislikes+1,...(s.liked?{liked:false,likes:s.likes-1}:{})});
  const btn = (active,c) => ({display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,fontFamily:DS.font,fontWeight:active?700:500,color:active?c:DS.textMuted,padding:"7px 14px",borderRadius:8,transition:"all 0.15s"});
  return (
    <>
      <div style={{display:"flex",alignItems:"center",padding:"2px 8px",borderTop:`1px solid ${DS.border}`}}>
        <button style={btn(st.liked,DS.primary)} onClick={handleLike}
          onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=st.liked?DS.primary:DS.textMuted;}}>
          <ThumbsUpIcon filled={st.liked}/> Like{st.likes>0&&<span style={{marginLeft:2}}>{st.likes}</span>}
        </button>
        <button style={btn(st.disliked,"#C53030")} onClick={handleDislike}
          onMouseEnter={e=>{e.currentTarget.style.background="#FFF5F5";e.currentTarget.style.color="#C53030";}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=st.disliked?"#C53030":DS.textMuted;}}>
          <ThumbsDownIcon filled={st.disliked}/> Dislike{st.dislikes>0&&<span style={{marginLeft:2}}>{st.dislikes}</span>}
        </button>
        <button style={btn(false,DS.primary)} onClick={()=>setShowComments(true)}
          onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=DS.textMuted;}}>
          <MessageCircleIcon/> Comment
        </button>
      </div>
      {showComments&&<CommentModal announcement={announcement} onClose={()=>setShowComments(false)}/>}
    </>
  );
};

// ─── Announcement Card ─────────────────────────────────────────────────────────
const AnnouncementCard = ({ announcement }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = announcement.content?.length > 300;
  const displayContent = expanded||!isLong ? announcement.content : announcement.content?.slice(0,300)+"...";
  const dateStr = announcement.createdDate ? new Date(announcement.createdDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "";
  const timeStr = announcement.createdDate ? new Date(announcement.createdDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "";
  return (
    <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,marginBottom:14,overflow:"hidden",border:`1px solid ${DS.border}`,borderLeft:announcement.isPinned?`4px solid #D97706`:`1px solid ${DS.border}`,transition:"box-shadow 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=DS.shadowHover}
      onMouseLeave={e=>e.currentTarget.style.boxShadow=DS.shadow}>
      {announcement.isPinned&&(
        <div style={{position:"absolute",top:0,right:16,background:"linear-gradient(135deg,#D97706,#B45309)",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:"0 0 8px 8px",fontFamily:DS.font,display:"flex",alignItems:"center",gap:4}}>
          <PinIcon/> PINNED
        </div>
      )}
      <div style={{position:"relative",padding:"14px 18px 0",display:"flex",alignItems:"center",gap:10}}>
        <OfficeAvatar officeName={announcement.admin?.officeName} size={38}/>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font}}>{announcement.admin?.officeName||"City of Surigao"}</div>
          <div style={{display:"flex",alignItems:"center",gap:4,color:DS.textMuted,fontSize:11,fontFamily:DS.font,marginTop:1}}>
            <ClockIcon/> {dateStr}{timeStr&&` · ${timeStr}`}
          </div>
        </div>
      </div>
      <div style={{padding:"10px 18px 6px",fontWeight:700,fontSize:15,color:DS.textPrimary,fontFamily:DS.font,lineHeight:1.4}}>{announcement.title}</div>
      <div style={{padding:"0 18px 12px",fontSize:14,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.75,whiteSpace:"pre-wrap"}}>
        {displayContent}
        {isLong&&<button onClick={()=>setExpanded(!expanded)} style={{display:"inline-flex",alignItems:"center",gap:4,marginLeft:6,background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:DS.primary,fontFamily:DS.font,padding:0}}>{expanded?"Show less":"Read more"}<ChevronDownIcon open={expanded}/></button>}
      </div>
      <MediaGallery media={announcement.media}/>
      <ReactionBar announcement={announcement}/>
    </div>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div style={{background:DS.card,borderRadius:12,padding:18,marginBottom:14,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
    <div style={{display:"flex",gap:12,marginBottom:12}}>
      <div style={{width:38,height:38,borderRadius:"50%",background:"#EDF2F7",animation:"pulse 1.5s ease-in-out infinite",flexShrink:0}}/>
      <div style={{flex:1}}>
        {[50,30].map((w,i)=><div key={i} style={{height:11,width:`${w}%`,background:"#EDF2F7",borderRadius:6,marginBottom:6,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
      </div>
    </div>
    {[95,88,65].map((w,i)=><div key={i} style={{height:12,width:`${w}%`,background:"#EDF2F7",borderRadius:6,marginBottom:9,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
  </div>
);

// ─── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${DS.border}`}}>
    <span style={{color:DS.primary,display:"flex",flexShrink:0}}>{icon}</span>
    <div>
      <div style={{fontSize:10,fontWeight:700,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6,marginBottom:2}}>{label}</div>
      <div style={{fontSize:13,color:DS.textPrimary,fontFamily:DS.font,fontWeight:500}}>{value||"—"}</div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
// Usage: import as a route. Wrap with the appropriate Layout in the route definition.
// Props: Layout (component), backPath (string)
function DepartmentPage({ Layout: LayoutComponent, backPath = -1 }) {
  const { adminID }  = useParams();
  const navigate     = useNavigate();
  const [office, setOffice]               = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingOffice, setLoadingOffice] = useState(true);
  const [loadingAnn, setLoadingAnn]       = useState(true);

  useEffect(() => {
    if (!adminID) return;
    // Fetch office info
    axios.get(`http://127.0.0.1:8000/api/admins/${adminID}/`)
      .then(res => setOffice(res.data))
      .catch(() => setOffice(null))
      .finally(() => setLoadingOffice(false));
    // Fetch announcements for this admin
    axios.get(`http://127.0.0.1:8000/api/announcements/?admin_id=${adminID}`)
      .then(res => setAnnouncements(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoadingAnn(false));
  }, [adminID]);

  const memberSince = office?.createdDate
    ? new Date(office.createdDate).toLocaleDateString("en-US",{month:"long",year:"numeric"})
    : "";

  return (
    <LayoutComponent>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Back button */}
      <button onClick={()=>navigate(backPath)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:DS.primary,fontFamily:DS.font,marginBottom:14,padding:0}}
        onMouseEnter={e=>e.currentTarget.style.opacity="0.75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        <ChevronLeftIcon/> Back
      </button>

      <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>

        {/* ── Left: About card (sticky) ── */}
        <div style={{width:280,flexShrink:0,position:"sticky",top:164}}>
          {/* Cover + Avatar */}
          <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`,overflow:"hidden",marginBottom:14}}>
            {/* Cover strip */}
            <div style={{height:80,background:DS.primaryGrad,position:"relative"}}>
              <div style={{position:"absolute",bottom:-28,left:20}}>
                {loadingOffice
                  ? <div style={{width:56,height:56,borderRadius:"50%",background:"#EDF2F7",border:"3px solid #fff",animation:"pulse 1.5s ease-in-out infinite"}}/>
                  : <OfficeAvatar officeName={office?.officeName} size={56}/>
                }
              </div>
            </div>
            <div style={{padding:"34px 20px 16px"}}>
              {loadingOffice
                ? <><div style={{height:16,width:"70%",background:"#EDF2F7",borderRadius:6,marginBottom:6,animation:"pulse 1.5s ease-in-out infinite"}}/><div style={{height:11,width:"40%",background:"#EDF2F7",borderRadius:6,animation:"pulse 1.5s ease-in-out infinite"}}/></>
                : <>
                    <div style={{fontWeight:800,fontSize:15,color:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.3}}>{office?.officeName}</div>
                    <div style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font,marginTop:3}}>City Government Department</div>
                  </>
              }
            </div>
          </div>

          {/* About */}
          <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`,padding:"14px 18px"}}>
            <div style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>About</div>
            {loadingOffice
              ? [1,2,3].map(i=><div key={i} style={{height:11,background:"#EDF2F7",borderRadius:6,marginBottom:10,animation:"pulse 1.5s ease-in-out infinite"}}/>)
              : <>
                  <InfoRow icon={<BuildingIcon/>} label="Office Name" value={office?.officeName}/>
                  <InfoRow icon={<MailIcon/>} label="Email" value={office?.email}/>
                  <InfoRow icon={<PhoneIcon/>} label="Contact" value={office?.contactNumber}/>
                  <InfoRow icon={<CalendarIcon/>} label="Member Since" value={memberSince}/>
                  <div style={{marginTop:10,padding:"8px 10px",background:DS.primaryLight,borderRadius:8,fontSize:12,color:DS.primary,fontFamily:DS.font,fontWeight:600,textAlign:"center"}}>
                    {announcements.length} Announcement{announcements.length!==1?"s":""}
                  </div>
                </>
            }
          </div>
        </div>

        {/* ── Right: Announcements feed ── */}
        <div style={{flex:1}}>
          <div style={{marginBottom:14}}>
            <h2 style={{margin:0,fontSize:18,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>
              {loadingOffice ? "Loading..." : `${office?.officeName || "Office"} — Posts`}
            </h2>
            <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>All announcements from this department</p>
          </div>

          {(loadingAnn) && [1,2,3].map(i=><CardSkeleton key={i}/>)}

          {!loadingAnn && announcements.length===0 && (
            <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><BuildingIcon/></div>
              No announcements from this office yet.
            </div>
          )}

          {!loadingAnn && announcements.map(a=>(
            <AnnouncementCard key={a.id} announcement={a}/>
          ))}
        </div>

      </div>
    </LayoutComponent>
  );
}

export default DepartmentPage;
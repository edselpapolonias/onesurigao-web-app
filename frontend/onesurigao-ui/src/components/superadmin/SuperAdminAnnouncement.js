// src/components/public/PublicAnnouncement.js
import React, { useState, useEffect } from "react";
import SuperAdminLayout from "../ReusableBar/SuperAdminLayout";
import MediaGallery from "../ReusableBar/MediaGallery";
import { apiClient } from "../../services/authService";

// ─── Design System ────────────────────────────────────────────────────────────
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
  pinned:        "#D97706",
  pinnedBg:      "#FFFBEB",
  shadow:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover:   "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal:   "0 20px 60px rgba(0,0,0,0.25)",
  font:          "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const ThumbsUpIcon   = ({ filled }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>);
const ThumbsDownIcon = ({ filled }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>);
const MessageCircleIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const ChevronDownIcon = ({ open }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0deg)" }}><polyline points="6 9 12 15 18 9"/></svg>);
const PinIcon    = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>);
const ClockIcon  = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const BuildingIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>);
const SendIcon   = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const XIcon      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ officeName }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SG";
  return (
    <div style={{ width:42, height:42, borderRadius:"50%", background:DS.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, fontFamily:DS.font, flexShrink:0, boxShadow:"0 2px 6px rgba(43,108,176,0.25)" }}>
      {initials}
    </div>
  );
};

// ─── Comment Modal ────────────────────────────────────────────────────────────
const CommentModal = ({ announcement, onClose }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const handlePost = () => { if (!text.trim()) return; setComments(p => [...p, { id: Date.now(), text, date: new Date() }]); setText(""); };
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div style={{ background:DS.card, borderRadius:14, width:"100%", maxWidth:540, maxHeight:"78vh", display:"flex", flexDirection:"column", boxShadow:DS.shadowModal, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${DS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:DS.textPrimary, fontFamily:DS.font }}>{announcement.title}</div>
            <div style={{ fontSize:11, color:DS.textMuted, fontFamily:DS.font, marginTop:2 }}>{announcement.admin?.officeName || "City of Surigao"}</div>
          </div>
          <button onClick={onClose} style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:"50%", width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:DS.textMuted }}><XIcon /></button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {comments.length === 0
            ? <div style={{ textAlign:"center", padding:"32px 0", color:DS.textMuted, fontSize:13, fontFamily:DS.font }}>
                <div style={{ fontSize:32, marginBottom:8, color:DS.textMuted }}><MessageCircleIcon /></div>
                No comments yet. Be the first!
              </div>
            : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display:"flex", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:DS.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:DS.primary, fontSize:13, fontWeight:700, fontFamily:DS.font }}>U</div>
                    <div style={{ background:DS.bg, borderRadius:12, padding:"8px 14px", flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:DS.textPrimary, fontFamily:DS.font, marginBottom:2 }}>Resident</div>
                      <div style={{ fontSize:13, color:DS.textSecondary, fontFamily:DS.font, lineHeight:1.5 }}>{c.text}</div>
                      <div style={{ fontSize:11, color:DS.textMuted, fontFamily:DS.font, marginTop:4 }}>{c.date.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div style={{ padding:"12px 20px", borderTop:`1px solid ${DS.border}`, display:"flex", gap:10, alignItems:"flex-end", flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:DS.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:DS.primary, fontSize:13, fontWeight:700, fontFamily:DS.font }}>U</div>
          <div style={{ flex:1, background:DS.bg, borderRadius:20, border:`1.5px solid ${DS.border}`, display:"flex", alignItems:"flex-end", padding:"8px 14px", gap:8 }}>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..." onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); handlePost(); } }}
              style={{ flex:1, background:"none", border:"none", outline:"none", resize:"none", fontSize:13, fontFamily:DS.font, color:DS.textPrimary, lineHeight:1.5, maxHeight:80, minHeight:20 }} rows={1} />
            <button onClick={handlePost} style={{ background:text.trim()?DS.primaryGrad:"#E2E8F0", border:"none", borderRadius:"50%", width:30, height:30, cursor:text.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0, transition:"background 0.2s" }}>
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reaction Bar ─────────────────────────────────────────────────────────────
const ReactionBar = ({ announcement }) => {
  const [liked, setLiked]       = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes]       = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const handleLike    = () => { if (liked) { setLikes(l=>l-1); setLiked(false); } else { setLikes(l=>l+1); setLiked(true); if(disliked){setDislikes(d=>d-1);setDisliked(false);} } };
  const handleDislike = () => { if (disliked) { setDislikes(d=>d-1); setDisliked(false); } else { setDislikes(d=>d+1); setDisliked(true); if(liked){setLikes(l=>l-1);setLiked(false);} } };

  const btn = (active, activeColor) => ({
    display:"flex", alignItems:"center", gap:6,
    background:"none", border:"none", cursor:"pointer",
    fontSize:13, fontFamily:DS.font, fontWeight:active?700:500,
    color:active?activeColor:DS.textMuted,
    padding:"7px 14px", borderRadius:8, transition:"all 0.15s",
  });

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", padding:"2px 8px" }}>
        <button style={btn(liked,DS.primary)} onClick={handleLike}
          onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=liked?DS.primary:DS.textMuted;}}>
          <ThumbsUpIcon filled={liked}/> Like{likes>0&&<span style={{fontSize:12,fontWeight:700,marginLeft:2}}>{likes}</span>}
        </button>
        <button style={btn(disliked,"#C53030")} onClick={handleDislike}
          onMouseEnter={e=>{e.currentTarget.style.background="#FFF5F5";e.currentTarget.style.color="#C53030";}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=disliked?"#C53030":DS.textMuted;}}>
          <ThumbsDownIcon filled={disliked}/> Dislike{dislikes>0&&<span style={{fontSize:12,fontWeight:700,marginLeft:2}}>{dislikes}</span>}
        </button>
        <button style={btn(false,DS.primary)} onClick={()=>setShowComments(true)}
          onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=DS.textMuted;}}>
          <MessageCircleIcon/> Comment
        </button>
      </div>
      {showComments && <CommentModal announcement={announcement} onClose={()=>setShowComments(false)}/>}
    </>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div style={{ background:DS.card, borderRadius:12, padding:"20px", marginBottom:14, boxShadow:DS.shadow, border:`1px solid ${DS.border}` }}>
    <div style={{ display:"flex", gap:12, marginBottom:14 }}>
      <div style={{ width:42, height:42, borderRadius:"50%", background:"#EDF2F7", animation:"pulse 1.5s ease-in-out infinite", flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ height:13, width:"35%", background:"#EDF2F7", borderRadius:6, marginBottom:8, animation:"pulse 1.5s ease-in-out infinite" }}/>
        <div style={{ height:11, width:"20%", background:"#EDF2F7", borderRadius:6, animation:"pulse 1.5s ease-in-out infinite" }}/>
      </div>
    </div>
    {[95,88,70,50].map((w,i)=><div key={i} style={{ height:12, width:`${w}%`, background:"#EDF2F7", borderRadius:6, marginBottom:9, animation:"pulse 1.5s ease-in-out infinite" }}/>)}
  </div>
);

// ─── Announcement Card ────────────────────────────────────────────────────────
const AnnouncementCard = ({ announcement }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = announcement.content?.length > 300;
  const displayContent = expanded||!isLong ? announcement.content : announcement.content?.slice(0,300)+"...";
  const officeName  = announcement.admin?.officeName || "City of Surigao";
  const createdDate = announcement.createdDate ? new Date(announcement.createdDate) : null;
  const dateStr     = createdDate?.toLocaleDateString("en-US",{ month:"long", day:"numeric", year:"numeric" })||"";
  const timeStr     = createdDate?.toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" })||"";

  return (
    <div style={{ background:DS.card, borderRadius:12, boxShadow:DS.shadow, marginBottom:14, overflow:"hidden", position:"relative", border:`1px solid ${DS.border}`, borderLeft:announcement.isPinned?`4px solid ${DS.pinned}`:`1px solid ${DS.border}`, transition:"box-shadow 0.2s" }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=DS.shadowHover}
      onMouseLeave={e=>e.currentTarget.style.boxShadow=DS.shadow}>

      {announcement.isPinned&&(
        <div style={{ position:"absolute", top:0, right:16, background:`linear-gradient(135deg,${DS.pinned},#B45309)`, color:"#fff", fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:"0 0 8px 8px", fontFamily:DS.font, display:"flex", alignItems:"center", gap:4, boxShadow:"0 2px 6px rgba(180,83,9,0.3)" }}>
          <PinIcon/> PINNED
        </div>
      )}

      <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", gap:12 }}>
        <Avatar officeName={officeName}/>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:DS.textPrimary, fontFamily:DS.font }}>{officeName}</div>
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2, color:DS.textMuted, fontSize:11, fontFamily:DS.font }}>
            <ClockIcon/> {dateStr}{timeStr&&` · ${timeStr}`}
          </div>
        </div>
      </div>

      <div style={{ padding:"12px 20px 6px", fontWeight:700, fontSize:16, color:DS.textPrimary, fontFamily:DS.font, lineHeight:1.4 }}>{announcement.title}</div>

      <div style={{ padding:"0 20px 14px", fontSize:14, color:DS.textSecondary, fontFamily:DS.font, lineHeight:1.75, whiteSpace:"pre-wrap" }}>
        {displayContent}
        {isLong&&<button onClick={()=>setExpanded(!expanded)} style={{ display:"inline-flex", alignItems:"center", gap:4, marginLeft:6, background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:DS.primary, fontFamily:DS.font, padding:0 }}>{expanded?"Show less":"Read more"}<ChevronDownIcon open={expanded}/></button>}
      </div>

      <MediaGallery media={announcement.media}/>

      <div style={{ padding:"8px 20px", display:"flex", alignItems:"center", gap:6, borderTop:`1px solid ${DS.border}` }}>
        <span style={{ color:DS.textMuted, display:"flex" }}><BuildingIcon/></span>
        <span style={{ fontSize:12, color:DS.textMuted, fontFamily:DS.font }}>{officeName}</span>
      </div>

      <ReactionBar announcement={announcement}/>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function SuperAdminAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get("/superadmin/announcements/")
      .then(res => { setAnnouncements(Array.isArray(res.data)?res.data:res.data.results||[]); setError(null); })
      .catch(err => {
        setError(err.response?.status === 403
          ? "Failed to load announcements. Please sign in again as super admin."
          : "Failed to load announcements.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SuperAdminLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:DS.textPrimary, fontFamily:DS.font, letterSpacing:-0.5 }}>Announcements</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:DS.textMuted, fontFamily:DS.font }}>All active announcements from city offices</p>
      </div>
      {error&&<div style={{ background:"#FFF5F5", border:"1.5px solid #FEB2B2", borderRadius:8, padding:"12px 16px", marginBottom:14, fontSize:13, color:"#C53030", fontFamily:DS.font }}>⚠️ {error}</div>}
      {loading&&[1,2,3].map(i=><CardSkeleton key={i}/>)}
      {!loading&&announcements.map(a=><AnnouncementCard key={a.id} announcement={a}/>)}
      {!loading&&!error&&announcements.length===0&&(
        <div style={{ background:DS.card, borderRadius:12, padding:"48px 20px", textAlign:"center", color:DS.textMuted, fontSize:14, fontFamily:DS.font, boxShadow:DS.shadow, border:`1px solid ${DS.border}` }}>
          <div style={{ marginBottom:12, color:DS.textMuted }}><BuildingIcon/></div>
          No announcements yet.
        </div>
      )}
    </SuperAdminLayout>
  );
}

export default SuperAdminAnnouncement;

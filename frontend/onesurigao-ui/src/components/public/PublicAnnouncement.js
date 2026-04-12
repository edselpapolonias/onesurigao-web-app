// src/components/public/PublicAnnouncement.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../ReusableBar/PublicLayout";
import MediaGallery from "../ReusableBar/MediaGallery";
import { useOfficeFilter } from "../ReusableBar/PublicLayout";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/public/announcements/";
const ADMINS_URL = "http://127.0.0.1:8000/api/admins/";

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
  pinned:        "#2B6CB0",
  pinnedBg:      "#EFF6FF",
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
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const DotsIcon   = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>);
const ShareIcon  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>);
const BookmarkIcon = ({ filled }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>);
const VerifiedBadgeIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="#007BFF" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}><path d="M22.5 12.5l-1.58 1.83.22 2.4-2.39.46-1.12 2.14-2.28-.9-1.92 1.48-1.92-1.48-2.28.9-1.12-2.14-2.39-.46.22-2.4-1.58-1.83 1.58-1.83-.22-2.4 2.39-.46 1.12-2.14 2.28.9 1.92-1.48 1.92 1.48 2.28-.9 1.12 2.14 2.39.46-.22 2.4 1.58 1.83z"/><path d="M9.5 12.5l2 2 4.5-4.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ officeName, profilePic }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SG";
  if (profilePic) return <img src={profilePic} alt={officeName} style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', flexShrink:0, boxShadow:'0 2px 6px rgba(0,0,0,0.1)' }} />;
  return (
    <div style={{ width:42, height:42, borderRadius:"50%", background:DS.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, fontFamily:DS.font, flexShrink:0, boxShadow:"0 2px 6px rgba(43,108,176,0.25)" }}>
      {initials}
    </div>
  );
};

const OfficeResultCard = ({ office, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(office.adminID)}
    style={{ width:"100%", background:DS.card, border:`1px solid ${DS.border}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", boxShadow:DS.shadow, transition:"transform 0.18s, box-shadow 0.18s, border-color 0.18s", textAlign:"left" }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=DS.shadowHover;e.currentTarget.style.borderColor=DS.primary;}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=DS.shadow;e.currentTarget.style.borderColor=DS.border;}}
  >
    <Avatar officeName={office.officeName} profilePic={announcement.admin?.profilePic || null}/>
    <div style={{ minWidth:0, flex:1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize:14, fontWeight:800, color:DS.textPrimary, fontFamily:DS.font, lineHeight: 1.3 }}>
        <span style={{ whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0 }}>{office.officeName}</span>
        <VerifiedBadgeIcon />
      </div>
      <div style={{ fontSize:12, color:DS.textMuted, fontFamily:DS.font, marginTop:3 }}>
        City Government Office
      </div>
      {office.email && (
        <div style={{ fontSize:12, color:DS.textSecondary, fontFamily:DS.font, marginTop:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {office.email}
        </div>
      )}
    </div>
  </button>
);

const SearchSectionHeader = ({ title, count }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
    <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:DS.textPrimary, fontFamily:DS.font }}>{title}</h3>
    <span style={{ fontSize:12, fontWeight:700, color:DS.primary, fontFamily:DS.font, background:DS.primaryLight, borderRadius:999, padding:"4px 10px" }}>
      {count}
    </span>
  </div>
);

const EmptySearchCard = ({ query }) => (
  <div style={{ background:DS.card, border:`1px solid ${DS.border}`, borderRadius:14, padding:"42px 20px", textAlign:"center", boxShadow:DS.shadow }}>
    <div style={{ display:"flex", justifyContent:"center", color:DS.primary, marginBottom:14 }}>
      <SearchIcon />
    </div>
    <div style={{ fontSize:16, fontWeight:800, color:DS.textPrimary, fontFamily:DS.font, marginBottom:6 }}>
      No results for "{query}"
    </div>
    <div style={{ fontSize:13, color:DS.textMuted, fontFamily:DS.font }}>
      Try a different office name or keyword from the announcement post.
    </div>
  </div>
);

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
  const [saved, setSaved]       = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLike    = () => { if (liked) { setLiked(false); } else { setLiked(true); if(disliked){setDisliked(false);} } };
  const handleDislike = () => { if (disliked) { setDisliked(false); } else { setDisliked(true); if(liked){setLiked(false);} } };

  const btn = (active, activeColor) => ({
    display:"flex", alignItems:"center", gap:6,
    background:"none", border:"none", cursor:"pointer",
    fontSize:13, fontFamily:DS.font, fontWeight:active?700:500,
    color:active?activeColor:DS.textMuted,
    padding:"7px 14px", borderRadius:8, transition:"all 0.15s",
  });

  const dropdownItem = (icon, label, onClick, active = false) => (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? DS.primary : DS.textPrimary, fontFamily: DS.font, textAlign: "left", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#F7FAFF"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}>
      <span style={{ color: active ? DS.primary : DS.textMuted, display: "flex" }}>{icon}</span>{label}
    </button>
  );

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"2px 8px" }}>
        <div style={{ display:"flex", alignItems:"center" }}>
          <button style={btn(liked,DS.primary)} onClick={handleLike}
            onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=liked?DS.primary:DS.textMuted;}}>
            <ThumbsUpIcon filled={liked}/> Like
          </button>
          <button style={btn(disliked,"#C53030")} onClick={handleDislike}
            onMouseEnter={e=>{e.currentTarget.style.background="#FFF5F5";e.currentTarget.style.color="#C53030";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=disliked?"#C53030":DS.textMuted;}}>
            <ThumbsDownIcon filled={disliked}/> Dislike
          </button>
          <button style={btn(false,DS.primary)} onClick={()=>setShowComments(true)}
            onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=DS.textMuted;}}>
            <MessageCircleIcon/> Comment
          </button>
        </div>

        <div ref={menuRef} style={{ position: "relative", alignSelf: "center", marginRight: 8 }}>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${DS.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: DS.textMuted, cursor: "pointer", flexShrink: 0 }}>
            <DotsIcon />
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", bottom: "calc(100% + 6px)", right: 0, background: DS.card, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: `1px solid ${DS.border}`, minWidth: 180, zIndex: 50, overflow: "hidden", animation: "fadeDown 0.16s ease" }}>
              <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <div style={{ padding: "4px 0" }}>
                {dropdownItem(<ShareIcon />, "Share", () => setMenuOpen(false))}
                {dropdownItem(<BookmarkIcon filled={saved} />, saved ? "Unsave" : "Save", () => { setSaved(p => !p); setMenuOpen(false); }, saved)}
              </div>
            </div>
          )}
        </div>
      </div>
      {showComments && <CommentModal announcement={announcement} onClose={()=>setShowComments(false)}/>}
    </>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div style={{ background:DS.card, borderRadius:0, padding:"20px", borderBottom:"1px solid #f0f0f0" }}>
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
    <div style={{ background:DS.card, borderRadius:0, marginBottom:0, overflow:"hidden", position:"relative", border:"none", borderBottom:"1px solid #f0f0f0", transition:"background 0.15s" }}
      onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"}
      onMouseLeave={e=>e.currentTarget.style.background=DS.card}>

      {announcement.isPinned&&(
        <div style={{ position:"absolute", top:0, right:16, background:`linear-gradient(135deg,${DS.primaryDark},${DS.pinned})`, color:"#fff", fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:"0 0 8px 8px", fontFamily:DS.font, display:"flex", alignItems:"center", gap:4, boxShadow:"0 2px 6px rgba(43,108,176,0.3)" }}>
          <PinIcon/> PINNED
        </div>
      )}

      <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", gap:12 }}>
        <Avatar officeName={officeName} profilePic={announcement.admin?.profilePic || null}/>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight:700, fontSize:14, color:DS.textPrimary, fontFamily:DS.font }}>{officeName} <VerifiedBadgeIcon /></div>
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2, color:DS.textMuted, fontSize:11, fontFamily:DS.font }}>
            <ClockIcon/> {dateStr}{timeStr&&` · ${timeStr}`}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 20px 0", fontWeight: 700, fontSize: 17, color: DS.textPrimary, fontFamily: DS.font, lineHeight: 1.36 }}>{announcement.title}</div>

      <div style={{ padding: "10px 20px 0", fontSize: 14, color: DS.textSecondary, fontFamily: DS.font, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {displayContent}
        {isLong&&<button onClick={()=>setExpanded(!expanded)} style={{ display:"inline-flex", alignItems:"center", gap:4, marginLeft:6, background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:DS.primary, fontFamily:DS.font, padding:0 }}>{expanded?"Show less":"Read more"}<ChevronDownIcon open={expanded}/></button>}
      </div>

      {Array.isArray(announcement.media) && announcement.media.length > 0 && (
        <div style={{ marginTop: 18, overflow: "hidden", background: "#F4F7FB" }}>
          <MediaGallery media={announcement.media} />
        </div>
      )}

      <ReactionBar announcement={announcement}/>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function PublicAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => { setAnnouncements(Array.isArray(res.data)?res.data:res.data.results||[]); setError(null); })
      .catch(() => setError("Failed to load announcements."))
      .finally(() => setLoading(false));
  }, []);

  const officeFilter = useOfficeFilter();
  const displayAnnouncements = officeFilter
    ? announcements.filter(a => a.admin?.adminID === officeFilter)
    : announcements;

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:DS.textPrimary, fontFamily:DS.font, letterSpacing:-0.5 }}>Announcements</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:DS.textMuted, fontFamily:DS.font }}>Official announcements from the City of Surigao</p>
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
    </Layout>
  );
}

export default PublicAnnouncement;

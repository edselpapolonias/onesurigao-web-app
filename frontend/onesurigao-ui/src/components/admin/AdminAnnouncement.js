// src/components/admin/AdminAnnouncement.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../ReusableBar/Layout";
import MediaGallery from "../ReusableBar/MediaGallery";
import { apiClient } from "../../services/authService";

const API_URL = "http://127.0.0.1:8000/api/announcements/";

// ─── Design System ────────────────────────────────────────────────────────────
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
  pinned:        "#D97706",
  pinnedBg:      "#FFFBEB",
  shadow:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover:   "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal:   "0 20px 60px rgba(0,0,0,0.25)",
  font:          "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const ThumbsUpIcon    = ({ filled }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>);
const ThumbsDownIcon  = ({ filled }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>);
const MessageCircleIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const ChevronDownIcon = ({ open }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0deg)" }}><polyline points="6 9 12 15 18 9"/></svg>);
const PinIcon         = ({ filled }) => (<svg width="13" height="13" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const PinBadgeIcon    = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>);
const ClockIcon       = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const BuildingIcon    = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>);
const SendIcon        = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const XIcon           = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const DotsIcon        = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>);
const PlusIcon        = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const FileTextIcon    = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
const EditIcon        = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const TrashIcon       = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>);
const ImageIcon       = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const VideoIcon       = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>);
const CalendarIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ officeName, size = 42 }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SG";
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:DS.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*0.31, fontWeight:700, fontFamily:DS.font, flexShrink:0, boxShadow:"0 2px 6px rgba(43,108,176,0.25)" }}>
      {initials}
    </div>
  );
};

// ─── Comment Modal ────────────────────────────────────────────────────────────
const CommentModal = ({ announcement, onClose }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const handlePost = () => { if (!text.trim()) return; setComments(p=>[...p,{ id:Date.now(), text, date:new Date() }]); setText(""); };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div style={{ background:DS.card, borderRadius:14, width:"100%", maxWidth:540, maxHeight:"78vh", display:"flex", flexDirection:"column", boxShadow:DS.shadowModal, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${DS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:DS.textPrimary, fontFamily:DS.font }}>{announcement.title}</div>
            <div style={{ fontSize:11, color:DS.textMuted, fontFamily:DS.font, marginTop:2 }}>{announcement.admin?.officeName||"City of Surigao"}</div>
          </div>
          <button onClick={onClose} style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:"50%", width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:DS.textMuted }}><XIcon/></button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {comments.length===0
            ? <div style={{ textAlign:"center", padding:"32px 0", color:DS.textMuted, fontSize:13, fontFamily:DS.font }}><div style={{ marginBottom:8, display:"flex", justifyContent:"center" }}><MessageCircleIcon/></div>No comments yet. Be the first!</div>
            : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {comments.map(c=>(
                  <div key={c.id} style={{ display:"flex", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:DS.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:DS.primary, fontSize:12, fontWeight:700, fontFamily:DS.font }}>U</div>
                    <div style={{ background:DS.bg, borderRadius:12, padding:"8px 14px", flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:DS.textPrimary, fontFamily:DS.font, marginBottom:2 }}>Resident</div>
                      <div style={{ fontSize:13, color:DS.textSecondary, fontFamily:DS.font, lineHeight:1.5 }}>{c.text}</div>
                      <div style={{ fontSize:11, color:DS.textMuted, fontFamily:DS.font, marginTop:4 }}>{c.date.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div style={{ padding:"12px 20px", borderTop:`1px solid ${DS.border}`, display:"flex", gap:10, alignItems:"flex-end", flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:DS.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:DS.primary, fontSize:12, fontWeight:700 }}>A</div>
          <div style={{ flex:1, background:DS.bg, borderRadius:20, border:`1.5px solid ${DS.border}`, display:"flex", alignItems:"flex-end", padding:"8px 14px", gap:8 }}>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..." onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handlePost();}}}
              style={{ flex:1, background:"none", border:"none", outline:"none", resize:"none", fontSize:13, fontFamily:DS.font, color:DS.textPrimary, lineHeight:1.5, maxHeight:80, minHeight:20 }} rows={1}/>
            <button onClick={handlePost} style={{ background:text.trim()?DS.primaryGrad:"#E2E8F0", border:"none", borderRadius:"50%", width:30, height:30, cursor:text.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0, transition:"background 0.2s" }}><SendIcon/></button>
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

  const handleLike    = () => { if(liked){setLikes(l=>l-1);setLiked(false);}else{setLikes(l=>l+1);setLiked(true);if(disliked){setDislikes(d=>d-1);setDisliked(false);}} };
  const handleDislike = () => { if(disliked){setDislikes(d=>d-1);setDisliked(false);}else{setDislikes(d=>d+1);setDisliked(true);if(liked){setLikes(l=>l-1);setLiked(false);}} };

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
      {showComments&&<CommentModal announcement={announcement} onClose={()=>setShowComments(false)}/>}
    </>
  );
};

// ─── Card Skeleton ────────────────────────────────────────────────────────────
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

// ─── Announcement Form ────────────────────────────────────────────────────────
const AnnouncementForm = ({ initial={title:"",content:"",mediaFiles:[],scheduleEnabled:false,scheduledAt:""}, onPost, onSaveDraft, onCancel }) => {
  const [form, setForm]   = useState(initial);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(()=>{ setForm(initial); setPreviews([]); },[initial.title,initial.content]);

  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});
  const handleFiles  = files => {
    const arr = Array.from(files);
    setPreviews(p=>[...p,...arr.map(f=>({name:f.name,type:f.type,url:URL.createObjectURL(f)}))]);
    setForm(p=>({...p,mediaFiles:[...(p.mediaFiles||[]),...arr]}));
  };
  const removeMedia = idx => { setPreviews(p=>p.filter((_,i)=>i!==idx)); setForm(p=>({...p,mediaFiles:p.mediaFiles.filter((_,i)=>i!==idx)})); };
  const handleDrop  = e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };
  const minDT       = () => new Date(Date.now()+5*60000).toISOString().slice(0,16);

  const inputSt = { width:"100%", padding:"10px 14px", fontSize:13, border:`1.5px solid ${DS.border}`, borderRadius:8, outline:"none", boxSizing:"border-box", fontFamily:DS.font, background:DS.card, transition:"border-color 0.2s", color:DS.textPrimary };
  const labelSt = { display:"block", marginBottom:6, fontWeight:600, fontSize:11, color:DS.textMuted, fontFamily:DS.font, textTransform:"uppercase", letterSpacing:0.6 };

  return (
    <div style={{ padding:"24px 28px", overflowY:"auto", maxHeight:"calc(90vh - 70px)" }}>
      <div style={{ marginBottom:16 }}>
        <label style={labelSt}>Title <span style={{color:"#DC2626"}}>*</span></label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Enter announcement title..." style={inputSt}
          onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={labelSt}>Content <span style={{color:"#DC2626"}}>*</span></label>
        <textarea name="content" value={form.content} onChange={handleChange} rows={6} placeholder="Write the announcement content here..."
          style={{...inputSt,resize:"vertical",minHeight:120}}
          onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/>
      </div>

      {/* Media Upload */}
      <div style={{ marginBottom:16 }}>
        <label style={labelSt}>Attach Photo / Video <span style={{fontSize:11,color:"#A0AEC0",fontWeight:400,textTransform:"none"}}>(optional)</span></label>
        <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop} onClick={()=>fileRef.current?.click()}
          style={{ border:`2px dashed ${dragOver?DS.primary:DS.border}`, borderRadius:10, padding:"20px 16px", textAlign:"center", cursor:"pointer", background:dragOver?DS.primaryLight:DS.bg, transition:"all 0.2s" }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:6, color:DS.primary }}><ImageIcon/> <VideoIcon/></div>
          <p style={{ margin:0, fontSize:13, color:DS.textSecondary, fontFamily:DS.font }}><span style={{color:DS.primary,fontWeight:600}}>Click to upload</span> or drag & drop</p>
          <p style={{ margin:"3px 0 0", fontSize:11, color:DS.textMuted, fontFamily:DS.font }}>PNG, JPG, MP4, MOV supported</p>
        </div>
        {previews.length>0&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
            {previews.map((m,i)=>(
              <div key={i} style={{ position:"relative", borderRadius:8, overflow:"hidden", border:`1.5px solid ${DS.border}` }}>
                {m.type.startsWith("image/")?<img src={m.url} alt={m.name} style={{width:80,height:64,objectFit:"cover",display:"block"}}/>:
                  <div style={{width:80,height:64,background:"#1A202C",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><VideoIcon/></div>}
                <button onClick={e=>{e.stopPropagation();removeMedia(i);}} style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",borderRadius:"50%",width:18,height:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule */}
      <div style={{ marginBottom:24 }}>
        <div style={{ background:form.scheduleEnabled?DS.primaryLight:DS.bg, border:`1.5px solid ${form.scheduleEnabled?DS.primary:DS.border}`, borderRadius:10, padding:"14px 16px", transition:"all 0.2s" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }} onClick={()=>setForm(f=>({...f,scheduleEnabled:!f.scheduleEnabled,scheduledAt:""}))}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{color:form.scheduleEnabled?DS.primary:DS.textMuted,display:"flex"}}><ClockIcon/></span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:form.scheduleEnabled?DS.primaryDark:DS.textSecondary,fontFamily:DS.font}}>Schedule Post</div>
                <div style={{fontSize:11,color:DS.textMuted,fontFamily:DS.font}}>Choose when to publish this announcement</div>
              </div>
            </div>
            <div style={{ width:40, height:22, borderRadius:11, background:form.scheduleEnabled?DS.primary:"#CBD5E0", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
              <div style={{ position:"absolute", top:3, left:form.scheduleEnabled?21:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
            </div>
          </div>
          {form.scheduleEnabled&&(
            <div style={{ marginTop:12 }}>
              <label style={{...{display:"block",marginBottom:6,fontWeight:600,fontSize:11,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6}, display:"flex", alignItems:"center", gap:5}}><CalendarIcon/> Select Date & Time</label>
              <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} min={minDT()} onChange={handleChange}
                style={{...inputSt,border:`1.5px solid ${DS.primary}`,fontSize:13}}
                onFocus={e=>e.target.style.borderColor=DS.primaryDark} onBlur={e=>e.target.style.borderColor=DS.primary}/>
              {form.scheduledAt&&<p style={{margin:"6px 0 0",fontSize:12,color:DS.primary,fontFamily:DS.font,display:"flex",alignItems:"center",gap:5}}><ClockIcon/> Will post: <strong style={{marginLeft:4}}>{new Date(form.scheduledAt).toLocaleString("en-US",{month:"short",day:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}</strong></p>}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", borderTop:`1px solid ${DS.border}`, paddingTop:16 }}>
        <button onClick={onCancel} style={{background:DS.bg,border:`1.5px solid ${DS.border}`,padding:"9px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textSecondary,fontFamily:DS.font}}>Cancel</button>
        {onSaveDraft&&<button onClick={()=>form.title&&onSaveDraft(form)} style={{background:DS.card,border:`1.5px solid ${DS.primary}`,padding:"9px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.primary,fontFamily:DS.font}}>Save Draft</button>}
        <button onClick={()=>form.title&&form.content&&onPost(form)}
          style={{background:form.scheduleEnabled&&form.scheduledAt?"linear-gradient(135deg,#276749,#38A169)":DS.primaryGrad,color:"#fff",border:"none",padding:"9px 22px",fontSize:13,fontWeight:700,borderRadius:8,cursor:"pointer",fontFamily:DS.font,display:"flex",alignItems:"center",gap:6,boxShadow:`0 2px 8px ${form.scheduleEnabled&&form.scheduledAt?"rgba(56,161,105,0.3)":"rgba(43,108,176,0.3)"}`}}>
          {form.scheduleEnabled&&form.scheduledAt?<><CalendarIcon/> Schedule Post</>:<><PlusIcon/> Post Announcement</>}
        </button>
      </div>
    </div>
  );
};

// ─── Post Modal ───────────────────────────────────────────────────────────────
const PostModal = ({ onClose, onPost, onSaveDraft, editDraft=null }) => (
  <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
    <div style={{background:DS.card,borderRadius:14,width:"100%",maxWidth:700,boxShadow:DS.shadowModal,overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:DS.primaryGrad,padding:"18px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:"rgba(255,255,255,0.18)",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
            {editDraft?<EditIcon/>:<PlusIcon/>}
          </div>
          <div>
            <span style={{color:"#fff",fontWeight:700,fontSize:15,fontFamily:DS.font,display:"block"}}>{editDraft?"Edit Draft":"Post Announcement"}</span>
            <span style={{color:"rgba(255,255,255,0.7)",fontSize:11,fontFamily:DS.font}}>{editDraft?"Update your saved draft":"Publish to all city residents"}</span>
          </div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <div style={{overflowY:"auto",flex:1}}>
        <AnnouncementForm initial={editDraft||{title:"",content:"",mediaFiles:[],scheduleEnabled:false,scheduledAt:""}} onPost={onPost} onSaveDraft={onSaveDraft} onCancel={onClose}/>
      </div>
    </div>
  </div>
);

// ─── Drafts Panel ─────────────────────────────────────────────────────────────
const DraftsPanel = ({ drafts, onEdit, onDelete, onPost, onClose }) => (
  <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-start",justifyContent:"flex-end",zIndex:1000}}>
    <div style={{background:DS.card,width:370,height:"100%",boxShadow:"-4px 0 24px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column"}}>
      <div style={{background:DS.primaryGrad,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#fff",display:"flex"}}><FileTextIcon/></span>
          <span style={{color:"#fff",fontWeight:700,fontSize:14,fontFamily:DS.font}}>Saved Drafts</span>
          {drafts.length>0&&<span style={{background:"rgba(255,255,255,0.22)",color:"#fff",borderRadius:12,padding:"1px 8px",fontSize:12,fontWeight:700}}>{drafts.length}</span>}
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {drafts.length===0?(
          <div style={{textAlign:"center",padding:"48px 20px",color:DS.textMuted,fontSize:14,fontFamily:DS.font}}>
            <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><FileTextIcon/></div>
            No drafts saved yet.
          </div>
        ):drafts.map(draft=>(
          <div key={draft.id} style={{background:DS.bg,border:`1.5px solid ${DS.border}`,borderRadius:10,padding:"14px",marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:13,color:DS.textPrimary,marginBottom:4,fontFamily:DS.font}}>{draft.title||"Untitled Draft"}</div>
            <div style={{fontSize:12,color:DS.textMuted,marginBottom:6,fontFamily:DS.font,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{draft.content||"No content yet..."}</div>
            <div style={{fontSize:11,color:"#A0AEC0",marginBottom:10,fontFamily:DS.font}}>Saved: {draft.savedAt}</div>
            {draft.scheduledAt&&<div style={{fontSize:11,color:DS.primary,marginBottom:10,fontFamily:DS.font,display:"flex",alignItems:"center",gap:4}}><CalendarIcon/> Scheduled: {new Date(draft.scheduledAt).toLocaleString("en-US",{month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>onEdit(draft)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:DS.card,border:`1.5px solid ${DS.primary}`,borderRadius:6,padding:"7px",cursor:"pointer",fontSize:12,fontWeight:600,color:DS.primary,fontFamily:DS.font}}><EditIcon/> Edit</button>
              <button onClick={()=>onPost(draft)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:DS.primaryGrad,border:"none",borderRadius:6,padding:"7px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#fff",fontFamily:DS.font}}><PlusIcon/> Post</button>
              <button onClick={()=>onDelete(draft.id)} style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:6,padding:"7px 10px",cursor:"pointer",color:"#C53030",display:"flex",alignItems:"center"}}><TrashIcon/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Announcement Card (Admin — with pin menu) ────────────────────────────────
const AnnouncementCard = ({ announcement, currentAdminID, onPin }) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(()=>{ const h=e=>{ if(menuRef.current&&!menuRef.current.contains(e.target)) setMenuOpen(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);

  const isLong      = announcement.content?.length > 300;
  const displayContent = expanded||!isLong ? announcement.content : announcement.content?.slice(0,300)+"...";
  const officeName  = announcement.admin?.officeName || "City of Surigao";
  const isOwner     = announcement.admin?.adminID === currentAdminID;
  const isPinned    = announcement.isPinned;
  const createdDate = announcement.createdDate ? new Date(announcement.createdDate) : null;
  const dateStr     = createdDate?.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})||"";
  const timeStr     = createdDate?.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})||"";

  return (
    <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,marginBottom:14,overflow:"hidden",position:"relative",border:`1px solid ${DS.border}`,borderLeft:isPinned?`4px solid ${DS.pinned}`:`1px solid ${DS.border}`,transition:"box-shadow 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=DS.shadowHover}
      onMouseLeave={e=>e.currentTarget.style.boxShadow=DS.shadow}>

      {isPinned&&(
        <div style={{position:"absolute",top:0,right:16,background:`linear-gradient(135deg,${DS.pinned},#B45309)`,color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:"0 0 8px 8px",fontFamily:DS.font,display:"flex",alignItems:"center",gap:4,boxShadow:"0 2px 6px rgba(180,83,9,0.3)"}}>
          <PinBadgeIcon/> PINNED
        </div>
      )}

      <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Avatar officeName={officeName}/>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:DS.textPrimary,fontFamily:DS.font}}>{officeName}</div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2,color:DS.textMuted,fontSize:11,fontFamily:DS.font}}>
              <ClockIcon/> {dateStr}{timeStr&&` · ${timeStr}`}
            </div>
          </div>
        </div>

        {isOwner&&(
          <div ref={menuRef} style={{position:"relative"}}>
            <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:"none",border:"none",cursor:"pointer",color:DS.textMuted,padding:6,borderRadius:6,display:"flex",alignItems:"center"}}
              onMouseEnter={e=>e.currentTarget.style.background=DS.bg} onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <DotsIcon/>
            </button>
            {menuOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:DS.card,borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",border:`1px solid ${DS.border}`,minWidth:170,zIndex:50,overflow:"hidden"}}>
                <button onClick={()=>{onPin(announcement);setMenuOpen(false);}}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:isPinned?DS.pinned:DS.textPrimary,fontFamily:DS.font,textAlign:"left"}}
                  onMouseEnter={e=>e.currentTarget.style.background=DS.bg} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <span style={{color:isPinned?DS.pinned:DS.textMuted,display:"flex"}}><PinIcon filled={isPinned}/></span>
                  {isPinned?"Unpin Post":"Pin Post"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{padding:"12px 20px 6px",fontWeight:700,fontSize:16,color:DS.textPrimary,fontFamily:DS.font,lineHeight:1.4}}>{announcement.title}</div>

      <div style={{padding:"0 20px 14px",fontSize:14,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.75,whiteSpace:"pre-wrap"}}>
        {displayContent}
        {isLong&&<button onClick={()=>setExpanded(!expanded)} style={{display:"inline-flex",alignItems:"center",gap:4,marginLeft:6,background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:DS.primary,fontFamily:DS.font,padding:0}}>{expanded?"Show less":"Read more"}<ChevronDownIcon open={expanded}/></button>}
      </div>

      <MediaGallery media={announcement.media}/>

      <div style={{padding:"8px 20px",display:"flex",alignItems:"center",gap:6,borderTop:`1px solid ${DS.border}`}}>
        <span style={{color:DS.textMuted,display:"flex"}}><BuildingIcon/></span>
        <span style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font}}>{officeName}</span>
      </div>

      <ReactionBar announcement={announcement}/>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminAnnouncement() {
  const location = useLocation();
  const adminID  = location.state?.adminID || Number(sessionStorage.getItem("adminID")) || null;
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [drafts, setDrafts]       = useState(()=>{ try{ return JSON.parse(sessionStorage.getItem("announcement_drafts")||"[]"); }catch{ return []; } });

  useEffect(()=>{
    setLoading(true);
    axios.get(API_URL)
      .then(res=>{ setAnnouncements(Array.isArray(res.data)?res.data:res.data.results||[]); setError(null); })
      .catch(()=>setError("Failed to load announcements. Is your Django server running?"))
      .finally(()=>setLoading(false));
  },[]);

  const persistDrafts = updated=>{ setDrafts(updated); sessionStorage.setItem("announcement_drafts",JSON.stringify(updated)); };

  const handlePost = form => {
    if(form.scheduleEnabled&&form.scheduledAt){
      const now = new Date().toLocaleString("en-US",{month:"short",day:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
      const d   = {id:editingDraft?.id||Date.now(),title:form.title,content:form.content,scheduledAt:form.scheduledAt,scheduleEnabled:true,savedAt:now,isScheduled:true};
      persistDrafts(editingDraft?drafts.map(x=>x.id===editingDraft.id?d:x):[d,...drafts]);
      setShowModal(false); setEditingDraft(null);
      alert(`Scheduled for ${new Date(form.scheduledAt).toLocaleString("en-US",{month:"short",day:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}`);
      return;
    }
    const fd=new FormData();
    fd.append("title",form.title); fd.append("content",form.content);
    if(adminID) fd.append("admin_id",adminID);
    (form.mediaFiles||[]).forEach(f=>fd.append("mediaFiles",f));
    apiClient.post("/api/announcements/", fd)
      .then(res=>{ setAnnouncements([res.data,...announcements]); setShowModal(false); setEditingDraft(null); if(editingDraft) persistDrafts(drafts.filter(d=>d.id!==editingDraft.id)); })
      .catch(err=>alert(`Failed to post: ${JSON.stringify(err.response?.data||err.message)}`));
  };

  const handleSaveDraft = form => {
    const now = new Date().toLocaleString("en-US",{month:"short",day:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
    persistDrafts(editingDraft?drafts.map(d=>d.id===editingDraft.id?{...d,...form,savedAt:now}:d):[{id:Date.now(),...form,savedAt:now},...drafts]);
    setShowModal(false); setEditingDraft(null);
  };

  const handlePin = ann => {
    apiClient.patch(`/api/announcements/${ann.id}/`, { isPinned: !ann.isPinned })
      .then(res=>setAnnouncements(announcements.map(a=>a.id===ann.id?res.data:a)))
      .catch(err=>alert(`Failed: ${JSON.stringify(err.response?.data||err.message)}`));
  };

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>Announcements</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>Oversee and publish official public advisories.</p>
          {officeName&&<p style={{margin:"4px 0 0",fontSize:12,color:DS.primary,fontFamily:DS.font,fontWeight:600}}>Logged in as: {officeName}</p>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setShowDrafts(true)} style={{display:"flex",alignItems:"center",gap:6,position:"relative",background:DS.card,border:`1.5px solid ${DS.border}`,padding:"9px 16px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textSecondary,fontFamily:DS.font,boxShadow:DS.shadow}}>
            <FileTextIcon/> Drafts
            {drafts.length>0&&<span style={{position:"absolute",top:-7,right:-7,background:"#DC2626",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{drafts.length}</span>}
          </button>
          <button onClick={()=>{setEditingDraft(null);setShowModal(true);}} style={{display:"flex",alignItems:"center",gap:6,background:DS.primaryGrad,border:"none",padding:"9px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff",fontFamily:DS.font,boxShadow:"0 2px 8px rgba(43,108,176,0.3)"}}>
            <PlusIcon/> Post Announcement
          </button>
        </div>
      </div>

      {error&&<div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:8,padding:"12px 16px",marginBottom:14,fontSize:13,color:"#C53030",fontFamily:DS.font}}>⚠️ {error}</div>}
      {loading&&[1,2].map(i=><CardSkeleton key={i}/>)}
      {!loading&&!error&&announcements.length===0&&(
        <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
          <div style={{marginBottom:12,display:"flex",justifyContent:"center",color:DS.textMuted}}><BuildingIcon/></div>
          No announcements yet. Click <strong>Post Announcement</strong> to add one.
        </div>
      )}
      {!loading&&announcements.map(a=><AnnouncementCard key={a.id} announcement={a} currentAdminID={adminID} onPin={handlePin}/>)}

      {showModal&&<PostModal onClose={()=>{setShowModal(false);setEditingDraft(null);}} onPost={handlePost} onSaveDraft={handleSaveDraft} editDraft={editingDraft}/>}
      {showDrafts&&<DraftsPanel drafts={drafts} onEdit={d=>{setEditingDraft(d);setShowDrafts(false);setShowModal(true);}} onDelete={id=>persistDrafts(drafts.filter(d=>d.id!==id))} onPost={d=>{setEditingDraft(d);handlePost(d);setShowDrafts(false);}} onClose={()=>setShowDrafts(false)}/>}
    </Layout>
  );
}

export default AdminAnnouncement;

// src/components/admin/AdminEvent.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../ReusableBar/LayoutModern";
import { apiClient } from "../../services/authService";

const API_URL = "http://127.0.0.1:8000/api/events/";

// ─── Design System ────────────────────────────────────────────────────────────
const DS = {
  primary:      "#2B6CB0",
  primaryDark:  "#1E4E8C",
  primaryLight: "#EBF4FF",
  primaryGrad:  "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg:           "#F5F7FA",
  card:         "#FFFFFF",
  border:       "#E2E8F0",
  borderFocus:  "#2B6CB0",
  textPrimary:  "#1A202C",
  textSecondary:"#4A5568",
  textMuted:    "#718096",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover:  "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal:  "0 20px 60px rgba(0,0,0,0.25)",
  font:         "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon      = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MapPinIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const CalendarIcon  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const UserIcon      = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const ArrowUpRightIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>);
const ImageIcon     = () => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const UploadIcon    = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const XIcon         = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const InfoIcon      = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);
const CheckCircleIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const XCircleIcon   = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>);
const ClockPendingIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);

const InfoRow = ({ icon, label, value }) => (
  <div style={{display:"flex",alignItems:"flex-start",gap:7}}>
    <span style={{color:DS.primary,marginTop:1,flexShrink:0}}>{icon}</span>
    <div style={{fontSize:12,fontFamily:DS.font}}>
      <span style={{color:DS.primary,fontWeight:700}}>{label}</span>
      <span style={{color:DS.textSecondary,marginLeft:5}}>— {value}</span>
    </div>
  </div>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabButton = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 18px",borderRadius:8,border:`1.5px solid ${active?DS.primary:DS.border}`,cursor:"pointer",fontSize:13,fontWeight:active?700:500,background:active?DS.primaryGrad:DS.card,color:active?"#fff":DS.textSecondary,fontFamily:DS.font,boxShadow:active?"0 2px 8px rgba(43,108,176,0.3)":DS.shadow,transition:"all 0.2s"}}>
    {label}
    {count!==undefined&&count>0&&(
      <span style={{background:active?"rgba(255,255,255,0.25)":"#DC2626",color:"#fff",borderRadius:12,padding:"1px 7px",fontSize:11,fontWeight:700}}>{count}</span>
    )}
  </button>
);

// ─── Add Event Modal ──────────────────────────────────────────────────────────
const AddEventModal = ({ onClose, onSubmit, adminOfficeName }) => {
  const [form, setForm]     = useState({title:"",description:"",eventDate:"",location:"",posterFile:null});
  const [preview, setPreview]   = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});
  const handleFile   = file => { if(!file||!file.type.startsWith("image/")) return; setForm(f=>({...f,posterFile:file})); setPreview(URL.createObjectURL(file)); };
  const handleDrop   = e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const handleSubmit = async () => {
    if(!form.title||!form.eventDate||!form.location){alert("Please fill in Title, Event Date, and Location.");return;}
    setSubmitting(true);
    try{await onSubmit(form);onClose();}catch{alert("Failed to submit event.");}finally{setSubmitting(false);}
  };

  const inputSt = {width:"100%",padding:"10px 14px",fontSize:13,border:`1.5px solid ${DS.border}`,borderRadius:8,outline:"none",boxSizing:"border-box",fontFamily:DS.font,background:DS.card,transition:"border-color 0.2s",color:DS.textPrimary};
  const labelSt = {display:"block",marginBottom:6,fontWeight:600,fontSize:11,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6};

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div style={{background:DS.card,borderRadius:14,width:"100%",maxWidth:680,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:DS.shadowModal,overflow:"hidden"}}>
        <div style={{background:DS.primaryGrad,padding:"18px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:16,fontFamily:DS.font}}>Add New Event</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,fontFamily:DS.font,marginTop:2}}>Submit for Super Admin approval before publishing</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"22px 26px"}}>
          {/* Notice */}
          <div style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:8,padding:"10px 14px",marginBottom:18,fontSize:12,color:"#92400E",fontFamily:DS.font,display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#D97706",flexShrink:0,display:"flex"}}><InfoIcon/></span>
            This event will be <strong style={{margin:"0 3px"}}>pending approval</strong> from a Super Admin before it becomes visible to the public.
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelSt}>Event Title <span style={{color:"#DC2626"}}>*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Bonok-Bonok Festival" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div>
              <label style={labelSt}>Event Date & Time <span style={{color:"#DC2626"}}>*</span></label>
              <input type="datetime-local" name="eventDate" value={form.eventDate} onChange={handleChange} style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/>
            </div>
            <div>
              <label style={labelSt}>Location <span style={{color:"#DC2626"}}>*</span></label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Surigao Provincial Sports..." style={inputSt} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelSt}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the event..." style={{...inputSt,resize:"vertical",minHeight:100}} onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={labelSt}>Posted By</label>
            <input value={adminOfficeName||"Your Office"} readOnly style={{...inputSt,background:DS.bg,color:DS.textMuted,cursor:"not-allowed"}}/>
          </div>
          <div style={{marginBottom:8}}>
            <label style={labelSt}>Event Poster <span style={{fontSize:11,color:"#A0AEC0",fontWeight:400,textTransform:"none"}}>(one image)</span></label>
            {preview?(
              <div style={{position:"relative",borderRadius:10,overflow:"hidden",border:`1.5px solid ${DS.border}`}}>
                <img src={preview} alt="poster" style={{width:"100%",height:200,objectFit:"cover",display:"block"}}/>
                <button onClick={()=>{setPreview(null);setForm(f=>({...f,posterFile:null}));}} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
              </div>
            ):(
              <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop} onClick={()=>fileRef.current?.click()}
                style={{border:`2px dashed ${dragOver?DS.primary:DS.border}`,borderRadius:10,padding:"28px 16px",textAlign:"center",cursor:"pointer",background:dragOver?DS.primaryLight:DS.bg,transition:"all 0.2s"}}>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                <div style={{color:DS.primary,display:"flex",justifyContent:"center",marginBottom:8}}><UploadIcon/></div>
                <p style={{margin:0,fontSize:13,color:DS.textSecondary,fontFamily:DS.font}}><span style={{color:DS.primary,fontWeight:600}}>Click to upload</span> or drag & drop</p>
              </div>
            )}
          </div>
        </div>
        <div style={{padding:"14px 26px",borderTop:`1px solid ${DS.border}`,display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0,background:DS.bg}}>
          <button onClick={onClose} style={{background:DS.card,border:`1.5px solid ${DS.border}`,padding:"9px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textSecondary,fontFamily:DS.font}}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{background:submitting?"#9ab8e0":DS.primaryGrad,color:"#fff",border:"none",padding:"9px 24px",fontSize:13,fontWeight:700,borderRadius:8,cursor:submitting?"not-allowed":"pointer",fontFamily:DS.font}}>
            {submitting?"Submitting...":"Submit Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Event Details Modal ──────────────────────────────────────────────────────
const EventDetailsModal = ({ event, onClose }) => {
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}) : "";
  const timeStr = event.eventDate ? new Date(event.eventDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "";
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div style={{background:DS.card,borderRadius:14,width:"100%",maxWidth:560,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:DS.shadowModal,overflow:"hidden"}}>
        {event.posterUrl?(
          <div style={{position:"relative",height:220,flexShrink:0}}>
            <img src={event.posterUrl} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))"}}/>
            <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.5)",border:"none",color:"#fff",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
            <div style={{position:"absolute",bottom:16,left:20,color:"#fff",fontWeight:800,fontSize:18,fontFamily:DS.font,textTransform:"uppercase",textShadow:"0 2px 8px rgba(0,0,0,0.6)"}}>{event.title}</div>
          </div>
        ):(
          <div style={{background:DS.primaryGrad,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <span style={{color:"#fff",fontWeight:700,fontSize:16,fontFamily:DS.font}}>Event Details</span>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
          </div>
        )}
        <div style={{overflowY:"auto",flex:1,padding:24}}>
          {!event.posterUrl&&<h2 style={{margin:"0 0 14px",fontSize:18,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase"}}>{event.title}</h2>}
          <div style={{background:DS.bg,borderRadius:10,padding:"14px 16px",marginBottom:16,display:"flex",flexDirection:"column",gap:10}}>
            <InfoRow icon={<MapPinIcon/>} label="Location" value={event.location}/>
            <InfoRow icon={<CalendarIcon/>} label="Date" value={`${dateStr}${timeStr?" at "+timeStr:""}`}/>
            <InfoRow icon={<UserIcon/>} label="Posted By" value={event.postedBy||event.admin?.officeName||"Surigao PIO"}/>
          </div>
          {event.description&&<p style={{fontSize:14,color:DS.textSecondary,lineHeight:1.75,fontFamily:DS.font,margin:0}}>{event.description}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Approved Event Card ──────────────────────────────────────────────────────
const EventCard = ({ event, onClick, isPast = false }) => {
  const [hovered, setHovered] = useState(false);
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{background:DS.card,borderRadius:12,overflow:"hidden",boxShadow:hovered?DS.shadowHover:DS.shadow,border:`1px solid ${DS.border}`,transition:"box-shadow 0.2s, transform 0.2s",transform:hovered?"translateY(-2px)":"translateY(0)",opacity:isPast?0.82:1}}>
      <div style={{height:140,background:isPast?"linear-gradient(135deg,#4A5568,#2D3748)":DS.primaryGrad,overflow:"hidden",position:"relative"}}>
        {event.posterUrl?(
          <img src={event.posterUrl} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s",transform:hovered?"scale(1.04)":"scale(1)",filter:isPast?"grayscale(50%)":"none"}}/>
        ):(
          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><ImageIcon/></div>
        )}
        {isPast&&<div style={{position:"absolute",top:10,left:10,background:"rgba(0,0,0,0.7)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:DS.font}}>EVENT DONE</div>}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontWeight:700,fontSize:12,color:isPast?DS.textMuted:DS.textPrimary,marginBottom:8,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.35}}>{event.title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
          <InfoRow icon={<MapPinIcon/>} label="Location" value={event.location?.length>22?event.location.slice(0,22)+"…":event.location}/>
          <InfoRow icon={<CalendarIcon/>} label="Date" value={dateStr}/>
          <InfoRow icon={<UserIcon/>} label="By" value={event.postedBy||event.admin?.officeName||"Surigao PIO"}/>
        </div>
        <button onClick={()=>onClick(event)}
          style={{display:"flex",alignItems:"center",gap:5,background:"none",border:`1px solid ${DS.border}`,borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,color:DS.textMuted,fontFamily:DS.font,padding:"5px 10px",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.primary;e.currentTarget.style.color=DS.primary;e.currentTarget.style.background=DS.primaryLight;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.color=DS.textMuted;e.currentTarget.style.background="none";}}>
          <ArrowUpRightIcon/> View Details
        </button>
      </div>
    </div>
  );
};

// ─── Add Event Card ───────────────────────────────────────────────────────────
const AddEventCard = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{background:DS.card,borderRadius:12,border:`2px dashed ${hovered?DS.primary:DS.border}`,boxShadow:hovered?DS.shadowHover:DS.shadow,transition:"all 0.2s",transform:hovered?"translateY(-2px)":"translateY(0)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:240}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:hovered?DS.primaryGrad:`${DS.primaryLight}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,transition:"all 0.2s",boxShadow:hovered?"0 4px 14px rgba(43,108,176,0.35)":"none",color:hovered?"#fff":DS.primary}}>
        <PlusIcon/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color:hovered?DS.primary:DS.textMuted,fontFamily:DS.font,letterSpacing:1,textTransform:"uppercase"}}>Add Event</span>
    </div>
  );
};

// ─── Pending Event Card ───────────────────────────────────────────────────────
const PendingEventCard = ({ event }) => {
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  const isDeclined = !event.isApproved && event.declineReason;
  const isApproved = event.isApproved;
  const borderColor = isDeclined?"#FEB2B2":isApproved?"#9AE6B4":"#FDE68A";
  const statusBg    = isDeclined?"#DC2626":isApproved?"#16A34A":"#D97706";

  return (
    <div style={{background:DS.card,borderRadius:12,overflow:"hidden",boxShadow:DS.shadow,border:`1.5px solid ${borderColor}`}}>
      <div style={{height:120,background:DS.primaryGrad,overflow:"hidden",position:"relative"}}>
        {event.posterUrl?<img src={event.posterUrl} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(
          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><ImageIcon/></div>
        )}
        <div style={{position:"absolute",top:8,right:8,background:statusBg,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:DS.font}}>
          {isDeclined?"DECLINED":isApproved?"APPROVED":"PENDING"}
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontWeight:700,fontSize:12,color:DS.textPrimary,marginBottom:8,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.4}}>{event.title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
          <InfoRow icon={<MapPinIcon/>} label="Location" value={event.location?.length>22?event.location.slice(0,22)+"…":event.location}/>
          <InfoRow icon={<CalendarIcon/>} label="Date" value={dateStr}/>
        </div>
        {isApproved&&(
          <div style={{background:"#F0FDF4",border:"1px solid #9AE6B4",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#166534",fontFamily:DS.font,display:"flex",alignItems:"center",gap:6}}>
            <span style={{display:"flex",flexShrink:0,color:"#16A34A"}}><CheckCircleIcon/></span> Approved and visible to the public.
          </div>
        )}
        {isDeclined&&(
          <div style={{background:"#FFF5F5",border:"1px solid #FEB2B2",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#C53030",fontFamily:DS.font}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontWeight:700,marginBottom:3}}><span style={{display:"flex",flexShrink:0}}><XCircleIcon/></span> Declined</div>
            {event.declineReason}
          </div>
        )}
        {!isApproved&&!isDeclined&&(
          <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400E",fontFamily:DS.font,display:"flex",alignItems:"center",gap:6}}>
            <span style={{display:"flex",flexShrink:0,color:"#D97706"}}><ClockPendingIcon/></span> Waiting for Super Admin approval.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const EventSkeleton = () => (
  <div style={{background:DS.card,borderRadius:12,overflow:"hidden",boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
    <div style={{height:140,background:"#EDF2F7",animation:"pulse 1.5s ease-in-out infinite"}}/>
    <div style={{padding:"12px 14px"}}>
      {[80,65,55,45].map((w,i)=><div key={i} style={{height:11,width:`${w}%`,background:"#EDF2F7",borderRadius:6,marginBottom:9,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminEvent() {
  const location   = useLocation();
  const adminID    = location.state?.adminID || Number(sessionStorage.getItem("adminID")) || null;
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  const [activeTab, setActiveTab] = useState("EVENT");
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [myEvents, setMyEvents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(()=>{
    setLoading(true);
    axios.get(API_URL,{params:adminID?{adminID}:{}})
      .then(res=>{
        const all=Array.isArray(res.data)?res.data:res.data.results||[];
        setApprovedEvents(all.filter(e=>e.isApproved));
        setMyEvents(all.filter(e=>!e.isApproved));
        setError(null);
      })
      .catch(()=>setError("Failed to load events."))
      .finally(()=>setLoading(false));
  },[adminID]);

  const handleSubmitEvent = async form => {
    const fd=new FormData();
    fd.append("title",form.title); fd.append("description",form.description);
    fd.append("eventDate",form.eventDate); fd.append("location",form.location);
    fd.append("admin_id",adminID);
    if(form.posterFile) fd.append("posterPath",form.posterFile);
    const res = await apiClient.post("/api/events/", fd);
    setMyEvents(prev=>[{...res.data,posterUrl:form.posterFile?URL.createObjectURL(form.posterFile):null,postedBy:officeName},...prev]);
    setActiveTab("PENDING");
  };

  const enrich = e => ({...e,posterUrl:e.posterUrl||e.posterPath||null,postedBy:e.admin?.officeName||officeName||"Surigao PIO"});
  const now = new Date();
  const upcomingApproved = approvedEvents.filter(e=>e.eventDate&&new Date(e.eventDate)>=now).map(enrich);
  const pastApproved     = approvedEvents.filter(e=>e.eventDate&&new Date(e.eventDate)<now).map(enrich);
  const pendingEvents    = myEvents.map(enrich);
  const pendingCount     = pendingEvents.filter(e=>!e.declineReason).length;

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>
            {activeTab==="EVENT"?"Upcoming Events":activeTab==="PAST"?"Past Events":"Pending Events"}
          </h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>
            {activeTab==="EVENT"?"Community gatherings, holidays and official schedules":activeTab==="PAST"?"Events that have already taken place":"Your submitted events awaiting approval"}
          </p>
          {officeName&&<p style={{margin:"4px 0 0",fontSize:12,color:DS.primary,fontFamily:DS.font,fontWeight:600}}>Logged in as: {officeName}</p>}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <TabButton label="Events" active={activeTab==="EVENT"} onClick={()=>setActiveTab("EVENT")}/>
          <TabButton label="Past Events" active={activeTab==="PAST"} onClick={()=>setActiveTab("PAST")} count={pastApproved.length}/>
          <TabButton label="Pending" active={activeTab==="PENDING"} onClick={()=>setActiveTab("PENDING")} count={pendingCount}/>
        </div>
      </div>

      {error&&<div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:8,padding:"12px 16px",marginBottom:14,fontSize:13,color:"#C53030",fontFamily:DS.font}}>⚠️ {error}</div>}

      {/* EVENT TAB */}
      {activeTab==="EVENT"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          <AddEventCard onClick={()=>setShowAddModal(true)}/>
          {loading&&[1,2,3].map(i=><EventSkeleton key={i}/>)}
          {!loading&&upcomingApproved.map(e=><EventCard key={e.eventID||e.id} event={e} onClick={setSelectedEvent}/>)}
          {!loading&&upcomingApproved.length===0&&(
            <div style={{gridColumn:"2 / -1",background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><CalendarIcon/></div>
              No upcoming approved events yet.
            </div>
          )}
        </div>
      )}

      {/* PAST TAB */}
      {activeTab==="PAST"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {loading&&[1,2,3].map(i=><EventSkeleton key={i}/>)}
          {!loading&&pastApproved.map(e=><EventCard key={e.eventID||e.id} event={e} onClick={setSelectedEvent} isPast/>)}
          {!loading&&pastApproved.length===0&&(
            <div style={{gridColumn:"1 / -1",background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><CalendarIcon/></div>
              No past events yet.
            </div>
          )}
        </div>
      )}

      {/* PENDING TAB */}
      {activeTab==="PENDING"&&(
        pendingEvents.length===0&&!loading?(
          <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
            <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><ClockPendingIcon/></div>
            No pending events. Click <strong>Add Event</strong> in the Events tab to submit one.
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {pendingEvents.map(e=><PendingEventCard key={e.eventID||e.id} event={e}/>)}
          </div>
        )
      )}

      {showAddModal&&<AddEventModal onClose={()=>setShowAddModal(false)} onSubmit={handleSubmitEvent} adminOfficeName={officeName}/>}
      {selectedEvent&&<EventDetailsModal event={selectedEvent} onClose={()=>setSelectedEvent(null)}/>}
    </Layout>
  );
}

export default AdminEvent;

// src/components/superadmin/SuperAdminEvent.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import SuperAdminLayout from "../ReusableBar/SuperAdminLayout";

const EVENTS_URL  = "http://127.0.0.1:8000/superadmin/events/";
const APPROVE_URL = id => `http://127.0.0.1:8000/superadmin/events/${id}/approve/`;
const DECLINE_URL = id => `http://127.0.0.1:8000/superadmin/events/${id}/decline/`;

// ─── Design System ────────────────────────────────────────────────────────────
const DS = {
  primary:      "#2B6CB0",
  primaryDark:  "#1E4E8C",
  primaryLight: "#EBF4FF",
  primaryGrad:  "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg:           "#F5F7FA",
  card:         "#FFFFFF",
  border:       "#E2E8F0",
  textPrimary:  "#1A202C",
  textSecondary:"#4A5568",
  textMuted:    "#718096",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover:  "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal:  "0 20px 60px rgba(0,0,0,0.25)",
  font:         "'Segoe UI', system-ui, sans-serif",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const MapPinIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const CalendarIcon  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const UserIcon      = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const ArrowUpRightIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>);
const CheckIcon     = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const XIcon         = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const ImageIcon     = () => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const InfoIcon      = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);

const InfoRow = ({ icon, label, value }) => (
  <div style={{display:"flex",alignItems:"flex-start",gap:7}}>
    <span style={{color:DS.primary,marginTop:1,flexShrink:0}}>{icon}</span>
    <div style={{fontSize:12,fontFamily:DS.font}}>
      <span style={{color:DS.primary,fontWeight:700}}>{label}</span>
      <span style={{color:DS.textSecondary,marginLeft:5}}>— {value}</span>
    </div>
  </div>
);

const TabButton = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 18px",borderRadius:8,border:`1.5px solid ${active?DS.primary:DS.border}`,cursor:"pointer",fontSize:13,fontWeight:active?700:500,background:active?DS.primaryGrad:DS.card,color:active?"#fff":DS.textSecondary,fontFamily:DS.font,boxShadow:active?"0 2px 8px rgba(43,108,176,0.3)":DS.shadow,transition:"all 0.2s"}}>
    {label}
    {count!==undefined&&count>0&&(
      <span style={{background:active?"rgba(255,255,255,0.25)":"#DC2626",color:"#fff",borderRadius:12,padding:"1px 7px",fontSize:11,fontWeight:700}}>{count}</span>
    )}
  </button>
);

// ─── Decline Modal ────────────────────────────────────────────────────────────
const DeclineModal = ({ event, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleConfirm = async () => {
    if(!reason.trim()){alert("Please provide a reason.");return;}
    setSubmitting(true); await onConfirm(event.eventID,reason); setSubmitting(false); onClose();
  };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div style={{background:DS.card,borderRadius:14,width:"100%",maxWidth:480,boxShadow:DS.shadowModal,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#9B2C2C,#C53030)",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:15,fontFamily:DS.font}}>Decline Event</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,fontFamily:DS.font,marginTop:2}}>Provide a reason so the admin can revise their submission</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
        </div>
        <div style={{padding:"22px"}}>
          <div style={{background:DS.bg,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,fontFamily:DS.font}}>
            <div style={{fontWeight:700,color:DS.textPrimary}}>{event.title}</div>
            <div style={{fontSize:12,color:DS.textMuted,marginTop:2}}>By {event.admin?.officeName||"Unknown Office"}</div>
          </div>
          <label style={{display:"block",marginBottom:6,fontWeight:600,fontSize:11,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6}}>Reason <span style={{color:"#DC2626"}}>*</span></label>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4} placeholder="e.g. Incomplete information, duplicate event..."
            style={{width:"100%",padding:"10px 14px",fontSize:13,border:"1.5px solid #FEB2B2",borderRadius:8,outline:"none",boxSizing:"border-box",fontFamily:DS.font,resize:"vertical",minHeight:100}}
            onFocus={e=>e.target.style.borderColor="#C53030"} onBlur={e=>e.target.style.borderColor="#FEB2B2"}/>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16}}>
            <button onClick={onClose} style={{background:DS.card,border:`1.5px solid ${DS.border}`,padding:"9px 20px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textSecondary,fontFamily:DS.font}}>Cancel</button>
            <button onClick={handleConfirm} disabled={submitting} style={{background:submitting?"#f08080":"linear-gradient(135deg,#9B2C2C,#C53030)",color:"#fff",border:"none",padding:"9px 20px",fontSize:13,fontWeight:700,borderRadius:8,cursor:submitting?"not-allowed":"pointer",fontFamily:DS.font}}>
              {submitting?"Declining...":"Confirm Decline"}
            </button>
          </div>
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
            <InfoRow icon={<UserIcon/>} label="Posted By" value={event.admin?.officeName||"Surigao PIO"}/>
          </div>
          {event.description&&<p style={{fontSize:14,color:DS.textSecondary,lineHeight:1.75,fontFamily:DS.font,margin:0}}>{event.description}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── Approved Event Card ──────────────────────────────────────────────────────
const ApprovedEventCard = ({ event, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  const posterUrl = event.posterPath||null;
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{background:DS.card,borderRadius:12,overflow:"hidden",boxShadow:hovered?DS.shadowHover:DS.shadow,border:`1px solid ${DS.border}`,transition:"box-shadow 0.2s, transform 0.2s",transform:hovered?"translateY(-2px)":"translateY(0)"}}>
      <div style={{height:140,background:DS.primaryGrad,overflow:"hidden",position:"relative"}}>
        {posterUrl?<img src={posterUrl} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s",transform:hovered?"scale(1.04)":"scale(1)"}}/>:(
          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><ImageIcon/></div>
        )}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontWeight:700,fontSize:12,color:DS.textPrimary,marginBottom:8,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.35}}>{event.title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
          <InfoRow icon={<MapPinIcon/>} label="Location" value={event.location?.length>22?event.location.slice(0,22)+"…":event.location}/>
          <InfoRow icon={<CalendarIcon/>} label="Date" value={dateStr}/>
          <InfoRow icon={<UserIcon/>} label="By" value={event.admin?.officeName||"Surigao PIO"}/>
        </div>
        <button onClick={()=>onClick({...event,posterUrl})}
          style={{display:"flex",alignItems:"center",gap:5,background:"none",border:`1px solid ${DS.border}`,borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,color:DS.textMuted,fontFamily:DS.font,padding:"5px 10px",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.primary;e.currentTarget.style.color=DS.primary;e.currentTarget.style.background=DS.primaryLight;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.color=DS.textMuted;e.currentTarget.style.background="none";}}>
          <ArrowUpRightIcon/> View Details
        </button>
      </div>
    </div>
  );
};

// ─── Validation Card ──────────────────────────────────────────────────────────
const ValidationCard = ({ event, onApprove, onDecline }) => {
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  const timeStr = event.eventDate ? new Date(event.eventDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "";
  const [approving, setApproving] = useState(false);
  const handleApprove = async () => { setApproving(true); await onApprove(event.eventID); setApproving(false); };
  return (
    <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,overflow:"hidden",border:`1.5px solid #FDE68A`}}>
      <div style={{height:140,background:DS.primaryGrad,overflow:"hidden",position:"relative"}}>
        {event.posterPath?<img src={event.posterPath} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(
          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><ImageIcon/></div>
        )}
        <div style={{position:"absolute",top:8,left:8,background:"#D97706",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:DS.font}}>
          PENDING APPROVAL
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontWeight:700,fontSize:12,color:DS.textPrimary,marginBottom:8,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.4}}>{event.title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
          <InfoRow icon={<MapPinIcon/>} label="Location" value={event.location?.length>22?event.location.slice(0,22)+"…":event.location}/>
          <InfoRow icon={<CalendarIcon/>} label="Date" value={`${dateStr}${timeStr?" · "+timeStr:""}`}/>
          <InfoRow icon={<UserIcon/>} label="By" value={event.admin?.officeName||"Unknown Office"}/>
        </div>
        {event.description&&(
          <div style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font,lineHeight:1.6,marginBottom:12,background:DS.bg,borderRadius:8,padding:"8px 10px"}}>
            {event.description.length>120?event.description.slice(0,120)+"…":event.description}
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleApprove} disabled={approving} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:approving?"#9ab8e0":"linear-gradient(135deg,#276749,#38A169)",border:"none",borderRadius:8,padding:"9px",cursor:approving?"not-allowed":"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:DS.font,boxShadow:"0 2px 8px rgba(56,161,105,0.3)"}}>
            <CheckIcon/> {approving?"Approving...":"Approve"}
          </button>
          <button onClick={()=>onDecline(event)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#9B2C2C,#C53030)",border:"none",borderRadius:8,padding:"9px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:DS.font,boxShadow:"0 2px 8px rgba(197,48,48,0.3)"}}>
            <XIcon/> Decline
          </button>
        </div>
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
function SuperAdminEvent() {
  const location     = useLocation();
  const superAdminID = location.state?.superAdminID || Number(sessionStorage.getItem("superAdminID")) || null;

  const [activeTab, setActiveTab]         = useState("EVENT");
  const now = new Date();
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [pendingEvents, setPendingEvents]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [error, setError]                 = useState(null);

  const fetchEvents = () => {
    setLoading(true);
    Promise.all([
      axios.get(EVENTS_URL),
      axios.get(EVENTS_URL,{params:{status:"pending"}}),
    ]).then(([aRes,pRes])=>{
      const allApproved = Array.isArray(aRes.data)?aRes.data:aRes.data.results||[];
      setApprovedEvents(allApproved);
      setPendingEvents(Array.isArray(pRes.data)?pRes.data:pRes.data.results||[]);
      setError(null);
    }).catch(()=>setError("Failed to load events.")).finally(()=>setLoading(false));
  };

  useEffect(()=>{fetchEvents();},[]);

  const handleApprove = async eventID => { await axios.patch(APPROVE_URL(eventID),{superAdminID}); fetchEvents(); };
  const handleDecline = async (eventID,reason) => { await axios.patch(DECLINE_URL(eventID),{declineReason:reason}); fetchEvents(); };

  return (
    <SuperAdminLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>Events</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>Manage and validate city events</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <TabButton label="Events" active={activeTab==="EVENT"} onClick={()=>setActiveTab("EVENT")}/>
          <TabButton label="Past Events" active={activeTab==="PAST"} onClick={()=>setActiveTab("PAST")}/>
          <TabButton label="Validation" active={activeTab==="VALIDATION"} onClick={()=>setActiveTab("VALIDATION")} count={pendingEvents.length}/>
        </div>
      </div>

      {error&&<div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:8,padding:"12px 16px",marginBottom:14,fontSize:13,color:"#C53030",fontFamily:DS.font}}>⚠️ {error}</div>}

      {/* EVENT TAB */}
      {activeTab==="EVENT"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {loading&&[1,2,3].map(i=><EventSkeleton key={i}/>)}
          {!loading&&approvedEvents.filter(e=>e.eventDate&&new Date(e.eventDate)>=new Date()).map(e=><ApprovedEventCard key={e.eventID} event={e} onClick={setSelectedEvent}/>)}
          {!loading&&approvedEvents.filter(e=>e.eventDate&&new Date(e.eventDate)>=new Date()).length===0&&(
            <div style={{gridColumn:"1 / -1",background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><CalendarIcon/></div>
              No approved events yet. Go to <strong>Validation</strong> to approve events.
            </div>
          )}
        </div>
      )}


      {/* PAST EVENTS TAB */}
      {activeTab==="PAST"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {loading&&[1,2,3].map(i=><EventSkeleton key={i}/>)}
          {!loading&&approvedEvents.filter(e=>e.eventDate&&new Date(e.eventDate)<new Date()).map(e=>{
            const ev = {...e, posterUrl:e.posterPath||null, postedBy:e.admin?.officeName||"Surigao PIO"};
            const [hovered,setHovered] = [false,()=>{}];
            const dateStr = e.eventDate?new Date(e.eventDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"";
            return (
              <div key={e.eventID} style={{background:DS.card,borderRadius:12,overflow:"hidden",boxShadow:DS.shadow,border:`1px solid ${DS.border}`,opacity:0.85}}>
                <div style={{height:140,background:"linear-gradient(135deg,#4A5568,#2D3748)",overflow:"hidden",position:"relative"}}>
                  {e.posterPath?<img src={e.posterPath} alt={e.title} style={{width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(40%)"}}/>:
                    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><ImageIcon/></div>}
                  <div style={{position:"absolute",top:10,left:10,background:"rgba(0,0,0,0.7)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:DS.font}}>EVENT DONE</div>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{fontWeight:700,fontSize:12,color:DS.textMuted,marginBottom:8,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.35}}>{e.title}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <InfoRow icon={<MapPinIcon/>} label="Location" value={e.location?.length>22?e.location.slice(0,22)+"…":e.location}/>
                    <InfoRow icon={<CalendarIcon/>} label="Date" value={dateStr}/>
                    <InfoRow icon={<UserIcon/>} label="By" value={e.admin?.officeName||"Surigao PIO"}/>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading&&approvedEvents.filter(e=>e.eventDate&&new Date(e.eventDate)<new Date()).length===0&&(
            <div style={{gridColumn:"1 / -1",background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><CalendarIcon/></div>
              No past events yet.
            </div>
          )}
        </div>
      )}

      {/* VALIDATION TAB */}
      {activeTab==="VALIDATION"&&(
        pendingEvents.length===0&&!loading?(
          <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
            <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:"#38A169"}}><CheckIcon/></div>
            All events have been reviewed. No pending approvals.
          </div>
        ):(
          <>
            <div style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,color:"#92400E",fontFamily:DS.font,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:"#D97706",flexShrink:0,display:"flex"}}><InfoIcon/></span>
              <strong>{pendingEvents.length} event{pendingEvents.length>1?"s":""}</strong> waiting for approval. Approved events are immediately visible to the public.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {pendingEvents.map(e=><ValidationCard key={e.eventID} event={e} onApprove={handleApprove} onDecline={setDeclineTarget}/>)}
            </div>
          </>
        )
      )}

      {selectedEvent&&<EventDetailsModal event={selectedEvent} onClose={()=>setSelectedEvent(null)}/>}
      {declineTarget&&<DeclineModal event={declineTarget} onClose={()=>setDeclineTarget(null)} onConfirm={handleDecline}/>}
    </SuperAdminLayout>
  );
}

export default SuperAdminEvent;
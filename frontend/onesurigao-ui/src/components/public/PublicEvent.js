// src/components/public/PublicEvent.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../ReusableBar/PublicLayoutModern";

const API_URL = "http://127.0.0.1:8000/public/events/";

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
const MODAL_OVERLAY = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.38)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 18,
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const MapPinIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const CalendarIcon  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const UserIcon      = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const ArrowUpRightIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>);
const ImageIcon     = () => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const XIcon         = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

// ─── InfoRow ──────────────────────────────────────────────────────────────────
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
    {count !== undefined && (
      <span style={{background:active?"rgba(255,255,255,0.25)":DS.primaryLight,color:active?"#fff":DS.primary,borderRadius:12,padding:"1px 8px",fontSize:11,fontWeight:700}}>{count}</span>
    )}
  </button>
);

// ─── Event Details Modal ──────────────────────────────────────────────────────
const EventDetailsModal = ({ event, onClose }) => {
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}) : "";
  const timeStr = event.eventDate ? new Date(event.eventDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "";
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={MODAL_OVERLAY}>
      <div style={{background:"linear-gradient(180deg,#FFFFFF 0%, #F8FBFF 100%)",border:"1px solid rgba(226,232,240,0.9)",borderRadius:30,width:"100%",maxWidth:560,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 28px 70px rgba(15,23,42,0.18)",overflow:"hidden"}}>
        {event.posterUrl ? (
          <div style={{position:"relative",height:220,flexShrink:0}}>
            <img src={event.posterUrl} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))"}}/>
            <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.5)",border:"none",color:"#fff",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
            <div style={{position:"absolute",bottom:16,left:20,color:"#fff",fontWeight:800,fontSize:18,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.5,textShadow:"0 2px 8px rgba(0,0,0,0.6)"}}>{event.title}</div>
          </div>
        ) : (
          <div style={{padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,borderBottom:`1px solid ${DS.border}`,background:"linear-gradient(180deg,#FFFFFF 0%, #F7FBFF 100%)"}}>
            <span style={{color:DS.textPrimary,fontWeight:700,fontSize:16,fontFamily:DS.font}}>Event Details</span>
            <button onClick={onClose} style={{background:"#F5F8FC",border:`1px solid ${DS.border}`,color:DS.textSecondary,borderRadius:12,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
          </div>
        )}
        <div style={{overflowY:"auto",flex:1,padding:24}}>
          {!event.posterUrl && <h2 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.5}}>{event.title}</h2>}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18,background:DS.bg,borderRadius:10,padding:"14px 16px"}}>
            <InfoRow icon={<MapPinIcon/>} label="Location" value={event.location}/>
            <InfoRow icon={<CalendarIcon/>} label="Date" value={`${dateStr}${timeStr?" at "+timeStr:""}`}/>
            <InfoRow icon={<UserIcon/>} label="Posted By" value={event.admin?.officeName||"Surigao PIO"}/>
          </div>
          {event.description && (
            <div>
              <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8,fontFamily:DS.font}}>About this Event</div>
              <p style={{fontSize:14,color:DS.textSecondary,lineHeight:1.75,fontFamily:DS.font,margin:0}}>{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Event Card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, onClick, isPast = false }) => {
  const [hovered, setHovered] = useState(false);
  const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  const posterUrl = event.posterPath || event.posterUrl || null;

  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{background:DS.card,borderRadius:12,overflow:"hidden",boxShadow:hovered?DS.shadowHover:DS.shadow,border:`1px solid ${DS.border}`,transition:"box-shadow 0.2s, transform 0.2s",transform:hovered?"translateY(-2px)":"translateY(0)",opacity:isPast?0.82:1}}>

      {/* Poster */}
      <div style={{height:140,background:isPast?"linear-gradient(135deg,#4A5568,#2D3748)":DS.primaryGrad,overflow:"hidden",position:"relative"}}>
        {posterUrl ? (
          <img src={posterUrl} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s",transform:hovered?"scale(1.04)":"scale(1)",filter:isPast?"grayscale(50%)":"none"}}/>
        ) : (
          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><ImageIcon/></div>
        )}
        {isPast && (
          <div style={{position:"absolute",top:10,left:10,background:"rgba(0,0,0,0.7)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,fontFamily:DS.font,letterSpacing:0.5}}>
            EVENT DONE
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{padding:"12px 14px"}}>
        <div style={{fontWeight:700,fontSize:12,color:isPast?DS.textMuted:DS.textPrimary,marginBottom:8,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.35}}>{event.title}</div>
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
function PublicEvent() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedEvent, setSelected]= useState(null);
  const [activeTab, setActiveTab]   = useState("UPCOMING");

  useEffect(()=>{
    axios.get(API_URL)
      .then(res=>{setEvents(Array.isArray(res.data)?res.data:res.data.results||[]);setError(null);})
      .catch(()=>setError("Failed to load events."))
      .finally(()=>setLoading(false));
  },[]);

  const now = new Date();
  const upcomingEvents = events.filter(e=>e.eventDate&&new Date(e.eventDate)>=now);
  const pastEvents     = events.filter(e=>e.eventDate&&new Date(e.eventDate)<now);
  const displayEvents  = activeTab==="UPCOMING"?upcomingEvents:pastEvents;

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>
            {activeTab==="UPCOMING"?"Upcoming Events":"Past Events"}
          </h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>
            {activeTab==="UPCOMING"?"Community gatherings, holidays and official schedules":"Events that have already taken place"}
          </p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <TabButton label="Upcoming" active={activeTab==="UPCOMING"} onClick={()=>setActiveTab("UPCOMING")} count={loading?undefined:upcomingEvents.length}/>
          <TabButton label="Past Events" active={activeTab==="PAST"} onClick={()=>setActiveTab("PAST")} count={loading?undefined:pastEvents.length}/>
        </div>
      </div>

      {error&&<div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:8,padding:"12px 16px",marginBottom:14,fontSize:13,color:"#C53030",fontFamily:DS.font}}>⚠️ {error}</div>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {loading&&[1,2,3,4,5,6].map(i=><EventSkeleton key={i}/>)}
        {!loading&&displayEvents.map(e=><EventCard key={e.eventID||e.id} event={e} onClick={setSelected} isPast={activeTab==="PAST"}/>)}
        {!loading&&!error&&displayEvents.length===0&&(
          <div style={{gridColumn:"1 / -1",background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
            <div style={{marginBottom:12,display:"flex",justifyContent:"center",color:DS.textMuted}}><CalendarIcon/></div>
            {activeTab==="UPCOMING"?"No upcoming events at the moment.":"No past events to show."}
          </div>
        )}
      </div>

      {selectedEvent&&<EventDetailsModal event={selectedEvent} onClose={()=>setSelected(null)}/>}
    </Layout>
  );
}

export default PublicEvent;

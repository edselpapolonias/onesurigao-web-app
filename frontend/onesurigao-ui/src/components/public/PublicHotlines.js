// src/components/public/PublicHotlines.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../ReusableBar/PublicLayout";

const API_URL = "http://127.0.0.1:8000/public/hotline-categories/";

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
  font:         "'Segoe UI', system-ui, sans-serif",
};

const PhoneIcon    = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const ChevronIcon  = ({ open }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{transition:"transform 0.25s",transform:open?"rotate(180deg)":"rotate(0deg)"}}><polyline points="6 9 12 15 18 9"/></svg>);
const HeadphonesIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>);
const AlertTriangleIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);

const HotlineCard = ({ hotline }) => (
  <div style={{background:DS.card,border:`1.5px solid ${DS.border}`,borderRadius:10,padding:"14px 16px",transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=DS.primary;e.currentTarget.style.boxShadow=DS.shadowHover;e.currentTarget.style.transform="translateY(-1px)";}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=DS.border;e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
    <div style={{fontWeight:700,fontSize:12,color:DS.textPrimary,fontFamily:DS.font,marginBottom:8,textTransform:"uppercase",letterSpacing:0.4,lineHeight:1.35}}>{hotline.name}</div>
    <div style={{display:"flex",alignItems:"center",gap:7}}>
      <span style={{color:DS.primary,flexShrink:0,display:"flex"}}><PhoneIcon/></span>
      <a href={`tel:${hotline.contactNumber}`} style={{color:DS.textSecondary,textDecoration:"none",fontSize:13,fontFamily:DS.font,fontWeight:600,transition:"color 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.color=DS.primary}
        onMouseLeave={e=>e.currentTarget.style.color=DS.textSecondary}>
        {hotline.contactNumber}
      </a>
    </div>
  </div>
);

const CategoryAccordion = ({ category, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,marginBottom:12,overflow:"hidden",border:`1px solid ${DS.border}`,transition:"box-shadow 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=DS.shadowHover}
      onMouseLeave={e=>e.currentTarget.style.boxShadow=DS.shadow}>
      <div onClick={()=>setOpen(!open)} style={{padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:open?"#F7FAFF":DS.card,transition:"background 0.2s",userSelect:"none"}}
        onMouseEnter={e=>e.currentTarget.style.background="#EBF4FF"}
        onMouseLeave={e=>e.currentTarget.style.background=open?"#F7FAFF":DS.card}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:DS.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{category.icon}</div>
          <span style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.5}}>{category.name}</span>
          <span style={{fontSize:11,background:DS.primaryLight,color:DS.primary,borderRadius:12,padding:"2px 8px",fontWeight:700,fontFamily:DS.font}}>{category.hotlines.length}</span>
        </div>
        <span style={{color:DS.textMuted,display:"flex"}}><ChevronIcon open={open}/></span>
      </div>
      {open&&(
        <div style={{padding:"4px 18px 18px",borderTop:`1px solid ${DS.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginTop:14}}>
            {category.hotlines.map(h=><HotlineCard key={h.id} hotline={h}/>)}
            {category.hotlines.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",color:DS.textMuted,fontSize:13,fontFamily:DS.font,padding:"16px 0"}}>No hotlines in this category yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const Skeleton = () => (
  <div style={{background:DS.card,borderRadius:12,padding:"14px 18px",marginBottom:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
    <div style={{height:13,width:"40%",background:"#EDF2F7",borderRadius:6,animation:"pulse 1.5s ease-in-out infinite"}}/>
  </div>
);

function PublicHotlines() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(()=>{
    axios.get(API_URL)
      .then(res=>{setCategories(Array.isArray(res.data)?res.data:res.data.results||[]);setError(null);})
      .catch(()=>setError("Failed to load hotlines."))
      .finally(()=>setLoading(false));
  },[]);

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{marginBottom:20}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>Hotlines</h2>
        <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>Emergency contacts and city service hotlines</p>
      </div>

      {/* Emergency Banner */}
      <div style={{background:"linear-gradient(135deg,#FFF5F5,#FED7D7)",border:"1.5px solid #FEB2B2",borderRadius:12,padding:"18px 22px",marginBottom:20,display:"flex",alignItems:"flex-start",gap:16}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#C53030,#9B2C2C)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(197,48,48,0.3)",color:"#fff"}}>
          <AlertTriangleIcon/>
        </div>
        <div>
          <div style={{fontWeight:800,fontSize:16,color:"#C53030",fontFamily:DS.font,marginBottom:4}}>Emergency Response Center</div>
          <div style={{fontSize:13,color:"#742A2A",fontFamily:DS.font,lineHeight:1.65,marginBottom:10}}>
            In case of immediate emergency, please dial 911 or the local emergency hotline immediately. Keep these numbers saved in your phone.
          </div>
          <div style={{fontWeight:900,fontSize:38,color:"#C53030",fontFamily:DS.font,letterSpacing:3,lineHeight:1}}>911</div>
        </div>
      </div>

      {/* Directory Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700,color:DS.textPrimary,fontFamily:DS.font,borderLeft:`4px solid ${DS.primary}`,paddingLeft:12}}>Directory of Services</h3>
        <div style={{display:"flex",alignItems:"center",gap:7,background:DS.primaryGrad,borderRadius:20,padding:"7px 16px",color:"#fff",fontSize:12,fontWeight:600,fontFamily:DS.font,boxShadow:"0 2px 8px rgba(43,108,176,0.3)"}}>
          <HeadphonesIcon/> Customer Service
        </div>
      </div>

      {error&&<div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:8,padding:"12px 16px",marginBottom:14,fontSize:13,color:"#C53030",fontFamily:DS.font}}>⚠️ {error}</div>}
      {loading&&[1,2,3].map(i=><Skeleton key={i}/>)}
      {!loading&&!error&&categories.length===0&&(
        <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
          <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><PhoneIcon/></div>
          No hotlines available yet.
        </div>
      )}
      {!loading&&categories.map((cat,i)=><CategoryAccordion key={cat.id} category={cat} defaultOpen={i===0}/>)}
    </Layout>
  );
}

export default PublicHotlines;
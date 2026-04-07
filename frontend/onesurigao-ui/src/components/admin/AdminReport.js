// src/components/admin/AdminReport.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../ReusableBar/Layout";
import MediaGallery from "../ReusableBar/MediaGallery";
import { apiClient } from "../../services/authService";

const BASE = "http://127.0.0.1:8000/public";

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
  shadowModal:   "0 24px 80px rgba(0,0,0,0.28)",
  font:          "'Segoe UI', system-ui, sans-serif",
};
const STATUS = {
  color: { pending:"#D97706", approved:"#2B6CB0", declined:"#DC2626", responded:"#2B6CB0", resolved:"#16A34A" },
  label: { pending:"Pending", approved:"Awaiting Response", declined:"Declined", responded:"Responded", resolved:"Resolved" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const XIcon        = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const SendIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const CheckCircle  = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const MapPinIcon   = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const ClockIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const FileTextIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>);
const MessageIcon  = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const ClipboardIcon= () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>);

const StatusBadge = ({ status }) => (
  <span style={{background:(STATUS.color[status]||"#aaa")+"18",color:STATUS.color[status]||"#aaa",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,fontFamily:DS.font,whiteSpace:"nowrap",border:`1px solid ${(STATUS.color[status]||"#aaa")}30`}}>
    {STATUS.label[status]||status}
  </span>
);

// ─── Resolve Modal ────────────────────────────────────────────────────────────
const ResolveModal = ({ report, onClose, onConfirm }) => {
  const [resolving, setResolving] = useState(false);
  const handleConfirm = async () => { setResolving(true); await onConfirm(report.reportID); setResolving(false); onClose(); };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20,backdropFilter:"blur(2px)"}}>
      <div style={{background:DS.card,borderRadius:16,width:"100%",maxWidth:460,boxShadow:DS.shadowModal,overflow:"hidden",animation:"slideUp 0.25s ease"}}>
        <div style={{background:"linear-gradient(135deg,#276749,#38A169)",padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:"#fff",fontWeight:800,fontSize:15,fontFamily:DS.font}}>Mark as Resolved</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
        </div>
        <div style={{padding:"28px",textAlign:"center"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"#F0FDF4",border:"2px solid #9AE6B4",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"#16A34A"}}><CheckCircle/></div>
          <h3 style={{margin:"0 0 8px",fontSize:16,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font}}>Confirm Resolution</h3>
          <p style={{margin:"0 0 22px",fontSize:13,color:DS.textMuted,fontFamily:DS.font,lineHeight:1.65}}>
            Are you sure this report has been fully resolved? The community member will be notified.
          </p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"11px",background:DS.bg,border:`1.5px solid ${DS.border}`,borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textSecondary,fontFamily:DS.font}}>Cancel</button>
            <button onClick={handleConfirm} disabled={resolving} style={{flex:2,padding:"11px",background:resolving?"#9AB8E0":"linear-gradient(135deg,#276749,#38A169)",color:"#fff",border:"none",borderRadius:9,cursor:resolving?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              {resolving?"Resolving...":<><CheckCircle/>Mark as Resolved</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Report Detail Modal ──────────────────────────────────────────────────────
const ReportDetailModal = ({ report, onClose, onRespond, onResolve, onRefresh }) => {
  const [activeTab, setActiveTab]     = useState("details");
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [showResolve, setShowResolve] = useState(false);

  const isResolved    = report.isResolved||report.status==="resolved";
  const responseCount = report.adminResponses?.length||0;
  const galleryMedia  = (report.media||[]).map(m=>({file:m.file,mediaType:m.mediaType}));

  const handleSubmitResponse = async () => {
    if(!newResponse.trim()){return;}
    setSubmitting(true);
    await onRespond(report.reportID,newResponse);
    setNewResponse(""); setSubmitting(false); onRefresh();
  };

  const handleResolveConfirm = async id => { await onResolve(id); onRefresh(); };

  const TabBtn = ({ id, label, icon, badge }) => (
    <button onClick={()=>setActiveTab(id)} style={{flex:1,padding:"13px 10px",border:"none",cursor:"pointer",fontSize:13,fontWeight:activeTab===id?700:500,background:"transparent",color:activeTab===id?DS.primary:DS.textMuted,fontFamily:DS.font,borderBottom:`2.5px solid ${activeTab===id?DS.primary:"transparent"}`,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      {icon}{label}
      {badge>0&&<span style={{background:activeTab===id?DS.primary:"#EDF2F7",color:activeTab===id?"#fff":DS.textMuted,borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{badge}</span>}
    </button>
  );

  return (
    <>
      <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(2px)"}}>
        <div style={{background:DS.card,borderRadius:16,width:"100%",maxWidth:700,maxHeight:"94vh",display:"flex",flexDirection:"column",boxShadow:DS.shadowModal,overflow:"hidden",animation:"slideUp 0.25s ease"}}>

          {/* Header */}
          <div style={{background:DS.primaryGrad,padding:"20px 26px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
            <div>
              <div style={{color:"#fff",fontWeight:800,fontSize:17,fontFamily:DS.font}}>Report #{report.reportID}</div>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:12,fontFamily:DS.font,marginTop:3}}>{report.report} · {report.barangay}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,fontFamily:DS.font,border:"1px solid rgba(255,255,255,0.3)"}}>
                {STATUS.label[report.status]||report.status}
              </span>
              <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.3)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>
                <XIcon/>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${DS.border}`,background:DS.card,flexShrink:0}}>
            <TabBtn id="details" label="Report Details" icon={<FileTextIcon/>}/>
            <TabBtn id="response" label="Responses" icon={<MessageIcon/>} badge={responseCount}/>
          </div>

          {/* Body */}
          <div style={{overflowY:"auto",flex:1}}>

            {/* DETAILS TAB */}
            {activeTab==="details"&&(
              <div style={{padding:"22px 26px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  {[
                    {label:"Submitted By",value:report.publicUser?`${report.publicUser.name} ${report.publicUser.lastName}`:"Anonymous"},
                    {label:"Date Submitted",value:new Date(report.submittedDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})},
                    {label:"Barangay",value:report.barangay},
                    {label:"Exact Location",value:report.location},
                  ].map(({label,value})=>(
                    <div key={label} style={{background:DS.bg,borderRadius:8,padding:"10px 14px"}}>
                      <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>{label}</div>
                      <div style={{fontSize:13,color:DS.textPrimary,fontFamily:DS.font,fontWeight:500}}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#EBF4FF",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
                  <div style={{fontSize:10,color:DS.primary,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>Problem</div>
                  <div style={{fontSize:14,color:DS.primaryDark,fontFamily:DS.font,fontWeight:700}}>{report.report}</div>
                </div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8}}>Description</div>
                  <div style={{fontSize:13,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.75,background:DS.bg,borderRadius:8,padding:"12px 14px"}}>{report.description}</div>
                </div>
                {galleryMedia.length>0?(
                  <div>
                    <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8}}>
                      Attached Evidence ({galleryMedia.length} file{galleryMedia.length>1?"s":""})
                    </div>
                    <div style={{margin:"0 -4px"}}><MediaGallery media={galleryMedia}/></div>
                  </div>
                ):(
                  <div style={{background:DS.bg,borderRadius:8,padding:"18px",textAlign:"center",color:DS.textMuted,fontSize:13,fontFamily:DS.font}}>No media attached to this report.</div>
                )}
              </div>
            )}

            {/* RESPONSE TAB */}
            {activeTab==="response"&&(
              <div style={{padding:"22px 26px"}}>
                {isResolved&&(
                  <div style={{background:"#F0FDF4",border:"1.5px solid #9AE6B4",borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13,color:"#276749",fontFamily:DS.font,display:"flex",alignItems:"center",gap:8}}>
                    <CheckCircle/> <span><strong>Resolved</strong> on {new Date(report.resolvedDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
                  </div>
                )}

                {responseCount>0?(
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:12,fontFamily:DS.font}}>Response History ({responseCount})</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {report.adminResponses.map((r,i)=>(
                        <div key={i} style={{background:DS.bg,border:`1px solid ${DS.border}`,borderRadius:10,padding:"12px 16px",fontFamily:DS.font}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <span style={{fontSize:11,fontWeight:700,color:DS.primary,background:DS.primaryLight,padding:"2px 8px",borderRadius:10}}>Response #{i+1} — {r.office}</span>
                            <span style={{fontSize:11,color:DS.textMuted}}>{new Date(r.date).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                          </div>
                          <div style={{fontSize:13,color:DS.textSecondary,lineHeight:1.7}}>{r.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ):(!isResolved&&(
                  <div style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:10,padding:"14px 16px",marginBottom:18,fontSize:13,color:"#92400E",fontFamily:DS.font,display:"flex",alignItems:"center",gap:8}}>
                    <ClockIcon/> No responses yet. Add the first response below.
                  </div>
                ))}

                {!isResolved&&(
                  <div style={{background:DS.bg,borderRadius:10,padding:"18px",border:`1.5px solid ${DS.border}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:DS.textMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10,fontFamily:DS.font}}>
                      {responseCount>0?"Add Another Response":"Add Response"}
                    </div>
                    <textarea value={newResponse} onChange={e=>setNewResponse(e.target.value)} rows={4}
                      placeholder="Describe the action taken, progress update, or additional info for the community member..."
                      style={{width:"100%",padding:"11px 14px",fontSize:13,border:`1.5px solid ${DS.border}`,borderRadius:8,outline:"none",boxSizing:"border-box",fontFamily:DS.font,resize:"vertical",minHeight:110,background:DS.card,color:DS.textPrimary,transition:"border-color 0.2s"}}
                      onFocus={e=>e.target.style.borderColor=DS.borderFocus} onBlur={e=>e.target.style.borderColor=DS.border}/>
                    <div style={{display:"flex",gap:10,marginTop:12}}>
                      <button onClick={handleSubmitResponse} disabled={submitting||!newResponse.trim()}
                        style={{flex:2,padding:"11px",background:submitting||!newResponse.trim()?"#9AB8E0":DS.primaryGrad,color:"#fff",border:"none",borderRadius:8,cursor:submitting||!newResponse.trim()?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        <SendIcon/>{submitting?"Sending...":"Send Response"}
                      </button>
                      {responseCount>0&&(
                        <button onClick={()=>setShowResolve(true)}
                          style={{flex:1,padding:"11px",background:"linear-gradient(135deg,#276749,#38A169)",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font,boxShadow:"0 2px 8px rgba(56,161,105,0.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                          <CheckCircle/>Resolve
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showResolve&&<ResolveModal report={report} onClose={()=>setShowResolve(false)} onConfirm={async id=>{await handleResolveConfirm(id);setShowResolve(false);onClose();}}/>}
    </>
  );
};

// ─── Report Card ──────────────────────────────────────────────────────────────
const ReportCard = ({ report, onClick }) => {
  const responseCount = report.adminResponses?.length||0;
  return (
    <div onClick={()=>onClick(report)}
      style={{background:DS.card,borderRadius:12,marginBottom:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`,borderLeft:`4px solid ${STATUS.color[report.status]||"#ddd"}`,cursor:"pointer",transition:"box-shadow 0.2s, transform 0.18s"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow=DS.shadowHover;e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow=DS.shadow;e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font}}>{report.report}</span>
            {report.media?.length>0&&<span style={{fontSize:11,background:DS.primaryLight,color:DS.primary,borderRadius:10,padding:"2px 8px",fontWeight:600,fontFamily:DS.font}}>{report.media.length} file{report.media.length>1?"s":""}</span>}
            {responseCount>0&&<span style={{fontSize:11,background:"#F0FDF4",color:"#276749",borderRadius:10,padding:"2px 8px",fontWeight:600,fontFamily:DS.font}}>{responseCount} response{responseCount>1?"s":""}</span>}
          </div>
          <div style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font,marginBottom:2,display:"flex",alignItems:"center",gap:5}}><MapPinIcon/>{report.barangay} · {report.location?.length>35?report.location.slice(0,35)+"…":report.location}</div>
          <div style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font,display:"flex",alignItems:"center",gap:5}}>
            By {report.publicUser?`${report.publicUser.name} ${report.publicUser.lastName}`:"Anonymous"} · {new Date(report.submittedDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
          <StatusBadge status={report.status}/>
          <span style={{fontSize:11,color:DS.textMuted,fontFamily:DS.font}}>View →</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminReport() {
  const location   = useLocation();
  const adminID    = location.state?.adminID||Number(sessionStorage.getItem("adminID"))||null;
  const officeName = location.state?.officeName||sessionStorage.getItem("officeName")||"";

  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = () => {
    setLoading(true);
    apiClient.get("/public/reports/")
      .then(res=>{const all=Array.isArray(res.data)?res.data:res.data.results||[];setReports(all.filter(r=>r.assignedTo?.adminID===adminID));})
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{fetchReports();},[adminID]);

  const handleRespond = async (reportID,response) => { await apiClient.patch(`/public/reports/${reportID}/respond/`, { adminResponse: response }); };
  const handleResolve = async reportID => { await apiClient.patch(`/public/reports/${reportID}/resolve/`); };
  const handleRefresh = () => {
    fetchReports();
    if(selectedReport) { apiClient.get(`/public/reports/${selectedReport.reportID}/`).then(res=>setSelectedReport(res.data)).catch(()=>{}); }
  };

  const filtered = filter==="all"?reports:filter==="active"?reports.filter(r=>r.status==="approved"||r.status==="responded"):reports.filter(r=>r.status==="resolved");
  const awaitingCount = reports.filter(r=>r.status==="approved"||r.status==="responded").length;
  const resolvedCount = reports.filter(r=>r.status==="resolved").length;

  const FilterBtn = ({ val, label, count }) => (
    <button onClick={()=>setFilter(val)} style={{padding:"7px 16px",borderRadius:8,border:`1.5px solid ${filter===val?DS.primary:DS.border}`,cursor:"pointer",fontSize:12,fontWeight:filter===val?700:500,background:filter===val?DS.primaryGrad:DS.card,color:filter===val?"#fff":DS.textSecondary,fontFamily:DS.font,boxShadow:filter===val?"0 2px 8px rgba(43,108,176,0.3)":DS.shadow,transition:"all 0.2s",display:"flex",alignItems:"center",gap:6}}>
      {label}{count>0&&<span style={{background:filter===val?"rgba(255,255,255,0.25)":"#EDF2F7",color:filter===val?"#fff":DS.textMuted,borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{count}</span>}
    </button>
  );

  return (
    <Layout>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>Assigned Reports</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>Community reports assigned to your office</p>
          {officeName&&<p style={{margin:"4px 0 0",fontSize:12,color:DS.primary,fontFamily:DS.font,fontWeight:600}}>Logged in as: {officeName}</p>}
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        <FilterBtn val="all" label="All" count={reports.length}/>
        <FilterBtn val="active" label="Active" count={awaitingCount}/>
        <FilterBtn val="resolved" label="Resolved" count={resolvedCount}/>
      </div>

      {loading&&<div style={{color:DS.textMuted,fontSize:13,fontFamily:DS.font}}>Loading reports...</div>}

      {!loading&&filtered.length===0&&(
        <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
          <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><ClipboardIcon/></div>
          {filter==="all"?"No reports assigned to your office yet.":`No ${filter==="resolved"?"resolved":"active"} reports.`}
        </div>
      )}

      {!loading&&filtered.map(r=><ReportCard key={r.reportID} report={r} onClick={setSelectedReport}/>)}

      {selectedReport&&(
        <ReportDetailModal report={selectedReport}
          onClose={()=>{setSelectedReport(null);fetchReports();}}
          onRespond={handleRespond} onResolve={handleResolve} onRefresh={handleRefresh}/>
      )}
    </Layout>
  );
}

export default AdminReport;

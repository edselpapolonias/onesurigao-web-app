// src/components/superadmin/SuperAdminReport.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import SuperAdminLayout from "../ReusableBar/SuperAdminLayout";
import { apiClient } from "../../services/authService";

const BASE       = "http://127.0.0.1:8000/public";
const ADMINS_URL = "http://127.0.0.1:8000/api/admins/";

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
  label: { pending:"Pending", approved:"Approved", declined:"Declined", responded:"Responded", resolved:"Resolved" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon    = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const XIcon        = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const MapPinIcon   = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const ClockIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const ClipboardIcon= () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>);
const InfoIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);

const StatusBadge = ({ status }) => (
  <span style={{background:(STATUS.color[status]||"#aaa")+"18",color:STATUS.color[status]||"#aaa",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,fontFamily:DS.font,whiteSpace:"nowrap",border:`1px solid ${(STATUS.color[status]||"#aaa")}30`}}>
    {STATUS.label[status]||status}
  </span>
);

// ─── Report Detail Modal ──────────────────────────────────────────────────────
const ReportDetailModal = ({ report, admins, superAdminID, onClose, onApprove, onDecline }) => {
  const [assignedTo, setAssignedTo]       = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [mode, setMode]                   = useState(null); // "approve"|"decline"
  const [submitting, setSubmitting]       = useState(false);

  const handleApprove = async () => {
    if(!assignedTo){alert("Please select an office.");return;}
    setSubmitting(true); await onApprove(report.reportID,Number(assignedTo),superAdminID); setSubmitting(false); onClose();
  };
  const handleDecline = async () => {
    if(!declineReason.trim()){alert("Please provide a reason.");return;}
    setSubmitting(true); await onDecline(report.reportID,declineReason,superAdminID); setSubmitting(false); onClose();
  };

  const inputSt = {width:"100%",padding:"10px 14px",fontSize:13,border:`1.5px solid ${DS.border}`,borderRadius:8,outline:"none",boxSizing:"border-box",fontFamily:DS.font,background:DS.card,color:DS.textPrimary};

  return (
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

        <div style={{overflowY:"auto",flex:1,padding:"22px 26px"}}>

          {/* Info Grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[
              {label:"Submitted By",value:report.publicUser?`${report.publicUser.name} ${report.publicUser.lastName}`:"Anonymous"},
              {label:"Date",value:new Date(report.submittedDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})},
              {label:"Barangay",value:report.barangay},
              {label:"Location",value:report.location},
            ].map(({label,value})=>(
              <div key={label} style={{background:DS.bg,borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>{label}</div>
                <div style={{fontSize:13,color:DS.textPrimary,fontFamily:DS.font,fontWeight:500}}>{value}</div>
              </div>
            ))}
          </div>

          {/* Problem */}
          <div style={{background:"#EBF4FF",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
            <div style={{fontSize:10,color:DS.primary,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>Problem</div>
            <div style={{fontSize:14,color:DS.primaryDark,fontFamily:DS.font,fontWeight:700}}>{report.report}</div>
          </div>

          {/* Description */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8}}>Description</div>
            <div style={{fontSize:13,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.75,background:DS.bg,borderRadius:8,padding:"12px 14px"}}>{report.description}</div>
          </div>

          {/* Media */}
          {report.media&&report.media.length>0&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:10,color:DS.textMuted,fontFamily:DS.font,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10}}>Attached Evidence</div>
              <div style={{display:"grid",gridTemplateColumns:report.media.length===1?"1fr":"1fr 1fr 1fr",gap:8}}>
                {report.media.slice(0,6).map((m,i)=>(
                  m.mediaType==="image"?(
                    <img key={i} src={m.file} alt="" style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",borderRadius:8,border:`1px solid ${DS.border}`,cursor:"pointer"}} onClick={()=>window.open(m.file,"_blank")}/>
                  ):(
                    <video key={i} src={m.file} controls style={{width:"100%",aspectRatio:"4/3",borderRadius:8,background:"#000"}}/>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Validation actions */}
          {report.status==="pending"&&(
            <div style={{background:DS.bg,borderRadius:12,padding:"18px",border:`1.5px solid ${DS.border}`}}>
              <div style={{fontSize:12,fontWeight:700,color:DS.textPrimary,marginBottom:14,fontFamily:DS.font}}>Validate this Report</div>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                <button onClick={()=>setMode(mode==="approve"?null:"approve")}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:mode==="approve"?"linear-gradient(135deg,#276749,#38A169)":"#F0FDF4",border:`1.5px solid ${mode==="approve"?"#38A169":"#9AE6B4"}`,borderRadius:8,padding:"11px",cursor:"pointer",fontSize:13,fontWeight:700,color:mode==="approve"?"#fff":"#276749",fontFamily:DS.font,transition:"all 0.2s"}}>
                  <CheckIcon/> Approve
                </button>
                <button onClick={()=>setMode(mode==="decline"?null:"decline")}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:mode==="decline"?"linear-gradient(135deg,#9B2C2C,#C53030)":"#FFF5F5",border:`1.5px solid ${mode==="decline"?"#C53030":"#FEB2B2"}`,borderRadius:8,padding:"11px",cursor:"pointer",fontSize:13,fontWeight:700,color:mode==="decline"?"#fff":"#C53030",fontFamily:DS.font,transition:"all 0.2s"}}>
                  <XIcon/> Decline
                </button>
              </div>

              {mode==="approve"&&(
                <div style={{background:"#F0FDF4",border:"1.5px solid #9AE6B4",borderRadius:10,padding:"16px",animation:"slideUp 0.2s ease"}}>
                  <label style={{display:"block",marginBottom:8,fontWeight:600,fontSize:11,color:"#276749",fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6}}>Assign to Office <span style={{color:"#DC2626"}}>*</span></label>
                  <select value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} style={{...inputSt,marginBottom:12,cursor:"pointer",borderColor:"#9AE6B4"}}>
                    <option value="">Select Office</option>
                    {admins.map(a=><option key={a.adminID} value={a.adminID}>{a.officeName}</option>)}
                  </select>
                  <button onClick={handleApprove} disabled={submitting||!assignedTo}
                    style={{width:"100%",padding:"11px",fontSize:13,fontWeight:700,background:submitting||!assignedTo?"#9AB8E0":"linear-gradient(135deg,#276749,#38A169)",color:"#fff",border:"none",borderRadius:8,cursor:submitting||!assignedTo?"not-allowed":"pointer",fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <CheckIcon/>{submitting?"Approving...":"Confirm Approval"}
                  </button>
                </div>
              )}

              {mode==="decline"&&(
                <div style={{background:"#FFF5F5",border:"1.5px solid #FEB2B2",borderRadius:10,padding:"16px",animation:"slideUp 0.2s ease"}}>
                  <label style={{display:"block",marginBottom:8,fontWeight:600,fontSize:11,color:"#C53030",fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6}}>Reason for Declining <span style={{color:"#DC2626"}}>*</span></label>
                  <textarea value={declineReason} onChange={e=>setDeclineReason(e.target.value)} rows={3} placeholder="Explain why this report is being declined..."
                    style={{...inputSt,resize:"vertical",marginBottom:12,borderColor:"#FEB2B2"}}
                    onFocus={e=>e.target.style.borderColor="#C53030"} onBlur={e=>e.target.style.borderColor="#FEB2B2"}/>
                  <button onClick={handleDecline} disabled={submitting||!declineReason.trim()}
                    style={{width:"100%",padding:"11px",fontSize:13,fontWeight:700,background:submitting||!declineReason.trim()?"#f08080":"linear-gradient(135deg,#9B2C2C,#C53030)",color:"#fff",border:"none",borderRadius:8,cursor:submitting||!declineReason.trim()?"not-allowed":"pointer",fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <XIcon/>{submitting?"Declining...":"Confirm Decline"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Already validated */}
          {report.status!=="pending"&&(
            <div style={{background:report.status==="declined"?"#FFF5F5":"#F0FDF4",border:`1.5px solid ${report.status==="declined"?"#FEB2B2":"#9AE6B4"}`,borderRadius:10,padding:"14px 16px",fontSize:13,color:report.status==="declined"?"#C53030":"#276749",fontFamily:DS.font,display:"flex",alignItems:"center",gap:8}}>
              {report.status==="declined"?<><XIcon/> Declined: {report.rejectionReason}</>:<><CheckIcon/>{report.status==="responded"?`Responded by ${report.assignedTo?.officeName}`:`Approved and assigned to ${report.assignedTo?.officeName}`}</>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Report Card ──────────────────────────────────────────────────────────────
const ReportCard = ({ report, onClick }) => (
  <div onClick={()=>onClick(report)}
    style={{background:DS.card,borderRadius:12,padding:"14px 18px",marginBottom:12,boxShadow:DS.shadow,border:`1px solid ${DS.border}`,borderLeft:`4px solid ${STATUS.color[report.status]||"#ddd"}`,cursor:"pointer",transition:"box-shadow 0.2s, transform 0.18s"}}
    onMouseEnter={e=>{e.currentTarget.style.boxShadow=DS.shadowHover;e.currentTarget.style.transform="translateY(-1px)";}}
    onMouseLeave={e=>{e.currentTarget.style.boxShadow=DS.shadow;e.currentTarget.style.transform="translateY(0)";}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
          <span style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font}}>{report.report}</span>
          {report.media?.length>0&&<span style={{fontSize:11,background:DS.primaryLight,color:DS.primary,borderRadius:10,padding:"2px 8px",fontWeight:600,fontFamily:DS.font}}>{report.media.length} file{report.media.length>1?"s":""}</span>}
        </div>
        <div style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font,marginBottom:2,display:"flex",alignItems:"center",gap:5}}><MapPinIcon/>{report.barangay} · {report.location?.length>40?report.location.slice(0,40)+"…":report.location}</div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
function SuperAdminReport() {
  const location     = useLocation();
  const superAdminID = location.state?.superAdminID||Number(sessionStorage.getItem("superAdminID"))||null;

  const [reports, setReports]             = useState([]);
  const [admins, setAdmins]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([apiClient.get("/public/reports/"), axios.get(ADMINS_URL)])
      .then(([rr,ar])=>{setReports(Array.isArray(rr.data)?rr.data:rr.data.results||[]);setAdmins(Array.isArray(ar.data)?ar.data:ar.data.results||[]);})
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{fetchAll();},[]);

  const handleApprove = async (reportID,assignedToID,superAdminID) => { await apiClient.patch(`/public/reports/${reportID}/approve/`,{assignedTo_id:assignedToID,superAdminID}); fetchAll(); };
  const handleDecline = async (reportID,reason,superAdminID) => { await apiClient.patch(`/public/reports/${reportID}/decline/`,{rejectionReason:reason,superAdminID}); fetchAll(); };

  const filtered      = filter==="all"?reports:reports.filter(r=>r.status===filter);
  const pendingCount  = reports.filter(r=>r.status==="pending").length;

  const FilterBtn = ({ val, label }) => (
    <button onClick={()=>setFilter(val)} style={{padding:"7px 16px",borderRadius:8,border:`1.5px solid ${filter===val?DS.primary:DS.border}`,cursor:"pointer",fontSize:12,fontWeight:filter===val?700:500,background:filter===val?DS.primaryGrad:DS.card,color:filter===val?"#fff":DS.textSecondary,fontFamily:DS.font,boxShadow:filter===val?"0 2px 8px rgba(43,108,176,0.3)":DS.shadow,transition:"all 0.2s"}}>
      {label}
    </button>
  );

  return (
    <SuperAdminLayout>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>Community Reports</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>Validate and assign community reports from residents</p>
        </div>
        {pendingCount>0&&(
          <div style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:8,padding:"8px 16px",fontSize:13,color:"#92400E",fontFamily:DS.font,display:"flex",alignItems:"center",gap:6}}>
            <ClockIcon/><strong>{pendingCount}</strong> report{pendingCount>1?"s":""} pending validation
          </div>
        )}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        <FilterBtn val="all" label={`All (${reports.length})`}/>
        <FilterBtn val="pending" label={`Pending (${reports.filter(r=>r.status==="pending").length})`}/>
        <FilterBtn val="approved" label={`Approved (${reports.filter(r=>r.status==="approved").length})`}/>
        <FilterBtn val="declined" label={`Declined (${reports.filter(r=>r.status==="declined").length})`}/>
        <FilterBtn val="responded" label={`Responded (${reports.filter(r=>r.status==="responded").length})`}/>
        <FilterBtn val="resolved" label={`Resolved (${reports.filter(r=>r.status==="resolved").length})`}/>
      </div>

      {loading&&<div style={{color:DS.textMuted,fontSize:13,fontFamily:DS.font}}>Loading reports...</div>}

      {!loading&&filtered.length===0&&(
        <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
          <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><ClipboardIcon/></div>
          No {filter==="all"?"":filter+" "}reports found.
        </div>
      )}

      {!loading&&filtered.map(r=><ReportCard key={r.reportID} report={r} onClick={setSelectedReport}/>)}

      {selectedReport&&(
        <ReportDetailModal report={selectedReport} admins={admins} superAdminID={superAdminID}
          onClose={()=>{setSelectedReport(null);fetchAll();}}
          onApprove={handleApprove} onDecline={handleDecline}/>
      )}
    </SuperAdminLayout>
  );
}

export default SuperAdminReport;

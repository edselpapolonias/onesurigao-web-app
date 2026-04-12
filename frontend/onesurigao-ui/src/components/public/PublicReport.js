// src/components/public/PublicReport.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { apiClient, loginPublicUser, logoutAll } from "../../services/authService";
import Layout from "../ReusableBar/PublicLayoutModern";
import { usePublicAuth } from "../ReusableBar/SurigaoHeader";
import MediaGallery from "../ReusableBar/MediaGallery";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import {
  buildMapTilerReverseGeocodeUrl,
  hasMapTilerKey,
  MAPTILER_ATTRIBUTION,
  MAPTILER_TILE_LAYER_OPTIONS,
  MAPTILER_TILE_URL,
} from "../../utils/maptiler";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const BASE = "http://127.0.0.1:8000/public";
const SURIGAO_CITY_CENTER = [9.7891, 125.4952];

const BARANGAYS = ["Anomar", "Balibayon", "Bonifacio", "Cagniog", "Canlanipa", "Capalayan", "Day-asan", "Ipil", "Lipata", "Mabini", "Mabua", "Mapawa", "Mat-i", "Punta Bilar", "Quezon", "Rizal", "Sabang", "Serna", "Silop", "Taft", "Togbongon", "Washington"];
const BARANGAY_COORDS = {
  "Anomar": [9.6803, 125.5034],
  "Balibayon": [9.7642, 125.5245],
  "Bonifacio": [9.7381, 125.4960],
  "Cagniog": [9.7619, 125.5045],
  "Canlanipa": [9.7759, 125.4928],
  "Capalayan": [9.7404, 125.5439],
  "Day-asan": [9.7726, 125.5508],
  "Ipil": [9.7922, 125.4396],
  "Lipata": [9.8128, 125.4553],
  "Mabini": [9.6988, 125.4817],
  "Mabua": [9.8098, 125.4409],
  "Mapawa": [9.7288, 125.5204],
  "Mat-i": [9.7182, 125.4768],
  "Punta Bilar": [9.8227, 125.4443],
  "Quezon": [9.7230, 125.5056],
  "Rizal": [9.7823, 125.4633],
  "Sabang": [9.7979, 125.4720],
  "Serna": [9.7243, 125.4832],
  "Silop": [9.7500, 125.5150],
  "Taft": [9.7847, 125.4975],
  "Togbongon": [9.7629, 125.4696],
  "Washington": [9.7843, 125.4887],
};
const PROBLEM_CATEGORIES = {
  "Infrastructure Issues": ["Damaged Road / Potholes", "Flooding / Poor Drainage", "Broken Streetlights", "Sidewalk Obstruction", "Unsafe Bridges"],
  "Transportation Problems": ["Traffic Congestion", "Illegal Parking", "Tricycle / Multicab Overloading", "No Proper Loading/Unloading Zone", "Reckless Driving"],
  "Environmental Issues": ["Improper Waste Disposal", "Uncollected Garbage", "Water Pollution", "Air Pollution", "Clogged Canals"],
  "Public Utilities": ["Power Interruption", "Water Supply Problem", "Internet Connectivity Issue"],
  "Safety & Security": ["Theft / Robbery", "Vandalism", "Noise Complaint", "Public Disturbance", "Lack of Police Presence"],
  "Health & Sanitation": ["Unsanitary Area", "Standing Water (Mosquito Risk)", "Stray Animals", "Lack of Clean Water"],
  "Public Services": ["Slow Government Service", "Lack of Facilities", "School-related Issues", "Health Center Concerns"],
  "Social Concerns": ["Poverty", "Homelessness", "Youth-related Issues", "Community Conflicts"],
  "Others": ["Other (please specify)"],
};

// ─── Design System ────────────────────────────────────────────────────────────
const DS = {
  primary: "#2B6CB0",
  primaryDark: "#1E4E8C",
  primaryLight: "#EBF4FF",
  primaryGrad: "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderFocus: "#2B6CB0",
  textPrimary: "#1A202C",
  textSecondary: "#4A5568",
  textMuted: "#718096",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover: "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal: "0 24px 80px rgba(0,0,0,0.28)",
  font: "'Segoe UI', system-ui, sans-serif",
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

const STATUS = {
  color: { pending: "#D97706", approved: "#2B6CB0", declined: "#DC2626", responded: "#2B6CB0", resolved: "#16A34A" },
  label: { pending: "Pending", approved: "Approved", declined: "Declined", responded: "Responded", resolved: "Resolved" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
const XIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const AlertIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const MapPinIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const ClockIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const FileTextIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>);
const ActivityIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>);
const CheckCircle = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>);
const XCircle = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>);

// ─── Shared input/label styles ────────────────────────────────────────────────
const inputSt = { width: "100%", padding: "10px 14px", fontSize: 13, border: `1.5px solid ${DS.border}`, borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: DS.font, background: DS.card, transition: "border-color 0.2s", color: DS.textPrimary };
const labelSt = { display: "block", marginBottom: 6, fontWeight: 600, fontSize: 11, color: DS.textMuted, fontFamily: DS.font, textTransform: "uppercase", letterSpacing: 0.6 };

const fetchAddress = async (lat, lon, setForm) => {
  if (!hasMapTilerKey) return;
  try {
    const res = await axios.get(buildMapTilerReverseGeocodeUrl(lat, lon));
    const feature = res.data?.features?.[0];
    if (feature?.place_name || feature?.text) {
      const locationLabel = feature.place_name || feature.text;
      setForm(prev => ({ ...prev, latitude: lat, longitude: lon, location: locationLabel }));
    }
  } catch (e) {
    console.error("Reverse geocoding failed", e);
  }
};

const PinDropper = ({ form, setForm }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
      fetchAddress(lat, lng, setForm);
    }
  });
  return form.latitude && form.longitude ? <Marker position={[form.latitude, form.longitude]} /> : null;
};

const MapAutoPanner = ({ barangay }) => {
  const map = useMap();
  const lastBarangayRef = useRef("");

  useEffect(() => {
    if (!barangay || !hasMapTilerKey || lastBarangayRef.current === barangay) return;

    lastBarangayRef.current = barangay;
    const coords = BARANGAY_COORDS[barangay];
    map.stop();
    if (coords) {
      map.setView(coords, 15, { animate: false });
    } else {
      map.setView(SURIGAO_CITY_CENTER, 13, { animate: false });
    }
  }, [barangay, map]);
  return null;
};

const MapTilerSetupNotice = ({ compact = false }) => (
  <div
    style={{
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: compact ? "12px" : "16px",
      background: "#F8FBFF",
      color: DS.textMuted,
      fontSize: 12,
      fontFamily: DS.font,
      textAlign: "center",
      lineHeight: 1.6,
    }}
  >
    Set `REACT_APP_MAPTILER_API_KEY` to enable the MapTiler map.
  </div>
);

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = ["Submit Report", "Verify Identity", "Review & Send"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
      {steps.map((label, i) => {
        const idx = i + 1, done = idx < currentStep, active = idx === currentStep;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, fontFamily: DS.font, background: done ? "#16A34A" : active ? DS.primaryGrad : "#EDF2F7", color: done || active ? "#fff" : "#A0AEC0", transition: "all 0.3s", boxShadow: active ? "0 4px 14px rgba(43,108,176,0.4)" : "none" }}>
                {done ? <CheckIcon /> : idx}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? DS.primary : done ? "#16A34A" : DS.textMuted, fontFamily: DS.font, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: idx < currentStep ? "#16A34A" : "#EDF2F7", maxWidth: 70, margin: "0 8px", marginBottom: 22, borderRadius: 2, transition: "background 0.3s" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Vertical Stepper ─────────────────────────────────────────────────────────
const VerticalStepper = ({ report }) => {
  const isDeclined = report.status === "declined";
  const isResolved = report.isResolved || report.status === "resolved";
  const hasResponses = report.adminResponses?.length > 0;
  const isApproved = ["approved", "responded", "resolved"].includes(report.status);

  const steps = [
    {
      key: "submitted", label: "Report Submitted",
      desc: `"${report.report}" submitted on ${new Date(report.submittedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
      done: true, color: DS.primary
    },
    {
      key: "validated",
      label: isDeclined ? "Report Declined" : report.status === "pending" ? "Awaiting Validation" : "Report Approved",
      desc: report.status === "pending" ? "Your report is under review by the Super Admin." : isDeclined ? `Declined — ${report.rejectionReason}` : `Approved and assigned to ${report.assignedTo?.officeName || "the concerned office"}.`,
      done: report.status !== "pending", color: isDeclined ? "#DC2626" : "#16A34A",
      icon: isDeclined ? <XCircle /> : report.status === "pending" ? <ClockIcon /> : <CheckCircle />
    },
    {
      key: "responded",
      label: hasResponses ? `Office Responses (${report.adminResponses.length})` : "Awaiting Office Response",
      desc: !isApproved ? "Available once your report is approved." : !hasResponses ? `Waiting for ${report.assignedTo?.officeName || "the assigned office"} to respond.` : null,
      done: hasResponses, color: "#D97706"
    },
    {
      key: "resolved", label: isResolved ? "Issue Resolved" : "Resolution",
      desc: isResolved ? `Resolved on ${new Date(report.resolvedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} by ${report.assignedTo?.officeName || "the office"}.` : "Will be marked resolved once the office confirms it has been addressed.",
      done: isResolved, color: "#16A34A",
      icon: isResolved ? <CheckCircle /> : null
    },
  ];

  return (
    <div style={{ paddingTop: 4 }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: step.done ? step.color : "#EDF2F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: step.done ? "#fff" : "#A0AEC0", flexShrink: 0, transition: "all 0.3s", boxShadow: step.done ? `0 2px 8px ${step.color}44` : "none" }}>
              {step.icon || (step.done ? <CheckIcon /> : i + 1)}
            </div>
            {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 32, background: step.done ? step.color : "#EDF2F7", margin: "4px 0", transition: "background 0.3s" }} />}
          </div>
          <div style={{ paddingBottom: 22, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: step.done ? DS.textPrimary : DS.textMuted, fontFamily: DS.font, marginBottom: 4 }}>{step.label}</div>
            {step.desc && (
              <div style={{ fontSize: 12, color: step.done ? DS.textSecondary : "#CBD5E0", fontFamily: DS.font, lineHeight: 1.65, background: step.done ? DS.bg : "transparent", borderRadius: 8, padding: step.done ? "8px 12px" : "0", border: step.done ? `1px solid ${DS.border}` : "none" }}>
                {step.desc}
              </div>
            )}
            {step.key === "responded" && hasResponses && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {report.adminResponses.map((r, idx) => (
                  <div key={idx} style={{ background: "#F0FDF4", border: "1px solid #9AE6B4", borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: DS.font }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#276749", background: "#C6F6D5", padding: "2px 8px", borderRadius: 10 }}>Update #{idx + 1} — {r.office}</span>
                      <span style={{ fontSize: 11, color: DS.textMuted }}>{new Date(r.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.6, color: "#276749" }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
            {step.key === "resolved" && isResolved && (
              <div style={{ marginTop: 8, background: "#F0FDF4", border: "1.5px solid #9AE6B4", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#276749", fontFamily: DS.font }}>
                Your concern has been fully addressed. Thank you for helping improve Surigao City!
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span style={{ background: (STATUS.color[status] || "#aaa") + "18", color: STATUS.color[status] || "#aaa", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: DS.font, whiteSpace: "nowrap", border: `1px solid ${(STATUS.color[status] || "#aaa")}33` }}>
    {STATUS.label[status] || status}
  </span>
);

// ─── Report Card ──────────────────────────────────────────────────────────────
const ReportCard = ({ report, onClick }) => {
  const responseCount = report.adminResponses?.length || 0;
  return (
    <div onClick={() => onClick(report)}
      style={{ background: DS.card, borderRadius: 12, marginBottom: 12, boxShadow: DS.shadow, border: `1px solid ${DS.border}`, borderLeft: `4px solid ${STATUS.color[report.status] || "#ddd"}`, cursor: "pointer", transition: "box-shadow 0.2s, transform 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = DS.shadowHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = DS.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: DS.textPrimary, fontFamily: DS.font }}>{report.report}</span>
            {report.media?.length > 0 && <span style={{ fontSize: 11, background: DS.primaryLight, color: DS.primary, borderRadius: 10, padding: "2px 8px", fontWeight: 600, fontFamily: DS.font }}>{report.media.length} file{report.media.length > 1 ? "s" : ""}</span>}
            {responseCount > 0 && <span style={{ fontSize: 11, background: "#F0FDF4", color: "#276749", borderRadius: 10, padding: "2px 8px", fontWeight: 600, fontFamily: DS.font }}>{responseCount} response{responseCount > 1 ? "s" : ""}</span>}
          </div>
          <div style={{ fontSize: 12, color: DS.textMuted, fontFamily: DS.font, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}><MapPinIcon />{report.barangay}</div>
          <div style={{ fontSize: 12, color: DS.textMuted, fontFamily: DS.font, display: "flex", alignItems: "center", gap: 5 }}><ClockIcon />{new Date(report.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <StatusBadge status={report.status} />
          <span style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.font }}>View details →</span>
        </div>
      </div>
    </div>
  );
};

// ─── Report Detail Modal (public) ─────────────────────────────────────────────
const LegacyReportDetailModal = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");
  const responseCount = report.adminResponses?.length || 0;
  const mediaList = report.media || [];

  const TabBtn = ({ id, label, icon, badge }) => (
    <button onClick={() => setActiveTab(id)} style={{ flex: 1, padding: "13px 10px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === id ? 700 : 500, background: "transparent", color: activeTab === id ? DS.primary : DS.textMuted, fontFamily: DS.font, borderBottom: `2.5px solid ${activeTab === id ? DS.primary : "transparent"}`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {icon}{label}
      {badge > 0 && <span style={{ background: activeTab === id ? DS.primary : "#EDF2F7", color: activeTab === id ? "#fff" : DS.textMuted, borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={MODAL_OVERLAY}>
      <div style={{ background: "linear-gradient(180deg,#FFFFFF 0%, #F8FBFF 100%)", border: "1px solid rgba(226,232,240,0.9)", borderRadius: 30, width: "100%", maxWidth: 680, maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 70px rgba(15,23,42,0.18)", overflow: "hidden", animation: "slideUp 0.25s ease" }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{ padding: "20px 26px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, borderBottom: `1px solid ${DS.border}`, background: DS.primaryGrad }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, fontFamily: DS.font }}>Report #{report.reportID}</div>
            <div style={{ color: DS.textMuted, fontSize: 12, fontFamily: DS.font, marginTop: 3 }}>{report.report} · {report.barangay}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: DS.primaryLight, color: DS.primary, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, fontFamily: DS.font, border: `1px solid ${DS.border}` }}>
              {STATUS.label[report.status] || report.status}
            </span>
            <button onClick={onClose} style={{ background: "#F5F8FC", border: `1px solid ${DS.border}`, color: DS.textSecondary, borderRadius: 12, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EEF4FB"} onMouseLeave={e => e.currentTarget.style.background = "#F5F8FC"}>
              <XIcon />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${DS.border}`, background: DS.card, flexShrink: 0 }}>
          <TabBtn id="details" label="Report Details" icon={<FileTextIcon />} />
          <TabBtn id="progress" label="Track Progress" icon={<ActivityIcon />} badge={responseCount} />
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* ── DETAILS TAB ── */}
          {activeTab === "details" && (
            <div style={{ padding: "22px 26px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Date Submitted", value: new Date(report.submittedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Barangay", value: report.barangay },
                  { label: "Exact Location", value: report.location },
                  { label: "Assigned To", value: report.assignedTo?.officeName || "Not yet assigned" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: DS.bg, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: DS.textPrimary, fontFamily: DS.font, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#EBF4FF", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: DS.primary, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Problem</div>
                <div style={{ fontSize: 14, color: DS.primaryDark, fontFamily: DS.font, fontWeight: 700 }}>{report.report}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Description</div>
                <div style={{ fontSize: 13, color: DS.textSecondary, fontFamily: DS.font, lineHeight: 1.75, background: DS.bg, borderRadius: 8, padding: "12px 14px" }}>{report.description}</div>
              </div>
              {report.latitude && report.longitude && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Map Location</div>
                  <div style={{ height: 150, width: "100%", borderRadius: 8, overflow: "hidden", border: `1px solid ${DS.border}`, zIndex: 0 }}>
                    {hasMapTilerKey ? (
                      <MapContainer center={[report.latitude, report.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                        <TileLayer url={MAPTILER_TILE_URL} attribution={MAPTILER_ATTRIBUTION} {...MAPTILER_TILE_LAYER_OPTIONS} />
                        <Marker position={[report.latitude, report.longitude]} />
                      </MapContainer>
                    ) : (
                      <MapTilerSetupNotice compact />
                    )}
                  </div>
                </div>
              )}
              {mediaList.length > 0 ? (
                <div>
                  <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>Attached Evidence ({mediaList.length} file{mediaList.length > 1 ? "s" : ""})</div>
                  <div style={{ display: "grid", gridTemplateColumns: mediaList.length === 1 ? "1fr" : "1fr 1fr", gap: 8 }}>
                    {mediaList.slice(0, 4).map((m, i) => {
                      const isVid = m.mediaType === "video";
                      const isLast = i === 3 && mediaList.length > 4;
                      return (
                        <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", background: "#1A202C", cursor: "pointer" }} onClick={() => !isVid && window.open(m.file, "_blank")}>
                          {isVid ? <video src={m.file} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                            <img src={m.file} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                          {isLast && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.58)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: DS.font }}>+{mediaList.length - 4}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background: DS.bg, borderRadius: 8, padding: "20px", textAlign: "center", color: DS.textMuted, fontSize: 13, fontFamily: DS.font }}>No media attached to this report.</div>
              )}
            </div>
          )}

          {/* ── PROGRESS TAB ── */}
          {activeTab === "progress" && (
            <div style={{ padding: "22px 26px" }}>
              {/* Status summary */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, background: DS.bg, borderRadius: 10, padding: "14px 18px", border: `1px solid ${DS.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS.color[report.status] || "#ddd", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, fontFamily: DS.font, textTransform: "uppercase", letterSpacing: 0.6 }}>Current Status</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: STATUS.color[report.status] || "#888", fontFamily: DS.font, marginTop: 2 }}>{STATUS.label[report.status] || report.status}</div>
                </div>
                {report.assignedTo?.officeName && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font }}>Assigned to</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DS.primary, fontFamily: DS.font }}>{report.assignedTo.officeName}</div>
                  </div>
                )}
              </div>
              <VerticalStepper report={report} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Step 1: Form ─────────────────────────────────────────────────────────────
void LegacyReportDetailModal;

const ReportDetailModal = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");
  const responseCount = report.adminResponses?.length || 0;
  const galleryMedia = (report.media || []).map(m => ({ file: m.file, mediaType: m.mediaType }));

  const TabBtn = ({ id, label, icon, badge }) => (
    <button onClick={() => setActiveTab(id)} style={{ flex: 1, padding: "13px 10px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === id ? 700 : 500, background: "transparent", color: activeTab === id ? DS.primary : DS.textMuted, fontFamily: DS.font, borderBottom: `2.5px solid ${activeTab === id ? DS.primary : "transparent"}`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      {icon}{label}
      {badge > 0 && <span style={{ background: activeTab === id ? DS.primary : "#EDF2F7", color: activeTab === id ? "#fff" : DS.textMuted, borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={MODAL_OVERLAY}>
      <div style={{ background: "linear-gradient(180deg,#FFFFFF 0%, #F8FBFF 100%)", border: "1px solid rgba(226,232,240,0.9)", borderRadius: 30, width: "100%", maxWidth: 680, maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 70px rgba(15,23,42,0.18)", overflow: "hidden", animation: "slideUp 0.25s ease" }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ padding: "20px 26px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, borderBottom: `1px solid ${DS.border}`, background: "linear-gradient(180deg,#FFFFFF 0%, #F7FBFF 100%)" }}>
          <div>
            <div style={{ color: DS.textPrimary, fontWeight: 800, fontSize: 17, fontFamily: DS.font }}>Report #{report.reportID}</div>
            <div style={{ color: DS.textMuted, fontSize: 12, fontFamily: DS.font, marginTop: 3 }}>{report.report} · {report.barangay}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: DS.primaryLight, color: DS.primary, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, fontFamily: DS.font, border: `1px solid ${DS.border}` }}>
              {STATUS.label[report.status] || report.status}
            </span>
            <button onClick={onClose} style={{ background: "#F5F8FC", border: `1px solid ${DS.border}`, color: DS.textSecondary, borderRadius: 12, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XIcon />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${DS.border}`, background: DS.card, flexShrink: 0 }}>
          <TabBtn id="details" label="Report Details" icon={<FileTextIcon />} />
          <TabBtn id="progress" label="Track Progress" icon={<ActivityIcon />} badge={responseCount} />
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {activeTab === "details" && (
            <div style={{ padding: "22px 26px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Submitted By", value: report.publicUser ? `${report.publicUser.name} ${report.publicUser.lastName}` : "Anonymous" },
                  { label: "Date Submitted", value: new Date(report.submittedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Barangay", value: report.barangay },
                  { label: "Exact Location", value: report.location },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: DS.bg, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: DS.textPrimary, fontFamily: DS.font, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: DS.bg, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Assigned To</div>
                <div style={{ fontSize: 13, color: DS.textPrimary, fontFamily: DS.font, fontWeight: 500 }}>{report.assignedTo?.officeName || "Not yet assigned"}</div>
              </div>
              <div style={{ background: "#EBF4FF", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: DS.primary, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Problem</div>
                <div style={{ fontSize: 14, color: DS.primaryDark, fontFamily: DS.font, fontWeight: 700 }}>{report.report}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Description</div>
                <div style={{ fontSize: 13, color: DS.textSecondary, fontFamily: DS.font, lineHeight: 1.75, background: DS.bg, borderRadius: 8, padding: "12px 14px" }}>{report.description}</div>
              </div>
              {report.latitude && report.longitude && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>Map Location</div>
                  <div style={{ height: 200, width: "100%", borderRadius: 12, overflow: "hidden", border: `1px solid ${DS.border}`, zIndex: 0 }}>
                    {hasMapTilerKey ? (
                      <MapContainer center={[report.latitude, report.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                        <TileLayer url={MAPTILER_TILE_URL} attribution={MAPTILER_ATTRIBUTION} {...MAPTILER_TILE_LAYER_OPTIONS} />
                        <Marker position={[report.latitude, report.longitude]} />
                      </MapContainer>
                    ) : (
                      <MapTilerSetupNotice />
                    )}
                  </div>
                </div>
              )}
              {galleryMedia.length > 0 ? (
                <div>
                  <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>Attached Evidence ({galleryMedia.length} file{galleryMedia.length > 1 ? "s" : ""})</div>
                  <div style={{ margin: "0 -4px" }}><MediaGallery media={galleryMedia} /></div>
                </div>
              ) : (
                <div style={{ background: DS.bg, borderRadius: 8, padding: "20px", textAlign: "center", color: DS.textMuted, fontSize: 13, fontFamily: DS.font }}>No media attached to this report.</div>
              )}
            </div>
          )}

          {activeTab === "progress" && (
            <div style={{ padding: "22px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, background: DS.bg, borderRadius: 10, padding: "14px 18px", border: `1px solid ${DS.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS.color[report.status] || "#ddd", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: DS.textMuted, fontFamily: DS.font, textTransform: "uppercase", letterSpacing: 0.6 }}>Current Status</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: STATUS.color[report.status] || "#888", fontFamily: DS.font, marginTop: 2 }}>{STATUS.label[report.status] || report.status}</div>
                </div>
                {report.assignedTo?.officeName && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font }}>Assigned to</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DS.primary, fontFamily: DS.font }}>{report.assignedTo.officeName}</div>
                  </div>
                )}
              </div>
              <VerticalStepper report={report} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step1Form = ({ form, setForm, mediaFiles, setMediaFiles, mediaPreviews, setMediaPreviews, onNext }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = files => {
    const arr = Array.from(files);
    setMediaPreviews(p => [...p, ...arr.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }))]);
    setMediaFiles(p => [...p, ...arr]);
  };
  const removeMedia = idx => { setMediaPreviews(p => p.filter((_, i) => i !== idx)); setMediaFiles(p => p.filter((_, i) => i !== idx)); };
  const canNext = form.barangay && form.location && form.category && form.report && form.description;

  return (
    <div>
      <h3 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 800, color: DS.textPrimary, fontFamily: DS.font }}>Report a Community Problem</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelSt}>Barangay <span style={{ color: "#DC2626" }}>*</span></label>
          <select
            value={form.barangay}
            onChange={e => {
              const nextBarangay = e.target.value;
              const coords = BARANGAY_COORDS[nextBarangay];
              setForm(prev => ({
                ...prev,
                barangay: nextBarangay,
                latitude: coords ? coords[0] : "",
                longitude: coords ? coords[1] : "",
              }));
            }}
            style={{ ...inputSt, cursor: "pointer" }}
            onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border}>
            <option value="">Select Barangay</option>
            {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={labelSt}>Exact Location <span style={{ color: "#DC2626" }}>*</span></label>
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Near City Hall..." style={inputSt}
            onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelSt}>Pinpoint Location on Map <span style={{ fontSize: 11, color: "#A0AEC0", fontWeight: 400, textTransform: "none" }}>(Tap map to set exact location)</span></label>
        <div style={{ height: 200, width: "100%", borderRadius: 8, overflow: "hidden", border: `1.5px solid ${DS.border}`, zIndex: 0 }}>
          {hasMapTilerKey ? (
            <MapContainer center={SURIGAO_CITY_CENTER} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
              <TileLayer url={MAPTILER_TILE_URL} attribution={MAPTILER_ATTRIBUTION} {...MAPTILER_TILE_LAYER_OPTIONS} />
              <PinDropper form={form} setForm={setForm} />
              <MapAutoPanner barangay={form.barangay} />
            </MapContainer>
          ) : (
            <MapTilerSetupNotice />
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelSt}>Problem Category <span style={{ color: "#DC2626" }}>*</span></label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, report: "" })} style={{ ...inputSt, cursor: "pointer" }}
            onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border}>
            <option value="">Select Category</option>
            {Object.keys(PROBLEM_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {form.category && (
          <div>
            <label style={labelSt}>Specific Problem <span style={{ color: "#DC2626" }}>*</span></label>
            <select value={form.report} onChange={e => setForm({ ...form, report: e.target.value })} style={{ ...inputSt, cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border}>
              <option value="">Select Problem</option>
              {PROBLEM_CATEGORIES[form.category].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelSt}>Description <span style={{ color: "#DC2626" }}>*</span></label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe the problem in detail..."
          style={{ ...inputSt, resize: "vertical", minHeight: 90 }} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={labelSt}>Attach Evidence <span style={{ fontSize: 11, color: "#A0AEC0", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? DS.primary : DS.border}`, borderRadius: 10, padding: "18px", textAlign: "center", cursor: "pointer", background: dragOver ? DS.primaryLight : DS.bg, transition: "all 0.2s" }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          <div style={{ color: DS.primary, display: "flex", justifyContent: "center", marginBottom: 6 }}><UploadIcon /></div>
          <p style={{ margin: 0, fontSize: 13, color: DS.textSecondary, fontFamily: DS.font }}><span style={{ color: DS.primary, fontWeight: 600 }}>Click to upload</span> or drag & drop</p>
        </div>
        {mediaPreviews.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {mediaPreviews.map((m, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `1.5px solid ${DS.border}` }}>
                {m.type.startsWith("image/") ? <img src={m.url} alt="" style={{ width: 76, height: 60, objectFit: "cover", display: "block" }} /> :
                  <div style={{ width: 76, height: 60, background: "#1A202C", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>▶</div>}
                <button onClick={e => { e.stopPropagation(); removeMedia(i); }} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={onNext} disabled={!canNext} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: canNext ? DS.primaryGrad : "#CBD5E0", color: "#fff", border: "none", borderRadius: 9, cursor: canNext ? "pointer" : "not-allowed", fontFamily: DS.font, transition: "all 0.2s" }}>
        Continue →
      </button>
    </div>
  );
};

// ─── Step 2: Auth ─────────────────────────────────────────────────────────────
const Step2Auth = ({ onLoggedIn, onBack }) => {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", lastName: "", username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await loginPublicUser(loginForm);
      if (res.data.success) {
        onLoggedIn({ publicUserID: res.data.publicUserID, name: `${res.data.name} ${res.data.lastName}` });
      } else setError(res.data.message || "Invalid credentials.");
    } catch { setError("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regForm.name || !regForm.lastName || !regForm.username || !regForm.password || !regForm.email) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${BASE}/users/`, regForm);
      logoutAll();
      sessionStorage.setItem("publicUserID", String(res.data.publicUserID));
      sessionStorage.setItem("publicUserName", `${res.data.name} ${res.data.lastName}`);
      onLoggedIn({ publicUserID: res.data.publicUserID, name: `${res.data.name} ${res.data.lastName}` });
    } catch (err) {
      const d = err.response?.data;
      setError(d?.username ? "Username already taken." : d?.email ? "Email already in use." : "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: DS.textPrimary, fontFamily: DS.font }}>Verify Your Identity</h3>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: DS.textMuted, fontFamily: DS.font }}>You need an account to track your report and receive updates.</p>
      <div style={{ display: "flex", background: "#EDF2F7", borderRadius: 10, padding: 4, marginBottom: 18 }}>
        {["login", "register"].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: mode === m ? 700 : 500, background: mode === m ? DS.card : "transparent", color: mode === m ? DS.primary : DS.textMuted, fontFamily: DS.font, boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
            {m === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>
      {error && <div style={{ background: "#FFF5F5", border: "1.5px solid #FEB2B2", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#C53030", fontFamily: DS.font, display: "flex", alignItems: "center", gap: 6 }}><AlertIcon />{error}</div>}
      {mode === "login" ? (
        <>
          <div style={{ marginBottom: 12 }}><label style={labelSt}>Username</label><input value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="Enter username" style={inputSt} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} /></div>
          <div style={{ marginBottom: 16 }}><label style={labelSt}>Password</label><input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Enter password" style={inputSt} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: loading ? "#9AB8E0" : DS.primaryGrad, color: "#fff", border: "none", borderRadius: 9, cursor: loading ? "not-allowed" : "pointer", fontFamily: DS.font }}>{loading ? "Signing in..." : "Sign In & Continue"}</button>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelSt}>First Name</label><input value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} placeholder="Juan" style={inputSt} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} /></div>
            <div><label style={labelSt}>Last Name</label><input value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} placeholder="dela Cruz" style={inputSt} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelSt}>Username</label><input value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} placeholder="username" style={inputSt} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} /></div>
            <div><label style={labelSt}>Email</label><input type="email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} placeholder="email@example.com" style={inputSt} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label style={labelSt}>Password</label><input type="password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} placeholder="••••••••" style={inputSt} onFocus={e => e.target.style.borderColor = DS.borderFocus} onBlur={e => e.target.style.borderColor = DS.border} /></div>
          <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: loading ? "#9AB8E0" : DS.primaryGrad, color: "#fff", border: "none", borderRadius: 9, cursor: loading ? "not-allowed" : "pointer", fontFamily: DS.font }}>{loading ? "Creating account..." : "Register & Continue"}</button>
        </>
      )}
      <button onClick={onBack} style={{ width: "100%", marginTop: 10, padding: "10px", fontSize: 13, fontWeight: 600, background: DS.bg, border: `1.5px solid ${DS.border}`, color: DS.textSecondary, borderRadius: 9, cursor: "pointer", fontFamily: DS.font }}>← Back</button>
    </div>
  );
};

// ─── Submission Modal ─────────────────────────────────────────────────────────
const SubmissionModal = ({ onClose, user, form, mediaFiles, setUser, onSubmitted }) => {
  const [step, setStep] = useState(user ? 1 : 1);
  const [mediaFiles2, setMediaFiles] = useState(mediaFiles);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(form);
  const handleLoggedIn = u => { setUser(u); setStep(3); };
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("barangay", formData.barangay); fd.append("location", formData.location);
      fd.append("report", formData.report); fd.append("description", formData.description);
      if (formData.latitude) fd.append("latitude", formData.latitude);
      if (formData.longitude) fd.append("longitude", formData.longitude);
      // publicUser is set server-side from X-User-ID header — no need to send it
      mediaFiles2.forEach(f => fd.append("mediaFiles", f));
      const res = await apiClient.post(`${BASE}/reports/`, fd);
      onSubmitted(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || "Failed to submit. Please try again.");
    }
    finally { setSubmitting(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={MODAL_OVERLAY}>
      <div style={{ background: "linear-gradient(180deg,#FFFFFF 0%, #F8FBFF 100%)", border: "1px solid rgba(226,232,240,0.9)", borderRadius: 30, width: "100%", maxWidth: 600, maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 70px rgba(15,23,42,0.18)", overflow: "hidden", animation: "slideUp 0.25s ease" }}>
        <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, borderBottom: `1px solid ${DS.border}`, background: "linear-gradient(180deg,#FFFFFF 0%, #F7FBFF 100%)" }}>
          <div style={{ color: DS.textPrimary, fontWeight: 800, fontSize: 16, fontFamily: DS.font }}>Community Report</div>
          <button onClick={onClose} style={{ background: "#F5F8FC", border: `1px solid ${DS.border}`, color: DS.textSecondary, borderRadius: 12, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "22px 24px" }}>
          <StepIndicator currentStep={user ? (step === 1 ? 1 : step === 2 ? 2 : 3) : step} />
          {(step === 1) && <Step1Form form={formData} setForm={setFormData} mediaFiles={mediaFiles2} setMediaFiles={setMediaFiles} mediaPreviews={mediaPreviews} setMediaPreviews={setMediaPreviews} onNext={() => { if (user) setStep(3); else setStep(2); }} />}
          {step === 2 && <Step2Auth onLoggedIn={handleLoggedIn} onBack={() => setStep(1)} />}
          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #9AE6B4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#16A34A" }}><CheckCircle /></div>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: DS.textPrimary, fontFamily: DS.font }}>Ready to Submit</h3>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: DS.textMuted, fontFamily: DS.font }}>Logged in as <strong>{user?.name}</strong>.</p>
              <div style={{ background: DS.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 18, textAlign: "left", border: `1px solid ${DS.border}` }}>
                <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.font, marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>Report Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[["Barangay", formData.barangay], ["Location", formData.location], ["Problem", formData.report], ["Description", formData.description]].map(([k, v]) => (
                    <div key={k} style={{ fontSize: 13, color: DS.textSecondary, fontFamily: DS.font }}><strong style={{ color: DS.textPrimary }}>{k}:</strong> {v}</div>
                  ))}
                  {mediaFiles2.length > 0 && <div style={{ fontSize: 13, color: DS.textSecondary, fontFamily: DS.font }}><strong style={{ color: DS.textPrimary }}>Attachments:</strong> {mediaFiles2.length} file{mediaFiles2.length > 1 ? "s" : ""}</div>}
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, background: submitting ? "#9AB8E0" : DS.primaryGrad, color: "#fff", border: "none", borderRadius: 9, cursor: submitting ? "not-allowed" : "pointer", fontFamily: DS.font, marginBottom: 10 }}>
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
              <button onClick={() => setStep(1)} style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 600, background: DS.bg, border: `1.5px solid ${DS.border}`, color: DS.textSecondary, borderRadius: 9, cursor: "pointer", fontFamily: DS.font }}>← Edit Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const initialFormState = { barangay: "", location: "", category: "", report: "", description: "", latitude: "", longitude: "" };

function PublicReport() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [mediaFiles, setMediaFiles] = useState([]);
  const { user, login: authLogin, logout: authLogout } = usePublicAuth();
  const setUser = (u) => { if (u) authLogin(u); else authLogout(); };
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoading] = useState(false);
  const [selectedReport, setSelected] = useState(null);

  const fetchReports = uid => {
    setLoading(true);
    apiClient.get(`${BASE}/reports/`)
      .then(res => setReports(Array.isArray(res.data) ? res.data : res.data.results || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) fetchReports(user.publicUserID); }, [user]);

  const openModal = () => { setForm(initialFormState); setMediaFiles([]); setShowModal(true); };

  return (
    <Layout>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: DS.textPrimary, fontFamily: DS.font, letterSpacing: -0.5 }}>Report a Problem</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.textMuted, fontFamily: DS.font }}>Help improve Surigao City by reporting community issues</p>
        </div>
        <button onClick={openModal} style={{ display: "flex", alignItems: "center", gap: 8, background: DS.primaryGrad, border: "none", padding: "10px 20px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: DS.font, boxShadow: "0 2px 8px rgba(43,108,176,0.3)" }}>
          <AlertIcon /> Report a Problem
        </button>
      </div>

      {user && (
        <div style={{ background: "#F0FDF4", border: "1.5px solid #9AE6B4", borderRadius: 8, padding: "10px 16px", marginBottom: 18, fontSize: 13, color: "#276749", fontFamily: DS.font, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}><CheckCircle />Logged in as <strong>{user.name}</strong></span>
          <button onClick={() => { setUser(null); sessionStorage.removeItem("publicUserID"); sessionStorage.removeItem("publicUserName"); setReports([]); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: DS.textMuted, fontFamily: DS.font, textDecoration: "underline" }}>Sign out</button>
        </div>
      )}

      {user && (
        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: DS.textPrimary, fontFamily: DS.font }}>My Reports</h3>
          {loadingReports && <div style={{ color: DS.textMuted, fontSize: 13, fontFamily: DS.font }}>Loading...</div>}
          {!loadingReports && reports.length === 0 && (
            <div style={{ background: DS.card, borderRadius: 12, padding: "36px 20px", textAlign: "center", color: DS.textMuted, fontSize: 14, fontFamily: DS.font, boxShadow: DS.shadow, border: `1px solid ${DS.border}` }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", color: DS.textMuted }}><FileTextIcon /></div>
              You haven't submitted any reports yet.
            </div>
          )}
          {!loadingReports && reports.map(r => <ReportCard key={r.reportID} report={r} onClick={setSelected} />)}
        </div>
      )}

      {!user && (
        <div style={{ background: DS.card, borderRadius: 12, padding: "48px 20px", textAlign: "center", color: DS.textMuted, fontSize: 14, fontFamily: DS.font, boxShadow: DS.shadow, border: `1px solid ${DS.border}` }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "center", color: DS.textMuted }}><AlertIcon /></div>
          <strong style={{ color: DS.textSecondary, fontSize: 15 }}>See something wrong in your community?</strong>
          <p style={{ margin: "8px 0 0", color: DS.textMuted }}>Click <strong>Report a Problem</strong> to submit an issue and track its progress.</p>
        </div>
      )}

      {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelected(null)} />}

      {showModal && (
        <SubmissionModal onClose={() => setShowModal(false)} user={user} form={form} mediaFiles={mediaFiles}
          setUser={u => { setUser(u); }}
          onSubmitted={r => { setReports(p => [r, ...p]); }} />
      )}
    </Layout>
  );
}

export default PublicReport;

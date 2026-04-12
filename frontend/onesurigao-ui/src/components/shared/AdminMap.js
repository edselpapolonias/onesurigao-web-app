import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { apiClient } from "../../services/authService";
import { MAPTILER_TILE_URL, MAPTILER_TILE_LAYER_OPTIONS, MAPTILER_ATTRIBUTION, hasMapTilerKey } from "../../utils/maptiler";

// ─── Design System ────────────────────────────────────────────────────────────
const DS = {
  primary:       "#2B6CB0",
  bg:            "#F5F7FA",
  card:          "#FFFFFF",
  border:        "#E2E8F0",
  textPrimary:   "#1A202C",
  textSecondary: "#4A5568",
  textMuted:     "#718096",
  shadow:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  font:          "'Segoe UI', system-ui, sans-serif",
};

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:       require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:     require("leaflet/dist/images/marker-shadow.png"),
});

const BuildingIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M9 7h1M14 7h1M9 12h1M14 12h1"/></svg>);
const PhoneIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>);
const MailIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);

export default function AdminMap({ Layout, mode }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Center of Surigao City
  const centerPos = [9.7848, 125.4925];

  useEffect(() => {
    // Fetch admins open to everyone
    apiClient.get("/api/admins/")
      .then(res => {
        // filter out anyone without coordinates
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        const mapped = data.filter(a => a.latitude !== null && a.longitude !== null);
        setAdmins(mapped);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load map data:", err);
        setError("Could not load administrative offices data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getDepartmentPath = (adminID) => {
    if (mode === "public") return `/home/department/${adminID}`;
    if (mode === "superadmin") return `/superadmin/department/${adminID}`;
    return `/department/${adminID}`;
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 600 }}>
        <div style={{ padding: "0 4px 16px" }}>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: 24, color: DS.textPrimary, fontFamily: DS.font }}>Admin Offices Map</h1>
          <p style={{ margin: "4px 0 0", fontSize: 15, color: DS.textSecondary, fontFamily: DS.font }}>
            Locate and explore city departments across Surigao City.
          </p>
        </div>

        {error && (
          <div style={{ background: "#FFF5F5", border: "1px solid #FEB2B2", borderRadius: 8, padding: "12px 16px", marginBottom: 14, fontSize: 14, color: "#C53030", fontFamily: DS.font }}>
            {error}
          </div>
        )}

        {!hasMapTilerKey && !error && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "12px 16px", marginBottom: 14, fontSize: 14, color: "#92400E", fontFamily: DS.font }}>
            Map functionality relies on MapTiler. Please ensure `REACT_APP_MAPTILER_API_KEY` is configured in your environment.
          </div>
        )}

        {loading ? (
          <div style={{ flex: 1, background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
             <div style={{ width: 40, height: 40, border: `3px solid ${DS.border}`, borderTopColor: DS.primary, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
             <div style={{ color: DS.textMuted, fontFamily: DS.font, fontSize: 14, fontWeight: 500 }}>Loading Map Data...</div>
             <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ flex: 1, background: DS.card, borderRadius: 16, border: `1px solid ${DS.border}`, overflow: "hidden", position: "relative", boxShadow: DS.shadow }}>
            {hasMapTilerKey ? (
              <MapContainer center={centerPos} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                <TileLayer url={MAPTILER_TILE_URL} attribution={MAPTILER_ATTRIBUTION} {...MAPTILER_TILE_LAYER_OPTIONS} />
                {admins.map(admin => (
                  <Marker key={admin.adminID} position={[admin.latitude, admin.longitude]}>
                    <Popup>
                      <div style={{ fontFamily: DS.font, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                           {admin.profilePic ? (
                             <img src={admin.profilePic} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                           ) : (
                             <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EBF4FF", color: DS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                                {admin.officeName?.charAt(0) || "O"}
                             </div>
                           )}
                           <div style={{ fontWeight: 800, fontSize: 14, color: DS.textPrimary, lineHeight: 1.2 }}>{admin.officeName}</div>
                        </div>
                        
                        {(admin.contactNumber || admin.email) && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                            {admin.contactNumber && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
                                <PhoneIcon /> {admin.contactNumber}
                              </div>
                            )}
                            {admin.email && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DS.textSecondary }}>
                                <MailIcon /> {admin.email}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <Link to={getDepartmentPath(admin.adminID)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "6px 0", background: "#EBF4FF", color: DS.primary, borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 700, transition: "background 0.2s" }}
                           onMouseEnter={e => e.currentTarget.style.background = "#D2E4FF"}
                           onMouseLeave={e => e.currentTarget.style.background = "#EBF4FF"}>
                          <BuildingIcon /> View Office Page
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: DS.bg, color: DS.textMuted, fontFamily: DS.font }}>
                  [ Map rendering failed Check API Key ]
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

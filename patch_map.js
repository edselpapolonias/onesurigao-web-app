const fs = require('fs');

const path = 'frontend/onesurigao-ui/src/components/admin/AdminProfilePage.js';
let text = fs.readFileSync(path, 'utf8');

if (!text.includes('react-leaflet')) {
    text = text.replace(
        'import { apiClient, changeAdminPassword } from "../../services/authService";',
        `import { apiClient, changeAdminPassword } from "../../services/authService";\nimport { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";\nimport L from "leaflet";\nimport "leaflet/dist/leaflet.css";\nimport { MAPTILER_TILE_URL, MAPTILER_TILE_LAYER_OPTIONS, MAPTILER_ATTRIBUTION, hasMapTilerKey } from "../../utils/maptiler";\n\n// Fix default Leaflet icon paths\ndelete L.Icon.Default.prototype._getIconUrl;\nL.Icon.Default.mergeOptions({\n  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),\n  iconUrl:       require("leaflet/dist/images/marker-icon.png"),\n  shadowUrl:     require("leaflet/dist/images/marker-shadow.png"),\n});`
    );
}

if (!text.includes('LocationPickerMap')) {
    // Add the LocationPickerMap helper just before EditProfileModal
    const mapPickerCode = `
// ─── Map Picker Component ─────────────
const LocationPickerMap = ({ form, setForm }) => {
  const defaultPos = [9.7848, 125.4925]; // Surigao City Center
  const pos = form.latitude && form.longitude ? [form.latitude, form.longitude] : defaultPos;

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setForm(prev => ({ ...prev, latitude: e.latlng.lat, longitude: e.latlng.lng }));
      },
    });
    return form.latitude && form.longitude ? <Marker position={[form.latitude, form.longitude]} /> : null;
  };

  return (
    <div style={{ height: 260, width: "100%", borderRadius: 12, overflow: "hidden", border: \`1px solid \${DS.border}\`, background: DS.bg }}>
      {hasMapTilerKey ? (
        <MapContainer center={pos} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer url={MAPTILER_TILE_URL} attribution={MAPTILER_ATTRIBUTION} {...MAPTILER_TILE_LAYER_OPTIONS} />
          <LocationMarker />
        </MapContainer>
      ) : (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: DS.textMuted, fontSize: 13, fontFamily: DS.font }}>
          Map missing API Key
        </div>
      )}
    </div>
  );
};
`;
    text = text.replace('// ─── Edit Profile Modal', mapPickerCode + '\n// ─── Edit Profile Modal');
}

// Ensure the form state captures latitude and longitude
text = text.replace(
    'const [form, setForm]       = useState({ officeName:admin.officeName||"", email:admin.email||"", contactNumber:admin.contactNumber||"", username:admin.username||"" });',
    'const [form, setForm]       = useState({ officeName:admin.officeName||"", email:admin.email||"", contactNumber:admin.contactNumber||"", username:admin.username||"", latitude:admin.latitude||null, longitude:admin.longitude||null });'
);

// Add the 3rd tab to the Modal
text = text.replace(
    '<Tab id="password" label="Change Password"/>\n        </div>',
    '<Tab id="password" label="Change Password"/>\n          <Tab id="location" label="Location Settings"/>\n        </div>'
);

const locationTabUI = `
          {tab==="location"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize: 13, color: DS.textSecondary, fontFamily: DS.font, lineHeight: 1.5}}>
                Click anywhere on the map to pinpoint your exact office location. This will help citizens identify your department easier!
              </div>
              
              <LocationPickerMap form={form} setForm={setForm} />
              
              <button onClick={handleSaveInfo} disabled={saving} style={{width:"100%",padding:"11px",background:saving?"#9AB8E0":DS.primaryGrad,color:"#fff",border:"none",borderRadius:8,cursor:saving?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:4}}>
                <SaveIcon/>{saving?"Saving...":"Save Location"}
              </button>
            </div>
          )}
`;

if (!text.includes('tab==="location"')) {
    text = text.replace(
        '{tab==="password"&&(',
        locationTabUI + '\n          {tab==="password"&&('
    );
}

// Add MapPinIcon
const mapPinIconDef = `const MapPinIcon       = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);`;
if (!text.includes('MapPinIcon')) {
    text = text.replace('const ClockIcon', mapPinIconDef + '\nconst ClockIcon');
}

// Update the actual visual display outside modal
if (!text.includes('has coordinates')) {
    text = text.replace(
        '<InfoRow icon={<CalendarIcon/>} label="Member Since" value={memberSince}/>\n                </>\n            }',
        '<InfoRow icon={<CalendarIcon/>} label="Member Since" value={memberSince}/>\n                  <InfoRow icon={<MapPinIcon/>} label="Location" value={admin?.latitude ? "📍 " + Number(admin.latitude).toFixed(4) + ", " + Number(admin.longitude).toFixed(4) : "Not Set"}/>\n                </>\n            }'
    );
}

fs.writeFileSync(path, text, 'utf8');
console.log('Done mapping.');

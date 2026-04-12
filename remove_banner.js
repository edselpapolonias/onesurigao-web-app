const fs = require('fs');

const path = 'frontend/onesurigao-ui/src/components/public/PublicReport.js';
let text = fs.readFileSync(path, 'utf8');

const target = `{user && (
        <div style={{ background: "#F0FDF4", border: "1.5px solid #9AE6B4", borderRadius: 8, padding: "10px 16px", marginBottom: 18, fontSize: 13, color: "#276749", fontFamily: DS.font, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}><CheckCircle />Logged in as <strong>{user.name}</strong></span>
          <button onClick={() => { setUser(null); sessionStorage.removeItem("publicUserID"); sessionStorage.removeItem("publicUserName"); setReports([]); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: DS.textMuted, fontFamily: DS.font, textDecoration: "underline" }}>Sign out</button>
        </div>
      )}`;

// We need to match with whatever lineendings the string actually has
const genericTarget = /\{user && \(\s*<div style=\{\{ background: "#F0FDF4"[\s\S]*?Sign out<\/button>\s*<\/div>\s*\)\}/;

text = text.replace(genericTarget, '');
fs.writeFileSync(path, text, 'utf8');
console.log('Banner removed successfully.');

const fs = require('fs');

const path = 'frontend/onesurigao-ui/src/components/superadmin/SuperAdminAnnouncement.js';
let text = fs.readFileSync(path, 'utf8');

const replacements = [
    {
        target: '<div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", gap: 12 }}>',
        replace: '<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "20px 20px 0" }}>'
    },
    {
        target: '<Avatar officeName={officeName} />',
        replace: '<div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>\n          <Avatar officeName={officeName} />'
    },
    {
        target: '<div>\r\n          <div style={{ fontWeight: 700, fontSize: 14, color: DS.textPrimary, fontFamily: DS.font }}>{officeName}</div>',
        replace: '<div style={{ minWidth: 0 }}>\n            <div style={{ fontWeight: 800, fontSize: 14, color: DS.textPrimary, fontFamily: DS.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{officeName}</div>'
    },
    {
        target: '<div>\n          <div style={{ fontWeight: 700, fontSize: 14, color: DS.textPrimary, fontFamily: DS.font }}>{officeName}</div>',
        replace: '<div style={{ minWidth: 0 }}>\n            <div style={{ fontWeight: 800, fontSize: 14, color: DS.textPrimary, fontFamily: DS.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{officeName}</div>'
    },
    {
        target: '<div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, color: DS.textMuted, fontSize: 11, fontFamily: DS.font }}>',
        replace: '<div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: DS.textMuted, fontSize: 11.5, fontFamily: DS.font }}>'
    },
    {
        target: '</div>\r\n        </div>\r\n      </div>',
        replace: '</div>\n          </div>\n        </div>\n      </div>'
    },
    {
        target: '</div>\n        </div>\n      </div>',
        replace: '</div>\n          </div>\n        </div>\n      </div>'
    }
];

let changed = false;
for (const r of replacements) {
    if (text.includes(r.target)) {
        text = text.replace(r.target, r.replace);
        changed = true;
    }
}

if (changed) {
    fs.writeFileSync(path, text, 'utf8');
    console.log('Success');
} else {
    console.log('Failed to find targets');
}

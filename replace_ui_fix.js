const fs = require('fs');
const path = 'frontend/onesurigao-ui/src/components/superadmin/SuperAdminAnnouncement.js';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(
    '<Avatar officeName={officeName} />\n        <div style={{ minWidth: 0 }}>\n            <div style={{ fontWeight: 800',
    '<Avatar officeName={officeName} />\n          <div style={{ minWidth: 0 }}>\n            <div style={{ fontWeight: 800'
);

// We need to add the missing </div>.
// We'll replace the block covering the ClockIcon div wrapper
const targetDiv = '<div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: DS.textMuted, fontSize: 11.5, fontFamily: DS.font }}>\n            <ClockIcon /> {dateStr}{timeStr && ` · ${timeStr}`}\n          </div>\n        </div>\n      </div>';

const replacementDiv = '<div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: DS.textMuted, fontSize: 11.5, fontFamily: DS.font }}>\n              <ClockIcon /> {dateStr}{timeStr && ` · ${timeStr}`}\n            </div>\n          </div>\n        </div>\n      </div>';

text = text.replace(targetDiv, replacementDiv);

fs.writeFileSync(path, text, 'utf8');
console.log('Fixed tags');

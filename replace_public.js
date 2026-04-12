const fs = require('fs');

const path = 'frontend/onesurigao-ui/src/components/public/PublicAnnouncement.js';
let text = fs.readFileSync(path, 'utf8');

const target1 = `<div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", gap:12 }}>
        <Avatar officeName={officeName}/>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:DS.textPrimary, fontFamily:DS.font }}>{officeName}</div>
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2, color:DS.textMuted, fontSize:11, fontFamily:DS.font }}>
            <ClockIcon/> {dateStr}{timeStr&&\` · \${timeStr}\`}
          </div>
        </div>
      </div>`;

const replace1 = `<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Avatar officeName={officeName} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: DS.textPrimary, fontFamily: DS.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{officeName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: DS.textMuted, fontSize: 11.5, fontFamily: DS.font }}>
              <ClockIcon /> {dateStr}{timeStr && \` · \${timeStr}\`}
            </div>
          </div>
        </div>
      </div>`;

const target2 = `<div style={{ padding:"12px 20px 6px", fontWeight:700, fontSize:16, color:DS.textPrimary, fontFamily:DS.font, lineHeight:1.4 }}>{announcement.title}</div>`;

const replace2 = `<div style={{ padding: "14px 20px 0", fontWeight: 700, fontSize: 17, color: DS.textPrimary, fontFamily: DS.font, lineHeight: 1.36 }}>{announcement.title}</div>`;

const target3 = `<div style={{ padding:"0 20px 14px", fontSize:14, color:DS.textSecondary, fontFamily:DS.font, lineHeight:1.75, whiteSpace:"pre-wrap" }}>`;

const replace3 = `<div style={{ padding: "10px 20px 0", fontSize: 14, color: DS.textSecondary, fontFamily: DS.font, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>`;

const target4 = `<MediaGallery media={announcement.media}/>`;

const replace4 = `{Array.isArray(announcement.media) && announcement.media.length > 0 && (
        <div style={{ marginTop: 18, overflow: "hidden", background: "#F4F7FB" }}>
          <MediaGallery media={announcement.media} />
        </div>
      )}`;

text = text.replace(target1, replace1)
           .replace(target2, replace2)
           .replace(target3, replace3)
           .replace(target4, replace4);

fs.writeFileSync(path, text, 'utf8');
console.log('Public formatting updated');

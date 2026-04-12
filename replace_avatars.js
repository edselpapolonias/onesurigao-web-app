const fs = require('fs');

const files = [
    'frontend/onesurigao-ui/src/components/public/PublicAnnouncement.js',
    'frontend/onesurigao-ui/src/components/public/PublicAnnouncementSearch.js',
    'frontend/onesurigao-ui/src/components/public/PublicPinned.js',
    'frontend/onesurigao-ui/src/components/superadmin/SuperAdminAnnouncement.js',
    'frontend/onesurigao-ui/src/components/superadmin/SuperAdminPinned.js',
    'frontend/onesurigao-ui/src/components/admin/PinnedAnnouncement.js',
    'frontend/onesurigao-ui/src/components/shared/DepartmentPage.js',
    'frontend/onesurigao-ui/src/components/admin/AdminAnnouncement.js'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let text = fs.readFileSync(file, 'utf8');

        // Regex to find Avatar component. 
        // We match const Avatar = ({ officeName }) => { ... };
        const avatarRegex = /const\s+Avatar\s*=\s*\(\{\s*officeName\s*\}\)\s*=>\s*\{[\s\S]*?return\s*\([\s\S]*?\{initials\}[\s\S]*?<\/div>\s*\)\;\s*\};/;
        
        const newAvatar = `const Avatar = ({ officeName, profilePic }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SG";
  if (profilePic) return <img src={profilePic} alt={officeName} style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover", flexShrink:0, boxShadow:"0 2px 6px rgba(0,0,0,0.1)" }} />;
  return (
    <div style={{ width:42, height:42, borderRadius:"50%", background:DS.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, fontFamily:DS.font, flexShrink:0, boxShadow:"0 2px 6px rgba(43,108,176,0.25)" }}>
      {initials}
    </div>
  );
};`;

        text = text.replace(avatarRegex, newAvatar);
        
        // Also update the <Avatar officeName={officeName}/> or <Avatar officeName={...} /> calls 
        // in these components.
        text = text.replace(/<Avatar\s+officeName=\{([^}]+)\}\s*\/>/g, '<Avatar officeName={$1} profilePic={announcement.admin?.profilePic || null}/>');

        fs.writeFileSync(file, text, 'utf8');
        console.log('Updated ' + file);
    }
});

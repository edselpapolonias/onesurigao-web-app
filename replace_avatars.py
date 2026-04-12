import os

def update_file(filepath):
    print(f"Updating {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Generic regex for Avatar component update
    import re
    # Match the entire Avatar component
    pattern = r"const Avatar = \(\{ officeName \}\) => \{.*?return \(.*?\{initials\}.*?</div>\s*\);\s*\};"
    
    new_avatar = """const Avatar = ({ officeName, profilePic }) => {
  const initials = officeName?.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SG";
  if (profilePic) return <img src={profilePic} alt={officeName} style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover", flexShrink:0, boxShadow:"0 2px 6px rgba(0,0,0,0.1)" }} />;
  return (
    <div style={{ width:42, height:42, borderRadius:"50%", background:DS.primaryGrad, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, fontFamily:DS.font, flexShrink:0, boxShadow:"0 2px 6px rgba(43,108,176,0.25)" }}>
      {initials}
    </div>
  );
};"""

    # Do the sub with re.DOTALL so .* matches newlines
    text = re.sub(pattern, new_avatar, text, flags=re.DOTALL)

    # Next update the usages of <Avatar officeName={officeName}/>
    # This might have spacing around it, so let's use regex
    text = re.sub(r'<Avatar officeName=\{officeName\}\s*/>', '<Avatar officeName={officeName} profilePic={announcement.admin?.profilePic || null}/>', text)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

files_to_update = [
    r'c:\Users\USER\OneDrive\Documents\OneSurigao\frontend\onesurigao-ui\src\components\public\PublicAnnouncement.js',
    r'c:\Users\USER\OneDrive\Documents\OneSurigao\frontend\onesurigao-ui\src\components\public\PublicAnnouncementSearch.js',
    r'c:\Users\USER\OneDrive\Documents\OneSurigao\frontend\onesurigao-ui\src\components\public\PublicPinned.js',
    r'c:\Users\USER\OneDrive\Documents\OneSurigao\frontend\onesurigao-ui\src\components\superadmin\SuperAdminAnnouncement.js',
    r'c:\Users\USER\OneDrive\Documents\OneSurigao\frontend\onesurigao-ui\src\components\superadmin\SuperAdminPinned.js',
    r'c:\Users\USER\OneDrive\Documents\OneSurigao\frontend\onesurigao-ui\src\components\admin\PinnedAnnouncement.js'
]

for fp in files_to_update:
    if os.path.exists(fp):
        update_file(fp)
    else:
        print(f"Skipping {fp} - does not exist")

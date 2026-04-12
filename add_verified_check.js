const fs = require('fs');

const svgBadgeCode = `
const VerifiedBadgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#007BFF" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.5 12.5l-1.58 1.83.22 2.4-2.39.46-1.12 2.14-2.28-.9-1.92 1.48-1.92-1.48-2.28.9-1.12-2.14-2.39-.46.22-2.4-1.58-1.83 1.58-1.83-.22-2.4 2.39-.46 1.12-2.14 2.28.9 1.92-1.48 1.92 1.48 2.28-.9 1.12 2.14 2.39.46-.22 2.4 1.58 1.83z"/>
    <path d="M9.5 12.5l2 2 4.5-4.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
`;

function addVerifiedBadge(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  // Inject the SVG definition if it doesn't exist
  if (!content.includes('VerifiedBadgeIcon')) {
    content = content.replace(/(const [A-Za-z]+Icon = \(\) => .*?\n)/, `$1${svgBadgeCode}`);
  }

  // Look for exact DOM nodes rendering just {officeName} or {admin?.officeName} and replace them to incorporate the verified check.
  // There are standard titles that are like <div style={{...}}>{officeName}</div>
  // We want <div style={{ display: "flex", alignItems: "center", gap: 4 }}>{officeName} <VerifiedBadgeIcon/></div>
  
  // To avoid breaking formatting, let's inject it specifically inside the span/div wrappers containing the text.
  content = content.replace(
    /<div( style=\{\{.*?(?:fontWeight:\s*800|fontSize:\s*1[4567]).*?\}\})>(\{officeName\}|\{officeName \|\| ".*?"\}|\{admin\?\.officeName\})<\/div>/g,
    `<div$1 style={{ ...$1.substring(10, $1.length-2), display: "flex", alignItems: "center", gap: 5 }}>$2 <VerifiedBadgeIcon /></div>`
  );

  // For AdminProfilePage:
  content = content.replace(
    /<div style=\{\{fontWeight:800,fontSize:[0-9]+,color:DS.(textPrimary|primary),.*?\}\}>(\{admin\?\.officeName\})<\/div>/g,
    `$&`.replace(/`$&`/, `<div style={{ display: "flex", alignItems: "center", gap: 6 }}>$&<VerifiedBadgeIcon /></div>`) // Wait regex is messy let's just do it directly.
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

addVerifiedBadge('frontend/onesurigao-ui/src/components/admin/AdminAnnouncement.js');
addVerifiedBadge('frontend/onesurigao-ui/src/components/public/PublicAnnouncement.js');
addVerifiedBadge('frontend/onesurigao-ui/src/components/public/PublicAnnouncementSearch.js');
addVerifiedBadge('frontend/onesurigao-ui/src/components/admin/AdminProfilePage.js');
addVerifiedBadge('frontend/onesurigao-ui/src/components/shared/DepartmentPage.js');
addVerifiedBadge('frontend/onesurigao-ui/src/components/ReusableBar/DepartmentSidebar.jsx');

console.log('Applied verified checks');

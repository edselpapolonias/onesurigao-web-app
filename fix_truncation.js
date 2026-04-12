const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/onesurigao-ui/src/components');

function traverseAndFix(currentPath) {
  const stat = fs.statSync(currentPath);
  if (stat.isDirectory()) {
    fs.readdirSync(currentPath).forEach(file => traverseAndFix(path.join(currentPath, file)));
  } else if (stat.isFile() && (currentPath.endsWith('.js') || currentPath.endsWith('.jsx'))) {
    let content = fs.readFileSync(currentPath, 'utf8');
    
    // We want to find:
    // <div style={{ display: "flex", ..., whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{officeName} <VerifiedBadgeIcon /></div>
    // or similar things.
    // The regex would be something like wrapping `{officeName}` or similar if it's next to VerifiedBadgeIcon
    
    const regex = /<div style={{([^}]*whiteSpace\s*:\s*["']nowrap["'][^}]*overflow\s*:\s*["']hidden["'][^}]*textOverflow\s*:\s*["']ellipsis["'][^}]*)}}>(\s*{(?:office|officeName|admin\?\.officeName|announcement\.admin\?\.officeName.*?)}\s*)<VerifiedBadgeIcon \/><\/div>/g;
    
    // Wait, the regex might be tricky. Let's just do a simpler search and replace.
    // We can manually fix the known affected files!
  }
}

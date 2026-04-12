const fs = require('fs');

const path = 'frontend/onesurigao-ui/src/components/superadmin/SuperAdminAnnouncement.js';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(/\\\$/g, '$');
text = text.replace(/\\`/g, '`');

fs.writeFileSync(path, text, 'utf8');
console.log('Fixed syntax escapes');

const fs = require('fs');

const path = 'frontend/onesurigao-ui/src/components/ReusableBar/SurigaoHeader.jsx';
let text = fs.readFileSync(path, 'utf8');

const icon_def = `const MapTabIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>);`;

if (!text.includes('MapTabIcon =')) {
    text = text.replace('const ProfileIcon =', icon_def + '\nconst ProfileIcon =');
}

text = text.replace(
    'const quickAccessLabels = ["Search", "AI Chat"];',
    'const quickAccessLabels = ["Search", "AI Chat", "Map"];'
);

// We need to add `{ label: "Map", icon: <MapTabIcon /> },` to all the tabs Arrays!
// There are three of them.
text = text.replace(/{ label: "Search", icon: <SearchIcon \/> },\s+\]/g, '{ label: "Search", icon: <SearchIcon /> },\n        { label: "Map", icon: <MapTabIcon /> },\n      ]');

// ROUTES dictionaries
text = text.replace(/"Hotlines": "\/hotlines", "Search": "\/search" };/g, '"Hotlines": "/hotlines", "Search": "/search", "Map": "/map" };');
text = text.replace(/"\/hotlines": "Hotlines", "\/search": "Search" };/g, '"/hotlines": "Hotlines", "/search": "Search", "/map": "Map" };');

text = text.replace(/"Hotlines": "\/superadmin\/hotlines", "Search": "\/superadmin\/search" };/g, '"Hotlines": "/superadmin/hotlines", "Search": "/superadmin/search", "Map": "/superadmin/map" };');
text = text.replace(/"\/superadmin\/hotlines": "Hotlines", "\/superadmin\/search": "Search" };/g, '"/superadmin/hotlines": "Hotlines", "/superadmin/search": "Search", "/superadmin/map": "Map" };');

text = text.replace(/"AI Chat": "\/home\/chat", "Search": "\/home\/search" };/g, '"AI Chat": "/home/chat", "Search": "/home/search", "Map": "/home/map" };');
text = text.replace(/"\/home\/chat": "AI Chat", "\/home\/search": "Search" };/g, '"/home/chat": "AI Chat", "/home/search": "Search", "/home/map": "Map" };');

fs.writeFileSync(path, text, 'utf8');
console.log('Done');

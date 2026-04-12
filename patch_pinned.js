const fs = require('fs');

const files = [
    'frontend/onesurigao-ui/src/components/admin/PinnedAnnouncement.js',
    'frontend/onesurigao-ui/src/components/superadmin/SuperAdminPinned.js',
    'frontend/onesurigao-ui/src/components/public/PublicPinned.js'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove the header paragraphs and hint banners
    content = content.replace(
        /<div style=\{\{marginBottom: ?20\}\}>\s*<h2[\s\S]*?<\/h2>\s*<p[\s\S]*?<\/p>\s*<\/div>\s*\{\/\* Hint banner \*\/}[\s\S]*?menu on your card to unpin it.\s*<\/div>/g,
        ''
    );
    
    // Some pages might not have the hint banner, just the header
    content = content.replace(
        /<div style=\{\{marginBottom: ?20\}\}>\s*<h2[\s\S]*?<\/h2>\s*<p[\s\S]*?<\/p>\s*<\/div>/g,
        ''
    );

    // 2. Replace ReactionBar completely
    const newReactionBar = `
// ─── Reaction Bar ─────────────────────────────────────────────────────────────
const ReactionBar = ({ announcement }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => { if (liked) { setLikes(l => l - 1); setLiked(false); } else { setLikes(l => l + 1); setLiked(true); if (disliked) { setDislikes(d => d - 1); setDisliked(false); } } };
  const handleDislike = () => { if (disliked) { setDislikes(d => d - 1); setDisliked(false); } else { setDislikes(d => d + 1); setDisliked(true); if (liked) { setLikes(l => l - 1); setLiked(false); } } };

  const btn = (active, activeColor) => ({
    display: "flex", alignItems: "center", gap: 6,
    background: active ? "#F8FBFF" : "transparent", border: "none", cursor: "pointer",
    fontSize: 12.5, fontFamily: DS.font, fontWeight: active ? 700 : 600,
    color: active ? activeColor : DS.textMuted,
    padding: "7px 12px", borderRadius: 12, transition: "all 0.15s",
  });

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px 10px", borderTop: \`1px solid \${DS.border}\` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <button style={btn(liked, DS.primary)} onClick={handleLike}
            onMouseEnter={e => { e.currentTarget.style.background = DS.primaryLight; e.currentTarget.style.color = DS.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = liked ? "#F8FBFF" : "transparent"; e.currentTarget.style.color = liked ? DS.primary : DS.textMuted; }}>
            <ThumbsUpIcon filled={liked} /> Like{likes > 0 && <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2 }}>{likes}</span>}
          </button>
          <button style={btn(disliked, "#C53030")} onClick={handleDislike}
            onMouseEnter={e => { e.currentTarget.style.background = "#FFF5F5"; e.currentTarget.style.color = "#C53030"; }}
            onMouseLeave={e => { e.currentTarget.style.background = disliked ? "#F8FBFF" : "transparent"; e.currentTarget.style.color = disliked ? "#C53030" : DS.textMuted; }}>
            <ThumbsDownIcon filled={disliked} /> Dislike{dislikes > 0 && <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2 }}>{dislikes}</span>}
          </button>
          <button style={btn(false, DS.primary)} onClick={() => setShowComments(true)}
            onMouseEnter={e => { e.currentTarget.style.background = DS.primaryLight; e.currentTarget.style.color = DS.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = DS.textMuted; }}>
            <MessageCircleIcon /> Comment
          </button>
        </div>
      </div>
      {showComments && <CommentModal announcement={announcement} onClose={() => setShowComments(false)} />}
    </>
  );
};
`;
    // Find the current ReactionBar block
    const reactBarRegex = /\/\/\s*───\s*Reaction Bar[\s\S]*?(?=\/\/\s*───\s*Card Skeleton)/;
    content = content.replace(reactBarRegex, newReactionBar + "\n");

    // 3. PinnedCard styles:
    // Update the card wrapper to remove border/shadow gap
    content = content.replace(
        /<div style=\{\{background:DS\.card,borderRadius:12,boxShadow:DS\.shadow,marginBottom:14,overflow:"hidden",position:"relative",border:`1px solid \$\{DS.pinnedBorder\}`,borderLeft:`4px solid \$\{DS\.pinned\}`,transition:"box-shadow 0\.2s"\}\}\n\s*onMouseEnter=\{e=>e\.currentTarget\.style\.boxShadow=DS\.shadowHover\}\n\s*onMouseLeave=\{e=>e\.currentTarget\.style\.boxShadow=DS\.shadow\}>/g,
        `<div style={{ background: DS.card, borderRadius: 0, marginBottom: 0, overflow: "hidden", position: "relative", border: "none", borderBottom: "1px solid #f0f0f0", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"}
      onMouseLeave={e => e.currentTarget.style.background = DS.card}>`
    );

    // Replace the pinned ribbon to match AnnouncementCard isPinned Ribbon
    content = content.replace(
        /\{\/\* Pinned ribbon \*\/\}[\s\S]*?<\/div>/g,
        `<div style={{ position: "absolute", top: 14, right: 14, background: "#E7F2FF", color: DS.primary, fontSize: 10, fontWeight: 800, padding: "5px 10px", borderRadius: 999, fontFamily: DS.font, display: "flex", alignItems: "center", gap: 4 }}>
          <PinSolidIcon /> PINNED
        </div>`
    );

    // Footer removal (the building icon footer is not in standard announcements)
    content = content.replace(
        /\{\/\* Footer \*\/\}[\s\S]*?<\/div>\s*<ReactionBar/g,
        '<ReactionBar'
    );

    // Padding/margins fixes on Title and Body
    content = content.replace(
        /<div style=\{\{padding:"12px 20px 6px",fontWeight:700,fontSize:16/g,
        '<div style={{padding:"14px 20px 0",fontWeight:700,fontSize:17'
    );
    content = content.replace(
        /<div style=\{\{padding:"0 20px 14px",fontSize:14,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.75/g,
        '<div style={{padding:"10px 20px 0",fontSize:14,color:DS.textSecondary,fontFamily:DS.font,lineHeight:1.8'
    );

    fs.writeFileSync(file, content, 'utf8');
}
console.log("Pinned Pages Patched successfully.");

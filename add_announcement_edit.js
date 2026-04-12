const fs = require('fs');
const path = 'frontend/onesurigao-ui/src/components/admin/AdminAnnouncement.js';
let content = fs.readFileSync(path, 'utf8');

// Normalize line endings to avoid regex issues
content = content.replace(/\r\n/g, '\n');

// 1. Add editingPost state in AdminAnnouncement
content = content.replace(
  /const \[editingDraft, setEditingDraft\] = useState\(null\);/g,
  `const [editingDraft, setEditingDraft] = useState(null);\n  const [editingPost, setEditingPost] = useState(null);`
);

// 2. Update handlePost to support PATCH if editingPost is set
content = content.replace(
  /const fd = new FormData\(\);\n\s*fd\.append\("title", form\.title\); fd\.append\("content", form\.content\);\n\s*if \(adminID\) fd\.append\("admin_id", adminID\);\n\s*\(form\.mediaFiles \|\| \[\]\)\.forEach\(f => fd\.append\("mediaFiles", f\)\);\n\s*apiClient\.post\("\/api\/announcements\/", fd\)\n\s*\.then\(res => \{ setAnnouncements\(\[res\.data, \.\.\.announcements\]\); setShowModal\(false\); setEditingDraft\(null\); if \(editingDraft\) persistDrafts\(drafts\.filter\(d => d\.id !== editingDraft\.id\)\); \}\)\n\s*\.catch\(err => alert\(`Failed to post: \$\{JSON\.stringify\(err\.response\?\.data \|\| err\.message\)\}`\)\);/g,
  `const fd = new FormData();
    fd.append("title", form.title); fd.append("content", form.content);
    if (adminID) fd.append("admin_id", adminID);
    (form.mediaFiles || []).forEach(f => fd.append("mediaFiles", f));
    
    if (editingPost) {
      apiClient.patch(\`/api/announcements/\${editingPost.id}/\`, fd)
        .then(res => {
          setAnnouncements(announcements.map(a => a.id === editingPost.id ? res.data : a));
          setShowModal(false); setEditingPost(null);
        })
        .catch(err => alert(\`Failed to update: \${JSON.stringify(err.response?.data || err.message)}\`));
      return;
    }

    apiClient.post("/api/announcements/", fd)
      .then(res => { setAnnouncements([res.data, ...announcements]); setShowModal(false); setEditingDraft(null); if (editingDraft) persistDrafts(drafts.filter(d => d.id !== editingDraft.id)); })
      .catch(err => alert(\`Failed to post: \${JSON.stringify(err.response?.data || err.message)}\`));`
);

// 3. Update AnnouncementCard props definition
content = content.replace(
  /const AnnouncementCard = \(\{ announcement, currentAdminID, onPin \}\) => \{/g,
  `const AnnouncementCard = ({ announcement, currentAdminID, onPin, onEditPost }) => {`
);

// 4. Update the "three dots" menu in AnnouncementCard to show "Edit Post"
content = content.replace(
  /<button onClick=\{\(\) => \{ onPin\(announcement\); setMenuOpen\(false\); \}\}/g,
  `<button onClick={() => { onEditPost && onEditPost(announcement); setMenuOpen(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: DS.textPrimary, fontFamily: DS.font, textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = DS.bg} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <span style={{ color: DS.textMuted, display: "flex" }}><EditIcon /></span>
                  Edit Post
                </button>
                <div style={{height:1, background:DS.border}}/>
                <button onClick={() => { onPin(announcement); setMenuOpen(false); }}`
);

// 5. Update PostModal payload mapping
content = content.replace(
  /editDraft=\{editingDraft\}/g,
  `editDraft={editingDraft || editingPost}`
);

// 6. Update mapping props when rendering <AnnouncementCard>
content = content.replace(
  /<AnnouncementCard\n\s*key=\{a\.id\}\n\s*announcement=\{a\}\n\s*currentAdminID=\{adminID\}\n\s*onPin=\{handlePin\}\n\s*\/>/g,
  `<AnnouncementCard
                    key={a.id}
                    announcement={a}
                    currentAdminID={adminID}
                    onPin={handlePin}
                    onEditPost={(post) => { setEditingPost(post); setShowModal(true); }}
                  />`
);

// 7. Make sure PostModal properly closes and resets editingPost
content = content.replace(
  /<PostModal\n\s*onClose=\{\(\) => setShowModal\(false\)\}\n\s*onPost=\{handlePost\}\n\s*onSaveDraft=\{handleSaveDraft\}\n\s*editDraft=\{editingDraft \|\| editingPost\}\n\s*\/>/g,
  `<PostModal
            onClose={() => { setShowModal(false); setEditingDraft(null); setEditingPost(null); }}
            onPost={handlePost}
            onSaveDraft={handleSaveDraft}
            editDraft={editingDraft || editingPost}
          />`
);

// 8. Update Composer "Start an update" to clear editingPost
content = content.replace(
  /onOpenComposer=\{\(\) => setShowModal\(true\)\}/g,
  `onOpenComposer={() => { setEditingDraft(null); setEditingPost(null); setShowModal(true); }}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully patched AdminAnnouncement.js with the Edit feature!");

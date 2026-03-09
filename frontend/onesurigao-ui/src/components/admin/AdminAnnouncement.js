// src/components/admin/AdminAnnouncement.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../ReusableBar/Layout";

const API_URL = "http://127.0.0.1:8000/api/announcements/";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ThumbUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DotsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const DraftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PinIcon = ({ filled = false }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Office Seal ──────────────────────────────────────────────────────────────

const OfficeSeal = () => (
  <div style={{
    width: 44, height: 44, borderRadius: "50%",
    background: "linear-gradient(135deg, #c0392b 0%, #8b0000 100%)",
    border: "2px solid #ddd",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width="26" height="26" viewBox="0 0 50 50" fill="none">
      <path d="M25 5 L42 14 L42 30 Q42 42 25 47 Q8 42 8 30 L8 14 Z" fill="#d4a017" opacity="0.9" />
      <path d="M25 10 L38 17 L38 29 Q38 39 25 43 Q12 39 12 29 L12 17 Z" fill="#8b0000" />
      <polygon points="25,14 26.5,19 31.5,19 27.5,22 29,27 25,24 21,27 22.5,22 18.5,19 23.5,19" fill="#d4a017" />
    </svg>
  </div>
);

// ─── Announcement Form (Enhanced) ─────────────────────────────────────────────

const AnnouncementForm = ({ initial = { title: "", content: "", mediaFiles: [], scheduleEnabled: false, scheduledAt: "" }, onPost, onSaveDraft, onCancel }) => {
  const [form, setForm] = useState(initial);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(initial);
    setMediaPreviews([]);
  }, [initial.title, initial.content]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (files) => {
    const arr = Array.from(files);
    const newPreviews = arr.map(f => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
      file: f,
    }));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
    setForm(prev => ({ ...prev, mediaFiles: [...(prev.mediaFiles || []), ...arr] }));
  };

  const removeMedia = (idx) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== idx));
    setForm(prev => ({ ...prev, mediaFiles: prev.mediaFiles.filter((_, i) => i !== idx) }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Min datetime for schedule = now + 5 min
  const minDateTime = () => {
    const d = new Date(Date.now() + 5 * 60000);
    return d.toISOString().slice(0, 16);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 14,
    border: "1.5px solid #dde3ec", borderRadius: 8,
    outline: "none", boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif", transition: "border-color 0.2s",
    background: "#fff",
  };

  return (
    <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "calc(90vh - 70px)" }}>

      {/* ── Title ── */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, color: "#444", fontFamily: "'Segoe UI', sans-serif" }}>
          Title <span style={{ color: "#e53935" }}>*</span>
        </label>
        <input type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="Enter announcement title..."
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = "#1976d2"}
          onBlur={(e) => e.target.style.borderColor = "#dde3ec"} />
      </div>

      {/* ── Content ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, color: "#444", fontFamily: "'Segoe UI', sans-serif" }}>
          Content <span style={{ color: "#e53935" }}>*</span>
        </label>
        <textarea name="content" value={form.content} onChange={handleChange} rows={6}
          placeholder="Write the announcement content here..."
          style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
          onFocus={(e) => e.target.style.borderColor = "#1976d2"}
          onBlur={(e) => e.target.style.borderColor = "#dde3ec"} />
      </div>

      {/* ── Media Upload ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13, color: "#444", fontFamily: "'Segoe UI', sans-serif" }}>
          Attach Photo / Video <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>(optional)</span>
        </label>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#1976d2" : "#c8d6e8"}`,
            borderRadius: 10,
            padding: "22px 16px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "#eef5ff" : "#f8fafd",
            transition: "all 0.2s",
          }}
        >
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)} />
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ color: "#1976d2" }}><UploadIcon /></span>
            <span style={{ color: "#888" }}><VideoIcon /></span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#666", fontFamily: "'Segoe UI', sans-serif" }}>
            <span style={{ color: "#1976d2", fontWeight: 600 }}>Click to upload</span> or drag & drop
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif" }}>
            PNG, JPG, GIF, MP4, MOV supported
          </p>
        </div>

        {/* Previews */}
        {mediaPreviews.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            {mediaPreviews.map((m, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1.5px solid #e0e8f4", background: "#f0f4fa" }}>
                {m.type.startsWith("image/") ? (
                  <img src={m.url} alt={m.name} style={{ width: 90, height: 72, objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: 90, height: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <VideoIcon />
                    <span style={{ fontSize: 10, color: "#666", fontFamily: "'Segoe UI', sans-serif", padding: "0 4px", textAlign: "center", wordBreak: "break-all" }}>{m.name.slice(0, 14)}</span>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
                  style={{
                    position: "absolute", top: 3, right: 3,
                    background: "rgba(0,0,0,0.6)", border: "none",
                    color: "#fff", borderRadius: "50%",
                    width: 20, height: 20, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                ><XIcon /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Schedule Post ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          background: form.scheduleEnabled ? "#eef5ff" : "#f8fafd",
          border: `1.5px solid ${form.scheduleEnabled ? "#90bff0" : "#dde3ec"}`,
          borderRadius: 10, padding: "14px 16px",
          transition: "all 0.2s",
        }}>
          {/* Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
            onClick={() => setForm(f => ({ ...f, scheduleEnabled: !f.scheduleEnabled, scheduledAt: "" }))}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: form.scheduleEnabled ? "#1976d2" : "#888", display: "flex" }}><ClockIcon /></span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.scheduleEnabled ? "#1a56a0" : "#444", fontFamily: "'Segoe UI', sans-serif" }}>
                  Schedule Post
                </div>
                <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Segoe UI', sans-serif" }}>
                  Choose when to publish this announcement
                </div>
              </div>
            </div>
            {/* Toggle Switch */}
            <div style={{
              width: 42, height: 24, borderRadius: 12,
              background: form.scheduleEnabled ? "#1976d2" : "#cdd5e0",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 3,
                left: form.scheduleEnabled ? 21 : 3,
                width: 18, height: 18, borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </div>
          </div>

          {/* Date/Time Picker */}
          {form.scheduleEnabled && (
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#555", fontFamily: "'Segoe UI', sans-serif" }}>
                <CalendarIcon /> Select Date & Time
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                min={minDateTime()}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  border: "1.5px solid #90bff0",
                  background: "#fff",
                  fontSize: 13,
                  color: form.scheduledAt ? "#1a1a1a" : "#aaa",
                }}
                onFocus={(e) => e.target.style.borderColor = "#1976d2"}
                onBlur={(e) => e.target.style.borderColor = "#90bff0"}
              />
              {form.scheduledAt && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <ClockIcon />
                  Will be posted on: <strong style={{ marginLeft: 4 }}>{new Date(form.scheduledAt).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4, borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
        <button onClick={onCancel}
          style={{ background: "#f0f2f5", border: "none", padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555", fontFamily: "'Segoe UI', sans-serif" }}>
          Cancel
        </button>
        {onSaveDraft && (
          <button onClick={() => form.title && onSaveDraft(form)}
            style={{ background: "#fff", border: "1.5px solid #1976d2", padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif" }}>
            Save as Draft
          </button>
        )}
        <button
          onClick={() => form.title && form.content && onPost(form)}
          style={{
            background: form.scheduleEnabled && form.scheduledAt
              ? "linear-gradient(135deg, #0d7c3d, #16a34a)"
              : "linear-gradient(135deg, #1a56a0, #1976d2)",
            color: "#fff", border: "none", padding: "10px 24px",
            fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: "pointer",
            fontFamily: "'Segoe UI', sans-serif",
            boxShadow: form.scheduleEnabled && form.scheduledAt
              ? "0 2px 8px rgba(22,163,74,0.3)"
              : "0 2px 8px rgba(25,118,210,0.25)",
            display: "flex", alignItems: "center", gap: 7,
            transition: "all 0.2s",
          }}>
          {form.scheduleEnabled && form.scheduledAt
            ? <><ClockIcon /> Schedule Post</>
            : <><PlusIcon /> Post Announcement</>
          }
        </button>
      </div>
    </div>
  );
};

// ─── Post Modal (Bigger) ──────────────────────────────────────────────────────

const PostModal = ({ onClose, onPost, onSaveDraft, editDraft = null }) => (
  <div
    onClick={(e) => e.target === e.currentTarget && onClose()}
    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
    <div style={{
      background: "#fff", borderRadius: 14, width: "100%", maxWidth: 720,
      boxShadow: "0 16px 60px rgba(0,0,0,0.25)", overflow: "hidden",
      maxHeight: "90vh", display: "flex", flexDirection: "column",
    }}>
      {/* Modal Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a56a0, #1976d2)",
        padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {editDraft
              ? <EditIcon />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            }
          </div>
          <div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'Segoe UI', sans-serif", display: "block" }}>
              {editDraft ? "Edit Draft" : "Post Announcement"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "'Segoe UI', sans-serif" }}>
              {editDraft ? "Update your saved draft" : "Publish to all city residents"}
            </span>
          </div>
        </div>
        <button onClick={onClose}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          ✕
        </button>
      </div>

      {/* Modal Body */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        <AnnouncementForm
          initial={editDraft || { title: "", content: "", mediaFiles: [], scheduleEnabled: false, scheduledAt: "" }}
          onPost={onPost}
          onSaveDraft={onSaveDraft}
          onCancel={onClose}
        />
      </div>
    </div>
  </div>
);

// ─── Drafts Side Panel ────────────────────────────────────────────────────────

const DraftsPanel = ({ drafts, onEdit, onDelete, onPost, onClose }) => (
  <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", zIndex: 1000 }}>
    <div style={{ background: "#fff", width: 380, height: "100%", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg, #1a56a0, #1976d2)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DraftIcon />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'Segoe UI', sans-serif" }}>Saved Drafts</span>
          {drafts.length > 0 && <span style={{ background: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: 12, padding: "1px 8px", fontSize: 12, fontWeight: 700 }}>{drafts.length}</span>}
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {drafts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <p style={{ margin: 0 }}>No drafts saved yet.</p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} style={{ background: "#f9fafb", border: "1.5px solid #e8ecf0", borderRadius: 8, padding: "14px", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 4, fontFamily: "'Segoe UI', sans-serif" }}>{draft.title || "Untitled Draft"}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontFamily: "'Segoe UI', sans-serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{draft.content || "No content yet..."}</div>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10, fontFamily: "'Segoe UI', sans-serif" }}>Saved: {draft.savedAt}</div>
              {draft.scheduledAt && (
                <div style={{ fontSize: 11, color: "#1976d2", marginBottom: 10, fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  <ClockIcon /> Scheduled: {new Date(draft.scheduledAt).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onEdit(draft)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#fff", border: "1.5px solid #1976d2", borderRadius: 6, padding: "7px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif" }}><EditIcon /> Edit</button>
                <button onClick={() => onPost(draft)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "linear-gradient(135deg, #1a56a0, #1976d2)", border: "none", borderRadius: 6, padding: "7px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}><PlusIcon /> Post</button>
                <button onClick={() => onDelete(draft.id)} style={{ background: "#fff", border: "1.5px solid #ffcdd2", borderRadius: 6, padding: "7px 10px", cursor: "pointer", color: "#e53935", display: "flex", alignItems: "center" }}><TrashIcon /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div style={{ background: "#fff", borderRadius: 10, padding: "18px", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 16 }}>
    {[80, 100, 60].map((w, i) => (
      <div key={i} style={{ height: i === 0 ? 16 : 12, width: `${w}%`, background: "#f0f2f5", borderRadius: 6, marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
    ))}
  </div>
);

// ─── Announcement Card ────────────────────────────────────────────────────────

const AnnouncementCard = ({ announcement, currentAdminID, onPin }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLike = () => {
    if (liked) { setLikes(l => l - 1); setLiked(false); }
    else { setLikes(l => l + 1); setLiked(true); if (disliked) { setDislikes(d => d - 1); setDisliked(false); } }
  };
  const handleDislike = () => {
    if (disliked) { setDislikes(d => d - 1); setDisliked(false); }
    else { setDislikes(d => d + 1); setDisliked(true); if (liked) { setLikes(l => l - 1); setLiked(false); } }
  };

  const officeName = announcement.admin?.officeName || "Unknown Office";
  const createdDate = announcement.createdDate ? new Date(announcement.createdDate) : null;
  const dateStr = createdDate?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) || "";
  const timeStr = createdDate?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) || "";

  const isOwner = announcement.admin?.adminID === currentAdminID;
  const isPinned = announcement.isPinned;

  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 16, overflow: "visible", position: "relative" }}>
      {isPinned && (
        <div style={{
          position: "absolute", top: -10, left: 16,
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "3px 10px", borderRadius: 20,
          fontFamily: "'Segoe UI', sans-serif", letterSpacing: 0.5,
          display: "flex", alignItems: "center", gap: 4,
          boxShadow: "0 2px 6px rgba(217,119,6,0.4)",
        }}>
          📌 PINNED
        </div>
      )}

      <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <OfficeSeal />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>{officeName}</div>
            <div style={{ fontSize: 12, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>{dateStr} {timeStr && `| ${timeStr}`}</div>
          </div>
        </div>

        {isOwner && (
          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 4, borderRadius: 6 }}>
              <DotsIcon />
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.13)", border: "1px solid #e8ecf0", minWidth: 170, zIndex: 50, overflow: "hidden" }}>
                <button
                  onClick={() => { onPin(announcement); setMenuOpen(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: isPinned ? "#d97706" : "#333", fontFamily: "'Segoe UI', sans-serif", textAlign: "left" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <span style={{ color: isPinned ? "#d97706" : "#888", display: "flex" }}><PinIcon filled={isPinned} /></span>
                  {isPinned ? "Unpin Post" : "Pin Post"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "0 18px 6px", fontWeight: 700, fontSize: 15, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>
        {announcement.title}
      </div>

      <div style={{ padding: "0 18px 14px" }}>
        {announcement.content.split("\n\n").map((para, i) => (
          <p key={i} style={{ fontSize: 14, color: "#333", lineHeight: 1.75, fontFamily: "'Segoe UI', sans-serif", textAlign: "justify", margin: i === 0 ? "0 0 10px 0" : "0" }}>{para}</p>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #f0f0f0", margin: "0 18px" }} />

      <div style={{ padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: liked ? "#1976d2" : "#666", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", fontWeight: liked ? 700 : 400, transition: "color 0.15s" }}><ThumbUp /> {likes}</button>
          <button onClick={handleDislike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: disliked ? "#e53935" : "#666", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", fontWeight: disliked ? 700 : 400, transition: "color 0.15s" }}><ThumbDown /> {dislikes}</button>
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#666", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}><CommentIcon /> COMMENT</button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

function AdminAnnouncement() {
  const location = useLocation();
  const adminID = location.state?.adminID || Number(sessionStorage.getItem("adminID")) || null;
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("announcement_drafts") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    setLoading(true);
    axios.get(API_URL)
      .then((res) => {
        setAnnouncements(Array.isArray(res.data) ? res.data : res.data.results || []);
        setError(null);
      })
      .catch(() => setError("Failed to load announcements. Is your Django server running?"))
      .finally(() => setLoading(false));
  }, []);

  const persistDrafts = (updated) => {
    setDrafts(updated);
    sessionStorage.setItem("announcement_drafts", JSON.stringify(updated));
  };

  const handlePost = (form) => {
    // If scheduled, save as draft with schedule info instead of posting immediately
    if (form.scheduleEnabled && form.scheduledAt) {
      const now = new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
      const scheduleDraft = {
        id: editingDraft?.id || Date.now(),
        title: form.title,
        content: form.content,
        scheduledAt: form.scheduledAt,
        scheduleEnabled: true,
        savedAt: now,
        isScheduled: true,
      };
      if (editingDraft) {
        persistDrafts(drafts.map(d => d.id === editingDraft.id ? scheduleDraft : d));
      } else {
        persistDrafts([scheduleDraft, ...drafts]);
      }
      setShowModal(false);
      setEditingDraft(null);
      alert(`✅ Announcement scheduled for ${new Date(form.scheduledAt).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`);
      return;
    }

    // Immediate post
    axios.post(API_URL, { title: form.title, content: form.content, admin_id: adminID })
      .then((res) => {
        setAnnouncements([res.data, ...announcements]);
        setShowModal(false);
        setEditingDraft(null);
        if (editingDraft) persistDrafts(drafts.filter(d => d.id !== editingDraft.id));
      })
      .catch((err) => {
        alert(`Failed to post: ${JSON.stringify(err.response?.data || err.message)}`);
      });
  };

  const handleSaveDraft = (form) => {
    const now = new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    if (editingDraft) {
      persistDrafts(drafts.map(d => d.id === editingDraft.id ? { ...d, ...form, savedAt: now } : d));
    } else {
      persistDrafts([{ id: Date.now(), ...form, savedAt: now }, ...drafts]);
    }
    setShowModal(false);
    setEditingDraft(null);
  };

  const handlePin = (announcement) => {
    const newPinned = !announcement.isPinned;
    axios.patch(`${API_URL}${announcement.id}/`, { isPinned: newPinned })
      .then((res) => {
        setAnnouncements(announcements.map(a => a.id === announcement.id ? res.data : a));
      })
      .catch((err) => {
        alert(`Failed to ${newPinned ? "pin" : "unpin"}: ${JSON.stringify(err.response?.data || err.message)}`);
      });
  };

  const handleEditDraft = (draft) => { setEditingDraft(draft); setShowDrafts(false); setShowModal(true); };
  const handleDeleteDraft = (id) => persistDrafts(drafts.filter(d => d.id !== id));
  const handlePostDraft = (draft) => { setEditingDraft(draft); handlePost(draft); setShowDrafts(false); };

  return (
    <Layout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif" }}>City Announcement Administration</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Oversee and publish official public advisories.</p>
          {officeName && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 }}>Logged in as: {officeName}</p>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowDrafts(true)} style={{ display: "flex", alignItems: "center", gap: 7, position: "relative", background: "#fff", border: "1.5px solid #dde3ec", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#444", fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <DraftIcon /> DRAFT
            {drafts.length > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#e53935", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{drafts.length}</span>}
          </button>
          <button onClick={() => { setEditingDraft(null); setShowModal(true); }} style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg, #1a56a0, #1976d2)", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 8px rgba(25,118,210,0.3)" }}>
            <PlusIcon /> POST ANNOUNCEMENT
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c62828", fontFamily: "'Segoe UI', sans-serif" }}>⚠️ {error}</div>}
      {loading && [1, 2].map(i => <CardSkeleton key={i} />)}

      {!loading && !error && announcements.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 10, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📢</div>
          No announcements yet. Click <strong>+ POST ANNOUNCEMENT</strong> to add one.
        </div>
      )}

      {!loading && announcements.map((a) => (
        <AnnouncementCard key={a.id} announcement={a} currentAdminID={adminID} onPin={handlePin} />
      ))}

      {showModal && <PostModal onClose={() => { setShowModal(false); setEditingDraft(null); }} onPost={handlePost} onSaveDraft={handleSaveDraft} editDraft={editingDraft} />}
      {showDrafts && <DraftsPanel drafts={drafts} onEdit={handleEditDraft} onDelete={handleDeleteDraft} onPost={handlePostDraft} onClose={() => setShowDrafts(false)} />}
    </Layout>
  );
}

export default AdminAnnouncement;
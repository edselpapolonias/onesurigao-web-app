// src/components/superadmin/SuperAdminHotlines.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import SuperAdminLayout from "../ReusableBar/SuperAdminLayout";

const CAT_URL    = "http://127.0.0.1:8000/public/hotline-categories/";
const HOT_URL    = "http://127.0.0.1:8000/public/hotlines/";

const EMOJI_OPTIONS = ["📞","🚨","🚒","🚑","🚓","💡","🏥","🏫","🌊","🔒","🗑️","🚦","🧑‍🤝‍🧑","📝","🛡️","⚡","🌐"];

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>);
const EditIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const PhoneIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);

const inputStyle = { width: "100%", padding: "9px 13px", fontSize: 13, border: "1.5px solid #dde3ec", borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", background: "#fff", transition: "border-color 0.2s" };

// ─── Add/Edit Hotline Modal ───────────────────────────────────────────────────
const HotlineModal = ({ categoryID, hotline, onClose, onSave }) => {
  const [form, setForm] = useState({ name: hotline?.name || "", contactNumber: hotline?.contactNumber || "", category: categoryID });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.contactNumber.trim()) { alert("Please fill in all fields."); return; }
    setSaving(true);
    try {
      if (hotline) {
        await axios.patch(`${HOT_URL}${hotline.id}/`, form);
      } else {
        await axios.post(HOT_URL, form);
      }
      onSave();
      onClose();
    } catch { alert("Failed to save hotline."); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #0d3b7a, #1976d2)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Segoe UI', sans-serif" }}>{hotline ? "Edit Hotline" : "Add Hotline"}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "22px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Office / Service Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency Response Service" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Contact Number *</label>
            <input value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} placeholder="e.g. 0929-420-9511" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "#f0f2f5", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555", fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "10px", background: saving ? "#9ab8e0" : "linear-gradient(135deg, #0d3b7a, #1976d2)", color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif" }}>
              {saving ? "Saving..." : hotline ? "Save Changes" : "Add Hotline"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Add/Edit Category Modal ──────────────────────────────────────────────────
const CategoryModal = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState({ name: category?.name || "", icon: category?.icon || "📞" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Please enter a category name."); return; }
    setSaving(true);
    try {
      if (category) {
        await axios.patch(`${CAT_URL}${category.id}/`, form);
      } else {
        await axios.post(CAT_URL, form);
      }
      onSave();
      onClose();
    } catch { alert("Failed to save category."); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #0d3b7a, #1976d2)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Segoe UI', sans-serif" }}>{category ? "Edit Category" : "Add Category"}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "22px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Category Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency Services Hotlines" style={inputStyle} onFocus={e => e.target.style.borderColor = "#1976d2"} onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 12, color: "#555", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Icon</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, icon: e }))} style={{ width: 40, height: 40, fontSize: 20, border: `2px solid ${form.icon === e ? "#1976d2" : "#e8ecf0"}`, borderRadius: 8, background: form.icon === e ? "#eef5ff" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "#f0f2f5", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555", fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "10px", background: saving ? "#9ab8e0" : "linear-gradient(135deg, #0d3b7a, #1976d2)", color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif" }}>
              {saving ? "Saving..." : category ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Category Section ─────────────────────────────────────────────────────────
const CategorySection = ({ category, onEdit, onDelete, onRefresh }) => {
  const [open, setOpen] = useState(true);
  const [addingHotline, setAddingHotline] = useState(false);
  const [editingHotline, setEditingHotline] = useState(null);

  const handleDeleteHotline = async (id) => {
    if (!window.confirm("Delete this hotline?")) return;
    await axios.delete(`${HOT_URL}${id}/`);
    onRefresh();
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 16, overflow: "hidden", border: "1px solid #e8ecf0" }}>
      {/* Category Header */}
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafd", borderBottom: open ? "1px solid #f0f0f0" : "none" }}>
        <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #eef5ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{category.icon}</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", textTransform: "uppercase", letterSpacing: 0.4 }}>{category.name}</span>
            <span style={{ marginLeft: 8, fontSize: 11, background: "#eef5ff", color: "#1976d2", borderRadius: 10, padding: "2px 8px", fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>{category.hotlines.length} hotlines</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setAddingHotline(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg, #0d3b7a, #1976d2)", border: "none", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>
            <PlusIcon /> Add
          </button>
          <button onClick={() => onEdit(category)} style={{ background: "#eef5ff", border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", color: "#1976d2", display: "flex", alignItems: "center" }}><EditIcon /></button>
          <button onClick={() => onDelete(category.id)} style={{ background: "#fff3f3", border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", color: "#e53935", display: "flex", alignItems: "center" }}><TrashIcon /></button>
        </div>
      </div>

      {/* Hotlines */}
      {open && (
        <div style={{ padding: "14px 18px" }}>
          {category.hotlines.length === 0 && (
            <div style={{ textAlign: "center", color: "#aaa", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", padding: "16px 0" }}>
              No hotlines yet. Click <strong>+ Add</strong> to add one.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {category.hotlines.map(h => (
              <div key={h.id} style={{ background: "#f8fafd", border: "1.5px solid #e8ecf0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 }}>{h.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "#555", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>
                  <span style={{ color: "#1976d2" }}><PhoneIcon /></span>
                  {h.contactNumber}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditingHotline(h)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#eef5ff", border: "none", borderRadius: 6, padding: "5px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#1976d2", fontFamily: "'Segoe UI', sans-serif" }}><EditIcon /> Edit</button>
                  <button onClick={() => handleDeleteHotline(h.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#fff3f3", border: "none", borderRadius: 6, padding: "5px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#e53935", fontFamily: "'Segoe UI', sans-serif" }}><TrashIcon /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {addingHotline && <HotlineModal categoryID={category.id} onClose={() => setAddingHotline(false)} onSave={onRefresh} />}
      {editingHotline && <HotlineModal categoryID={category.id} hotline={editingHotline} onClose={() => setEditingHotline(null)} onSave={onRefresh} />}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function SuperAdminHotlines() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    axios.get(CAT_URL)
      .then(res => setCategories(Array.isArray(res.data) ? res.data : res.data.results || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category and all its hotlines?")) return;
    await axios.delete(`${CAT_URL}${id}/`);
    fetchCategories();
  };

  return (
    <SuperAdminLayout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Segoe UI', sans-serif", letterSpacing: -0.5 }}>Manage Hotlines</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", fontFamily: "'Segoe UI', sans-serif" }}>Add and manage emergency contacts and service hotlines</p>
        </div>
        <button onClick={() => setAddingCategory(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg, #0d3b7a, #1976d2)", border: "none", padding: "10px 20px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 8px rgba(13,59,122,0.3)" }}>
          <PlusIcon /> Add Category
        </button>
      </div>

      {loading && [1, 2].map(i => <div key={i} style={{ background: "#fff", borderRadius: 12, height: 60, marginBottom: 14, animation: "pulse 1.5s ease-in-out infinite" }} />)}

      {!loading && categories.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "48px 20px", textAlign: "center", color: "#aaa", fontSize: 14, fontFamily: "'Segoe UI', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📞</div>
          No hotline categories yet. Click <strong>Add Category</strong> to get started.
        </div>
      )}

      {!loading && categories.map(cat => (
        <CategorySection
          key={cat.id}
          category={cat}
          onEdit={setEditingCategory}
          onDelete={handleDeleteCategory}
          onRefresh={fetchCategories}
        />
      ))}

      {addingCategory && <CategoryModal onClose={() => setAddingCategory(false)} onSave={fetchCategories} />}
      {editingCategory && <CategoryModal category={editingCategory} onClose={() => setEditingCategory(null)} onSave={fetchCategories} />}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </SuperAdminLayout>
  );
}

export default SuperAdminHotlines;
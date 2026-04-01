// src/components/superadmin/SuperAdminHotlines.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import SuperAdminLayout from "../ReusableBar/SuperAdminLayout";

const CAT_URL = "http://127.0.0.1:8000/public/hotline-categories/";
const HOT_URL = "http://127.0.0.1:8000/public/hotlines/";

const EMOJI_OPTIONS = ["📞","🚨","🚒","🚑","🚓","💡","🏥","🏫","🌊","🔒","🗑️","🚦","🛡️","⚡","🌐","📝","🧑‍🤝‍🧑"];

const DS = {
  primary:      "#2B6CB0", primaryDark:"#1E4E8C", primaryLight:"#EBF4FF",
  primaryGrad:  "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
  bg:           "#F5F7FA", card:"#FFFFFF", border:"#E2E8F0",
  textPrimary:  "#1A202C", textSecondary:"#4A5568", textMuted:"#718096",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover:  "0 4px 16px rgba(0,0,0,0.10)",
  shadowModal:  "0 24px 80px rgba(0,0,0,0.28)",
  font:         "'Segoe UI', system-ui, sans-serif",
};

const PlusIcon  = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const TrashIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>);
const EditIcon  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const PhoneIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const ChevronIcon = ({ open }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{transition:"transform 0.25s",transform:open?"rotate(180deg)":"rotate(0deg)"}}><polyline points="6 9 12 15 18 9"/></svg>);
const XIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

const inputSt = {width:"100%",padding:"10px 14px",fontSize:13,border:`1.5px solid ${DS.border}`,borderRadius:8,outline:"none",boxSizing:"border-box",fontFamily:DS.font,background:DS.card,transition:"border-color 0.2s",color:DS.textPrimary};
const labelSt = {display:"block",marginBottom:6,fontWeight:600,fontSize:11,color:DS.textMuted,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.6};

// ─── Hotline Modal ─────────────────────────────────────────────────────────────
const HotlineModal = ({ categoryID, hotline, onClose, onSave }) => {
  const [form, setForm] = useState({name:hotline?.name||"",contactNumber:hotline?.contactNumber||"",category:categoryID});
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if(!form.name.trim()||!form.contactNumber.trim()){alert("Please fill in all fields.");return;}
    setSaving(true);
    try{if(hotline){await axios.patch(`${HOT_URL}${hotline.id}/`,form);}else{await axios.post(HOT_URL,form);}onSave();onClose();}
    catch{alert("Failed to save hotline.");}finally{setSaving(false);}
  };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(2px)"}}>
      <div style={{background:DS.card,borderRadius:14,width:"100%",maxWidth:460,boxShadow:DS.shadowModal,overflow:"hidden",animation:"slideUp 0.22s ease"}}>
        <div style={{background:DS.primaryGrad,padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:"#fff",fontWeight:800,fontSize:15,fontFamily:DS.font}}>{hotline?"Edit Hotline":"Add Hotline"}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
        </div>
        <div style={{padding:"22px"}}>
          <div style={{marginBottom:14}}><label style={labelSt}>Office / Service Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Emergency Response Service" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
          <div style={{marginBottom:20}}><label style={labelSt}>Contact Number *</label><input value={form.contactNumber} onChange={e=>setForm({...form,contactNumber:e.target.value})} placeholder="e.g. 0929-420-9511" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"10px",background:DS.bg,border:`1.5px solid ${DS.border}`,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textSecondary,fontFamily:DS.font}}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{flex:2,padding:"10px",background:saving?"#9AB8E0":DS.primaryGrad,color:"#fff",border:"none",borderRadius:8,cursor:saving?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font}}>
              {saving?"Saving...":hotline?"Save Changes":"Add Hotline"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Category Modal ────────────────────────────────────────────────────────────
const CategoryModal = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState({name:category?.name||"",icon:category?.icon||"📞"});
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if(!form.name.trim()){alert("Please enter a category name.");return;}
    setSaving(true);
    try{if(category){await axios.patch(`${CAT_URL}${category.id}/`,form);}else{await axios.post(CAT_URL,form);}onSave();onClose();}
    catch{alert("Failed to save category.");}finally{setSaving(false);}
  };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(2px)"}}>
      <div style={{background:DS.card,borderRadius:14,width:"100%",maxWidth:480,boxShadow:DS.shadowModal,overflow:"hidden",animation:"slideUp 0.22s ease"}}>
        <div style={{background:DS.primaryGrad,padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:"#fff",fontWeight:800,fontSize:15,fontFamily:DS.font}}>{category?"Edit Category":"Add Category"}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><XIcon/></button>
        </div>
        <div style={{padding:"22px"}}>
          <div style={{marginBottom:14}}><label style={labelSt}>Category Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Emergency Services Hotlines" style={inputSt} onFocus={e=>e.target.style.borderColor=DS.primary} onBlur={e=>e.target.style.borderColor=DS.border}/></div>
          <div style={{marginBottom:20}}>
            <label style={labelSt}>Icon</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {EMOJI_OPTIONS.map(em=>(
                <button key={em} onClick={()=>setForm(f=>({...f,icon:em}))} style={{width:40,height:40,fontSize:20,border:`2px solid ${form.icon===em?DS.primary:DS.border}`,borderRadius:8,background:form.icon===em?DS.primaryLight:DS.card,cursor:"pointer",transition:"all 0.15s"}}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"10px",background:DS.bg,border:`1.5px solid ${DS.border}`,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.textSecondary,fontFamily:DS.font}}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{flex:2,padding:"10px",background:saving?"#9AB8E0":DS.primaryGrad,color:"#fff",border:"none",borderRadius:8,cursor:saving?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:DS.font}}>
              {saving?"Saving...":category?"Save Changes":"Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Category Section ──────────────────────────────────────────────────────────
const CategorySection = ({ category, onEdit, onDelete, onRefresh }) => {
  const [open, setOpen]               = useState(true);
  const [addingHotline, setAdding]    = useState(false);
  const [editingHotline, setEditing]  = useState(null);

  const handleDeleteHotline = async id => {
    if(!window.confirm("Delete this hotline?")) return;
    await axios.delete(`${HOT_URL}${id}/`); onRefresh();
  };

  return (
    <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,marginBottom:14,overflow:"hidden",border:`1px solid ${DS.border}`,transition:"box-shadow 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=DS.shadowHover}
      onMouseLeave={e=>e.currentTarget.style.boxShadow=DS.shadow}>

      {/* Header */}
      <div style={{padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F7FAFF",borderBottom:open?`1px solid ${DS.border}`:"none"}}>
        <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",flex:1}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:DS.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{category.icon}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontWeight:700,fontSize:13,color:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.4}}>{category.name}</span>
            <span style={{fontSize:11,background:DS.primaryLight,color:DS.primary,borderRadius:10,padding:"2px 8px",fontWeight:700,fontFamily:DS.font}}>{category.hotlines.length} hotlines</span>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setAdding(true)} style={{display:"flex",alignItems:"center",gap:5,background:DS.primaryGrad,border:"none",borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff",fontFamily:DS.font,boxShadow:"0 2px 6px rgba(43,108,176,0.25)"}}>
            <PlusIcon/> Add
          </button>
          <button onClick={()=>onEdit(category)} style={{background:DS.primaryLight,border:"none",borderRadius:7,padding:"6px 10px",cursor:"pointer",color:DS.primary,display:"flex",alignItems:"center"}}><EditIcon/></button>
          <button onClick={()=>onDelete(category.id)} style={{background:"#FFF5F5",border:"none",borderRadius:7,padding:"6px 10px",cursor:"pointer",color:"#C53030",display:"flex",alignItems:"center"}}><TrashIcon/></button>
        </div>
      </div>

      {/* Hotlines */}
      {open&&(
        <div style={{padding:"14px 18px"}}>
          {category.hotlines.length===0&&(
            <div style={{textAlign:"center",color:DS.textMuted,fontSize:13,fontFamily:DS.font,padding:"16px 0"}}>No hotlines yet. Click <strong>+ Add</strong> to add one.</div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {category.hotlines.map(h=>(
              <div key={h.id} style={{background:DS.bg,border:`1.5px solid ${DS.border}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontWeight:700,fontSize:12,color:DS.textPrimary,fontFamily:DS.font,marginBottom:6,textTransform:"uppercase",letterSpacing:0.3}}>{h.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,color:DS.textSecondary,fontSize:13,fontFamily:DS.font}}>
                  <span style={{color:DS.primary,display:"flex"}}><PhoneIcon/></span>{h.contactNumber}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>setEditing(h)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:DS.primaryLight,border:"none",borderRadius:6,padding:"5px",cursor:"pointer",fontSize:11,fontWeight:600,color:DS.primary,fontFamily:DS.font}}><EditIcon/> Edit</button>
                  <button onClick={()=>handleDeleteHotline(h.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:"#FFF5F5",border:"none",borderRadius:6,padding:"5px",cursor:"pointer",fontSize:11,fontWeight:600,color:"#C53030",fontFamily:DS.font}}><TrashIcon/> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {addingHotline&&<HotlineModal categoryID={category.id} onClose={()=>setAdding(false)} onSave={onRefresh}/>}
      {editingHotline&&<HotlineModal categoryID={category.id} hotline={editingHotline} onClose={()=>setEditing(null)} onSave={onRefresh}/>}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
function SuperAdminHotlines() {
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [addingCategory, setAddingCat]    = useState(false);
  const [editingCategory, setEditingCat]  = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    axios.get(CAT_URL).then(res=>setCategories(Array.isArray(res.data)?res.data:res.data.results||[])).finally(()=>setLoading(false));
  };

  useEffect(()=>{fetchCategories();},[]);

  const handleDeleteCategory = async id => {
    if(!window.confirm("Delete this category and all its hotlines?")) return;
    await axios.delete(`${CAT_URL}${id}/`); fetchCategories();
  };

  return (
    <SuperAdminLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>Manage Hotlines</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>Add and manage emergency contacts and service hotlines</p>
        </div>
        <button onClick={()=>setAddingCat(true)} style={{display:"flex",alignItems:"center",gap:7,background:DS.primaryGrad,border:"none",padding:"10px 18px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff",fontFamily:DS.font,boxShadow:"0 2px 8px rgba(43,108,176,0.3)"}}>
          <PlusIcon/> Add Category
        </button>
      </div>

      {loading&&[1,2].map(i=><div key={i} style={{background:DS.card,borderRadius:12,height:56,marginBottom:14,animation:"pulse 1.5s ease-in-out infinite",border:`1px solid ${DS.border}`}}/>)}

      {!loading&&categories.length===0&&(
        <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:`1px solid ${DS.border}`}}>
          <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><PhoneIcon/></div>
          No hotline categories yet. Click <strong>Add Category</strong> to get started.
        </div>
      )}

      {!loading&&categories.map(cat=>(
        <CategorySection key={cat.id} category={cat} onEdit={setEditingCat} onDelete={handleDeleteCategory} onRefresh={fetchCategories}/>
      ))}

      {addingCategory&&<CategoryModal onClose={()=>setAddingCat(false)} onSave={fetchCategories}/>}
      {editingCategory&&<CategoryModal category={editingCategory} onClose={()=>setEditingCat(null)} onSave={fetchCategories}/>}
    </SuperAdminLayout>
  );
}

export default SuperAdminHotlines;
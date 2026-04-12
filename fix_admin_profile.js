const fs = require('fs');

const path = 'frontend/onesurigao-ui/src/components/admin/AdminProfilePage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the announcement API call filtering
content = content.replace(
  /axios\.get\(`http:\/\/127\.0\.0\.1:8000\/api\/announcements\/\?admin_id=\$\{adminID\}`\)\s*\.then\(res => setAnn\(Array\.isArray\(res\.data\)\?res\.data:res\.data\.results\|\|\[\]\)\)/g,
  `axios.get(\`http://127.0.0.1:8000/api/announcements/\`)
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : res.data.results || [];
        setAnn(all.filter(a => a.admin?.adminID === Number(adminID)));
      })`
);

// Normalize newlines to \n to make finding easier
const normalizedContent = content.replace(/\r\n/g, '\n');

// 2. Rewrite the return section for better layout alignment
const searchStr = '  return (\n    <Layout>';
const oldReturnStart = normalizedContent.indexOf(searchStr);

if (oldReturnStart !== -1) {
  const newReturn = `  return (
    <Layout>
      <style>{\`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}\`}</style>
      
      <div style={{display:"flex",flexDirection:"column",gap:20}}>

        {/* ── Top Header: Profile Banner ── */}
        <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:\`1px solid \${DS.border}\`,overflow:"hidden",position:"relative"}}>
          {/* Cover Photo Area */}
          <div style={{height:180,background:DS.primaryGrad,position:"relative"}} />

          {/* Profile Details Bar */}
          <div style={{padding:"20px 24px 20px 180px",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:90}}>
            <div>
              {loadingAdmin ? (
                <>
                  <div style={{height:20,width:200,background:"#EDF2F7",borderRadius:6,marginBottom:6,animation:"pulse 1.5s ease-in-out infinite"}}/>
                  <div style={{height:14,width:140,background:"#EDF2F7",borderRadius:6,animation:"pulse 1.5s ease-in-out infinite"}}/>
                </>
              ) : (
                <>
                  <div style={{fontWeight:800,fontSize:22,color:DS.textPrimary,fontFamily:DS.font,textTransform:"uppercase",letterSpacing:0.3}}>{admin?.officeName}</div>
                  <div style={{fontSize:14,color:DS.textMuted,fontFamily:DS.font,marginTop:4}}>City Government Department</div>
                </>
              )}
            </div>
            
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontWeight:800,fontSize:18,color:DS.primary,fontFamily:DS.font}}>{announcements.length}</div>
                <div style={{fontSize:12,color:DS.textMuted,fontFamily:DS.font,fontWeight:600}}>Posts</div>
              </div>
              <button onClick={()=>setShowEdit(true)} style={{padding:"10px 16px",background:DS.primaryLight,border:\`1.5px solid \${DS.primary}\`,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DS.primary,fontFamily:DS.font,display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.background=DS.primaryGrad;e.currentTarget.style.color="#fff";}}
                onMouseLeave={e=>{e.currentTarget.style.background=DS.primaryLight;e.currentTarget.style.color=DS.primary;}}>
                <EditIcon/> Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Pic overlapping cover & details */}
          <div style={{position:"absolute",left:30,top:100,cursor:"pointer"}} onClick={()=>picRef.current?.click()}>
            <div style={{position:"relative"}}>
              {loadingAdmin
                ? <div style={{width:130,height:130,borderRadius:"50%",background:"#EDF2F7",border:"4px solid #fff",animation:"pulse 1.5s ease-in-out infinite"}}/>
                : profilePic
                  ? <img src={profilePic} alt="profile" style={{width:130,height:130,borderRadius:"50%",objectFit:"cover",border:"4px solid #fff",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}/>
                  : <div style={{width:130,height:130,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:38,fontWeight:800,fontFamily:DS.font,border:"4px solid #fff",boxShadow:"0 4px 16px rgba(43,108,176,0.3)"}}>
                      {admin?.officeName?.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"OF"}
                    </div>
              }
              <div style={{position:"absolute",bottom:6,right:6,width:32,height:32,borderRadius:"50%",background:DS.primaryGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.2)",border:"2px solid #fff"}}>
                <CameraIcon/>
              </div>
            </div>
            <input ref={picRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handlePicChange(e.target.files[0])}/>
          </div>
        </div>

        {/* ── Two-Column Body Below Banner ── */}
        <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
          
          {/* Account Info (Left Side) */}
          <div style={{width:320,flexShrink:0,position:"sticky",top:76}}>
            <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:\`1px solid \${DS.border}\`,padding:"18px 22px"}}>
              <div style={{fontWeight:800,fontSize:14,color:DS.textPrimary,fontFamily:DS.font,marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>About</div>
              {loadingAdmin
                ? [1,2,3].map(i=><div key={i} style={{height:12,background:"#EDF2F7",borderRadius:6,marginBottom:12,animation:"pulse 1.5s ease-in-out infinite"}}/>)
                : <>
                    <InfoRow icon={<BuildingIcon/>} label="Office" value={admin?.officeName}/>
                    <InfoRow icon={<UserIcon/>} label="Username" value={admin?.username}/>
                    <InfoRow icon={<MailIcon/>} label="Email" value={admin?.email}/>
                    <InfoRow icon={<PhoneIcon/>} label="Contact" value={admin?.contactNumber}/>
                    <InfoRow icon={<CalendarIcon/>} label="Member Since" value={memberSince}/>
                  </>
              }
            </div>
          </div>

          {/* Announcements Feed (Right Side) */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{background:DS.card,borderRadius:12,boxShadow:DS.shadow,border:\`1px solid \${DS.border}\`,padding:"18px 22px",marginBottom:14}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:800,color:DS.textPrimary,fontFamily:DS.font,letterSpacing:-0.5}}>My Announcements</h2>
              <p style={{margin:"4px 0 0",fontSize:13,color:DS.textMuted,fontFamily:DS.font}}>Track all announcements and posts made by your department</p>
            </div>

            {loadingAnn && [1,2,3].map(i=>(
              <div key={i} style={{background:DS.card,borderRadius:12,padding:16,marginBottom:12,boxShadow:DS.shadow,border:\`1px solid \${DS.border}\`}}>
                {[80,95,65].map((w,j)=><div key={j} style={{height:12,width:\`\${w}%\`,background:"#EDF2F7",borderRadius:6,marginBottom:9,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
              </div>
            ))}

            {!loadingAnn && announcements.length===0 && (
              <div style={{background:DS.card,borderRadius:12,padding:"48px 20px",textAlign:"center",color:DS.textMuted,fontSize:14,fontFamily:DS.font,boxShadow:DS.shadow,border:\`1px solid \${DS.border}\`}}>
                <div style={{marginBottom:10,display:"flex",justifyContent:"center",color:DS.textMuted}}><BuildingIcon/></div>
                No announcements posted yet. Go to Announcements to create one.
              </div>
            )}

            {!loadingAnn && announcements.map(a=><MiniCard key={a.id} announcement={a}/>)}
          </div>
        </div>

      </div>

      {showEdit && admin && (
        <EditProfileModal
          admin={admin}
          onClose={()=>setShowEdit(false)}
          onSaved={updated=>{ setAdmin(updated); setShowEdit(false); sessionStorage.setItem("officeName",updated.officeName); }}/>
      )}
    </Layout>
  );
}

export default AdminProfilePage;
`;

  // We find the index in normalizedContent and replace in normalizedContent, then write it back
  const newContent = normalizedContent.substring(0, oldReturnStart) + newReturn;
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Successfully processed AdminProfilePage layout and filtering fix!");
} else {
  console.error("Could not find the return block to replace!");
}

// src/components/ReusableBar/PublicLayout.js
import React, { useState } from "react";
import { SurigaoHeader, PublicNavBar } from "./SurigaoHeader";
import DepartmentSidebar from "./DepartmentSidebar";

// Context so any public page can read the active office filter
import { createContext, useContext } from "react";
export const OfficeFilterContext = createContext(null);
export const useOfficeFilter = () => useContext(OfficeFilterContext);

const PublicLayout = ({ children }) => {
  const [selectedAdminID, setSelectedAdminID] = useState(null);

  return (
    <OfficeFilterContext.Provider value={selectedAdminID}>
      <div style={{ margin:0, padding:0, minHeight:"100vh", background:"#F0F2F5" }}>
        <SurigaoHeader />
        <PublicNavBar onSearch={q => console.log("Search:", q)} />
        <div style={{ display:"flex", gap:20, padding:"20px 24px", maxWidth:1200, margin:"0 auto", alignItems:"flex-start" }}>
          <DepartmentSidebar onOfficeFilter={setSelectedAdminID} />
          <div style={{ flex:1 }}>{children}</div>
        </div>
      </div>
    </OfficeFilterContext.Provider>
  );
};

export default PublicLayout;
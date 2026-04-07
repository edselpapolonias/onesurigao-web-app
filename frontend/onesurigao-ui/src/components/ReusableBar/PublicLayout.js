// src/components/ReusableBar/PublicLayout.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SurigaoHeader, PublicNavBar } from "./SurigaoHeader";
import DepartmentSidebar from "./DepartmentSidebar";

// Context so any public page can read the active office filter
import { createContext, useContext } from "react";
export const OfficeFilterContext = createContext(null);
export const useOfficeFilter = () => useContext(OfficeFilterContext);

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const [selectedAdminID, setSelectedAdminID] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const officeParam = params.get("office");
    setSelectedAdminID(officeParam ? Number(officeParam) : null);
  }, [location.pathname, location.search]);

  return (
    <OfficeFilterContext.Provider value={selectedAdminID}>
      <div style={{ margin:0, padding:0, minHeight:"100vh", background:"#F0F2F5" }}>
        <SurigaoHeader />
        <PublicNavBar onSearch={q => console.log("Search:", q)} />
        <div style={{ display:"flex", gap:20, padding:"20px 24px", maxWidth:1200, margin:"0 auto", alignItems:"flex-start" }}>
          <DepartmentSidebar selectedAdminID={selectedAdminID} onOfficeFilter={setSelectedAdminID} />
          <div style={{ flex:1 }}>{children}</div>
        </div>
      </div>
    </OfficeFilterContext.Provider>
  );
};

export default PublicLayout;

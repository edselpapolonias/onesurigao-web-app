import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PublicNavBar } from "./SurigaoHeader";
import DepartmentSidebar from "./DepartmentSidebar";

export const OfficeFilterContext = createContext(null);
export const useOfficeFilter = () => useContext(OfficeFilterContext);

const PublicLayoutModern = ({ children }) => {
  const location = useLocation();
  const [selectedAdminID, setSelectedAdminID] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const officeParam = params.get("office");
    setSelectedAdminID(officeParam ? Number(officeParam) : null);
  }, [location.pathname, location.search]);

  return (
    <OfficeFilterContext.Provider value={selectedAdminID}>
      <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "#f7f8fb" }}>
        <div style={{ width: "100%", padding: "18px 24px 24px 264px", display: "flex", gap: 22, alignItems: "flex-start", boxSizing: "border-box" }}>
          <PublicNavBar />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: "#FCFDFE", border: "1px solid #E9EEF5", borderRadius: 30, padding: "28px", boxShadow: "0 18px 40px rgba(15,23,42,0.05)" }}>
              {children}
            </div>
          </div>
          <DepartmentSidebar selectedAdminID={selectedAdminID} onOfficeFilter={setSelectedAdminID} />
        </div>
      </div>
    </OfficeFilterContext.Provider>
  );
};

export default PublicLayoutModern;

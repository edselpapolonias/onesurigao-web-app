import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PublicNavBar, useTheme } from "./SurigaoHeader";
import DepartmentSidebar from "./DepartmentSidebar";

export const OfficeFilterContext = createContext(null);
export const useOfficeFilter = () => useContext(OfficeFilterContext);

const PublicLayoutModern = ({ children }) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const [selectedAdminID, setSelectedAdminID] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const officeParam = params.get("office");
    setSelectedAdminID(officeParam ? Number(officeParam) : null);
  }, [location.pathname, location.search]);

  return (
    <OfficeFilterContext.Provider value={selectedAdminID}>
      <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: isDark ? "#0B1220" : "#F3F6FB" }}>
        <div style={{ width: "100%", padding: "14px 18px 18px 254px", display: "flex", gap: 16, alignItems: "flex-start", boxSizing: "border-box" }}>
          <PublicNavBar />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: isDark ? "#101927" : "#FFFFFF", border: "none", borderRadius: 22, padding: "20px", boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : "0 12px 30px rgba(15,23,42,0.07)" }}>
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

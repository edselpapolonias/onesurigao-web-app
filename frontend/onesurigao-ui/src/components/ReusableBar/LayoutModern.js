import React from "react";
import { useLocation } from "react-router-dom";
import { SurigaoNavBar } from "./SurigaoHeader";
import { DepartmentSidebar } from "./DepartmentSidebar";

const LayoutModern = ({ children }) => {
  const location = useLocation();
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  return (
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "#f7f8fb" }}>
      <div style={{ width: "100%", padding: "18px 24px 24px 264px", display: "flex", gap: 22, alignItems: "flex-start", boxSizing: "border-box" }}>
        <SurigaoNavBar officeName={officeName} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: "#FCFDFE", border: "1px solid #E9EEF5", borderRadius: 30, padding: "28px", boxShadow: "0 18px 40px rgba(15,23,42,0.05)" }}>
            {children}
          </div>
        </div>
        <DepartmentSidebar />
      </div>
    </div>
  );
};

export default LayoutModern;

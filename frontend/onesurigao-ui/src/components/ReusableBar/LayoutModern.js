import React from "react";
import { useLocation } from "react-router-dom";
import { SurigaoNavBar, useTheme } from "./SurigaoHeader";
import { DepartmentSidebar } from "./DepartmentSidebar";
import SystemTopBar from "./SystemTopBar";

const LayoutModern = ({ children }) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  return (
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: isDark ? "#0B1220" : "#f0f2f5" }}>
      <SystemTopBar />
      <SurigaoNavBar officeName={officeName} />
      <div style={{ paddingTop: 56, paddingLeft: 250, boxSizing: "border-box", minHeight: "100vh" }}>
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 18, boxSizing: "border-box" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ background: isDark ? "#101927" : "transparent", border: "none", borderRadius: 28, padding: 0, boxShadow: "none" }}>
                {children}
              </div>
            </div>
            <DepartmentSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutModern;

// src/components/ReusableBar/SuperAdminLayout.js
import React from "react";
import { useLocation } from "react-router-dom";
import { SurigaoHeader, SuperAdminNavBar } from "./SurigaoHeader";
import DepartmentSidebar from "./DepartmentSidebar";

const SuperAdminLayout = ({ children }) => {
  const location = useLocation();
  const superAdminName = location.state?.superAdminName || sessionStorage.getItem("superAdminName") || "";

  return (
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "#f0f2f5" }}>
      <SurigaoHeader />
      <SuperAdminNavBar
        onSearch={(query) => console.log("Search:", query)}
        superAdminName={superAdminName}
      />
      <div style={{
        display: "flex", gap: 20, padding: "20px 24px",
        maxWidth: 1200, margin: "0 auto", alignItems: "flex-start",
      }}>
        <DepartmentSidebar />
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
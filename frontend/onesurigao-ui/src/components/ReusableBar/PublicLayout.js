// src/components/ReusableBar/PublicLayout.js
import React from "react";
import { useLocation } from "react-router-dom";
import { SurigaoHeader, PublicNavBar } from "./SurigaoHeader";
import DepartmentSidebar from "./DepartmentSidebar";

const PublicLayout = ({ children }) => {
  return (
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "#f0f2f5" }}>
      <SurigaoHeader />
      <PublicNavBar onSearch={(query) => console.log("Search:", query)} />
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

export default PublicLayout;
// src/components/ReusableBar/Layout.js
import React from "react";
import { useLocation } from "react-router-dom";
import { SurigaoHeader, SurigaoNavBar } from "./SurigaoHeader";
import { DepartmentSidebar } from "./DepartmentSidebar";

const Layout = ({ children }) => {
  const location = useLocation();

  // ✅ Get officeName passed from login via navigate state
  const officeName = location.state?.officeName || sessionStorage.getItem("officeName") || "";

  return (
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "#f0f2f5" }}>

      {/* ── Sticky Header & Nav ── */}
      <SurigaoHeader />
      <SurigaoNavBar
        onSearch={(query) => console.log("Search:", query)}
        officeName={officeName}
      />

      {/* ── Page Body: Sidebar + Content ── */}
      <div style={{
        display: "flex", gap: 20,
        padding: "20px 24px",
        maxWidth: 1200,
        margin: "0 auto",
        alignItems: "flex-start",
      }}>
        <DepartmentSidebar />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>

    </div>
  );
};

export default Layout;
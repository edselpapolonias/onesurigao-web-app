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
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "linear-gradient(180deg,#eef6ff 0%,#f7fbff 38%,#eef2f7 100%)" }}>

      {/* ── Sticky Header & Nav ── */}
      <div style={{ maxWidth: 1520, margin: "0 auto", padding: "24px", display: "flex", gap: 22, alignItems: "flex-start" }}>
      <SurigaoNavBar
        onSearch={(query) => console.log("Search:", query)}
        officeName={officeName}
      />

      {/* ── Page Body: Sidebar + Content ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <SurigaoHeader />
          <div style={{ background: "rgba(255,255,255,0.76)", border: "1px solid rgba(43,108,176,0.08)", borderRadius: 30, padding: "24px", boxShadow: "0 24px 50px rgba(15,40,74,0.08)", backdropFilter: "blur(10px)" }}>
            {children}
          </div>
        </div>
        <DepartmentSidebar />

    </div>
  );
};

export default Layout;

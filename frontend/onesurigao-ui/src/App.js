// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./components/admin/AdminLogin";
import AdminForm from "./components/admin/adminForm";
import AdminAnnouncement from "./components/admin/AdminAnnouncement";
import PinnedAnnouncement from "./components/admin/PinnedAnnouncement";

function App() {
  return (
    <BrowserRouter>
      {/* ✅ Remove width/margin/padding from here */}
      <div style={{ margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/register" element={<AdminForm />} />
          <Route path="/announcements" element={<AdminAnnouncement />} />
          <Route path="/pinnedAnnouncememnts" element={<PinnedAnnouncement />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
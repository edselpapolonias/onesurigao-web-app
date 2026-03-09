// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./components/admin/AdminLogin";
import AdminForm from "./components/admin/adminForm";
import AdminAnnouncement from "./components/admin/AdminAnnouncement";
import PinnedAnnouncement from "./components/admin/PinnedAnnouncement";
import AdminEvent from "./components/admin/AdminEvent";


function App() {
  return (
    <BrowserRouter>
      {/* ✅ Remove width/margin/padding from here */}
      <div style={{ margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/register" element={<AdminForm />} />
          <Route path="/announcements" element={<AdminAnnouncement />} />
          <Route path="/pinnedAnnouncements" element={<PinnedAnnouncement />} />
          <Route path="/events" element={<AdminEvent />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
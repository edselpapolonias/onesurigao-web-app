// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./components/admin/AdminLogin";
import AdminForm from "./components/admin/adminForm";
import AdminAnnouncement from "./components/admin/AdminAnnouncement";
import PinnedAnnouncement from "./components/admin/PinnedAnnouncement";
import AdminEvent from "./components/admin/AdminEvent";
import PublicAnnouncement from "./components/public/PublicAnnouncement";
import PublicPinned from "./components/public/PublicPinned";
import PublicEvent from "./components/public/PublicEvent";
import SuperAdminLogin from "./components/superadmin/SuperAdminLogin";
import SuperAdminAnnouncement from "./components/superadmin/SuperAdminAnnouncement";
import SuperAdminPinned from "./components/superadmin/SuperAdminPinned";
import SuperAdminRegister from "./components/superadmin/SuperAdminRegister";
import SuperAdminEvent from "./components/superadmin/SuperAdminEvent";
import PublicReport from "./components/public/PublicReport";
import SuperAdminReport from "./components/superadmin/SuperAdminReport";
import AdminReport from "./components/admin/AdminReport";
import PublicHotlines from "./components/public/PublicHotlines";
import AdminHotlines from "./components/admin/AdminHotlines";
import SuperAdminHotlines from "./components/superadmin/SuperAdminHotlines";


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
          <Route path="/home" element={<PublicAnnouncement />} />
          <Route path="/home/pinned" element={<PublicPinned />} />
          <Route path="/home/events" element={<PublicEvent />} />
          <Route path="/superadmin" element={<SuperAdminLogin />} />
          <Route path="/superadmin/register" element={<SuperAdminRegister />} />
          <Route path="/superadmin/announcements" element={<SuperAdminAnnouncement />} />
          <Route path="/superadmin/pinned" element={<SuperAdminPinned />} />
          <Route path="/superadmin/events" element={<SuperAdminEvent />} />
          <Route path="/home/report" element={<PublicReport />} />
          <Route path="/superadmin/reports" element={<SuperAdminReport />} />
          <Route path="/report-problem" element={<AdminReport />} />
          <Route path="/home/hotlines" element={<PublicHotlines />} />
          <Route path="/hotlines" element={<AdminHotlines />} />
          <Route path="/superadmin/hotlines" element={<SuperAdminHotlines />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
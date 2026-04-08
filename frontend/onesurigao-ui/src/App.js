// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicAuthProvider, ThemeProvider } from "./components/ReusableBar/SurigaoHeader";

// Admin
import AdminLogin        from "./components/admin/AdminLogin";
import AdminForm         from "./components/admin/adminForm";
import AdminAnnouncement from "./components/admin/AdminAnnouncement";
import PinnedAnnouncement from "./components/admin/PinnedAnnouncement";
import AdminEvent        from "./components/admin/AdminEvent";
import AdminReport       from "./components/admin/AdminReport";
import AdminHotlines     from "./components/admin/AdminHotlines";
import AdminProfilePage  from "./components/admin/AdminProfilePage";

// Super Admin
import SuperAdminLogin        from "./components/superadmin/SuperAdminLogin";
import SuperAdminRegister     from "./components/superadmin/SuperAdminRegister";
import SuperAdminAnnouncement from "./components/superadmin/SuperAdminAnnouncement";
import SuperAdminPinned       from "./components/superadmin/SuperAdminPinned";
import SuperAdminEvent        from "./components/superadmin/SuperAdminEvent";
import SuperAdminReport       from "./components/superadmin/SuperAdminReport";
import SuperAdminHotlines     from "./components/superadmin/SuperAdminHotlines";

// Public
import PublicAnnouncement from "./components/public/PublicAnnouncementSearch";
import PublicPinned       from "./components/public/PublicPinned";
import PublicEvent        from "./components/public/PublicEvent";
import PublicReport       from "./components/public/PublicReport";
import PublicHotlines     from "./components/public/PublicHotlines";

// Shared Department Page (wraps with the correct Layout based on role)
import DepartmentPage from "./components/shared/DepartmentPage";
import SearchPage from "./components/shared/SearchPage";

// Layouts (needed to pass into DepartmentPage)
import AdminLayout      from "./components/ReusableBar/LayoutModern";
import PublicLayout     from "./components/ReusableBar/PublicLayoutModern";
import SuperAdminLayout from "./components/ReusableBar/SuperAdminLayoutModern";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ margin: 0, padding: 0 }}>
          <Routes>

          {/* ── ADMIN ROUTES ── */}
          <Route path="/"                   element={<AdminLogin />} />
          <Route path="/register"           element={<AdminForm />} />
          <Route path="/announcements"      element={<AdminAnnouncement />} />
          <Route path="/pinnedAnnouncements" element={<PinnedAnnouncement />} />
          <Route path="/events"             element={<AdminEvent />} />
          <Route path="/report-problem"     element={<AdminReport />} />
          <Route path="/hotlines"           element={<AdminHotlines />} />
          <Route path="/search"             element={<SearchPage mode="admin" Layout={AdminLayout} />} />
          <Route path="/profile"            element={<AdminProfilePage />} />
          {/* Admin view of a department page */}
          <Route path="/department/:adminID" element={<DepartmentPage Layout={AdminLayout} backPath="/announcements"/>} />

          {/* ── SUPER ADMIN ROUTES ── */}
          <Route path="/superadmin"                   element={<SuperAdminLogin />} />
          <Route path="/superadmin/register"          element={<SuperAdminRegister />} />
          <Route path="/superadmin/announcements"     element={<SuperAdminAnnouncement />} />
          <Route path="/superadmin/pinned"            element={<SuperAdminPinned />} />
          <Route path="/superadmin/events"            element={<SuperAdminEvent />} />
          <Route path="/superadmin/reports"           element={<SuperAdminReport />} />
          <Route path="/superadmin/hotlines"          element={<SuperAdminHotlines />} />
          <Route path="/superadmin/search"            element={<SearchPage mode="superadmin" Layout={SuperAdminLayout} />} />
          {/* SuperAdmin view of a department page */}
          <Route path="/superadmin/department/:adminID" element={<DepartmentPage Layout={SuperAdminLayout} backPath="/superadmin/announcements"/>} />

          {/* ── PUBLIC ROUTES (wrapped with PublicAuthProvider) ── */}
          <Route
            path="/home/*"
            element={
              <PublicAuthProvider>
                <Routes>
                  <Route path=""          element={<PublicAnnouncement />} />
                  <Route path="pinned"    element={<PublicPinned />} />
                  <Route path="events"    element={<PublicEvent />} />
                  <Route path="report"    element={<PublicReport />} />
                  <Route path="hotlines"  element={<PublicHotlines />} />
                  <Route path="search"    element={<SearchPage mode="public" Layout={PublicLayout} />} />
                  {/* Public view of a department page */}
                  <Route path="department/:adminID" element={<DepartmentPage Layout={PublicLayout} backPath="/home"/>} />
                </Routes>
              </PublicAuthProvider>
            }
          />

          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../../services/authService";

const ADMINS_URL = "http://127.0.0.1:8000/api/admins/";

const DS = {
  bg: "#f7f8fb",
  card: "#ffffff",
  panel: "#f9fafb",
  border: "#e8edf3",
  textPrimary: "#101828",
  textSecondary: "#475467",
  textMuted: "#667085",
  accent: "#D7EEFF",
  accentText: "#1E4E8C",
  shadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
  font: "'Segoe UI', system-ui, sans-serif",
};

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const OfficeAvatar = ({ officeName, profilePic, size = 38 }) => {
  const initials = officeName?.split(" ").filter(Boolean).map((word) => word[0]).slice(0, 2).join("").toUpperCase() || "OF";

  if (profilePic) {
    return (
      <img
        src={profilePic}
        alt={officeName || "Office"}
        style={{ width: size, height: size, borderRadius: 12, objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 6px rgba(43,108,176,0.2)" }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: "linear-gradient(135deg, #1E4E8C 0%, #2B6CB0 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 800,
        fontFamily: DS.font,
        flexShrink: 0,
        boxShadow: "0 2px 6px rgba(43,108,176,0.25)",
      }}
    >
      {initials}
    </div>
  );
};

const FileTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const EmptyState = ({ title, text }) => (
  <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 22, padding: "44px 28px", textAlign: "center" }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: DS.textPrimary, fontFamily: DS.font }}>{title}</div>
    <div style={{ marginTop: 8, color: DS.textMuted, fontSize: 14, lineHeight: 1.7, fontFamily: DS.font }}>{text}</div>
  </div>
);

const SearchPageContent = ({ mode = "public" }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [announcements, setAnnouncements] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const announcementEndpoint =
    mode === "superadmin"
      ? "/superadmin/announcements/"
      : mode === "admin"
        ? "/api/announcements/"
        : "http://127.0.0.1:8000/public/announcements/";

  const sourceLabel =
    mode === "superadmin" ? "Superadmin search" : mode === "admin" ? "Admin search" : "Public search";

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const announcementRequest =
          mode === "public"
            ? axios.get(announcementEndpoint)
            : apiClient.get(announcementEndpoint);

        const [announcementRes, officeRes] = await Promise.all([
          announcementRequest,
          axios.get(ADMINS_URL),
        ]);

        if (!active) return;

        const announcementData = Array.isArray(announcementRes.data)
          ? announcementRes.data
          : announcementRes.data.results || [];
        const officeData = Array.isArray(officeRes.data)
          ? officeRes.data
          : officeRes.data.results || [];

        setAnnouncements(announcementData);
        setOffices(officeData);
      } catch {
        if (active) setError("Failed to load search data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [announcementEndpoint, mode]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOffices = normalizedQuery
    ? offices.filter((office) =>
        `${office.officeName || ""} ${office.description || ""}`.toLowerCase().includes(normalizedQuery)
      )
    : [];
  const filteredAnnouncements = normalizedQuery
    ? announcements.filter((announcement) =>
        `${announcement.title || ""} ${announcement.content || ""} ${announcement.admin?.officeName || ""}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : [];

  const handleSearch = (event) => {
    event.preventDefault();
    const next = query.trim();
    if (next) {
      setSearchParams({ q: next });
    } else {
      setSearchParams({});
    }
  };

  const openOffice = (officeId) => {
    if (mode === "public") navigate(`/home/department/${officeId}`);
    if (mode === "admin") navigate(`/department/${officeId}`);
    if (mode === "superadmin") navigate(`/superadmin/department/${officeId}`);
  };

  return (
    <div style={{ fontFamily: DS.font }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 31, fontWeight: 800, color: DS.textPrimary, letterSpacing: -0.8 }}>Search</div>
          <div style={{ marginTop: 8, fontSize: 14, color: DS.textMuted, lineHeight: 1.7 }}>
            Search offices first, then browse matching announcements below.
          </div>
        </div>
        <div style={{ background: "#f3f5f8", border: `1px solid ${DS.border}`, borderRadius: 999, padding: "10px 14px", color: DS.textSecondary, fontSize: 12, fontWeight: 700 }}>
          {sourceLabel}
        </div>
      </div>

      <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 24, boxShadow: DS.shadow, padding: 20, marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 460px", minWidth: 260, height: 52, background: "#fff", border: `1px solid ${DS.border}`, borderRadius: 18, padding: "0 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: DS.textMuted, display: "flex" }}><SearchIcon /></span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search announcements, offices, services..."
              style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 14, color: DS.textPrimary, fontFamily: DS.font }}
            />
          </div>
          <button type="submit" style={{ height: 52, border: "none", borderRadius: 18, padding: "0 20px", background: DS.accent, color: DS.accentText, fontWeight: 800, fontSize: 12, letterSpacing: 0.3, cursor: "pointer" }}>
            SHOW RESULTS
          </button>
        </form>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          {["Announcements", "Offices", "City Updates"].map((chip) => (
            <div key={chip} style={{ background: "#f7f9fc", border: `1px solid ${DS.border}`, borderRadius: 999, padding: "8px 12px", fontSize: 12, color: DS.textSecondary }}>
              {chip}
            </div>
          ))}
        </div>
      </div>

      {loading && <EmptyState title="Loading search data" text="Pulling offices and announcements into the new search workspace." />}
      {error && !loading && <EmptyState title="Search unavailable" text={error} />}
      {!loading && !error && !normalizedQuery && (
        <EmptyState title="Start with a keyword" text="Try an office name, service, or announcement topic to see results in this cleaner search page." />
      )}

      {!loading && !error && normalizedQuery && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: DS.textPrimary }}>Offices</div>
              <div style={{ color: DS.textMuted, fontSize: 12 }}>{filteredOffices.length} result{filteredOffices.length === 1 ? "" : "s"}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {filteredOffices.length > 0 ? filteredOffices.map((office) => (
                <button
                  key={office.adminID}
                  onClick={() => openOffice(office.adminID)}
                  style={{ textAlign: "left", background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 20, padding: 18, cursor: "pointer", boxShadow: DS.shadow }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <OfficeAvatar officeName={office.officeName} profilePic={office.profilePic || null} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: DS.textPrimary }}>{office.officeName}</div>
                  <div style={{ marginTop: 8, color: DS.textMuted, fontSize: 13, lineHeight: 1.6 }}>
                    {office.description || "Open this office page to see announcements and office details."}
                  </div>
                </button>
              )) : <EmptyState title="No offices matched" text={`No office matches "${query.trim()}".`} />}
            </div>
          </section>

          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: DS.textPrimary }}>Announcements</div>
              <div style={{ color: DS.textMuted, fontSize: 12 }}>{filteredAnnouncements.length} result{filteredAnnouncements.length === 1 ? "" : "s"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((announcement) => (
                <div key={announcement.id} style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: 22, padding: 20, boxShadow: DS.shadow }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: DS.textMuted, fontSize: 12, marginBottom: 10 }}>
                    <span style={{ display: "flex" }}><FileTextIcon /></span>
                    <span>{announcement.admin?.officeName || "City Office"}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: DS.textPrimary, lineHeight: 1.4 }}>{announcement.title}</div>
                  <div style={{ marginTop: 10, color: DS.textSecondary, fontSize: 14, lineHeight: 1.75 }}>
                    {announcement.content?.length > 220 ? `${announcement.content.slice(0, 220)}...` : announcement.content}
                  </div>
                </div>
              )) : <EmptyState title="No announcements matched" text={`No announcement matches "${query.trim()}".`} />}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const SearchPage = ({ mode = "public", Layout }) => {
  if (Layout) {
    return (
      <Layout>
        <SearchPageContent mode={mode} />
      </Layout>
    );
  }

  return <SearchPageContent mode={mode} />;
};

export default SearchPage;

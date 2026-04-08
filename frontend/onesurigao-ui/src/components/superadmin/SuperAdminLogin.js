// src/components/superadmin/SuperAdminLogin.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginSuperAdmin } from "../../services/authService";

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await loginSuperAdmin(form);
      if (res.data.success) {
        sessionStorage.setItem("superAdminID", res.data.superAdminID);
        sessionStorage.setItem("superAdminName", res.data.superAdminName);
        navigate("/superadmin/announcements", {
          state: { superAdminID: res.data.superAdminID, superAdminName: res.data.superAdminName },
        });
      } else {
        setError(res.data.message || "Invalid credentials.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message;
      setError(msg ? String(msg) : "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", fontSize: 14,
    border: "1.5px solid #dde3ec", borderRadius: 10,
    outline: "none", boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif", background: "#fff",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, background: "linear-gradient(135deg, #0d3b7a 0%, #1a56a0 50%, #1976d2 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 48, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 12px", letterSpacing: 1 }}>
            SUPER ADMIN
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
            Manage approvals, oversee operations, and maintain the City of Surigao platform.
          </p>
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
            {["Event Approvals", "Report Filtering", "Platform Oversight"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7ec8f7", flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48, background: "#f8fafd" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#1a1a1a" }}>Sign In</h2>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#888" }}>Super Admin Portal — City of Surigao</p>
          </div>

          {error && (
            <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#c62828" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>Username</label>
            <input
              name="username" value={form.username} onChange={handleChange}
              placeholder="Enter your username" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#1976d2"}
              onBlur={e => e.target.style.borderColor = "#dde3ec"}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="password" type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                placeholder="Enter your password"
                style={{ ...inputStyle, paddingRight: 48 }}
                onFocus={e => e.target.style.borderColor = "#1976d2"}
                onBlur={e => e.target.style.borderColor = "#dde3ec"}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <button onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 13, fontWeight: 600 }}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
              background: loading ? "#9ab8e0" : "linear-gradient(135deg, #0d3b7a, #1976d2)",
              color: "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(25,118,210,0.35)", transition: "all 0.2s", letterSpacing: 0.5,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#888" }}>
            No account?{" "}
            <Link to="/superadmin/register" style={{ color: "#1976d2", fontWeight: 700, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLogin;

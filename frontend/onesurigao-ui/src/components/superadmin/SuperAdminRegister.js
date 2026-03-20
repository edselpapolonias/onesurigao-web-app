// src/components/superadmin/SuperAdminRegister.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/superadmin/superadmins/";

function SuperAdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    superAdminName: "", username: "", password: "",
    email: "", contactNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.superAdminName || !form.username || !form.password || !form.email || !form.contactNumber) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true); setError("");
    try {
      await axios.post(API_URL, form);
      setSuccess(true);
      setTimeout(() => navigate("/superadmin"), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.username) setError("Username already exists.");
      else if (data?.email) setError("Email already in use.");
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", fontSize: 13,
    border: "1.5px solid #dde3ec", borderRadius: 9,
    outline: "none", boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif", background: "#fff",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block", marginBottom: 6, fontWeight: 600,
    fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 0.5,
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
            Create a Super Admin account to manage the City of Surigao platform.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48, background: "#f8fafd" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#1a1a1a" }}>Create Account</h2>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#888" }}>Super Admin Portal — City of Surigao</p>
          </div>

          {/* Success Banner */}
          {success && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#166534", fontWeight: 600 }}>
              ✅ Account created! Redirecting to login...
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "#fff3f3", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#c62828" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name <span style={{ color: "#e53935" }}>*</span></label>
            <input name="superAdminName" value={form.superAdminName} onChange={handleChange}
              placeholder="e.g. Juan dela Cruz" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#1976d2"}
              onBlur={e => e.target.style.borderColor = "#dde3ec"} />
          </div>

          {/* Username + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Username <span style={{ color: "#e53935" }}>*</span></label>
              <input name="username" value={form.username} onChange={handleChange}
                placeholder="username" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#1976d2"}
                onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
            <div>
              <label style={labelStyle}>Email <span style={{ color: "#e53935" }}>*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="email@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#1976d2"}
                onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
          </div>

          {/* Password + Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Password <span style={{ color: "#e53935" }}>*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#1976d2"}
                onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
            <div>
              <label style={labelStyle}>Contact Number <span style={{ color: "#e53935" }}>*</span></label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange}
                placeholder="09XX-XXX-XXXX" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#1976d2"}
                onBlur={e => e.target.style.borderColor = "#dde3ec"} />
            </div>
          </div>

          <button
            onClick={handleSubmit} disabled={loading || success}
            style={{
              width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
              background: loading ? "#9ab8e0" : "linear-gradient(135deg, #0d3b7a, #1976d2)",
              color: "#fff", border: "none", borderRadius: 10,
              cursor: loading || success ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(25,118,210,0.35)", letterSpacing: 0.5,
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
            Already have an account?{" "}
            <Link to="/superadmin" style={{ color: "#1976d2", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminRegister;
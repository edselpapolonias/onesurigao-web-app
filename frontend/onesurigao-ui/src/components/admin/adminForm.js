// src/components/admin/adminForm.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createAdmin } from "../../services/adminService";

function AdminForm() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({
    officeName: "",
    username: "",
    password: "",
    email: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    createAdmin(admin)
      .then(() => {
        setSuccess(true);
        setAdmin({ officeName: "", username: "", password: "", email: "", contactNumber: "" });
        setTimeout(() => navigate("/"), 2000); // redirect to login after 2s
      })
      .catch((error) => {
        console.log("Backend error:", error.response?.data);
        const errData = error.response?.data;
        if (typeof errData === "object") {
          const messages = Object.entries(errData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ");
          setError(messages);
        } else {
          setError("Registration failed. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .reg-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Manrope', sans-serif;
          background: #f4f6fb;
        }

        /* ── Left Panel ── */
        .reg-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          min-height: 100vh;
        }

        .reg-left-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(160deg, rgba(10,40,120,0.82) 0%, rgba(30,80,200,0.65) 50%, rgba(10,40,120,0.80) 100%),
            url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80') center/cover no-repeat;
          z-index: 0;
        }

        .reg-left-content { position: relative; z-index: 1; }

        .reg-brand {
          position: absolute;
          top: 40px; left: 48px;
          display: flex; align-items: center; gap: 10px;
          z-index: 1;
        }

        .reg-brand-icon {
          width: 36px; height: 36px;
          border: 2px solid rgba(255,255,255,0.8);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }

        .reg-brand-name {
          color: #ffffff;
          font-size: 16px; font-weight: 700; letter-spacing: 0.2px;
        }

        .reg-headline {
          color: #ffffff;
          font-size: 42px; font-weight: 800;
          line-height: 1.15; margin-bottom: 16px; letter-spacing: -0.5px;
        }

        .reg-subtext {
          color: rgba(255,255,255,0.75);
          font-size: 15px; font-weight: 400;
          line-height: 1.6; max-width: 380px;
        }

        /* ── Right Panel ── */
        .reg-right {
          width: 560px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          background: #f4f6fb;
          overflow-y: auto;
        }

        .reg-form-box {
          width: 100%;
          max-width: 420px;
        }

        .reg-title {
          font-size: 30px; font-weight: 800;
          color: #0f172a; margin-bottom: 6px; letter-spacing: -0.5px;
        }

        .reg-subtitle {
          font-size: 14px; color: #64748b;
          margin-bottom: 28px; font-weight: 400;
        }

        .reg-field { margin-bottom: 16px; }

        .reg-label {
          display: block; font-size: 13px;
          font-weight: 600; color: #0f172a; margin-bottom: 7px;
        }

        .reg-input {
          width: 100%; padding: 13px 16px;
          font-size: 14px; font-family: 'Manrope', sans-serif;
          background: #eef0f6;
          border: 1.5px solid transparent;
          border-radius: 12px; outline: none;
          color: #0f172a;
          transition: border-color 0.2s, background 0.2s;
        }

        .reg-input::placeholder { color: #94a3b8; }

        .reg-input:focus {
          background: #ffffff;
          border-color: #3b6ef6;
          box-shadow: 0 0 0 3px rgba(59,110,246,0.12);
        }

        .reg-row {
          display: flex; gap: 12px;
        }

        .reg-row .reg-field { flex: 1; }

        .reg-error {
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 16px; font-weight: 500;
        }

        .reg-success {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #16a34a; font-size: 13px;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 16px; font-weight: 500;
          text-align: center;
        }

        .reg-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #3b6ef6 0%, #2554e8 100%);
          color: #ffffff; font-size: 15px; font-weight: 700;
          font-family: 'Manrope', sans-serif;
          border: none; border-radius: 12px; cursor: pointer;
          letter-spacing: 0.3px; margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(59,110,246,0.35);
        }

        .reg-btn:hover:not(:disabled) {
          opacity: 0.93; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59,110,246,0.4);
        }

        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .reg-login {
          text-align: center; margin-top: 22px;
          font-size: 14px; color: #64748b;
        }

        .reg-login a {
          color: #3b6ef6; font-weight: 700; text-decoration: none;
        }

        .reg-login a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .reg-left { display: none; }
          .reg-right { width: 100%; padding: 32px 24px; }
          .reg-row { flex-direction: column; gap: 0; }
        }
      `}</style>

      <div className="reg-root">

        {/* ── Left Panel ── */}
        <div className="reg-left">
          <div className="reg-left-bg" />

          <div className="reg-brand">
            <div className="reg-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="reg-brand-name">One-Surigao</span>
          </div>

          <div className="reg-left-content">
            <h1 className="reg-headline">
              Register Your<br />Office Account
            </h1>
            <p className="reg-subtext">
              Create an admin account for your city department to start
              publishing official announcements and public advisories.
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="reg-right">
          <div className="reg-form-box">
            <h2 className="reg-title">Create an account</h2>
            <p className="reg-subtitle">Fill in your office details to get started</p>

            {error && <div className="reg-error">⚠ {error}</div>}
            {success && (
              <div className="reg-success">
                ✓ Account created successfully! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Office Name — full width */}
              <div className="reg-field">
                <label className="reg-label">Office Name</label>
                <input
                  className="reg-input"
                  type="text" name="officeName"
                  placeholder="e.g. City Health Office"
                  value={admin.officeName}
                  onChange={handleChange} required
                />
              </div>

              {/* Username + Email — side by side */}
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">Username</label>
                  <input
                    className="reg-input"
                    type="text" name="username"
                    placeholder="Enter username"
                    value={admin.username}
                    onChange={handleChange} required
                    autoComplete="username"
                  />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Email</label>
                  <input
                    className="reg-input"
                    type="email" name="email"
                    placeholder="office@surigao.gov.ph"
                    value={admin.email}
                    onChange={handleChange} required
                  />
                </div>
              </div>

              {/* Password + Contact — side by side */}
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">Password</label>
                  <input
                    className="reg-input"
                    type="password" name="password"
                    placeholder="••••••••"
                    value={admin.password}
                    onChange={handleChange} required
                    autoComplete="new-password"
                  />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Contact Number</label>
                  <input
                    className="reg-input"
                    type="text" name="contactNumber"
                    placeholder="09XXXXXXXXX"
                    value={admin.contactNumber}
                    onChange={handleChange} required
                  />
                </div>
              </div>

              <button type="submit" className="reg-btn" disabled={loading || success}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="reg-login">
              Already have an account?{" "}
              <Link to="/">Sign in</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default AdminForm;
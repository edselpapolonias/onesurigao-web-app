// src/components/superadmin/SuperAdminRegister.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import oneSurigaoLogo from "../../assets/one-surigao-logo.png";
import superadminBg from "../../assets/superadmin-bg.jpg";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .sa-reg-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Manrope', sans-serif;
          background: #f4f6fb;
        }

        .sa-reg-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          min-height: 100vh;
        }

        .sa-reg-left-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(160deg, rgba(10,40,120,0.85) 0%, rgba(11,92,203,0.7) 50%, rgba(10,40,120,0.85) 100%),
            url('${superadminBg}') center/cover no-repeat;
          z-index: 0;
        }

        .sa-reg-left-content { position: relative; z-index: 1; }

        .sa-reg-brand {
          position: absolute;
          top: 40px; left: 48px;
          display: flex; align-items: center; gap: 10px;
          z-index: 1;
        }

        .sa-reg-brand-name {
          color: #ffffff;
          font-size: 16px; font-weight: 700; letter-spacing: 0.2px;
        }

        .sa-reg-headline {
          color: #ffffff;
          font-size: 42px; font-weight: 800;
          line-height: 1.15; margin-bottom: 16px; letter-spacing: -0.5px;
        }

        .sa-reg-subtext {
          color: rgba(255,255,255,0.75);
          font-size: 15px; font-weight: 400;
          line-height: 1.6; max-width: 380px;
        }

        .sa-reg-right {
          width: 560px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          background: #f4f6fb;
          overflow-y: auto;
        }

        .sa-reg-form-box { width: 100%; max-width: 420px; }

        .sa-reg-title {
          font-size: 30px; font-weight: 800;
          color: #0f172a; margin-bottom: 6px; letter-spacing: -0.5px;
        }

        .sa-reg-subtitle {
          font-size: 14px; color: #64748b;
          margin-bottom: 28px; font-weight: 400;
        }

        .sa-reg-field { margin-bottom: 16px; }

        .sa-reg-label {
          display: block; font-size: 13px;
          font-weight: 600; color: #0f172a; margin-bottom: 7px;
        }

        .sa-reg-input {
          width: 100%; padding: 13px 16px;
          font-size: 14px; font-family: 'Manrope', sans-serif;
          background: #eef0f6;
          border: 1.5px solid transparent;
          border-radius: 12px; outline: none;
          color: #0f172a;
          transition: border-color 0.2s, background 0.2s;
        }

        .sa-reg-input::placeholder { color: #94a3b8; }
        .sa-reg-input:focus {
          background: #ffffff; border-color: #3b6ef6;
          box-shadow: 0 0 0 3px rgba(59,110,246,0.12);
        }

        .sa-reg-row { display: flex; gap: 12px; }
        .sa-reg-row .sa-reg-field { flex: 1; }

        .sa-reg-error {
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 16px; font-weight: 500;
        }

        .sa-reg-success {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #16a34a; font-size: 13px;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 16px; font-weight: 500;
          text-align: center;
        }

        .sa-reg-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #3b6ef6 0%, #2554e8 100%);
          color: #ffffff; font-size: 15px; font-weight: 700;
          font-family: 'Manrope', sans-serif;
          border: none; border-radius: 12px; cursor: pointer;
          letter-spacing: 0.3px; margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(59,110,246,0.35);
        }

        .sa-reg-btn:hover:not(:disabled) {
          opacity: 0.93; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59,110,246,0.4);
        }
        .sa-reg-btn:active:not(:disabled) { transform: translateY(0); }
        .sa-reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .sa-reg-login {
          text-align: center; margin-top: 22px;
          font-size: 14px; color: #64748b;
        }
        .sa-reg-login a { color: #3b6ef6; font-weight: 700; text-decoration: none; }
        .sa-reg-login a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .sa-reg-left { display: none; }
          .sa-reg-right { width: 100%; padding: 32px 24px; }
          .sa-reg-row { flex-direction: column; gap: 0; }
        }
      `}</style>

      <div className="sa-reg-root">

        {/* ── Left Panel ── */}
        <div className="sa-reg-left">
          <div className="sa-reg-left-bg" />

          <div className="sa-reg-brand">
            <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={oneSurigaoLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span className="sa-reg-brand-name">One-Surigao</span>
          </div>

          <div className="sa-reg-left-content">
            <h1 className="sa-reg-headline">
              Register Your<br />Super Admin Account
            </h1>
            <p className="sa-reg-subtext">
              Create a Super Admin account to manage approvals and oversee the City of Surigao platform.
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="sa-reg-right">
          <div className="sa-reg-form-box">
            <h2 className="sa-reg-title">Create an account</h2>
            <p className="sa-reg-subtitle">Fill in your details to get started</p>

            {error && <div className="sa-reg-error">⚠ {error}</div>}
            {success && (
              <div className="sa-reg-success">
                ✓ Account created successfully! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="sa-reg-field">
                <label className="sa-reg-label">Full Name</label>
                <input
                  className="sa-reg-input"
                  type="text" name="superAdminName"
                  placeholder="e.g. Juan dela Cruz"
                  value={form.superAdminName}
                  onChange={handleChange} required
                />
              </div>

              {/* Username + Email */}
              <div className="sa-reg-row">
                <div className="sa-reg-field">
                  <label className="sa-reg-label">Username</label>
                  <input
                    className="sa-reg-input"
                    type="text" name="username"
                    placeholder="Enter username"
                    value={form.username}
                    onChange={handleChange} required
                    autoComplete="username"
                  />
                </div>
                <div className="sa-reg-field">
                  <label className="sa-reg-label">Email</label>
                  <input
                    className="sa-reg-input"
                    type="email" name="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={handleChange} required
                  />
                </div>
              </div>

              {/* Password + Contact */}
              <div className="sa-reg-row">
                <div className="sa-reg-field">
                  <label className="sa-reg-label">Password</label>
                  <input
                    className="sa-reg-input"
                    type="password" name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange} required
                    autoComplete="new-password"
                  />
                </div>
                <div className="sa-reg-field">
                  <label className="sa-reg-label">Contact Number</label>
                  <input
                    className="sa-reg-input"
                    type="text" name="contactNumber"
                    placeholder="09XXXXXXXXX"
                    value={form.contactNumber}
                    onChange={handleChange} required
                  />
                </div>
              </div>

              <button type="submit" className="sa-reg-btn" disabled={loading || success}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="sa-reg-login">
              Already have an account?{" "}
              <Link to="/superadmin">Sign in</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default SuperAdminRegister;
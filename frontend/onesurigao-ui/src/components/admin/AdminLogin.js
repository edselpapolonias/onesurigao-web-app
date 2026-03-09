// src/components/admin/AdminLogin.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAdmin } from "../../services/authService";

function AdminLogin() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError(""); // clear error on type
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    loginAdmin(loginData)
      .then((response) => {
        if (response.data.success) {
          sessionStorage.setItem("adminID", response.data.adminID);
          sessionStorage.setItem("officeName", response.data.officeName);

          navigate("/announcements", {
            state: {
              adminID: response.data.adminID,
              officeName: response.data.officeName,
            },
          });
        } else {
          setError("Invalid username or password.");
        }
      })
      .catch(() => {
        setError("Login failed. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Manrope', sans-serif;
          background: #f4f6fb;
        }

        /* ── Left Panel ── */
        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          min-height: 100vh;
        }

        .login-left-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(160deg, rgba(10,40,120,0.82) 0%, rgba(30,80,200,0.65) 50%, rgba(10,40,120,0.80) 100%),
            url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80') center/cover no-repeat;
          z-index: 0;
        }

        .login-left-content {
          position: relative;
          z-index: 1;
        }

        .login-brand {
          position: absolute;
          top: 40px;
          left: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1;
        }

        .login-brand-icon {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(255,255,255,0.8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-brand-name {
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .login-headline {
          color: #ffffff;
          font-size: 42px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .login-subtext {
          color: rgba(255,255,255,0.75);
          font-size: 15px;
          font-weight: 400;
          line-height: 1.6;
          max-width: 380px;
        }

        /* ── Right Panel ── */
        .login-right {
          width: 520px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          background: #f4f6fb;
        }

        .login-form-box {
          width: 100%;
          max-width: 400px;
        }

        .login-welcome {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }

        .login-welcome-sub {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .login-field {
          margin-bottom: 20px;
        }

        .login-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .login-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 14px;
          font-family: 'Manrope', sans-serif;
          background: #eef0f6;
          border: 1.5px solid transparent;
          border-radius: 12px;
          outline: none;
          color: #0f172a;
          transition: border-color 0.2s, background 0.2s;
        }

        .login-input::placeholder {
          color: #94a3b8;
        }

        .login-input:focus {
          background: #ffffff;
          border-color: #3b6ef6;
          box-shadow: 0 0 0 3px rgba(59,110,246,0.12);
        }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #3b6ef6 0%, #2554e8 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Manrope', sans-serif;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          letter-spacing: 0.3px;
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(59,110,246,0.35);
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59,110,246,0.4);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-register {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #64748b;
        }

        .login-register a {
          color: #3b6ef6;
          font-weight: 700;
          text-decoration: none;
        }

        .login-register a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { width: 100%; padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">

        {/* ── Left Panel ── */}
        <div className="login-left">
          <div className="login-left-bg" />

          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="login-brand-name">One-Surigao</span>
          </div>

          {/* Bottom content */}
          <div className="login-left-content">
            <h1 className="login-headline">
              Public Information &<br />Service Platform
            </h1>
            <p className="login-subtext">
              Connecting citizens with local government for faster, more
              transparent public services in Surigao.
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="login-right">
          <div className="login-form-box">
            <h2 className="login-welcome">Welcome back</h2>
            <p className="login-welcome-sub">Sign in to your account to continue</p>

            {error && <div className="login-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">Username</label>
                <input
                  className="login-input"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={loginData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="login-field">
                <label className="login-label">Password</label>
                <input
                  className="login-input"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="login-register">
              Don't have an account?{" "}
              <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default AdminLogin;
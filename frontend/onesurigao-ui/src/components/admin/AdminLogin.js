// src/components/admin/AdminLogin.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAdmin } from "../../services/authService";

const LOCKOUT_STORAGE_KEY = "adminLoginLockout";
const ATTEMPTS_PER_CYCLE = 5;
const LOCKOUT_INCREMENT_MINUTES = 3;

function getLockoutState() {
  try {
    const stored = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { failedAttempts: 0, lockoutUntil: null };
}

function saveLockoutState(state) {
  localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(state));
}

function clearLockoutState() {
  localStorage.removeItem(LOCKOUT_STORAGE_KEY);
}

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AdminLogin() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lockout state
  const [failedAttempts, setFailedAttempts] = useState(() => getLockoutState().failedAttempts);
  const [lockoutUntil, setLockoutUntil] = useState(() => getLockoutState().lockoutUntil);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isLockedOut = lockoutUntil && Date.now() < lockoutUntil;

  // Countdown timer
  useEffect(() => {
    if (!lockoutUntil) { setRemainingSeconds(0); return; }
    const tick = () => {
      const diff = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        setLockoutUntil(null);
        saveLockoutState({ failedAttempts, lockoutUntil: null });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil, failedAttempts]);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError(""); // clear error on type
  };

  const recordFailedAttempt = useCallback(() => {
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);

    if (newCount % ATTEMPTS_PER_CYCLE === 0) {
      const cycle = newCount / ATTEMPTS_PER_CYCLE;
      const lockoutMs = cycle * LOCKOUT_INCREMENT_MINUTES * 60 * 1000;
      const until = Date.now() + lockoutMs;
      setLockoutUntil(until);
      saveLockoutState({ failedAttempts: newCount, lockoutUntil: until });
    } else {
      saveLockoutState({ failedAttempts: newCount, lockoutUntil: null });
    }
  }, [failedAttempts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLockedOut) return;

    setLoading(true);
    setError("");

    loginAdmin(loginData)
      .then((response) => {
        if (response.data.success) {
          // Successful login — reset lockout state
          clearLockoutState();
          setFailedAttempts(0);
          setLockoutUntil(null);

          sessionStorage.setItem("adminID", response.data.adminID);
          sessionStorage.setItem("officeName", response.data.officeName);

          navigate("/announcements", {
            state: {
              adminID: response.data.adminID,
              officeName: response.data.officeName,
            },
          });
        } else {
          recordFailedAttempt();
          setError("Invalid username or password.");
        }
      })
      .catch(() => {
        recordFailedAttempt();
        setError("Login failed. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const attemptsBeforeNextLock = ATTEMPTS_PER_CYCLE - (failedAttempts % ATTEMPTS_PER_CYCLE);
  const disableForm = isLockedOut || loading;

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

        .login-input:disabled {
          background: #e8e8ec;
          color: #999;
          cursor: not-allowed;
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

        .login-lockout-banner {
          background: linear-gradient(135deg, #fff3e0, #ffe0b2);
          border: 1.5px solid #ffb74d;
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        .login-lockout-icon { font-size: 28px; margin-bottom: 6px; }

        .login-lockout-title {
          font-size: 14px;
          font-weight: 700;
          color: #e65100;
          margin-bottom: 4px;
        }

        .login-lockout-sub {
          font-size: 12px;
          color: #bf360c;
          margin-bottom: 10px;
        }

        .login-lockout-timer {
          font-size: 28px;
          font-weight: 900;
          color: #d84315;
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
        }

        .login-lockout-hint {
          font-size: 11px;
          color: #999;
          margin-top: 6px;
        }

        .login-attempts-warning {
          background: #fffde7;
          border: 1.5px solid #fff176;
          border-radius: 8px;
          padding: 8px 14px;
          margin-bottom: 16px;
          font-size: 12px;
          color: #f57f17;
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
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
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

            {/* Lockout Banner */}
            {isLockedOut && (
              <div className="login-lockout-banner">
                <div className="login-lockout-icon">🔒</div>
                <div className="login-lockout-title">Account Temporarily Locked</div>
                <div className="login-lockout-sub">Too many failed login attempts.</div>
                <div className="login-lockout-timer">{formatCountdown(remainingSeconds)}</div>
                <div className="login-lockout-hint">Please wait before trying again.</div>
              </div>
            )}

            {error && !isLockedOut && <div className="login-error">⚠ {error}</div>}



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
                  disabled={isLockedOut}
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
                  disabled={isLockedOut}
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={disableForm}
              >
                {isLockedOut ? "Locked" : loading ? "Signing in..." : "Sign In"}
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
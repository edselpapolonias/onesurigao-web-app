// src/components/superadmin/SuperAdminLogin.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginSuperAdmin } from "../../services/authService";
import oneSurigaoLogo from "../../assets/one-surigao-logo.png";
import superadminBg from "../../assets/superadmin-bg.jpg";

const LOCKOUT_STORAGE_KEY = "superAdminLoginLockout";
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

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isLockedOut) return;

    if (!form.username || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await loginSuperAdmin(form);
      if (res.data.success) {
        clearLockoutState();
        setFailedAttempts(0);
        setLockoutUntil(null);

        sessionStorage.setItem("superAdminID", res.data.superAdminID);
        sessionStorage.setItem("superAdminName", res.data.superAdminName);
        navigate("/superadmin/announcements", {
          state: { superAdminID: res.data.superAdminID, superAdminName: res.data.superAdminName },
        });
      } else {
        recordFailedAttempt();
        setError(res.data.message || "Invalid credentials.");
      }
    } catch (err) {
      recordFailedAttempt();
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

  // eslint-disable-next-line no-unused-vars
  const attemptsBeforeNextLock = ATTEMPTS_PER_CYCLE - (failedAttempts % ATTEMPTS_PER_CYCLE);
  const disableForm = isLockedOut || loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .sa-login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Manrope', sans-serif;
          background: #f4f6fb;
        }

        .sa-login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          min-height: 100vh;
        }

        .sa-login-left-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(160deg, rgba(10,40,120,0.85) 0%, rgba(11,92,203,0.7) 50%, rgba(10,40,120,0.85) 100%),
            url('${superadminBg}') center/cover no-repeat;
          z-index: 0;
        }

        .sa-login-left-content { position: relative; z-index: 1; }

        .sa-login-brand {
          position: absolute;
          top: 40px; left: 48px;
          display: flex; align-items: center; gap: 10px;
          z-index: 1;
        }

        .sa-login-headline {
          color: #ffffff;
          font-size: 42px; font-weight: 800;
          line-height: 1.15; margin-bottom: 16px; letter-spacing: -0.5px;
        }

        .sa-login-subtext {
          color: rgba(255,255,255,0.75);
          font-size: 15px; font-weight: 400;
          line-height: 1.6; max-width: 380px;
        }

        .sa-login-brand-name {
          color: #ffffff;
          font-size: 16px; font-weight: 700; letter-spacing: 0.2px;
        }

        .sa-login-right {
          width: 520px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          background: #f4f6fb;
        }

        .sa-login-form-box { width: 100%; max-width: 400px; }

        .sa-login-welcome {
          font-size: 32px; font-weight: 800;
          color: #0f172a; margin-bottom: 6px; letter-spacing: -0.5px;
        }

        .sa-login-welcome-sub {
          font-size: 14px; color: #64748b;
          margin-bottom: 36px; font-weight: 400;
        }

        .sa-login-field { margin-bottom: 20px; }

        .sa-login-label {
          display: block; font-size: 14px;
          font-weight: 600; color: #0f172a; margin-bottom: 8px;
        }

        .sa-login-input {
          width: 100%; padding: 14px 18px; font-size: 14px;
          font-family: 'Manrope', sans-serif;
          background: #eef0f6; border: 1.5px solid transparent;
          border-radius: 12px; outline: none; color: #0f172a;
          transition: border-color 0.2s, background 0.2s;
        }

        .sa-login-input::placeholder { color: #94a3b8; }
        .sa-login-input:focus {
          background: #ffffff; border-color: #3b6ef6;
          box-shadow: 0 0 0 3px rgba(59,110,246,0.12);
        }
        .sa-login-input:disabled {
          background: #e8e8ec; color: #999; cursor: not-allowed;
        }

        .sa-login-error {
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 20px; font-weight: 500;
        }

        .sa-login-lockout-banner {
          background: linear-gradient(135deg, #fff3e0, #ffe0b2);
          border: 1.5px solid #ffb74d; border-radius: 12px;
          padding: 18px 20px; margin-bottom: 20px; text-align: center;
        }

        .sa-login-lockout-icon { font-size: 28px; margin-bottom: 6px; }
        .sa-login-lockout-title { font-size: 14px; font-weight: 700; color: #e65100; margin-bottom: 4px; }
        .sa-login-lockout-sub { font-size: 12px; color: #bf360c; margin-bottom: 10px; }
        .sa-login-lockout-timer {
          font-size: 28px; font-weight: 900; color: #d84315;
          font-family: 'Courier New', monospace; letter-spacing: 2px;
        }
        .sa-login-lockout-hint { font-size: 11px; color: #999; margin-top: 6px; }

        .sa-login-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #3b6ef6 0%, #2554e8 100%);
          color: #ffffff; font-size: 15px; font-weight: 700;
          font-family: 'Manrope', sans-serif;
          border: none; border-radius: 12px; cursor: pointer;
          letter-spacing: 0.3px; margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(59,110,246,0.35);
        }

        .sa-login-btn:hover:not(:disabled) {
          opacity: 0.93; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(59,110,246,0.4);
        }
        .sa-login-btn:active:not(:disabled) { transform: translateY(0); }
        .sa-login-btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

        .sa-login-register {
          text-align: center; margin-top: 24px;
          font-size: 14px; color: #64748b;
        }
        .sa-login-register a { color: #3b6ef6; font-weight: 700; text-decoration: none; }
        .sa-login-register a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .sa-login-left { display: none; }
          .sa-login-right { width: 100%; padding: 32px 24px; }
        }
      `}</style>

      <div className="sa-login-root">

        {/* ── Left Panel ── */}
        <div className="sa-login-left">
          <div className="sa-login-left-bg" />

          {/* Brand */}
          <div className="sa-login-brand">
            <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={oneSurigaoLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span className="sa-login-brand-name">One-Surigao</span>
          </div>

          {/* Bottom content */}
          <div className="sa-login-left-content">
            <h1 className="sa-login-headline">
              Super Admin<br />Control Panel
            </h1>
            <p className="sa-login-subtext">
              Manage approvals, oversee operations, and maintain the City of Surigao platform.
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="sa-login-right">
          <div className="sa-login-form-box">
            <h2 className="sa-login-welcome">Welcome back</h2>
            <p className="sa-login-welcome-sub">Sign in to the Super Admin portal</p>

            {/* Lockout Banner */}
            {isLockedOut && (
              <div className="sa-login-lockout-banner">
                <div className="sa-login-lockout-icon">🔒</div>
                <div className="sa-login-lockout-title">Account Temporarily Locked</div>
                <div className="sa-login-lockout-sub">Too many failed login attempts.</div>
                <div className="sa-login-lockout-timer">{formatCountdown(remainingSeconds)}</div>
                <div className="sa-login-lockout-hint">Please wait before trying again.</div>
              </div>
            )}

            {error && !isLockedOut && <div className="sa-login-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="sa-login-field">
                <label className="sa-login-label">Username</label>
                <input
                  className="sa-login-input"
                  type="text" name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  required autoComplete="username"
                  disabled={isLockedOut}
                />
              </div>

              <div className="sa-login-field">
                <label className="sa-login-label">Password</label>
                <input
                  className="sa-login-input"
                  type="password" name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required autoComplete="current-password"
                  disabled={isLockedOut}
                />
              </div>

              <button type="submit" className="sa-login-btn" disabled={disableForm}>
                {isLockedOut ? "Locked" : loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="sa-login-register">
              Don't have an account?{" "}
              <Link to="/superadmin/register">Create an account</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default SuperAdminLogin;

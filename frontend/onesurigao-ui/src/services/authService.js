// src/services/authService.js
//
// What this file does:
// 1. apiClient — an Axios instance that automatically attaches X-Role and X-User-ID
//    headers on every request by reading from sessionStorage.
//    Use this instead of plain `axios` for any protected endpoint.
//
// 2. Login functions — call the backend, store session data, return the FULL
//    Axios response so callers can do `response.data.success`, `response.data.adminID` etc.
//    (AdminLogin.js uses `response.data.success` — this matches that shape.)
//
// 3. Logout / header helpers — utilities used by NavBar dropdowns and protected calls.

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

// ─── Session storage key lists ────────────────────────────────────────────────

const STORAGE_KEYS = {
  admin:      ["adminID", "officeName", "adminProfilePic", "announcement_drafts"],
  superadmin: ["superAdminID", "superAdminName"],
  publicuser: ["publicUserID", "publicUserName", "publicUserPic"],
};

function clearKeys(keys) {
  keys.forEach(k => sessionStorage.removeItem(k));
}

function clearAllSessions() {
  Object.values(STORAGE_KEYS).forEach(clearKeys);
}

// ─── Auth header builders ─────────────────────────────────────────────────────

export function adminHeaders() {
  const id = sessionStorage.getItem("adminID");
  return id ? { "X-Role": "admin", "X-User-ID": id } : {};
}

export function superAdminHeaders() {
  const id = sessionStorage.getItem("superAdminID");
  return id ? { "X-Role": "superadmin", "X-User-ID": id } : {};
}

export function publicUserHeaders() {
  const id = sessionStorage.getItem("publicUserID");
  return id ? { "X-Role": "publicuser", "X-User-ID": id } : {};
}

function getCurrentAuthHeaders() {
  if (sessionStorage.getItem("adminID"))      return adminHeaders();
  if (sessionStorage.getItem("superAdminID")) return superAdminHeaders();
  if (sessionStorage.getItem("publicUserID")) return publicUserHeaders();
  return {};
}

// ─── Axios instance with automatic auth headers ───────────────────────────────
// Use this instead of plain `axios` for all API calls.
// Login endpoints are open (no headers needed), but having them present is harmless.

export const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use(config => {
  const authHeaders = getCurrentAuthHeaders();
  config.headers = { ...(config.headers || {}), ...authHeaders };
  return config;
});

// ─── Session store helpers ────────────────────────────────────────────────────

function storeAdminSession(data) {
  clearAllSessions();
  sessionStorage.setItem("adminID",    String(data.adminID));
  sessionStorage.setItem("officeName", data.officeName || "");
  if (data.profilePic) {
    sessionStorage.setItem("adminProfilePic", data.profilePic);
  } else {
    sessionStorage.removeItem("adminProfilePic");
  }
}

function storeSuperAdminSession(data) {
  clearAllSessions();
  sessionStorage.setItem("superAdminID",   String(data.superAdminID));
  sessionStorage.setItem("superAdminName", data.superAdminName || "");
}

function storePublicUserSession(data) {
  clearAllSessions();
  sessionStorage.setItem("publicUserID",   String(data.publicUserID));
  sessionStorage.setItem("publicUserName", `${data.name || ""} ${data.lastName || ""}`.trim());
  if (data.profilePic) {
    sessionStorage.setItem("publicUserPic", data.profilePic);
  } else {
    sessionStorage.removeItem("publicUserPic");
  }
}

// ─── Login functions — return the full Axios response ────────────────────────
// AdminLogin.js uses:  response.data.success, response.data.adminID  etc.
// Returning the full response preserves that existing contract.

export async function loginAdmin({ username, password }) {
  const response = await apiClient.post("/api/login/", { username, password });
  if (response.data?.success) {
    storeAdminSession(response.data);
  }
  return response;   // ← full Axios response, not just response.data
}

export async function loginSuperAdmin({ username, password }) {
  const response = await apiClient.post("/superadmin/login/", { username, password });
  if (response.data?.success) {
    storeSuperAdminSession(response.data);
  }
  return response;
}

export async function loginPublicUser({ username, password }) {
  const response = await apiClient.post("/public/login/", { username, password });
  if (response.data?.success) {
    storePublicUserSession(response.data);
  }
  return response;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logoutAdmin()      { clearKeys(STORAGE_KEYS.admin);      }
export function logoutSuperAdmin() { clearKeys(STORAGE_KEYS.superadmin); }
export function logoutPublicUser() { clearKeys(STORAGE_KEYS.publicuser); }
export function logoutAll()        { clearAllSessions();                  }

// ─── Password change ──────────────────────────────────────────────────────────
// Uses apiClient so X-Role / X-User-ID are attached automatically.

export async function changeAdminPassword({ adminID, currentPassword, newPassword }) {
  return apiClient.patch(`/api/admins/${adminID}/change-password/`, {
    currentPassword,
    newPassword,
  });
}
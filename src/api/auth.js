// src/api/auth.js
import { apiClient } from "./index";

/**
 * Auth API helpers.
 * Names and endpoints match what your frontend files expect.
 *
 * Exports:
 *  - login(payload)
 *  - register(payload)
 *  - refreshToken()
 *  - getProfile()
 *  - updateProfile(payload)
 *  - changePassword(payload)
 *
 * NOTE: adjust the endpoint paths if your backend uses slightly different names.
 */

export async function login(payload) {
  // POST /auth/login
  return apiClient.post("/auth/login", payload);
}

export async function register(payload) {
  // POST /auth/register
  return apiClient.post("/auth/register", payload);
}

export async function refreshToken() {
  // POST /auth/refresh or similar; change if backend differs
  return apiClient.post("/auth/refresh");
}

export async function getProfile() {
  // GET /auth/profile
  return apiClient.get("/auth/profile");
}

/**
 * Update profile
 * Backend endpoint you mentioned: /api/auth/profile
 * Use PUT and return result
 */
export async function updateProfile(payload) {
  return apiClient.put("/auth/profile", payload);
}

/**
 * Change password
 * Many backends use /auth/changePassword or /auth/changepassword —
 * update the path here if your backend uses different casing.
 * You previously had /api/auth/changepassword on localhost so if remote uses that,
 * change "/auth/changePassword" to "/auth/changepassword".
 */
export async function changePassword(payload) {
  // example: { currentPassword, newPassword }
  return apiClient.put("/auth/changePassword", payload);
}

/* Assign the exported functions to a named variable first, then export it.
   This removes the ESLint `import/no-anonymous-default-export` warning. */
const authApi = {
  login,
  register,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
};

export default authApi;

// src/api/index.js
import axios from "axios";

/**
 * Central API client used throughout the app.
 * Attaches Authorization header automatically from localStorage before each request.
 */

export const apiClient = axios.create({
  baseURL: "https://movie-handler-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token from localStorage automatically
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        if (config.headers && config.headers["Authorization"]) {
          delete config.headers["Authorization"];
        }
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: don't perform a global redirect on 401.
// Let callers handle 401 (so we can show a friendly alert instead of forcing a logout).
apiClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // simply re-throw the error so component-level code can decide what to do
    return Promise.reject(error);
  }
);

// Optional helper to set token manually (keeps compatibility)
export function attachAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      localStorage.setItem("token", token);
    } catch (e) {}
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem("token");
    } catch (e) {}
  }
}

export default apiClient;

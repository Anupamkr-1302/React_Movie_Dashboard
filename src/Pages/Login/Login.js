// src/Pages/Login/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Loader from "../../Components/Loader/Loader";
import { login } from "../../api/auth";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [pwdVisible, setPwdVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // basic email validator
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const togglePwd = () => setPwdVisible((v) => !v);

  // handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const payload = { email: email.trim(), password };
      console.log("Login: sending payload", payload);

      // call your auth helper which uses apiClient.post("login", payload)
      const resp = await login(payload);
      console.log("Login response:", resp);

      // API shape: { success: true, token: "...", data: { _id, name, ... } }
      const token = resp?.data?.token || resp?.data?.data?.token;
      const userData = resp?.data?.data || resp?.data || null;

      console.log("Login token:", token);
      console.log("Login user:", userData);

      if (!token) {
        console.warn("Login: token not found in response");
      } else {
        // persist token and configure apiClient for subsequent requests
        localStorage.setItem("token", token);
      }

      if (userData) {
        localStorage.setItem("userDetails", JSON.stringify(userData));
        // save userId for components that expect it
        if (userData._id) localStorage.setItem("userId", userData._id);
      }

      // tiny delay to ensure storage set
      // navigate to dashboard
      navigate("/dashboard");
      console.log("navigate('/dashboard') called");
    } catch (err) {
      console.error("Login error caught:", err);
      // extract message from common shapes
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Login failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" role="region" aria-label="Sign in">
        <h2>Sign in</h2>

        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="input-row">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                autoComplete="username"
              />
            </div>
            <br></br>

            <div className="input-row" style={{ position: "relative" }}>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type={pwdVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={togglePwd}
                aria-label={pwdVisible ? "Hide password" : "Show password"}
              >
                {pwdVisible ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
            <br></br>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <div className="auth-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </div>

        <Loader loading={loading} text={loading ? "Signing in..." : ""} />
      </div>
    </div>
  );
}

// src/Pages/PassChange/PassChange.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/index";
import { changePassword } from "../../api/auth";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import "./PassChange.css";

export default function PassChange() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    if (!currentPassword) return "Please enter your current password.";
    if (!newPassword) return "Please enter a new password.";
    if (newPassword.length < 8)
      return "New password must be at least 8 characters.";
    if (newPassword !== confirmPassword)
      return "New password and confirm password do not match.";
    return null;
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    setSuccess("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setBusy(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // API expects { currentPassword, newPassword }
      const payload = { currentPassword, newPassword };

      const resp = await changePassword(payload);

      // shape may be { success: true, ... } or similar
      if (resp && resp.status >= 200 && resp.status < 300) {
        setSuccess(
          "Password changed successfully. Please sign in with your new password."
        );

        // clear auth so user must log in again
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        } catch (err) {}

        // notify other components
        window.dispatchEvent(new Event("userDataChanged"));

        // short delay so message is visible
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 900);
      } else {
        setError(`Change failed: ${resp ? resp.status : "unknown"}`);
      }
    } catch (err) {
      console.error("change-password error:", err);
      const serverMsg =
        err?.response?.data?.message || err?.response?.data || err?.message;
      setError(
        typeof serverMsg === "string" ? serverMsg : "Password change failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header />
      <main
        className="page-wrap passchange-wrap"
        style={{ paddingTop: 18, paddingBottom: 36 }}
      >
        <div className="pass-card container" style={{ maxWidth: 820 }}>
          <h2 className="form-title">Change Password</h2>

          <form onSubmit={handleSubmit} className="pass-form">
            <div className="form-row">
              <label>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="form-row">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="form-row">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="success" role="status">
                {success}
              </div>
            )}

            <div className="buttons" style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancel}
                disabled={busy}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-login"
                disabled={busy}
                style={{ marginLeft: 12 }}
              >
                {busy ? "Saving..." : "Confirm change"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

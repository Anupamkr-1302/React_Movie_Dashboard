// src/Components/Header/Header.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  // read user from 'user' or fall back to older keys
  const readUser = () => {
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("userDetails") ||
        localStorage.getItem("userData");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.userDetails ? parsed.userDetails : parsed;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(() => readUser());

  useEffect(() => {
    // update immediately on mount
    setUser(readUser());

    const onStorage = (e) => {
      if (!e) return;
      if (
        e.key === "user" ||
        e.key === "userDetails" ||
        e.key === "userData" ||
        e.key === "userId" ||
        e.key === "token"
      ) {
        setUser(readUser());
      }
    };

    const onUserDataChanged = () => setUser(readUser());

    window.addEventListener("storage", onStorage);
    window.addEventListener("userDataChanged", onUserDataChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userDataChanged", onUserDataChanged);
    };
  }, []);

  // derive display name:
  const displayName = (() => {
    if (!user) return "User";
    if (typeof user.name === "string" && user.name.trim())
      return user.name.trim();
    const fname = user.firstName || user.fname || user.first_name || "";
    const lname = user.lastName || user.lname || user.last_name || "";
    const combined = `${fname || ""}${
      lname ? (fname ? " " + lname : lname) : ""
    }`.trim();
    return combined || "User";
  })();

  // derive initials: prefer name (split words), otherwise use first/last
  const initials = (() => {
    if (!user) return "U";
    if (typeof user.name === "string" && user.name.trim()) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
    }
    const fname = (
      user.firstName ||
      user.fname ||
      user.first_name ||
      ""
    ).trim();
    const lname = (user.lastName || user.lname || user.last_name || "").trim();
    if (fname || lname) {
      return ((fname[0] || "") + (lname[0] || "")).toUpperCase() || "U";
    }
    return "U";
  })();

  // profile image: support avatar, photos, profileImage, avatarUrl
  const profileImage =
    (typeof user?.avatar === "string" && user.avatar) ||
    (typeof user?.photos === "string" && user.photos) ||
    (Array.isArray(user?.photos) && user.photos[0]) ||
    user?.profileImage ||
    user?.avatarUrl ||
    null;

  const handleLogout = () => {
    try {
      // remove everything stored in localStorage/sessionStorage for a clean logout
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("Logout: clearing storage failed", e);
    }

    // Notify other parts of the app (header/dashboard/listeners) that user data changed
    try {
      window.dispatchEvent(new Event("userDataChanged"));
    } catch (e) {}

    // navigate to login/landing page
    navigate("/", { replace: true });
  };

  return (
    <header className="app-header" role="banner" aria-label="Main header">
      <div className="header-left" aria-hidden="false">
        <div className="avatar" title={displayName} aria-hidden="true">
          {profileImage ? (
            <img
              src={profileImage}
              alt={`${displayName} avatar`}
              className="avatar-img"
            />
          ) : (
            <span className="avatar-initials" aria-hidden="true">
              {initials}
            </span>
          )}
        </div>
        <div className="welcome" aria-live="polite">
          <div className="small">Welcome</div>
          <div className="name">{displayName}</div>
        </div>
      </div>

      <div className="header-center" aria-hidden="true">
        <h1 className="brand">Movie Villa</h1>
      </div>

      <div className="header-right">
        <button
          onClick={handleLogout}
          className="logout-btn"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

// src/Pages/UpdateProfile/UpdateProfile.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/index";
import { updateProfile } from "../../api/auth";
import "./UpdateProfile.css";

export default function UpdateProfile() {
  const navigate = useNavigate();

  // form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // avatar upload preview/base64
  const [avatarPreview, setAvatarPreview] = useState(null); // data url or remote url
  const [avatarBase64, setAvatarBase64] = useState(null);
  const fileRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // helper: read currently stored user (support multiple keys)
  const readStoredUser = () => {
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("userDetails") ||
        localStorage.getItem("userData");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.userDetails ? parsed.userDetails : parsed;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const u = readStoredUser();
    if (u) {
      // prefer server 'name' split into first/last if needed
      if (u.name && !firstName && !lastName) {
        const parts = u.name.trim().split(/\s+/);
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      } else {
        setFirstName(u.firstName || u.fname || "");
        setLastName(u.lastName || u.lname || "");
      }
      setEmail(u.email || "");
      setDob(
        u.dateOfBirth
          ? u.dateOfBirth.split("T")[0]
          : u.dateOfBirth || u.dob || ""
      );
      setPhone(u.phone || u.phoneNumber || "");
      setBio(u.bio || "");
      setAvatarPreview(u.avatar || u.photos || u.profileImage || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // file -> base64 data url
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  // open file picker
  const openPicker = () => fileRef.current && fileRef.current.click();

  // when selecting file
  const handleFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const dataUrl = await fileToDataUrl(f);
      setAvatarPreview(dataUrl); // show preview
      // store base64 without prefix if you prefer; we'll send full dataURL in payload.avatar
      setAvatarBase64(dataUrl);
    } catch (err) {
      console.error("file read error", err);
      setError("Failed to read selected file.");
    } finally {
      // allow reselect same file next time
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // remove avatar locally (and send update to clear avatar on server)
  const handleRemoveAvatar = async () => {
    if (!window.confirm("Remove profile avatar and revert to initials?"))
      return;
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const payload = {
        name: `${firstName} ${lastName}`.trim() || undefined,
        email, // server may require email
        avatar: null,
      };

      const resp = await updateProfile(payload);
      const updated = resp?.data?.data || resp?.data || payload;
      // update local storage
      localStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("userDetails", JSON.stringify(updated));
      window.dispatchEvent(new Event("userDataChanged"));
      setAvatarPreview(null);
      setAvatarBase64(null);
      alert("Avatar removed.");
    } catch (err) {
      console.error("remove avatar error", err);
      setError(err?.response?.data?.message || err?.message || "Remove failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!firstName && !lastName) {
      setError("Please provide a name.");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        email, // email is not editable — keep but send current value
        phone: phone || undefined,
        dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
        bio: bio || undefined,
        avatar: avatarBase64 || avatarPreview || undefined,
      };

      const resp = await updateProfile(payload);
      const updated = resp?.data?.data || resp?.data || payload;

      // persist user - keep both keys to be safe
      localStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("userDetails", JSON.stringify(updated));

      // notify header/dashboard
      window.dispatchEvent(new Event("userDataChanged"));

      alert("Profile updated successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error("update profile error", err);
      const serverMsg =
        err?.response?.data?.message || err?.response?.data || err?.message;
      setError(typeof serverMsg === "string" ? serverMsg : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="update-profile-page page-wrap" style={{ padding: 20 }}>
      <div
        className="card container"
        style={{ maxWidth: 900, margin: "0 auto", padding: 28 }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 18 }}>Your Profile</h2>

        <form onSubmit={handleSave}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 12,
              alignItems: "center",
            }}
          >
            <label>Name</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ padding: 10, borderRadius: 8, flex: 1 }}
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ padding: 10, borderRadius: 8, flex: 1 }}
              />
            </div>

            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 10, borderRadius: 8 }}
            />

            <label>D.O.B</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              style={{ padding: 10, borderRadius: 8 }}
            />

            <label>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: 10, borderRadius: 8 }}
            />

            <label>Short bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              style={{ padding: 10, borderRadius: 8 }}
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: 12,
                color: "#9b1b1b",
                background: "#fff5f5",
                padding: 10,
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                background: "#f3f6f9",
                color: "#1f2a36",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #e6eef7",
              }}
            >
              ← Back
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: "#2b75ff",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
              }}
            >
              {saving ? "Saving..." : "Update Info"}
            </button>

            <div
              style={{
                marginLeft: 8,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={openPicker}
                style={{
                  background: "#fff",
                  color: "#1f2a36",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #e6eef7",
                }}
              >
                Upload Profile
              </button>

              <button
                type="button"
                onClick={handleRemoveAvatar}
                style={{
                  background: "#fff",
                  color: "#c0392b",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(192,57,43,0.12)",
                }}
              >
                Remove Profile
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {avatarPreview && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, marginBottom: 6 }}>
                Avatar preview
              </div>
              <img
                src={avatarPreview}
                alt="avatar preview"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "1px solid #e6eef7",
                }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

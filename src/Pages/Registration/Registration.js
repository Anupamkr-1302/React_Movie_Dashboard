import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Loader from "../../Components/Loader/Loader";
import { register } from "../../api/auth";
import "./Registration.css";

export default function Registration() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [pwdVisible, setPwdVisible] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

  const togglePwd = () => setPwdVisible((v) => !v);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email and password are required.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password does not meet the security requirements.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: "user",
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        bio: bio.trim() || undefined,
      };

      const resp = await register(payload);
      console.log("api is running----", resp);

      const data = resp?.data || {};
      const token = data.token || data.accessToken || data?.data?.token;
      const user = data.user || data?.data?.user || data;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Registration failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <div
        className="registration-card"
        role="region"
        aria-label="Create account"
      >
        <h2>Create account</h2>

        <form className="reg-form" onSubmit={handleRegister} noValidate>
          <div className="input-row">
            <label htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="input-row">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="input-row">
            <label htmlFor="reg-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="reg-password"
                type={pwdVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwdFocused(true)}
                onBlur={() => setPwdFocused(false)}
                placeholder="Choose a secure password"
                required
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
          </div>

          {/* password suggestion appears as full-width row */}
          {pwdFocused && (
            <div className="pwd-suggestion">
              <div className={`rule ${password.length >= 8 ? "ok" : "bad"}`}>
                <span>{password.length >= 8 ? "✓" : "◻"}</span>
                <span>Contains at least eight characters</span>
              </div>
              <div className={`rule ${/[0-9]/.test(password) ? "ok" : "bad"}`}>
                <span>{/[0-9]/.test(password) ? "✓" : "◻"}</span>
                <span>Include at least one number</span>
              </div>
              <div
                className={`rule ${
                  /(?=.*[a-z])(?=.*[A-Z])/.test(password) ? "ok" : "bad"
                }`}
              >
                <span>
                  {/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? "✓" : "◻"}
                </span>
                <span>Includes both lower and uppercase letters</span>
              </div>
              <div
                className={`rule ${
                  /[^A-Za-z0-9]/.test(password) ? "ok" : "bad"
                }`}
              >
                <span>{/[^A-Za-z0-9]/.test(password) ? "✓" : "◻"}</span>
                <span>Include at least one special character</span>
              </div>
            </div>
          )}

          <div className="input-row">
            <label htmlFor="reg-phone">Phone (optional)</label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          <div className="input-row">
            <label htmlFor="reg-dob">Date of birth (optional)</label>
            <input
              id="reg-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <div className="input-row full">
            <label htmlFor="reg-bio">Short bio (optional)</label>
            <textarea
              id="reg-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Movie enthusiast and critic"
            />
          </div>

          {error && (
            <div className="form-error full" role="alert">
              {error}
            </div>
          )}

          <div className="auth-actions full">
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Create account"}
            </button>
          </div>

          <div className="auth-footer full">
            Already have an account? <Link to="/">Sign in</Link>
          </div>
        </form>

        <Loader loading={loading} text={loading ? "Registering..." : ""} />
      </div>
    </div>
  );
}

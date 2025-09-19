// src/Components/Loader/Loader.js
import React from "react";
import "./Loader.css";

export default function Loader({ loading = false, text = "Please wait..." }) {
  if (!loading) return null;
  return (
    <div
      className="loader-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loader-card">
        <div className="loader-spinner" />
        <div className="loader-text">{text}</div>
      </div>
    </div>
  );
}

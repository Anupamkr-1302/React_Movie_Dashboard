// src/Pages/AddMovies/AddMovies.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import { createMovie, getMovies } from "../../api/movie";
import "./AddMovies.css";

export default function AddMovies() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    director: "",
    cast: [{ name: "", role: "" }],
    rating: "",
    duration: "",
    releaseDate: "",
    language: "",
    country: "",
    posterUrl: "",
    trailerUrl: "", // NEW field
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setCast = (i, k, v) =>
    setForm((s) => {
      const cast = Array.isArray(s.cast)
        ? [...s.cast]
        : [{ name: "", role: "" }];
      cast[i] = { ...cast[i], [k]: v };
      return { ...s, cast };
    });

  const addCastRow = () =>
    setForm((s) => ({
      ...s,
      cast: [...(s.cast || []), { name: "", role: "" }],
    }));

  const removeCastRow = (i) =>
    setForm((s) => ({ ...s, cast: s.cast.filter((_, idx) => idx !== i) }));

  const validate = () => {
    if (!form.title) return "Title is required";
    if (!form.posterUrl) return "Poster URL is required";
    // trailerUrl is optional; you could add URL validation here if you want.
    return null;
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        genre:
          typeof form.genre === "string"
            ? form.genre
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : form.genre,
        director: form.director,
        cast: Array.isArray(form.cast)
          ? form.cast.filter((c) => c && (c.name || c.role))
          : [],
        rating: form.rating ? Number(form.rating) : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        releaseDate: form.releaseDate || undefined,
        language: form.language || undefined,
        country: form.country || undefined,
        posterUrl: form.posterUrl,
        trailerUrl: form.trailerUrl || undefined, // NEW
      };

      // create movie
      await createMovie(payload);

      // fetch fresh list from server (use a short query - adjust if you need filters)
      const resp = await getGamesafe();

      // Persist returned list to localStorage so Dashboard loads it immediately
      const list = Array.isArray(resp) ? resp : [];
      try {
        localStorage.setItem("movies", JSON.stringify(list));
      } catch (err) {
        // ignore localStorage errors
      }
      // notify the app (storage listeners)
      window.dispatchEvent(new Event("storage"));
      // navigate back to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("add movie error", err);
      if (err?.response?.status === 401) {
        alert("Can't add");
        setError("Not authorized to create movie.");
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create movie";
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // helper - call getMovies but fall back to existing local data if API throttles/rates out
  async function getGamesafe() {
    try {
      // adjust query string as needed
      const q = "?page=1&limit=10";
      const r = await getMovies(q);
      // API may return { data: [...] } or { data: { data: [...] } } - normalize
      const d = Array.isArray(r?.data) ? r.data : r?.data?.data || r?.data;
      return Array.isArray(d) ? d : [];
    } catch (err) {
      // if server returns too many requests or errors, fallback to localStorage list (if any)
      try {
        const raw = localStorage.getItem("movies");
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="shell-body single-column">
        <main className="main-column add-movie-page">
          <div className="add-movie-card">
            <div className="add-movie-header">
              <h1>Add movies</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />

                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />

                <label>Genre (comma separated)</label>
                <input
                  value={form.genre}
                  onChange={(e) => setField("genre", e.target.value)}
                />

                <label>Director</label>
                <input
                  value={form.director}
                  onChange={(e) => setField("director", e.target.value)}
                />

                <div className="cast-block" style={{ gridColumn: "1 / -1" }}>
                  <label>Cast</label>
                  {Array.isArray(form.cast) &&
                    form.cast.map((c, i) => (
                      <div className="cast-row" key={i}>
                        <input
                          placeholder="Actor name"
                          value={c.name}
                          onChange={(e) => setCast(i, "name", e.target.value)}
                        />
                        <input
                          placeholder="Role"
                          value={c.role}
                          onChange={(e) => setCast(i, "role", e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn small"
                          onClick={() => removeCastRow(i)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="btn small"
                    onClick={addCastRow}
                  >
                    Add cast
                  </button>
                </div>

                <label>Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => setField("rating", e.target.value)}
                />

                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setField("duration", e.target.value)}
                />

                <label>Release Date</label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => setField("releaseDate", e.target.value)}
                />

                <label>Language</label>
                <input
                  value={form.language}
                  onChange={(e) => setField("language", e.target.value)}
                />

                <label>Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setField("country", e.target.value)}
                />

                <label>Poster URL *</label>
                <input
                  value={form.posterUrl}
                  onChange={(e) => setField("posterUrl", e.target.value)}
                />

                {/* NEW: Trailer URL directly below Poster URL */}
                <label>Trailer URL</label>
                <input
                  value={form.trailerUrl}
                  placeholder="Trailer link"
                  onChange={(e) => setField("trailerUrl", e.target.value)}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                <button type="button" className="btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create movie"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

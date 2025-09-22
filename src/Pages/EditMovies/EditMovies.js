// src/Pages/EditMovies/EditMovies.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import { getMovie, updateMovie } from "../../api/movie";
import "./EditMovies.css";

export default function EditMovies() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // load movie by id
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const resp = await getMovie(id);
        const m = resp?.data?.data || resp?.data || null;
        if (!m) {
          setError("Movie not found");
          return;
        }

        setForm({
          title: m.title || m.name || "",
          description: m.description || "",
          genre: Array.isArray(m.genre) ? m.genre.join(", ") : m.genre || "",
          director: m.director || "",
          cast:
            Array.isArray(m.cast) && m.cast.length
              ? m.cast
              : [{ name: "", role: "" }],
          rating: m.rating || "",
          duration: m.duration || "",
          releaseDate: m.releaseDate
            ? m.releaseDate.split("T")[0]
            : m.releaseDate || "",
          language: m.language || "",
          country: m.country || "",
          posterUrl: m.posterUrl || m.image || "",
          trailerUrl: m.trailerUrl || m.trailer || "", // NEW: load trailer
        });
      } catch (err) {
        console.error("Load movie error:", err);
        setError(
          err?.response?.data?.message || err?.message || "Failed to load movie"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // helpers
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const setCast = (i, field, value) =>
    setForm((s) => {
      const cast = Array.isArray(s.cast)
        ? [...s.cast]
        : [{ name: "", role: "" }];
      cast[i] = { ...cast[i], [field]: value };
      return { ...s, cast };
    });
  const addCastRow = () =>
    setForm((s) => ({
      ...s,
      cast: [...(s.cast || []), { name: "", role: "" }],
    }));
  const removeCastRow = (idx) =>
    setForm((s) => ({ ...s, cast: s.cast.filter((_, i) => i !== idx) }));

  const validate = () => {
    if (!form.title) return "Title is required";
    if (!form.posterUrl) return "Poster URL is required";
    return null;
  };

  // update localStorage helper
  const saveLocalMovies = (list) => {
    try {
      localStorage.setItem("movies", JSON.stringify(list || []));
    } catch (e) {}
  };

  const handleCancel = () => navigate("/dashboard");

  const handleSave = async (e) => {
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

      const resp = await updateMovie(id, payload);
      const updated = resp?.data?.data || resp?.data || { ...payload, _id: id };

      // update localStorage array so Dashboard shows updated card
      try {
        const raw = localStorage.getItem("movies");
        const list = raw ? JSON.parse(raw) : [];
        const newList = Array.isArray(list)
          ? list.map((m) => ((m._id || m.id) === id ? updated : m))
          : [updated, ...(list || [])];
        saveLocalMovies(newList);
      } catch (err) {
        // ignore localStorage errors
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Update movie error:", err);
      // If unauthorized - show friendly alert and keep user on page
      if (err?.response?.status === 401) {
        alert("Can't edit");
        setError("Not authorized to edit this movie.");
        // do not navigate away
        return;
      }
      const msg =
        err?.response?.data?.message || err?.message || "Update failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="add-movie-page">
          <div className="add-movie-card">
            <p>Loading movie...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="shell-body single-column">
        <main className="main-column add-movie-page">
          <div className="add-movie-card">
            <div className="add-movie-header">
              <h1>Edit movie</h1>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
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
                  placeholder="https://youtube.com/watch?v=..."
                  onChange={(e) => setField("trailerUrl", e.target.value)}
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

                <label>Release Date</label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => setField("releaseDate", e.target.value)}
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
                  {saving ? "Saving..." : "Save changes"}
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

// src/Pages/Dashboard/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Loader from "../../Components/Loader/Loader";
import {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovies,
  getTopRated,
  getLatest,
  getMoviesByGenre,
} from "../../api/movie";

import "./Dashboard.css";

/* local storage helpers */
const STORAGE_KEY = "movies";
function loadLocalMovies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocalMovies(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
  } catch {}
}

/* robust user reader for the profile area (supports multiple key names and envelopes) */
function readUserFromStorage() {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("userDetails") ||
      localStorage.getItem("userData");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.userDetails ? parsed.userDetails : parsed;
  } catch (e) {
    console.warn("Dashboard: failed to parse user", e);
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(() => readUserFromStorage());
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(() => loadLocalMovies() || []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [error, setError] = useState("");

  // New: navigation loader state
  const [navLoading, setNavLoading] = useState(false);

  // filter states
  const [filterType, setFilterType] = useState(""); // '', 'top-rated', 'latest'
  const [genreFilter, setGenreFilter] = useState(""); // '' or specific genre
  const [filterLoading, setFilterLoading] = useState(false);

  /* Form state (only the fields required by your spec) */
  const emptyForm = {
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
  };
  const [form, setForm] = useState({ ...emptyForm });

  /* load movies from server on mount; fallback to local if API fails */
  useEffect(() => {
    (async () => {
      try {
        setLoadingApi(true);
        const resp = await getMovies();
        const data = Array.isArray(resp?.data)
          ? resp.data
          : resp?.data?.data || resp?.data;
        if (Array.isArray(data) && data.length) {
          setMovies(data);
          saveLocalMovies(data);
        } else {
          // keep local if present
          const local = loadLocalMovies();
          if (local && local.length) setMovies(local);
        }
      } catch (err) {
        // fallback to local storage if api fails
        const local = loadLocalMovies();
        if (local && local.length) setMovies(local);
      } finally {
        setLoadingApi(false);
      }
    })();
  }, []);

  /* listen for storage changes and custom events so profile updates reflect immediately */
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (
        e.key === "user" ||
        e.key === "userDetails" ||
        e.key === "userData" ||
        e.key === "userId"
      ) {
        setUser(readUserFromStorage());
      }
      if (e.key === STORAGE_KEY) {
        const local = loadLocalMovies();
        if (local && local.length) setMovies(local);
      }
    };
    const onUserDataChanged = () => setUser(readUserFromStorage());
    window.addEventListener("storage", onStorage);
    window.addEventListener("userDataChanged", onUserDataChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userDataChanged", onUserDataChanged);
    };
  }, []);

  /* honor navigation state to switch to profile tab when requested */
  useEffect(() => {
    if (location && location.state && location.state.tab) {
      const requested = location.state.tab;
      if (requested === "profile" || requested === "dashboard") {
        setActiveTab(requested);
        try {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );
        } catch (e) {}
      }
    }
  }, [location]);

  /* derive available genres from current movies list */
  const availableGenres = useMemo(() => {
    try {
      const set = new Set();
      (movies || []).forEach((m) => {
        const g = m.genre;
        if (!g) return;
        if (Array.isArray(g)) {
          g.forEach((x) => x && set.add(String(x).trim()));
        } else {
          String(g)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((x) => set.add(x));
        }
      });
      return Array.from(set).sort();
    } catch {
      return [];
    }
  }, [movies]);

  /* helpers */
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

  /* Validation */
  const validateForm = () => {
    if (!form.title || !form.posterUrl)
      return "Title and Poster URL are required.";
    return null;
  };

  /* Create / Update (used when using inline form - but main flows use routes) */
  const handleSave = async (e) => {
    e?.preventDefault?.();
    setError("");
    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }
    setLoadingApi(true);
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
      };

      if (editing && (editing._id || editing.id)) {
        const id = editing._id || editing.id;
        const resp = await updateMovie(id, payload);
        const updated = resp?.data?.data ||
          resp?.data || { ...payload, _id: id };
        const newList = movies.map((m) =>
          (m._id || m.id) === id ? updated : m
        );
        setMovies(newList);
        saveLocalMovies(newList);
      } else {
        const resp = await createMovie(payload);
        const created = resp?.data?.data || resp?.data || payload;
        const newList = [created, ...movies];
        setMovies(newList);
        saveLocalMovies(newList);
      }

      setShowForm(false);
      setEditing(null);
      setError("");
    } catch (err) {
      console.error("handleSave error", err);
      setError(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setLoadingApi(false);
    }
  };

  /* Delete */
  const handleDelete = async (m) => {
    if (!window.confirm("Delete this movie?")) return;
    setLoadingApi(true);
    try {
      const id = m._id || m.id;
      if (id) await deleteMovie(id);
      const newList = movies.filter((x) => (x._id || x.id) !== id);
      setMovies(newList);
      saveLocalMovies(newList);
    } catch (err) {
      // If unauthorized, alert and do not remove or redirect
      if (err?.response?.status === 401) {
        alert("Can't Delete");
        setError("Not authorized to delete this movie.");
        // do not remove locally
      } else {
        console.warn("delete failed, removing locally", err);
        const id = m._id || m.id;
        const newList = movies.filter((x) => (x._id || x.id) !== id);
        setMovies(newList);
        saveLocalMovies(newList);
      }
    } finally {
      setLoadingApi(false);
    }
  };

  /* view detail: navigate to /movies/:id WITHOUT passing `state`
     so MovieDetails always calls the API getMovie(id). */
  const handleView = (m) => {
    const id = m._id || m.id;
    if (!id) return;
    // show loader immediately, then navigate so loader has time to render
    setNavLoading(true);
    // small delay to let the loader paint; this is intentionally short
    setTimeout(() => {
      navigate(`/movies/${id}`);
    }, 120);
  };

  /* edit flow: navigate to dedicated edit route */
  const handleEdit = (m) => {
    const id = m._id || m.id;
    if (!id) return;
    setNavLoading(true);
    setTimeout(() => {
      navigate(`/edit/${id}`);
    }, 120);
  };

  /* grid filter (client-side text search) */
  const visibleMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movies || [];
    return (movies || []).filter((m) => {
      const name = (m.title || m.name || "").toString().toLowerCase();
      return name.includes(q);
    });
  }, [movies, query]);

  /* Profile helpers */
  const getDisplayName = (u) => {
    if (!u) return "User";
    if (typeof u.name === "string" && u.name.trim()) return u.name.trim();
    const fname = u.firstName || u.fname || u.first_name || "";
    const lname = u.lastName || u.lname || u.last_name || "";
    const combined = `${fname || ""}${
      lname ? (fname ? " " + lname : lname) : ""
    }`.trim();
    return combined || "User";
  };

  /* Filter functions: call endpoints depending on selection */
  async function applyFilters({
    useFilter = filterType,
    useGenre = genreFilter,
  } = {}) {
    setFilterLoading(true);
    setError("");
    try {
      // genre selected -> fetch genre endpoint, optionally sort client-side
      if (useGenre) {
        const resp = await getMoviesByGenre(useGenre, 1, 50);
        const d = Array.isArray(resp?.data)
          ? resp.data
          : resp?.data?.data || resp?.data || [];
        let list = Array.isArray(d) ? d : [];

        if (useFilter === "top-rated") {
          list = list.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (useFilter === "latest") {
          list = list.slice().sort((a, b) => {
            const da = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
            const db = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
            return db - da;
          });
        }

        setMovies(list);
        saveLocalMovies(list);
        setFilterLoading(false);
        return;
      }

      // no genre -> filter-only endpoints
      if (useFilter === "top-rated") {
        const resp = await getTopRated(50);
        const d = Array.isArray(resp?.data)
          ? resp.data
          : resp?.data?.data || resp?.data || [];
        const list = Array.isArray(d) ? d : [];
        setMovies(list);
        saveLocalMovies(list);
        setFilterLoading(false);
        return;
      }

      if (useFilter === "latest") {
        const resp = await getLatest(50);
        const d = Array.isArray(resp?.data)
          ? resp.data
          : resp?.data?.data || resp?.data || [];
        const list = Array.isArray(d) ? d : [];
        setMovies(list);
        saveLocalMovies(list);
        setFilterLoading(false);
        return;
      }

      // none selected -> basic list
      const resp = await getMovies();
      const d = Array.isArray(resp?.data)
        ? resp.data
        : resp?.data?.data || resp?.data || [];
      const list = Array.isArray(d) ? d : [];
      setMovies(list);
      saveLocalMovies(list);
    } catch (err) {
      console.error("filter error", err);
      setError(err?.response?.data?.message || err?.message || "Filter failed");
    } finally {
      setFilterLoading(false);
    }
  }

  /* call applyFilters when filterType or genreFilter changes */
  useEffect(() => {
    // only trigger when user interacts with filters, not on mount (applyFilters is safe on mount too)
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, genreFilter]);

  return (
    <div className="app-shell" aria-busy={navLoading || loadingApi}>
      <Header />

      <div className="shell-body">
        {/* Left sidebar */}
        <aside className="side-column" aria-label="Main navigation">
          <div
            className={`side-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </div>

          <div
            className={`side-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Your Profile
          </div>
        </aside>

        {/* Main column */}
        <main className="main-column">
          {activeTab === "dashboard" && (
            <>
              <div className="main-top">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    aria-label="Add movie"
                    onClick={() => navigate("/dashboard/add")}
                    className="add-movie-btn"
                    title="Add movie"
                    disabled={navLoading}
                  >
                    <AddCircleIcon className="add-movie-icon" />
                  </button>

                  <h1 className="page-title">Add Movies</h1>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="search-box">
                    <input
                      type="search"
                      placeholder="Search movies..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <div className="search-box">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      aria-label="Filter movies"
                      disabled={filterLoading}
                    >
                      <option value="">Filter</option>
                      <option value="top-rated">Top rated</option>
                      <option value="latest">Latest movies</option>
                    </select>
                  </div>

                  <div className="search-box">
                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      aria-label="Genre filter"
                      disabled={filterLoading}
                    >
                      <option value="">Genre</option>
                      {availableGenres.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Add/Edit form (if you still want inline form support) */}
              {showForm && (
                <div className="movie-form-card">
                  <form onSubmit={handleSave}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3>{editing ? "Edit movie" : "Add movie"}</h3>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditing(null);
                          }}
                          className="btn"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loadingApi}
                          style={{ marginLeft: 8 }}
                        >
                          {loadingApi
                            ? "Saving..."
                            : editing
                            ? "Save changes"
                            : "Create movie"}
                        </button>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div>
                        <label>Title *</label>
                        <input
                          value={form.title}
                          onChange={(e) => setField("title", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Poster URL *</label>
                        <input
                          value={form.posterUrl}
                          onChange={(e) =>
                            setField("posterUrl", e.target.value)
                          }
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label>Description</label>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setField("description", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label>Genre (comma separated)</label>
                        <input
                          value={form.genre}
                          onChange={(e) => setField("genre", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Director</label>
                        <input
                          value={form.director}
                          onChange={(e) => setField("director", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Release Date</label>
                        <input
                          type="date"
                          value={form.releaseDate}
                          onChange={(e) =>
                            setField("releaseDate", e.target.value)
                          }
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label>Cast</label>
                        <div>
                          {Array.isArray(form.cast) &&
                            form.cast.map((c, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginBottom: 8,
                                }}
                              >
                                <input
                                  placeholder="Actor name"
                                  value={c.name}
                                  onChange={(e) =>
                                    setCast(i, "name", e.target.value)
                                  }
                                />
                                <input
                                  placeholder="Role"
                                  value={c.role}
                                  onChange={(e) =>
                                    setCast(i, "role", e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCastRow(i)}
                                  className="btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          <button
                            type="button"
                            onClick={addCastRow}
                            className="btn"
                          >
                            Add cast
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && <div className="form-error">{error}</div>}
                  </form>
                </div>
              )}

              {/* Cards grid */}
              <div className="cards-grid">
                {visibleMovies && visibleMovies.length > 0 ? (
                  visibleMovies.map((m) => (
                    <div key={m._id || m.id || m.name} className="card">
                      <div className="card-image-wrap">
                        <img
                          src={m.posterUrl || m.image || m.poster || ""}
                          alt={m.title || m.name}
                          onClick={() => handleView(m)}
                          style={{ cursor: navLoading ? "not-allowed" : "pointer" }}
                        />
                      </div>
                      <div className="card-body">
                        <h3>{m.title || m.name}</h3>
                        <div className="card-actions">
                          <button
                            title="Edit"
                            onClick={() => handleEdit(m)}
                            className="card-action"
                            disabled={navLoading}
                            aria-disabled={navLoading}
                          >
                            <EditIcon />
                          </button>

                          <button
                            title="View"
                            onClick={() => handleView(m)}
                            className="card-action"
                            disabled={navLoading}
                            aria-disabled={navLoading}
                          >
                            <VisibilityIcon />
                          </button>

                          <button
                            title="Delete"
                            onClick={() => handleDelete(m)}
                            className="card-action danger"
                            disabled={navLoading}
                            aria-disabled={navLoading}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-movies">
                    No movies yet. Click the add icon.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <section className="profile-area">
              <h2>Your Profile</h2>

              {!user ? (
                <p className="muted">
                  No profile data found. Please sign up or login.
                </p>
              ) : (
                <>
                  <div className="profile-grid">
                    <div className="label">Name</div>
                    <div className="value">{getDisplayName(user)}</div>

                    <div className="label">Email</div>
                    <div className="value">{user.email || "-"}</div>

                    <div className="label">D.O.B</div>
                    <div className="value">
                      {user.dateOfBirth
                        ? user.dateOfBirth.split("T")[0]
                        : user.dob || "-"}
                    </div>

                    <div className="label">Phone</div>
                    <div className="value">
                      {(user.countryCode ? user.countryCode + " " : "") +
                        (user.phoneNumber || user.phone || "-")}
                    </div>

                    <div className="label">Bio</div>
                    <div className="value">{user.bio || "-"}</div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <button
                      onClick={() =>
                        navigate("/dashboard/update", {
                          state: { tab: "profile" },
                        })
                      }
                      className="btn btn-primary"
                      style={{ marginRight: 10 }}
                    >
                      Update Info
                    </button>
                    <button
                      onClick={() => navigate("/dashboard/changepassword")}
                      className="btn"
                      style={{ background: "#5a6", color: "#fff" }}
                    >
                      Change Password
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </main>
      </div>

      <Footer />

      {/* Loader overlay shown when navigating from dashboard to view/edit */}
      <Loader loading={navLoading} text={navLoading ? "Loading..." : ""} />
    </div>
  );
}

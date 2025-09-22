// src/Pages/MovieDetails/MovieDetails.js
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import { getMovie } from "../../api/movie";
import "./MovieDetails.css";

/**
 * Return an embeddable YouTube URL (with autoplay) for a given youtube watch/shorts/embed url.
 * Returns null if not a YouTube url we understand.
 */
function getYouTubeEmbed(url) {
  if (!url || typeof url !== "string") return null;
  try {
    // remove surrounding whitespace
    const u = url.trim();

    // patterns:
    // https://www.youtube.com/watch?v=VIDEOID
    // https://youtu.be/VIDEOID
    // https://www.youtube.com/embed/VIDEOID
    // https://www.youtube.com/shorts/VIDEOID
    // extract 11-character id
    const m =
      u.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
      ) || [];
    const id = m[1];
    if (!id) return null;
    // autoplay=1 makes the video start playing when iframe loads
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  } catch {
    return null;
  }
}

export default function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(location.state || null);
  const [loading, setLoading] = useState(false);

  // trailer modal state
  const [showTrailer, setShowTrailer] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (movie) return;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const resp = await getMovie(id);
        const m = resp?.data?.data || resp?.data || null;
        setMovie(m);
      } catch (err) {
        console.error("Failed to load movie", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, movie]);

  // derive embed url whenever movie changes
  useEffect(() => {
    if (!movie) {
      setEmbedUrl(null);
      return;
    }
    const candidate = movie.trailerUrl || movie.trailer || "";
    const e = getYouTubeEmbed(candidate);
    setEmbedUrl(e);
  }, [movie]);

  // close on click outside modal or Esc
  useEffect(() => {
    if (!showTrailer) return;

    function onKey(e) {
      if (e.key === "Escape") setShowTrailer(false);
    }

    function onDocClick(e) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) {
        setShowTrailer(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [showTrailer]);

  if (!movie && loading) {
    return (
      <>
        <Header />
        <main className="movie-details">
          <p>Loading movie...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <Header />
        <main className="movie-details movie-not-found">
          <div
            className="notfound-card"
            role="region"
            aria-label="Movie not found"
          >
            <h3>Movie not found.</h3>

            <div className="notfound-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/dashboard")}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const sourceMovie = movie;

  return (
    <div className={`app-shell movie-details-root ${showTrailer ? "show-trailer" : ""}`}>
      <Header />
      <main className={`movie-details ${showTrailer ? "show-trailer" : ""}`}>
        <div className={`details-card ${showTrailer ? "blurred" : ""}`}>
          <div className="poster">
            <img src={movie.posterUrl} alt={movie.title} />
          </div>
          <div className="info">
            <h1>{movie.title}</h1>
            <p className="desc">{movie.description}</p>

            <p>
              <strong>Director:</strong> {movie.director || "-"}
            </p>
            <p>
              <strong>Genre:</strong>{" "}
              {(Array.isArray(movie.genre)
                ? movie.genre.join(", ")
                : movie.genre) || "-"}
            </p>

            <div>
              <strong>Cast:</strong>
              <ul>
                {Array.isArray(movie.cast) && movie.cast.length ? (
                  movie.cast.map((c, i) => (
                    <li key={i}>
                      {c.name} {c.role ? `— ${c.role}` : ""}
                    </li>
                  ))
                ) : (
                  <li>-</li>
                )}
              </ul>
            </div>

            <p>
              <strong>Rating:</strong> {movie.rating || "-"}
            </p>
            <p>
              <strong>Duration:</strong>{" "}
              {movie.duration ? `${movie.duration} min` : "-"}
            </p>
            <p>
              <strong>Release:</strong>{" "}
              {movie.releaseDate ? movie.releaseDate.split("T")[0] : "-"}
            </p>

            <div className="actions">
              <button onClick={() => navigate(-1)}>Back</button>

              {/* Watch trailer button */}
              <button
                className="btn btn-trailer"
                onClick={() => {
                  if (!embedUrl) {
                    alert("No trailer available for this movie.");
                    return;
                  }
                  setShowTrailer(true);
                }}
                style={{ marginLeft: 12 }}
              >
                Watch trailer
              </button>
            </div>
          </div>
        </div>

        {/* Trailer modal */}
        {showTrailer && embedUrl && (
          <div className="trailer-modal" role="dialog" aria-modal="true">
            <div className="trailer-card" ref={modalRef}>
              <div className="trailer-header">
                <h3>Trailer — {sourceMovie.title}</h3>
                <button
                  className="close-btn"
                  aria-label="Close trailer"
                  onClick={() => setShowTrailer(false)}
                >
                  ×
                </button>
              </div>
              <div className="trailer-body">
                <iframe
                  title={`trailer-${sourceMovie._id || sourceMovie.id || "movie"}`}
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

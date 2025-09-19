// src/Pages/MovieDetails/MovieDetails.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import { getMovie } from "../../api/movie";
import "./MovieDetails.css";

export default function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(location.state || null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="app-shell">
      <Header />
      <main className="movie-details">
        <div className="details-card">
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

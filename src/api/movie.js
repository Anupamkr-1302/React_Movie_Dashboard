// src/api/movie.js
import { apiClient } from "./index";

// Movie endpoints wrapper

export async function createMovie(payload) {
  return apiClient.post("/movies", payload);
}

export async function getMovies(query = "") {
  // query should include starting ? if needed, eg: ?page=1&limit=10
  return apiClient.get(`/movies${query}`);
}

export async function getMovie(id) {
  return apiClient.get(`/movies/${id}`);
}

export async function updateMovie(id, payload) {
  return apiClient.put(`/movies/${id}`, payload);
}

export async function deleteMovie(id) {
  return apiClient.delete(`/movies/${id}`);
}

/* --- New helpers for Dashboard filters --- */

/**
 * Get top rated movies. Example endpoint:
 * /movies/top-rated?limit=10
 */
export async function getTopRated(limit = 10) {
  return apiClient.get(`/movies/top-rated?limit=${limit}`);
}

/**
 * Get latest movies. Example endpoint:
 * /movies/latest?limit=10
 */
export async function getLatest(limit = 10) {
  return apiClient.get(`/movies/latest?limit=${limit}`);
}

/**
 * Get movies by genre. Example endpoint:
 * /movies/genre/Action?page=1&limit=10
 */
export async function getMoviesByGenre(genre, page = 1, limit = 10) {
  const g = encodeURIComponent(genre);
  return apiClient.get(`/movies/genre/${g}?page=${page}&limit=${limit}`);
}

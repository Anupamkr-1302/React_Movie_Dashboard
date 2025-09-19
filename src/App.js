// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Pages/Login/Login";
import Registration from "./Pages/Registration/Registration";
import Dashboard from "./Pages/Dashboard/Dashboard";
import MovieDetails from "./Pages/MovieDetails/MovieDetails";
import PassChange from "./Pages/PassChange/PassChange";
import UpdateProfile from "./Pages/UpdateProfile/UpdateProfile";
import AddMovies from "./Pages/AddMovies/AddMovies";
import EditMovies from "./Pages/EditMovies/EditMovies";

/**
 * Small inline auth check that uses localStorage token presence.
 * This avoids creating any new files and works with your existing structure.
 */
function isAuthenticated() {
  try {
    const t = localStorage.getItem("token");
    return !!t;
  } catch (e) {
    return false;
  }
}

/**
 * Wrapper to protect routes. Use by wrapping the element:
 * <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>} />
 */
function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    // not logged in -> redirect to login
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Protected pages - wrapped with RequireAuth */}
        <Route path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/dashboard/add"
          element={
            <RequireAuth>
              <AddMovies />
            </RequireAuth>
          }
        />
        <Route path="/movies/:id"
          element={
            <RequireAuth>
              <MovieDetails />
            </RequireAuth>
          }
        />
        <Route path="/edit/:id"
          element={
            <RequireAuth>
              <EditMovies />
            </RequireAuth>
          }
        />
        <Route path="/dashboard/update"
          element={
            <RequireAuth>
              <UpdateProfile />
            </RequireAuth>
          }
        />
        <Route path="/dashboard/changepassword"
          element={
            <RequireAuth>
              <PassChange />
            </RequireAuth>
          }
        />

        {/* fallback -> go to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

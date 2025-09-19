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


function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/add" element={<AddMovies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/edit/:id" element={<EditMovies />} />
        <Route path="/dashboard/update" element={<UpdateProfile />} />
        <Route path="/dashboard/changepassword" element={<PassChange />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        {/* <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />         */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

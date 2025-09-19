# 🎬 React Movie Dashboard

A full-stack **Movie Dashboard** application built with **React.js**.  
Users can register, log in, update their profile, change passwords, and manage movies (add, edit, view details, delete).  
Movie data is fetched and managed via a backend API.

---

## 🚀 Features
- **Authentication**: Login, Registration, Change Password (with protected routes).
- **Profile Management**: Update user details and view personal info.
- **Movie Management**:
  - Add new movies with details (title, description, cast, director, etc.).
  - Edit existing movies.
  - View detailed movie information.
  - Delete movies.
- **Filters**: Search, filter by rating, latest movies, or genre.
- **Responsive UI**: Styled with custom CSS and reusable React components.

---

## 🛠️ Tech Stack
- **Frontend**: React.js (with functional components and hooks)
- **Routing**: React Router DOM v6
- **API Requests**: Axios
- **Styling**: Custom CSS modules per component/page
- **Backend API**: External movie handler API (provided endpoints)

---

## 📂 Project Structure

```
REACT_MOVIE_DASHBOARD/
├── public/                # Static assets
├── src/
│   ├── api/               # API layer
│   │   ├── auth.js        # Authentication-related requests
│   │   ├── index.js       # Axios instance setup (base URL, interceptors)
│   │   └── movie.js       # Movie-related requests
│   ├── Components/        # Reusable components
│   │   ├── Footer/
│   │   ├── Header/
│   │   └── Loader/
│   ├── Pages/             # Main app pages
│   │   ├── AddMovies/
│   │   ├── Dashboard/
│   │   ├── EditMovies/
│   │   ├── Login/
│   │   ├── MovieDetails/
│   │   ├── PassChange/
│   │   ├── Registration/
│   │   └── UpdateProfile/
│   ├── App.js             # Root app component (with routes)
│   ├── App.css            # Global styles
│   ├── index.js           # Entry point
│   ├── index.css          # Global CSS resets
│   └── reportWebVitals.js # Performance monitoring
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd REACT_MOVIE_DASHBOARD
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API
- Base URL is set in `src/api/index.js`.
- Update the URL if your backend runs on a different server.

### 4. Run the app
```bash
npm start
```
This runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view in your browser.

---

## 🔐 Protected Routes
- `/dashboard`
- `/dashboard/add`
- `/movies/:id`
- `/edit/:id`
- `/dashboard/update`
- `/dashboard/changepassword`

Accessing these without authentication will redirect you to the login page.

---

## ✅ Future Improvements
- JWT token refresh flow.
- Better error handling for API failures.
- UI improvements with Material UI or Tailwind.

---

## 📜 License
This project is for learning and practice purposes. You can modify and use it freely.

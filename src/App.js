import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";

import Contact from "./components/pages/Contact";
import SignIn from "./components/pages/SignIn";
import SignUp from "./components/pages/SignUp";
import Dashboard from "./components/pages/Dashboard";
import About from "./components/pages/About";
import SpellingCorrection from "./components/pages/SpellingCorrection";
import Level from "./components/pages/Level";
import PronunciationExercise from "./components/pages/PronunciationExercise";

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/signin" />;
};

// Composant pour les routes publiques (redirige vers dashboard si déjà connecté)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return !token ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Routes d'authentification (seulement si non connecté) */}
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/spelling-correction"
          element={
            <ProtectedRoute>
              <SpellingCorrection />
            </ProtectedRoute>
          }
        />
      
        <Route
          path="/pronunciation/:lessonId"
          element={
            <ProtectedRoute>
              <PronunciationExercise />
            </ProtectedRoute>
          }
        />
        {/* Routes protégées (seulement si connecté) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/level/:type"
          element={
            <ProtectedRoute>
              <Level />
            </ProtectedRoute>
          }
        />

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

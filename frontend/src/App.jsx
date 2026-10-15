import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { useAuth } from "./auth/useAuth";
import LandingPage from "./pages/LandingPage/LandingPage";
import RegisterUser from "./pages/Register/RegisterUser";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Watch from "./pages/Watch/Watch";

function AuthLoading() {
  const { authError, refreshAuth, loading } = useAuth();

  if (!loading && authError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-white">
        <p role="alert">{authError}</p>
        <button
          type="button"
          onClick={refreshAuth}
          className="rounded-lg bg-red-500 px-5 py-2 font-medium hover:bg-red-600"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <p role="status">Checking your session...</p>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, authError } = useAuth();
  const location = useLocation();

  if (loading || authError) return <AuthLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading, authError } = useAuth();

  if (loading || authError) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/get-started"
            element={
              <GuestRoute>
                <RegisterUser />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:videoId"
            element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

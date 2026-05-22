import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Partials/Navbar";
import Footer from "./Components/Partials/Footer";
import HomePage from "./Pages/HomePage";
import RegisterPage from "./Pages/RegisterPage";
import LoginPage from "./Pages/LoginPage";
import Soa from "./Components/Soa";
import MenuPage from "./pages/MenuPage";
import NotificationsPage from "./pages/NotificationsPage";
import FavouritesPage from "./pages/FavouritesPage";
import CartPage from "./pages/CartPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { PageLoader } from "./Components/UI/Loading";

const AdminRedirect = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <PageLoader label="Checking access..." />;
  }

  if (user && isAdmin()) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

const RequireAdmin = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AuthenticatedOnly = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1a0f00",
                color: "#fff",
                border: "1px solid rgba(200, 146, 42, 0.2)",
                borderRadius: "12px",
                fontSize: "0.85rem",
              },
              success: {
                iconTheme: {
                  primary: "#c8922a",
                  secondary: "#fff",
                },
              },
            }}
          />
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/favourites" element={<AdminRedirect><FavouritesPage /></AdminRedirect>} />
              <Route path="/cart" element={<AdminRedirect><CartPage /></AdminRedirect>} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<AdminRedirect><ProfilePage /></AdminRedirect>} />
              <Route path="/admin-dashboard" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
            </Routes>
          </div>
          <Footer />
          <AuthenticatedOnly>
            <Soa />
          </AuthenticatedOnly>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

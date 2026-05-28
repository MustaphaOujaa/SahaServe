import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Partials/Navbar";
import Footer from "./Components/Partials/Footer";
import HomePage from "./Pages/HomePage";
import RegisterPage from "./Pages/RegisterPage";
import LoginPage from "./Pages/LoginPage";
import Soa from "./Components/Soa";
import MenuPage from "./pages/MenuPage";
import FavouritesPage from "./pages/FavouritesPage";
import CartPage from "./pages/CartPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import ChefDashboard from "./Pages/ChefDashboard";
import DeliveryDashboard from "./Pages/DeliveryDashboard";
import ShowDishPage from "./Pages/ShowDishPage";
import ReservationPage from "./Pages/ReservationPage";

import DashboardPage from "./Pages/DashboardPage";
import ProfileOrDashboard from "./Pages/ProfileOrDashboard";
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

const RequireDeliveryWorker = ({ children }) => {
  const { user, loading, isDeliverer } = useAuth();

  if (loading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isDeliverer()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireChef = ({ children }) => {
  const { user, loading, isChef } = useAuth();

  if (loading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isChef()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ClientOnly = ({ children }) => {
  const { user, loading, isAdmin, isChef, isDeliverer } = useAuth();

  // Hide for admin, chef, or delivery workers
  if (loading || !user || isAdmin() || isChef() || isDeliverer()) {
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
              <Route path="/dish/:id" element={<ShowDishPage />} />
              <Route path="/favourites" element={<AdminRedirect><FavouritesPage /></AdminRedirect>} />
              <Route path="/cart" element={<AdminRedirect><CartPage /></AdminRedirect>} />
              <Route path="/reservation" element={<AdminRedirect><ReservationPage /></AdminRedirect>} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<ProfileOrDashboard />} />
              <Route path="/chef-dashboard" element={<RequireChef><ChefDashboard /></RequireChef>} />
              <Route path="/delivery-dashboard" element={<RequireDeliveryWorker><DeliveryDashboard /></RequireDeliveryWorker>} />
              <Route path="/admin-dashboard" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
            </Routes>
          </div>
          <Footer />
          <ClientOnly>
            <Soa />
          </ClientOnly>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

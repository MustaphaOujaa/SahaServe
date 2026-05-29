import React from "react";
import { useAuth } from "../context/AuthContext";
import DeliveryDashboard from "./DeliveryDashboard";
import ServerDashboard from "./ServerDashboard";
import ProfilePage from "./ProfilePage";
import { PageLoader } from "../Components/UI/Loading";

/**
 * Component that renders the appropriate page for the "/profile" route.
 * - Delivery workers see the DeliveryDashboard.
 * - All other users see the regular ProfilePage.
 * Includes a loading state while the auth context is initializing.
 */
const ProfileOrDashboard = () => {
  const { loading, isDeliverer, isServer } = useAuth();

  if (loading) {
    return <PageLoader label="Loading profile..." />;
  }

  // If the current user is a delivery worker, show their dashboard.
  if (isDeliverer && isDeliverer()) {
    return <DeliveryDashboard />;
  }

  // If the current user is a server, show their dashboard.
  if (isServer && isServer()) {
    return <ServerDashboard />;
  }

  // Default to the standard profile page for other roles.
  return <ProfilePage />;
};

export default ProfileOrDashboard;

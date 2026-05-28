import React from "react";
import { useAuth } from "../context/AuthContext";
import DeliveryDashboard from "./DeliveryDashboard";
import ProfilePage from "./ProfilePage";
import { PageLoader } from "../Components/UI/Loading";

/**
 * Component that renders the appropriate page for the "/profile" route.
 * - Delivery workers see the DeliveryDashboard.
 * - All other users see the regular ProfilePage.
 * Includes a loading state while the auth context is initializing.
 */
const ProfileOrDashboard = () => {
  const { loading, isDeliverer } = useAuth();

  if (loading) {
    return <PageLoader label="Loading profile..." />;
  }

  // If the current user is a delivery worker, show their dashboard.
  if (isDeliverer && isDeliverer()) {
    return <DeliveryDashboard />;
  }

  // Default to the standard profile page for other roles.
  return <ProfilePage />;
};

export default ProfileOrDashboard;

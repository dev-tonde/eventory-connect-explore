
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedOrganizerDashboard from "@/components/organizer/EnhancedOrganizerDashboard";
import { CSRFProvider } from "@/components/security/CSRFProtection";

const Dashboard = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "organizer") {
      navigate("/become-organizer");
      return;
    }
  }, [isAuthenticated, profile, navigate]);

  // Don't render anything if user is not authenticated or not an organizer
  if (!isAuthenticated || profile?.role !== "organizer") {
    return null;
  }

  return (
    <CSRFProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your events with AI-powered insights and advanced tools
            </p>
          </div>

          <EnhancedOrganizerDashboard />
        </div>
      </div>
    </CSRFProvider>
  );
};

export default Dashboard;

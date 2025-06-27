
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedOrganizerDashboard from "@/components/organizer/EnhancedOrganizerDashboard";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const Dashboard = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure auth context is fully loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <CSRFProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </CSRFProvider>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If user is not an organizer, show upgrade prompt
  if (profile?.role !== "organizer") {
    return (
      <CSRFProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Organizer Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  You need to be an organizer to access the dashboard. Upgrade your account to start creating and managing events.
                </p>
                <Button onClick={() => navigate("/become-organizer")} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Become an Organizer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CSRFProvider>
    );
  }

  // Render organizer dashboard
  return (
    <CSRFProvider>
      <div className="min-h-screen bg-gray-50">
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

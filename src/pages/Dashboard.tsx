import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedOrganizerDashboard from "@/components/organizer/EnhancedOrganizerDashboard";
import { CSRFProvider } from "@/components/security/CSRFProtection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const { user, profile, isAuthenticated, isLoading, refreshProfile } =
    useAuth();
  const navigate = useNavigate();
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // Simulate dashboard loading for smoother UX
  useEffect(() => {
    const timer = setTimeout(() => setIsDashboardLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isDashboardLoading && !isLoading && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, isLoading, isDashboardLoading, navigate]);

  // Refresh profile if user exists but profile is missing
  useEffect(() => {
    if (user && !profile && !isLoading) {
      refreshProfile();
    }
  }, [user, profile, isLoading, refreshProfile]);

  if (isLoading || isDashboardLoading) {
    return (
      <CSRFProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </CSRFProvider>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Show error if user exists but profile couldn't be loaded
  if (user && !profile) {
    return (
      <CSRFProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Profile Loading Issue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    We're having trouble loading your profile. This might be
                    because your account is still being set up.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button onClick={refreshProfile}>
                    <Loader2 className="h-4 w-4 mr-2" />
                    Retry Loading Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                  >
                    Go to Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CSRFProvider>
    );
  }

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
                  You need to be an organizer to access the dashboard. Upgrade
                  your account to start creating and managing events.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Current Status: {profile?.role || "Unknown"}
                  </h4>
                  <p className="text-sm text-blue-800">
                    Upgrade to organizer to unlock event creation, analytics,
                    and management tools.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/become-organizer")}
                  className="flex items-center gap-2"
                >
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

  return (
    <CSRFProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back,{" "}
              {profile?.first_name || profile?.username || "Organizer"}! Manage
              your events with AI-powered insights and advanced tools.
            </p>
          </div>
          <EnhancedOrganizerDashboard />
        </div>
      </div>
    </CSRFProvider>
  );
};

export default Dashboard;
// This code defines a Dashboard page for organizers, checking authentication and profile status, and displaying the organizer dashboard with enhanced features.

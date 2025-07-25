import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileOverview from "@/components/profile/ProfileOverview";
import GamificationDashboard from "@/components/gamification/GamificationDashboard";

const Profile = () => {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileUpdateKey, setProfileUpdateKey] = useState(0);

  const activeTab = searchParams.get('tab') || 'rsvps';

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      setProfileUpdateKey(prev => prev + 1);
      toast({
        title: "Profile Refreshed",
        description: "Your profile has been updated with the latest information.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh profile",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProfileUpdate = () => {
    setProfileUpdateKey(prev => prev + 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
            <p className="text-gray-600 mb-4">
              Please log in to view your profile
            </p>
            <Link to="/auth">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <title>{profile?.first_name ? `${profile.first_name}'s Profile` : 'My Profile'} | Eventory</title>
      <meta name="description" content="Manage your Eventory profile, view your events, and update your account settings." />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Profile
                </h1>
                <p className="text-gray-600">
                  Manage your account and view your events
                </p>
              </div>
            <Button
              onClick={handleRefreshProfile}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Refresh Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <ProfileOverview 
              key={profileUpdateKey}
              onProfileUpdate={handleProfileUpdate}
            />
            
            {/* Gamification Dashboard - Profile page only */}
            <GamificationDashboard />
          </div>

          <div className="lg:col-span-2">
            <ProfileTabs defaultTab={activeTab} onProfileUpdate={handleProfileUpdate} />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Profile;
// This code defines a Profile page that allows users to view and manage their profile information. It includes features like refreshing the profile, displaying user details, and showing different content based on the user's role (organizer or attendee). The page is responsive and uses cards for layout, with loading states while fetching data. It also provides options to navigate to the dashboard or become an organizer if the user is an attendee.
// The Profile page enhances the user experience by providing a clear overview of the user's account, allowing them to manage their profile easily. It also encourages engagement by offering options to become an organizer if the user is currently an attendee. The use of badges and conditional rendering based on the user's role adds clarity to the profile, making it easy for users to understand their current status within the platform.

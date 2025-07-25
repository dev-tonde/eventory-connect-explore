import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProfileTabs from "@/components/profile/ProfileTabs";

const Profile = () => {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      toast({
        title: "Profile Refreshed",
        description:
          "Your profile has been updated with the latest information.",
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
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.username ||
                    profile?.email?.split("@")[0] ||
                    "User"}
              </h3>
              <p className="text-gray-600 mb-2">
                {profile?.email || user.email}
              </p>
              <div className="mb-4">
                <Badge
                  variant={
                    profile?.role === "organizer" ? "default" : "secondary"
                  }
                  className={
                    profile?.role === "organizer" ? "bg-purple-600" : ""
                  }
                >
                  {profile?.role === "organizer"
                    ? "Event Organizer"
                    : "Event Attendee"}
                </Badge>
              </div>
              {profile?.bio && (
                <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>
              )}

              {profile?.role === "organizer" && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium">
                    🎉 Organizer Features Active!
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    You can now create and manage events
                  </p>
                  <Link to="/dashboard">
                    <Button size="sm" className="mt-2 w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {profile?.role === "attendee" && (
                <div className="mt-4">
                  <Link to="/become-organizer">
                    <Button variant="outline" size="sm" className="w-full">
                      Become an Organizer
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <ProfileTabs />
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

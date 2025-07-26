import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Calendar, Users, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedProfile } from "@/hooks/useOptimizedProfile";

interface ProfileOverviewProps {
  showEditButton?: boolean;
  onProfileUpdate?: () => void;
}

const ProfileOverview = ({ showEditButton = true, onProfileUpdate }: ProfileOverviewProps) => {
  const { user, profile } = useAuth();
  const { refetch } = useOptimizedProfile();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName =
    profile?.name ||
    (profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name ||
        profile?.username ||
        profile?.email?.split("@")[0] ||
        user?.email?.split("@")[0] ||
        "User");

  const handleRefreshProfile = async () => {
    await refetch();
    onProfileUpdate?.();
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24 ring-4 ring-purple-100">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white font-bold text-lg">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <CardTitle className="text-xl">{displayName}</CardTitle>
        <p className="text-gray-600">@{profile?.username || "user"}</p>
        
        <Badge
          variant={profile?.role === "organizer" ? "default" : "secondary"}
          className="mt-2 mx-auto w-fit"
        >
          {profile?.role === "organizer" ? "Event Organizer" : "Event Attendee"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {profile?.bio && (
          <div>
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm">Following</span>
            </div>
            <p className="font-semibold text-lg">{profile?.followed_count || 0}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Events</span>
            </div>
            <p className="font-semibold text-lg">{profile?.events_attended_count || 0}</p>
          </div>
        </div>

        {/* Organization info for organizers */}
        {profile?.role === "organizer" && profile?.organization_name && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Organization</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{profile.organization_name}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          {profile?.role === "organizer" && (
            <Link to="/dashboard" className="block">
              <Button variant="default" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          )}

          {profile?.role === "attendee" && (
            <Link to="/become-organizer" className="block">
              <Button variant="outline" className="w-full">
                Become an Organizer
              </Button>
            </Link>
          )}

          {showEditButton && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleRefreshProfile}
              asChild
            >
              <Link to="/profile?tab=settings">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOverview;
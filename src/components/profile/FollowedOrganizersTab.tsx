import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Calendar, MapPin } from "lucide-react";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const FollowedOrganizersTab = () => {
  const navigate = useNavigate();
  const { organizers, loading, unfollowOrganizer } = useFollowedOrganizers();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            Followed Organizers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading organizers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" aria-hidden="true" />
          Followed Organizers ({organizers.length})
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/followed-organizers")}
          type="button"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {organizers.length === 0 ? (
          <div className="text-center py-8">
            <User
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No followed organizers yet
            </h3>
            <p className="text-gray-600 mb-4">
              Follow organizers to stay updated with their latest events!
            </p>
            <Button
              onClick={() => navigate("/events")}
              type="button"
              aria-label="Browse Events"
            >
              Discover Organizers
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {organizers.slice(0, 3).map((organizer) => (
              <div
                key={organizer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={organizer.avatar_url || "/placeholder.svg"}
                      alt={sanitizeText(organizer.name) || "Organizer avatar"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {sanitizeText(organizer.name)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      @{sanitizeText(organizer.username)}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {organizer.followerCount} followers
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {organizer.eventCount} events
                      </span>
                    </div>
                    {organizer.category && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {organizer.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unfollowOrganizer(organizer.id, organizer.name)}
                    type="button"
                    aria-label={`Unfollow ${sanitizeText(organizer.name)}`}
                  >
                    Unfollow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/organizer/${organizer.username}`)}
                    type="button"
                    aria-label={`View Profile: ${sanitizeText(organizer.name)}`}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
            
            {organizers.length > 3 && (
              <div className="text-center pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/followed-organizers")}
                  type="button"
                >
                  View {organizers.length - 3} More Organizers
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowedOrganizersTab;
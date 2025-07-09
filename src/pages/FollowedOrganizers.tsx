import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, User, Calendar, MapPin, Users } from "lucide-react";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";

const FollowedOrganizers = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { organizers: followedOrganizers, loading, unfollowOrganizer } = useFollowedOrganizers();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const upcomingEvents = [
    {
      id: "1",
      title: "React Conference 2024",
      organizer: "Tech Events SA",
      date: "2024-08-15",
      time: "09:00",
      venue: "Cape Town Convention Centre",
      price: 299,
      category: "Technology",
    },
    {
      id: "2",
      title: "Jazz Under the Stars",
      organizer: "Cape Town Music Collective",
      date: "2024-08-20",
      time: "19:00",
      venue: "Kirstenbosch Gardens",
      price: 150,
      category: "Music",
    },
  ];

  const handleUnfollow = (organizerId: string, organizerName: string) => {
    unfollowOrganizer(organizerId, organizerName);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
          <p className="text-gray-600">
            Stay updated with your favorite event organizers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Followed Organizers */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Followed Organizers ({followedOrganizers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {followedOrganizers.length > 0 ? (
                  <div className="space-y-4">
                    {followedOrganizers.map((organizer) => (
                      <div
                        key={organizer.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {organizer.name}
                            </h3>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {organizer.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {organizer.bio}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {organizer.followerCount} followers
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {organizer.eventCount} events
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                            onClick={() =>
                              navigate(`/organizer/${organizer.id}`)
                            }
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleUnfollow(organizer.id, organizer.name)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-colors"
                          >
                            Unfollow
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No followed organizers yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Follow organizers to stay updated with their latest events
                    </p>
                    <Button onClick={() => navigate("/events")}>
                      Discover Events
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events from Followed Organizers */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <h4 className="font-medium text-sm mb-1">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          by {event.organizer}
                        </p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()} at{" "}
                            {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                          <span className="text-sm font-medium text-purple-600">
                            R{event.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Organizers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    Follow more organizers to get suggestions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowedOrganizers;

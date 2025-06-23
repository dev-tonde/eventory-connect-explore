
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MapPin, Users, CheckCircle, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { Event } from "@/types/event";
import { useToast } from "@/hooks/use-toast";

interface OrganizerProfile {
  name: string;
  followerCount: number;
  isVerified: boolean;
  events: Event[];
}

const FollowedOrganizers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followedOrganizers, setFollowedOrganizers] = useState<OrganizerProfile[]>([]);

  useEffect(() => {
    if (!user) return;

    loadFollowedOrganizers();
  }, [user]);

  const loadFollowedOrganizers = () => {
    const follows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
    const events = JSON.parse(localStorage.getItem('eventory_events') || '[]');
    const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
    
    const userFollows = follows.filter((f: any) => f.userId === user?.id);
    const organizerNames = userFollows.map((f: any) => f.organizerName);

    // Create organizer profiles with their events
    const organizerProfiles: OrganizerProfile[] = organizerNames.map(name => {
      const organizerEvents = events.filter((e: Event) => e.organizer === name);
      const followerCount = followerCounts[name] || 0;
      const isVerified = followerCount >= 10000;

      return {
        name,
        followerCount,
        isVerified,
        events: organizerEvents.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    });

    setFollowedOrganizers(organizerProfiles);
  };

  const unfollowOrganizer = (organizerName: string) => {
    const follows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
    const updatedFollows = follows.filter((f: any) => !(f.userId === user?.id && f.organizerName === organizerName));
    
    localStorage.setItem('eventory_follows', JSON.stringify(updatedFollows));
    
    // Update follower count
    const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
    if (followerCounts[organizerName]) {
      followerCounts[organizerName] = Math.max(0, followerCounts[organizerName] - 1);
      localStorage.setItem('eventory_follower_counts', JSON.stringify(followerCounts));
    }

    loadFollowedOrganizers();
    
    toast({
      title: "Unfollowed organizer",
      description: `You are no longer following ${organizerName}.`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your followed organizers</h1>
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Followed Organizers</h1>
          <p className="text-gray-600">Stay updated with events from your favorite organizers</p>
        </div>

        {followedOrganizers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No followed organizers yet</h2>
            <p className="text-gray-500 mb-4">Start following organizers to see their events here</p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {followedOrganizers.map((organizer) => (
              <Card key={organizer.name} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{organizer.name}</CardTitle>
                          {organizer.isVerified && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span>{organizer.followerCount.toLocaleString()} followers</span>
                          {organizer.isVerified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Verified
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unfollowOrganizer(organizer.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Upcoming Events ({organizer.events.length})
                  </h3>
                  
                  {organizer.events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No upcoming events from this organizer</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {organizer.events.slice(0, 6).map((event) => (
                        <Link key={event.id} to={`/events/${event.id}`}>
                          <Card className="hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                              <img 
                                src={event.image} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-sm mb-2 line-clamp-2">{event.title}</h4>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-sm font-bold text-purple-600">
                                  {event.price === 0 ? 'Free' : `$${event.price}`}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {organizer.events.length > 6 && (
                    <div className="text-center mt-4">
                      <Link to={`/events?organizer=${encodeURIComponent(organizer.name)}`}>
                        <Button variant="outline" size="sm">
                          View All {organizer.events.length} Events
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowedOrganizers;

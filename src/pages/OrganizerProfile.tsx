
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MapPin, CheckCircle, UserPlus, UserCheck, Grid3X3 } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { Event } from "@/types/event";
import { useToast } from "@/hooks/use-toast";

const OrganizerProfile = () => {
  const { organizerName } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const decodedOrganizerName = decodeURIComponent(organizerName || '');

  useEffect(() => {
    if (!decodedOrganizerName) return;

    loadOrganizerData();
    checkFollowStatus();
  }, [decodedOrganizerName, user]);

  const loadOrganizerData = () => {
    const events = JSON.parse(localStorage.getItem('eventory_events') || '[]');
    const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
    
    // Get organizer's events
    const organizer_events = events.filter((e: Event) => e.organizer === decodedOrganizerName);
    setOrganizerEvents(organizer_events.sort((a: Event, b: Event) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // Get follower count and verification status
    const count = followerCounts[decodedOrganizerName] || 0;
    setFollowerCount(count);
    setIsVerified(count >= 10000);
  };

  const checkFollowStatus = () => {
    if (!user) return;
    
    const follows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
    const isFollowingOrganizer = follows.some((f: any) => f.userId === user.id && f.organizerName === decodedOrganizerName);
    setIsFollowing(isFollowingOrganizer);
  };

  const toggleFollow = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to follow organizers.",
        variant: "destructive",
      });
      return;
    }

    const existingFollows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
    const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');

    if (isFollowing) {
      // Unfollow
      const updatedFollows = existingFollows.filter(
        (f: any) => !(f.userId === user.id && f.organizerName === decodedOrganizerName)
      );
      localStorage.setItem('eventory_follows', JSON.stringify(updatedFollows));
      
      const newCount = Math.max(0, (followerCounts[decodedOrganizerName] || 0) - 1);
      followerCounts[decodedOrganizerName] = newCount;
      localStorage.setItem('eventory_follower_counts', JSON.stringify(followerCounts));
      
      setIsFollowing(false);
      setFollowerCount(newCount);
      setIsVerified(newCount >= 10000);
      
      toast({
        title: "Unfollowed organizer",
        description: `You are no longer following ${decodedOrganizerName}.`,
      });
    } else {
      // Follow
      const newFollow = { 
        userId: user.id, 
        organizerName: decodedOrganizerName, 
        followedAt: new Date().toISOString() 
      };
      existingFollows.push(newFollow);
      localStorage.setItem('eventory_follows', JSON.stringify(existingFollows));
      
      const newCount = (followerCounts[decodedOrganizerName] || 0) + 1;
      followerCounts[decodedOrganizerName] = newCount;
      localStorage.setItem('eventory_follower_counts', JSON.stringify(followerCounts));
      
      setIsFollowing(true);
      setFollowerCount(newCount);
      setIsVerified(newCount >= 10000);
      
      toast({
        title: "Following organizer",
        description: `You are now following ${decodedOrganizerName}.`,
      });

      if (newCount === 10000) {
        toast({
          title: "🎉 Organizer Verified!",
          description: `${decodedOrganizerName} just reached 10,000 followers and is now verified!`,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-16 w-16 text-white" />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-bold">{decodedOrganizerName}</h1>
                  {isVerified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                
                {user && (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={toggleFollow}
                    className={isFollowing ? "text-gray-700" : "bg-blue-500 hover:bg-blue-600 text-white"}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{organizerEvents.length}</div>
                  <div className="text-gray-600 text-sm">Events</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{followerCount.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm">Followers</div>
                </div>
              </div>
              
              {/* Verification Badge */}
              {isVerified && (
                <div className="mb-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Organizer
                  </Badge>
                </div>
              )}
              
              {/* Bio */}
              <div className="text-gray-700">
                <p>Professional event organizer creating memorable experiences. 
                {isVerified ? " Verified organizer with premium event quality." : " Building amazing events for our community."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid Header */}
        <div className="flex items-center gap-2 mb-6">
          <Grid3X3 className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-900">EVENTS</span>
        </div>

        {/* Events Grid */}
        {organizerEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events yet</h3>
            <p className="text-gray-500">This organizer hasn't created any events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizerEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <div className="aspect-square bg-gray-200 overflow-hidden relative">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-600">
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.attendeeCount} attending
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerProfile;

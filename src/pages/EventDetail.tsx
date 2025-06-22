/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  Heart,
  UserPlus,
  UserCheck,
} from "lucide-react";
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft, Share2, Heart, UserPlus, UserCheck, CheckCircle } from "lucide-react";
>>>>>>> db4f02f8b1d364f6cab2fa231a6e01d0de8471c8
import Header from "@/components/layout/Header";
import TicketPurchase from "@/components/tickets/TicketPurchase";
import { Event } from "@/types/event";
import { useAuth } from "@/contexts/useAuth";
import { useToast } from "@/hooks/use-toast";

// Mock data - in real app this would come from API
const mockEvent: Event = {
  id: "1",
  title: "Summer Music Festival",
  description:
    "Join us for an amazing day of live music featuring local and international artists. This festival brings together the best of contemporary music with food trucks, art installations, and a vibrant community atmosphere. Whether you're a music lover or just looking for a great day out, this event promises unforgettable memories.",
  date: "2024-07-15",
  time: "14:00",
  location: "Central Park",
  address: "123 Park Avenue, New York, NY 10001",
  price: 75,
  category: "Music",
  image: "/placeholder.svg",
  organizer: "Music Events Co.",
  attendeeCount: 150,
  maxAttendees: 500,
  tags: ["outdoor", "festival", "music", "family-friendly"],
};

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowingOrganizer, setIsFollowingOrganizer] = useState(false);
  const [organizerFollowerCount, setOrganizerFollowerCount] = useState(0);
  const [isVerifiedOrganizer, setIsVerifiedOrganizer] = useState(false);

  useEffect(() => {
    // Load event data
    const storedEvents = JSON.parse(
      localStorage.getItem("eventory_events") || "[]"
    );
    const allEvents = [mockEvent, ...storedEvents];
    const foundEvent = allEvents.find((e) => e.id === id);
    setEvent(foundEvent || null);

    // Check if favorited
    if (user && foundEvent) {
      const favorites = JSON.parse(
        localStorage.getItem("eventory_favorites") || "[]"
      );
      const isFav = favorites.some(
        (f: any) => f.userId === user.id && f.eventId === foundEvent.id
      );
      setIsFavorited(isFav);
    }

    // Check if following organizer and load follower count
    if (user && foundEvent) {
      const follows = JSON.parse(
        localStorage.getItem("eventory_follows") || "[]"
      );
      const isFollowing = follows.some(
        (f: any) =>
          f.userId === user.id && f.organizerName === foundEvent.organizer
      );
      setIsFollowingOrganizer(isFollowing);

      // Load follower count for this organizer
      const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
      const count = followerCounts[foundEvent.organizer] || 0;
      setOrganizerFollowerCount(count);
      setIsVerifiedOrganizer(count >= 10000);
    }
  }, [id, user]);

  const toggleFavorite = () => {
    if (!user || !event) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to favorite events.",
        variant: "destructive",
      });
      return;
    }

    const existingFavorites = JSON.parse(
      localStorage.getItem("eventory_favorites") || "[]"
    );

    if (isFavorited) {
      // Remove from favorites
      const updatedFavorites = existingFavorites.filter(
        (f: any) => !(f.userId === user.id && f.eventId === event.id)
      );
      localStorage.setItem(
        "eventory_favorites",
        JSON.stringify(updatedFavorites)
      );
      setIsFavorited(false);
      toast({
        title: "Removed from favorites",
        description: "Event removed from your favorites.",
      });
    } else {
      // Add to favorites
      const newFavorite = {
        userId: user.id,
        eventId: event.id,
        addedAt: new Date().toISOString(),
      };
      existingFavorites.push(newFavorite);
      localStorage.setItem(
        "eventory_favorites",
        JSON.stringify(existingFavorites)
      );
      setIsFavorited(true);
      toast({
        title: "Added to favorites",
        description: "Event added to your favorites.",
      });
    }
  };

  const toggleFollowOrganizer = () => {
    if (!user || !event) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to follow organizers.",
        variant: "destructive",
      });
      return;
    }

<<<<<<< HEAD
    const existingFollows = JSON.parse(
      localStorage.getItem("eventory_follows") || "[]"
    );
=======
    const existingFollows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
    const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
>>>>>>> db4f02f8b1d364f6cab2fa231a6e01d0de8471c8

    if (isFollowingOrganizer) {
      // Unfollow organizer
      const updatedFollows = existingFollows.filter(
        (f: any) =>
          !(f.userId === user.id && f.organizerName === event.organizer)
      );
<<<<<<< HEAD
      localStorage.setItem("eventory_follows", JSON.stringify(updatedFollows));
=======
      localStorage.setItem('eventory_follows', JSON.stringify(updatedFollows));
      
      // Decrease follower count
      const newCount = Math.max(0, (followerCounts[event.organizer] || 0) - 1);
      followerCounts[event.organizer] = newCount;
      localStorage.setItem('eventory_follower_counts', JSON.stringify(followerCounts));
      
>>>>>>> db4f02f8b1d364f6cab2fa231a6e01d0de8471c8
      setIsFollowingOrganizer(false);
      setOrganizerFollowerCount(newCount);
      setIsVerifiedOrganizer(newCount >= 10000);
      
      toast({
        title: "Unfollowed organizer",
        description: `You are no longer following ${event.organizer}.`,
      });
    } else {
      // Follow organizer
      const newFollow = {
        userId: user.id,
        organizerName: event.organizer,
        followedAt: new Date().toISOString(),
      };
      existingFollows.push(newFollow);
<<<<<<< HEAD
      localStorage.setItem("eventory_follows", JSON.stringify(existingFollows));
=======
      localStorage.setItem('eventory_follows', JSON.stringify(existingFollows));
      
      // Increase follower count
      const newCount = (followerCounts[event.organizer] || 0) + 1;
      followerCounts[event.organizer] = newCount;
      localStorage.setItem('eventory_follower_counts', JSON.stringify(followerCounts));
      
>>>>>>> db4f02f8b1d364f6cab2fa231a6e01d0de8471c8
      setIsFollowingOrganizer(true);
      setOrganizerFollowerCount(newCount);
      setIsVerifiedOrganizer(newCount >= 10000);
      
      toast({
        title: "Following organizer",
        description: `You are now following ${event.organizer}.`,
      });

      // Check if organizer just became verified
      if (newCount === 10000) {
        toast({
          title: "🎉 Organizer Verified!",
          description: `${event.organizer} just reached 10,000 followers and is now verified!`,
        });
      }
    }
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Event link has been copied to your clipboard.",
      });
    }
  };

  const handlePurchaseComplete = () => {
    // Refresh event data to show updated attendance
    if (event) {
      const storedEvents = JSON.parse(
        localStorage.getItem("eventory_events") || "[]"
      );
      const updatedEvent = storedEvents.find((e: Event) => e.id === event.id);
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Event not found
            </h1>
            <Link to="/events">
              <Button>Back to Events</Button>
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
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/events"
            className="inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>

          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFollowOrganizer}
              >
                {isFollowingOrganizer ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following {event.organizer}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow {event.organizer}
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={toggleFavorite}>
              <Heart
                className={`h-4 w-4 mr-2 ${
                  isFavorited ? "fill-red-500 text-red-500" : ""
                }`}
              />
              {isFavorited ? "Favorited" : "Add to Favorites"}
            </Button>
            <Button variant="outline" size="sm" onClick={shareEvent}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
                <CardDescription className="text-base flex items-center gap-2">
                  <Link 
                    to={`/organizer/${encodeURIComponent(event.organizer)}`}
                    className="hover:text-purple-600 transition-colors"
                  >
                    <span>Organized by {event.organizer}</span>
                  </Link>
                  {isVerifiedOrganizer && (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm text-gray-500">
                    ({organizerFollowerCount.toLocaleString()} followers)
                  </span>
                  {isVerifiedOrganizer && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      Verified
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">Date</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.time}</div>
                      <div className="text-sm text-gray-600">Time</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.location}</div>
                      <div className="text-sm text-gray-600">
                        {event.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">
                        {event.attendeeCount}/{event.maxAttendees}
                      </div>
                      <div className="text-sm text-gray-600">Attendees</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    About This Event
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <TicketPurchase
                event={event}
                onPurchaseComplete={handlePurchaseComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowLeft, Share2, Heart, Star, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import WaitlistButton from "@/components/waitlist/WaitlistButton";
import TicketPurchase from "@/components/tickets/TicketPurchase";
import { Event } from "@/types/event";

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");
      
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name,
            username
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Track event view for analytics
  React.useEffect(() => {
    if (event?.id) {
      const trackView = async () => {
        try {
          await supabase.rpc('track_event_view', {
            event_uuid: event.id,
            session_id: `session_${Date.now()}`
          });
        } catch (error) {
          console.error('Failed to track event view:', error);
        }
      };
      trackView();
    }
  }, [event?.id]);

  // Check if event is full
  const isEventFull = event && event.current_attendees >= event.max_attendees;

  const handleTicketPurchase = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tickets",
        variant: "destructive",
      });
      return;
    }
    // Navigate to ticket purchase - this would be implemented based on your ticket system
    toast({
      title: "Coming Soon",
      description: "Ticket purchase functionality will be available soon",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const organizerName = event.profiles 
    ? `${event.profiles.first_name || ""} ${event.profiles.last_name || ""}`.trim() || event.profiles.username
    : "Unknown Organizer";

  // Transform Supabase event data to match Event interface
  const transformedEvent: Event = {
    id: event.id,
    title: event.title,
    description: event.description || "",
    date: event.date,
    time: event.time,
    location: event.venue,
    address: event.address || "",
    price: Number(event.price),
    category: event.category,
    image: event.image_url || "/placeholder.svg",
    organizer: organizerName,
    attendeeCount: event.current_attendees || 0,
    maxAttendees: event.max_attendees || 100,
    tags: event.tags || []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/events" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>

            {/* Event Details Card with Enhanced Features */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{event.category}</Badge>
                      {event.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{event.current_attendees || 0} / {event.max_attendees || 100} attending</span>
                  </div>
                </div>

                {event.address && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">{event.address}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {event.description || "No description available."}
                  </p>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Organized by</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{organizerName}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-0 h-auto font-normal"
                      >
                        Follow Organizer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Reviews & Ratings */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No reviews yet. Be the first to review this event!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Event Info Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span>{event.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span>{event.max_attendees || 100} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span>{(event.max_attendees || 100) - (event.current_attendees || 0)} tickets left</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-purple-600">
                      {event.price === 0 ? 'Free' : `R${event.price}`}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Purchase / Waitlist */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {isEventFull ? (
                    <WaitlistButton eventId={event.id} isEventFull={true} />
                  ) : (
                    <TicketPurchase 
                      event={transformedEvent} 
                      onPurchaseComplete={() => {
                        queryClient.invalidateQueries({ queryKey: ["event", id] });
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-green-50 focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-purple-50 focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 transition-colors"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Community Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Similar Events */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Similar Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Loading similar events...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

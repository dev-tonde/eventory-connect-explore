import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft, Share2, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: isFavorite } = useQuery({
    queryKey: ["favorite", id, user?.id],
    queryFn: async () => {
      if (!user || !id) return false;
      
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", id)
        .single();

      return !!data;
    },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (isFavorite !== undefined) {
      setIsFavorited(isFavorite);
    }
  }, [isFavorite]);

  const toggleFavorite = async () => {
    if (!user || !event) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to favorite events.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("event_id", event.id);
        
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Event removed from your favorites.",
        });
      } else {
        await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            event_id: event.id,
          });
        
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "Event added to your favorites.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
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

  const purchaseTicket = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tickets")
        .insert({
          user_id: user.id,
          event_id: event.id,
          quantity: 1,
          total_price: event.price,
        });

      if (error) throw error;

      // Update current attendees
      await supabase
        .from("events")
        .update({ 
          current_attendees: (event.current_attendees || 0) + 1 
        })
        .eq("id", event.id);

      toast({
        title: "Ticket Purchased",
        description: "Your ticket has been purchased successfully.",
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="aspect-video bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  const organizerName = event.profiles 
    ? `${event.profiles.first_name} ${event.profiles.last_name}`.trim()
    : 'Unknown Organizer';

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <Badge variant="secondary">
                    {event.category}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  Organized by {organizerName}
                </p>
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
                      <div className="font-medium">{event.venue}</div>
                      <div className="text-sm text-gray-600">
                        {event.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">
                        {event.current_attendees || 0}/{event.max_attendees}
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

                {event.tags && event.tags.length > 0 && (
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
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Get Your Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      ${event.price}
                    </div>
                    <div className="text-sm text-gray-600">per ticket</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span>{(event.max_attendees || 0) - (event.current_attendees || 0)} tickets</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ 
                          width: `${((event.current_attendees || 0) / (event.max_attendees || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={purchaseTicket}
                    disabled={!user || (event.current_attendees || 0) >= (event.max_attendees || 0)}
                  >
                    {!user ? "Login to Purchase" : 
                     (event.current_attendees || 0) >= (event.max_attendees || 0) ? "Sold Out" : 
                     "Purchase Ticket"}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Note: This is a demo. No actual payment will be processed.
                  </p>
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

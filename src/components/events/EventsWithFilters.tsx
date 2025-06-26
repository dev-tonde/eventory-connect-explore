
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";

const EventsWithFilters = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (eventsData) {
        const convertedEvents: Event[] = eventsData.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.venue,
          address: event.address || event.venue,
          price: event.price,
          category: event.category,
          image: event.image_url || "/placeholder.svg",
          organizer: "Event Organizer",
          attendeeCount: event.current_attendees,
          maxAttendees: event.max_attendees,
          tags: event.tags || []
        }));
        setEvents(convertedEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByCategory = (category: string) => {
    if (category === "all") return events.slice(0, 6); // Limit to 6 events
    return events.filter(event => 
      event.category.toLowerCase() === category.toLowerCase()
    ).slice(0, 6); // Limit to 6 events
  };

  const categories = [
    { id: "all", label: "All Events", count: events.length },
    { id: "music", label: "Music", count: events.filter(e => e.category.toLowerCase() === "music").length },
    { id: "technology", label: "Technology", count: events.filter(e => e.category.toLowerCase() === "technology").length },
    { id: "sports", label: "Sports", count: events.filter(e => e.category.toLowerCase() === "sports").length },
    { id: "food", label: "Food & Drink", count: events.filter(e => e.category.toLowerCase() === "food").length },
    { id: "arts", label: "Arts & Culture", count: events.filter(e => e.category.toLowerCase() === "arts").length },
    { id: "business", label: "Business", count: events.filter(e => e.category.toLowerCase() === "business").length },
  ];

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-lg transition-shadow group">
      <div className="relative">
        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <Badge className="absolute top-2 right-2 bg-purple-600">
          {event.category}
        </Badge>
      </div>

      <Link to={`/events/${event.id}`}>
        <CardHeader>
          <CardTitle className="text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
            {event.title}
          </CardTitle>
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.attendeeCount} attending</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-purple-600">
              {event.price === 0 ? "Free" : `$${event.price}`}
            </span>
            <Button
              size="sm"
              className="group-hover:bg-purple-700 transition-colors"
            >
              View Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Discover Events
            </h2>
            <Link to="/events">
              <Button variant="outline" className="flex items-center gap-2">
                View More Events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse events by category and find your next great experience
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-8">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs sm:text-sm"
              >
                {category.label}
                {category.count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterEventsByCategory(category.id).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              {filterEventsByCategory(category.id).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No events found in this category.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default EventsWithFilters;

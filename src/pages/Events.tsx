
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import EventFilters from "@/components/filters/EventFilters";
import { Event, EventFilters as EventFiltersType } from "@/types/event";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Music Festival",
    description: "Join us for an amazing day of live music featuring local and international artists.",
    date: "2024-07-15",
    time: "14:00",
    location: "Central Park",
    address: "123 Park Avenue, New York, NY",
    price: 75,
    category: "Music",
    image: "/placeholder.svg",
    organizer: "Music Events Co.",
    attendeeCount: 150,
    maxAttendees: 500,
    tags: ["outdoor", "festival", "music"]
  },
  {
    id: "2", 
    title: "Tech Innovation Workshop",
    description: "Learn about the latest trends in AI and machine learning from industry experts.",
    date: "2024-07-20",
    time: "10:00",
    location: "Tech Hub",
    address: "456 Innovation Street, San Francisco, CA",
    price: 25,
    category: "Technology",
    image: "/placeholder.svg",
    organizer: "TechLearn",
    attendeeCount: 45,
    maxAttendees: 100,
    tags: ["workshop", "technology", "AI"]
  },
  {
    id: "3",
    title: "Community Food Fair",
    description: "Taste delicious food from local vendors and support your community.",
    date: "2024-07-22",
    time: "11:00",
    location: "Community Center",
    address: "789 Main Street, Austin, TX",
    price: 0,
    category: "Food",
    image: "/placeholder.svg",
    organizer: "Austin Community",
    attendeeCount: 200,
    maxAttendees: 300,
    tags: ["food", "community", "free"]
  }
];

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<EventFiltersType>({});

  useEffect(() => {
    // Load events and favorites from localStorage
    const storedEvents = JSON.parse(localStorage.getItem('eventory_events') || '[]');
    if (storedEvents.length > 0) {
      setEvents([...mockEvents, ...storedEvents]);
    }

    if (user) {
      const storedFavorites = JSON.parse(localStorage.getItem('eventory_favorites') || '[]');
      const userFavorites = storedFavorites
        .filter((f: any) => f.userId === user.id)
        .map((f: any) => f.eventId);
      setFavorites(userFavorites);
    }
  }, [user]);

  const toggleFavorite = (eventId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to favorite events.",
        variant: "destructive",
      });
      return;
    }

    const existingFavorites = JSON.parse(localStorage.getItem('eventory_favorites') || '[]');
    const isFavorited = favorites.includes(eventId);

    if (isFavorited) {
      // Remove from favorites
      const updatedFavorites = existingFavorites.filter(
        (f: any) => !(f.userId === user.id && f.eventId === eventId)
      );
      localStorage.setItem('eventory_favorites', JSON.stringify(updatedFavorites));
      setFavorites(favorites.filter(id => id !== eventId));
      toast({
        title: "Removed from favorites",
        description: "Event removed from your favorites.",
      });
    } else {
      // Add to favorites
      const newFavorite = { userId: user.id, eventId, addedAt: new Date().toISOString() };
      existingFavorites.push(newFavorite);
      localStorage.setItem('eventory_favorites', JSON.stringify(existingFavorites));
      setFavorites([...favorites, eventId]);
      toast({
        title: "Added to favorites",
        description: "Event added to your favorites.",
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || event.category.toLowerCase() === filters.category.toLowerCase();
    
    const matchesLocation = !filters.location || 
                           event.location.toLowerCase().includes(filters.location.toLowerCase()) ||
                           event.address.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesDateRange = !filters.dateRange || 
                            (!filters.dateRange.start || event.date >= filters.dateRange.start) &&
                            (!filters.dateRange.end || event.date <= filters.dateRange.end);
    
    const matchesPriceRange = !filters.priceRange ||
                             (event.price >= (filters.priceRange.min || 0) && 
                              event.price <= (filters.priceRange.max || 1000));

    return matchesSearch && matchesCategory && matchesLocation && matchesDateRange && matchesPriceRange;
  });

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Events</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events, locations, or organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <EventFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <Link to={`/events/${event.id}`}>
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(event.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.includes(event.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600'
                    }`} 
                  />
                </Button>
              </div>
              
              <Link to={`/events/${event.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {event.category}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendeeCount}/{event.maxAttendees} attending</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-purple-600">
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </span>
                    <Button size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find events.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;

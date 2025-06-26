
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, MapPin, Calendar, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import EventFilters from "@/components/filters/EventFilters";
import EventMap from "@/components/map/EventMap";
import LocationSearch from "@/components/location/LocationSearch";
import LocationPermissionModal from "@/components/location/LocationPermissionModal";
import { Event, EventFilters as EventFiltersType } from "@/types/event";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Enhanced mock data with different organizers and more realistic information
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Music Festival 2024",
    description: "Join us for an incredible day of live music featuring chart-topping artists, local bands, and emerging talent. Experience multiple stages, gourmet food trucks, craft beer gardens, and interactive art installations in a beautiful outdoor setting.",
    date: "2024-07-15",
    time: "14:00",
    location: "Central Park Amphitheater",
    address: "123 Park Avenue, New York, NY 10001",
    price: 75,
    category: "Music",
    image: "/placeholder.svg",
    organizer: "Harmony Events Co.",
    attendeeCount: 342,
    maxAttendees: 500,
    tags: ["outdoor", "festival", "music", "family-friendly"]
  },
  {
    id: "2",
    title: "AI & Machine Learning Summit",
    description: "Dive deep into the future of artificial intelligence with industry pioneers, researchers, and innovators. Network with leading AI professionals, attend hands-on workshops, and discover the latest breakthroughs in machine learning, neural networks, and automation.",
    date: "2024-07-20",
    time: "09:00",
    location: "Innovation Tech Hub",
    address: "456 Innovation Street, San Francisco, CA 94105",
    price: 125,
    category: "Technology",
    image: "/placeholder.svg",
    organizer: "TechVision Institute",
    attendeeCount: 89,
    maxAttendees: 150,
    tags: ["workshop", "technology", "AI", "networking", "professional"]
  },
  {
    id: "3",
    title: "Urban Food & Wine Experience",
    description: "Savor culinary masterpieces from award-winning chefs paired with premium wines from renowned vineyards around the world. Enjoy live cooking demonstrations, wine tastings, and exclusive access to limited-edition bottles in an elegant rooftop setting.",
    date: "2024-07-25",
    time: "18:30",
    location: "Skyline Rooftop Venue",
    address: "789 Luxury Lane, Los Angeles, CA 90210",
    price: 95,
    category: "Food",
    image: "/placeholder.svg",
    organizer: "Culinary Masters Guild",
    attendeeCount: 67,
    maxAttendees: 100,
    tags: ["food", "wine", "tasting", "luxury", "rooftop"]
  },
  {
    id: "4",
    title: "Startup Pitch Battle 2024",
    description: "Watch the next generation of entrepreneurs pitch their groundbreaking ideas to top-tier investors and venture capitalists. Network with founders, investors, and industry experts while witnessing the birth of tomorrow's unicorn companies.",
    date: "2024-08-02",
    time: "10:00",
    location: "Entrepreneur Hub",
    address: "321 Startup Street, Austin, TX 78701",
    price: 35,
    category: "Business",
    image: "/placeholder.svg",
    organizer: "Venture Connect",
    attendeeCount: 156,
    maxAttendees: 200,
    tags: ["startup", "business", "networking", "competition", "investors"]
  },
  {
    id: "5",
    title: "Contemporary Art Showcase",
    description: "Discover cutting-edge contemporary art from emerging and established artists from around the globe. Meet the artists, participate in guided tours, and enjoy an exclusive wine reception while exploring thought-provoking installations and paintings.",
    date: "2024-08-10",
    time: "19:00",
    location: "Modern Art Gallery District",
    address: "654 Arts District, Chicago, IL 60601",
    price: 0,
    category: "Arts",
    image: "/placeholder.svg",
    organizer: "Metropolitan Arts Foundation",
    attendeeCount: 43,
    maxAttendees: 120,
    tags: ["art", "gallery", "culture", "free", "wine-reception"]
  },
  {
    id: "6",
    title: "Wellness & Mindfulness Retreat",
    description: "Rejuvenate your mind, body, and spirit with expert-led yoga sessions, guided meditation, sound healing workshops, and holistic wellness practices. Includes healthy gourmet meals, spa treatments, and take-home wellness kits.",
    date: "2024-08-18",
    time: "08:00",
    location: "Serenity Wellness Sanctuary",
    address: "987 Peaceful Path, Sedona, AZ 86336",
    price: 180,
    category: "Health",
    image: "/placeholder.svg",
    organizer: "Zen Wellness Collective",
    attendeeCount: 28,
    maxAttendees: 40,
    tags: ["yoga", "wellness", "meditation", "retreat", "spa"]
  }
];

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; city?: string } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    // Load events and favorites from localStorage
    const storedEvents = JSON.parse(
      localStorage.getItem("eventory_events") || "[]"
    );
    if (storedEvents.length > 0) {
      setEvents([...mockEvents, ...storedEvents]);
    }

    if (user) {
      interface Favorite {
        userId: string;
        eventId: string;
        addedAt: string;
      }
      const storedFavorites: Favorite[] = JSON.parse(
        localStorage.getItem("eventory_favorites") || "[]"
      );
      const userFavorites = storedFavorites
        .filter((f: Favorite) => f.userId === user.id)
        .map((f: Favorite) => f.eventId);
      setFavorites(userFavorites);
    }

    // Check for location permission
    const permissionAsked = localStorage.getItem('location_permission_asked');
    if (!permissionAsked && !userLocation) {
      setShowLocationModal(true);
    }
  }, [user]);

  const handleLocationAllow = () => {
    setShowLocationModal(false);
    localStorage.setItem('location_permission_asked', 'true');
    requestCurrentLocation();
  };

  const handleLocationDeny = () => {
    setShowLocationModal(false);
    localStorage.setItem('location_permission_asked', 'true');
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude, city: 'Current Location' });
        localStorage.setItem('user_location', JSON.stringify({ latitude, longitude }));
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const toggleFavorite = (eventId: string) => {
    if (!user) {
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
    const isFavorited = favorites.includes(eventId);

    if (isFavorited) {
      // Remove from favorites
      const updatedFavorites = existingFavorites.filter(
        (f: { userId: string; eventId: string; addedAt: string }) =>
          !(f.userId === user.id && f.eventId === eventId)
      );
      localStorage.setItem(
        "eventory_favorites",
        JSON.stringify(updatedFavorites)
      );
      setFavorites(favorites.filter((id) => id !== eventId));
      toast({
        title: "Removed from favorites",
        description: "Event removed from your favorites.",
      });
    } else {
      // Add to favorites
      const newFavorite = {
        userId: user.id,
        eventId,
        addedAt: new Date().toISOString(),
      };
      existingFavorites.push(newFavorite);
      localStorage.setItem(
        "eventory_favorites",
        JSON.stringify(existingFavorites)
      );
      setFavorites([...favorites, eventId]);
      toast({
        title: "Added to favorites",
        description: "Event added to your favorites.",
      });
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !filters.category ||
      event.category.toLowerCase() === filters.category.toLowerCase();

    const matchesLocation =
      !filters.location ||
      event.location.toLowerCase().includes(filters.location.toLowerCase()) ||
      event.address.toLowerCase().includes(filters.location.toLowerCase());

    const matchesDateRange =
      !filters.dateRange ||
      ((!filters.dateRange.start || event.date >= filters.dateRange.start) &&
        (!filters.dateRange.end || event.date <= filters.dateRange.end));

    const matchesPriceRange =
      !filters.priceRange ||
      (event.price >= (filters.priceRange.min || 0) &&
        event.price <= (filters.priceRange.max || 1000));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesDateRange &&
      matchesPriceRange
    );
  });

  const clearFilters = () => {
    setFilters({});
  };

  // Get events with mock distance for map display
  const eventsWithDistance = filteredEvents.map(event => ({
    ...event,
    distance: Math.random() * 50 // Random distance up to 50km
  })).filter(event => event.distance <= 25) // Show events within 25km
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onAllow={handleLocationAllow}
        onDeny={handleLocationDeny}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Discover Events
          </h1>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events, locations, or organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Location Search */}
          <div className="max-w-md mb-6">
            <LocationSearch 
              onLocationChange={setUserLocation}
              currentLocation={userLocation}
            />
          </div>
          
          {!userLocation && (
            <div className="mb-6">
              <Button
                onClick={() => setShowLocationModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Enable Location Access
              </Button>
            </div>
          )}
        </div>

        {/* Map */}
        {userLocation && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Events Near You</h2>
            <EventMap events={eventsWithDistance} userLocation={userLocation} />
          </div>
        )}

        {/* Filters */}
        <EventFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""}
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
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
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
                  <p className="text-sm text-gray-500 mb-2">by {event.organizer}</p>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString()} at{" "}
                        {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.attendeeCount}/{event.maxAttendees} attending
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-purple-600">
                      {event.price === 0 ? "Free" : `$${event.price}`}
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No events found
            </h3>
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

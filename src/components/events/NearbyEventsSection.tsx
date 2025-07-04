import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import LocationSearch from "@/components/location/LocationSearch";
import EventMap from "@/components/map/EventMap";
import LocationPermissionModal from "@/components/location/LocationPermissionModal";

// Only allow trusted image URLs (must be https and from your trusted domain)
const isTrustedImageUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    // Replace with your actual trusted domain if needed
    return (
      parsed.protocol === "https:" && parsed.hostname.endsWith("supabase.co")
    );
  } catch {
    return false;
  }
};

const NearbyEventsSection = () => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
  } | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

  useEffect(() => {
    const permissionAsked = localStorage.getItem("location_permission_asked");
    if (!permissionAsked && !userLocation) {
      setShowLocationModal(true);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation) {
      loadNearbyEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const handleLocationAllow = () => {
    setShowLocationModal(false);
    setLocationPermissionAsked(true);
    localStorage.setItem("location_permission_asked", "true");
    requestCurrentLocation();
  };

  const handleLocationDeny = () => {
    setShowLocationModal(false);
    setLocationPermissionAsked(true);
    localStorage.setItem("location_permission_asked", "true");
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude, city: "Current Location" });
        localStorage.setItem(
          "user_location",
          JSON.stringify({ latitude, longitude })
        );
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const loadNearbyEvents = () => {
    if (!userLocation) return;

    // Enhanced mock events with more realistic data and different organizers
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Summer Music Festival 2024",
        description:
          "Join us for an incredible day of live music featuring chart-topping artists, local bands, and emerging talent. Experience multiple stages, gourmet food trucks, craft beer gardens, and interactive art installations in a beautiful outdoor setting.",
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
        tags: ["outdoor", "festival", "music", "family-friendly"],
      },
      {
        id: "2",
        title: "AI & Machine Learning Summit",
        description:
          "Dive deep into the future of artificial intelligence with industry pioneers, researchers, and innovators. Network with leading AI professionals, attend hands-on workshops, and discover the latest breakthroughs in machine learning, neural networks, and automation.",
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
        tags: ["workshop", "technology", "AI", "networking", "professional"],
      },
      {
        id: "3",
        title: "Urban Food & Wine Experience",
        description:
          "Savor culinary masterpieces from award-winning chefs paired with premium wines from renowned vineyards around the world. Enjoy live cooking demonstrations, wine tastings, and exclusive access to limited-edition bottles in an elegant rooftop setting.",
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
        tags: ["food", "wine", "tasting", "luxury", "rooftop"],
      },
      {
        id: "4",
        title: "Startup Pitch Battle 2024",
        description:
          "Watch the next generation of entrepreneurs pitch their groundbreaking ideas to top-tier investors and venture capitalists. Network with founders, investors, and industry experts while witnessing the birth of tomorrow's unicorn companies.",
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
        tags: ["startup", "business", "networking", "competition", "investors"],
      },
      {
        id: "5",
        title: "Contemporary Art Showcase",
        description:
          "Discover cutting-edge contemporary art from emerging and established artists from around the globe. Meet the artists, participate in guided tours, and enjoy an exclusive wine reception while exploring thought-provoking installations and paintings.",
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
        tags: ["art", "gallery", "culture", "free", "wine-reception"],
      },
      {
        id: "6",
        title: "Wellness & Mindfulness Retreat",
        description:
          "Rejuvenate your mind, body, and spirit with expert-led yoga sessions, guided meditation, sound healing workshops, and holistic wellness practices. Includes healthy gourmet meals, spa treatments, and take-home wellness kits.",
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
        tags: ["yoga", "wellness", "meditation", "retreat", "spa"],
      },
    ];

    // Get events from localStorage and combine with mock events
    const storedEvents = JSON.parse(
      localStorage.getItem("eventory_events") || "[]"
    );
    const allEvents = [...mockEvents, ...storedEvents];

    // Mock distance calculation - in real app would use geospatial queries
    const eventsWithDistance = allEvents
      .map((event) => ({
        ...event,
        distance: Math.random() * 50, // Random distance up to 50km
      }))
      .filter((event) => event.distance <= 25) // Show events within 25km
      .sort((a, b) => a.distance - b.distance);

    setNearbyEvents(eventsWithDistance.slice(0, 6));
  };

  return (
    <>
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onAllow={handleLocationAllow}
        onDeny={handleLocationDeny}
      />

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Events Near You
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Discover amazing events happening in your area
            </p>

            <div className="max-w-md mx-auto mb-6">
              <LocationSearch
                onLocationChange={setUserLocation}
                currentLocation={userLocation}
              />
            </div>

            {!userLocation && (
              <div className="text-center mb-6">
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

          {/* Map is always displayed when location is available */}
          {userLocation && (
            <div className="mb-8">
              <EventMap events={nearbyEvents} userLocation={userLocation} />
            </div>
          )}

          {nearbyEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyEvents.map((event) => {
                // Secure image URL
                const safeImageUrl =
                  event.image && isTrustedImageUrl(event.image)
                    ? event.image
                    : "/placeholder.svg";

                // Prevent unvalidated redirection by validating event.id before using in Link
                // Only allow alphanumeric, dash, and underscore for event IDs
                const isValidEventId =
                  typeof event.id === "string" &&
                  /^[a-zA-Z0-9_-]+$/.test(event.id);
                const eventLink = isValidEventId ? `/events/${event.id}` : "#";

                return (
                  <Card
                    key={event.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={safeImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-gray-500 mb-2">
                        by {event.organizer}
                      </p>
                      <div className="space-y-2 text-sm text-gray-600">
                        {/* ...date, location, attendees... */}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-600">
                          {event.price === 0 ? "Free" : `R${event.price}`}
                        </span>
                        <Link to={eventLink}>
                          <Button size="sm" disabled={!isValidEventId}>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : userLocation ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No nearby events found
              </h3>
              <p className="text-gray-600">
                Try expanding your search area or check back later.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Set your location
              </h3>
              <p className="text-gray-600">
                Allow location access or search for a city to find nearby
                events.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default NearbyEventsSection;
// This component fetches and displays events happening near the user's location.
// It includes a location search input, a map to visualize events, and a modal for location permissions.

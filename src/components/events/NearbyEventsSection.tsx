import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import LocationSearch from "@/components/location/LocationSearch";
import EventMap from "@/components/map/EventMap";
import LocationPermissionModal from "@/components/location/LocationPermissionModal";
import { supabase } from "@/integrations/supabase/client";

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

  const loadNearbyEvents = async () => {
    if (!userLocation) return;

    try {
      // Fetch real events from database
      const { data: events, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(20);

      if (error) {
        console.error("Error fetching events:", error);
        setNearbyEvents([]);
        return;
      }

      if (!events || events.length === 0) {
        setNearbyEvents([]);
        return;
      }

      // Transform database events to Event type and calculate mock distances
      const transformedEvents = events.map((event) => ({
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
        organizer: event.profiles
          ? `${event.profiles.first_name} ${event.profiles.last_name}`.trim()
          : "Unknown Organizer",
        attendeeCount: event.current_attendees || 0,
        maxAttendees: event.max_attendees || 100,
        tags: event.tags || [],
        distance: Math.random() * 50, // Mock distance calculation
      }))
      .filter((event) => event.distance <= 25) // Show events within 25km
      .sort((a, b) => a.distance - b.distance);

      setNearbyEvents(transformedEvents.slice(0, 6));
    } catch (error) {
      console.error("Error loading nearby events:", error);
      setNearbyEvents([]);
    }
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
                  variant="default"
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
                          <Button size="sm" disabled={!isValidEventId} variant="default">
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

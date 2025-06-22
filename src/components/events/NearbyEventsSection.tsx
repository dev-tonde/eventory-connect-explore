
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import LocationSearch from "@/components/location/LocationSearch";
import EventMap from "@/components/map/EventMap";

const NearbyEventsSection = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; city?: string } | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (userLocation) {
      loadNearbyEvents();
    }
  }, [userLocation]);

  const loadNearbyEvents = () => {
    if (!userLocation) return;

    // Get events from localStorage
    const storedEvents = JSON.parse(localStorage.getItem('eventory_events') || '[]');
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
      }
    ];

    // Combine stored events with mock events and simulate distance-based filtering
    const allEvents = [...mockEvents, ...storedEvents];
    
    // Mock distance calculation - in real app would use geospatial queries
    const eventsWithDistance = allEvents.map(event => ({
      ...event,
      distance: Math.random() * 50 // Random distance up to 50km
    })).filter(event => event.distance <= 25) // Show events within 25km
      .sort((a, b) => a.distance - b.distance);

    setNearbyEvents(eventsWithDistance.slice(0, 6));
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
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
          
          {userLocation && (
            <div className="text-center mb-6">
              <Button
                variant="outline"
                onClick={() => setShowMap(!showMap)}
                className="mr-4"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            </div>
          )}
        </div>

        {showMap && userLocation && (
          <div className="mb-8">
            <EventMap events={nearbyEvents} userLocation={userLocation} />
          </div>
        )}

        {nearbyEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="flex items-centers gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                      {(event as any).distance && (
                        <span className="text-green-600 ml-auto">
                          {(event as any).distance.toFixed(1)}km away
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendeeCount} attending</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-purple-600">
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </span>
                    <Link to={`/events/${event.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userLocation ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No nearby events found</h3>
            <p className="text-gray-600">Try expanding your search area or check back later.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Set your location</h3>
            <p className="text-gray-600">Allow location access or search for a city to find nearby events.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyEventsSection;

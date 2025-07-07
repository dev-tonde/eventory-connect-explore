import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect, useState } from "react";

// Sanitize city name to prevent XSS
const sanitizeText = (text: string) => text.replace(/[<>]/g, "").trim();

const LocationIndicator = () => {
  const { location, loading, error, requestLocation } = useGeolocation();
  const [userDeniedLocation, setUserDeniedLocation] = useState(false);

  useEffect(() => {
    // Auto-request location on first load if not already available and user hasn't denied
    if (!location && !error && !loading && !userDeniedLocation) {
      requestLocation();
    }
  }, [location, error, loading, userDeniedLocation, requestLocation]);

  if (loading) {
    return (
      <div
        className="flex items-center text-sm text-gray-600"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        <span>Getting location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setUserDeniedLocation(false);
          requestLocation();
        }}
        className="text-sm text-gray-600 hover:text-gray-800"
        aria-label="Retry location"
      >
        <AlertCircle className="h-4 w-4 mr-1" />
        Location Error - Retry
      </Button>
    );
  }

  if (!location) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setUserDeniedLocation(false);
          requestLocation();
        }}
        className="text-sm text-gray-600 hover:text-gray-800"
        aria-label="Enable location"
      >
        <MapPin className="h-4 w-4 mr-1" />
        Enable Location
      </Button>
    );
  }

  const displayLocation =
    location.city && location.city !== "Unknown"
      ? sanitizeText(location.city)
      : `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`;

  return (
    <div className="flex items-center text-sm text-gray-600">
      <MapPin className="h-4 w-4 mr-1 text-green-600" />
      <span
        title={`${location.latitude}, ${location.longitude}`}
        aria-label="Current location"
      >
        {displayLocation}
      </span>
    </div>
  );
};

export default LocationIndicator;
// This component displays the user's current location with a loading state, error handling, and a button to retry or enable location services.
// It uses a custom hook for geolocation and sanitizes the city name to prevent XSS attacks.
// The location is displayed with a map pin icon, and the component updates automatically when the location changes.
// The location is formatted to show either the city name or latitude/longitude coordinates, ensuring a


import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect } from "react";

const LocationIndicator = () => {
  const { location, loading, error, requestLocation } = useGeolocation();

  useEffect(() => {
    // Auto-request location on first load if not already available
    if (!location && !error && !loading) {
      requestLocation();
    }
  }, [location, error, loading, requestLocation]);

  if (loading) {
    return (
      <div className="flex items-center text-sm text-gray-600">
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        <span>Getting location...</span>
      </div>
    );
  }

  if (error || !location) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={requestLocation}
        className="text-sm text-gray-600"
      >
        <MapPin className="h-4 w-4 mr-1" />
        Enable Location
      </Button>
    );
  }

  return (
    <div className="flex items-center text-sm text-gray-600">
      <MapPin className="h-4 w-4 mr-1" />
      <span>{location.city || 'Your Location'}</span>
    </div>
  );
};

export default LocationIndicator;

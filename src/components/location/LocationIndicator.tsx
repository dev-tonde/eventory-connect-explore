
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect } from "react";

const LocationIndicator = () => {
  const { location, loading, error, requestLocation } = useGeolocation();

  useEffect(() => {
    // Auto-request location on first load if not already available and user hasn't denied
    const locationDenied = localStorage.getItem('location_permission_denied');
    if (!location && !error && !loading && !locationDenied) {
      console.log('Auto-requesting location...');
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

  if (error) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Manually requesting location...');
          requestLocation();
        }}
        className="text-sm text-gray-600 hover:text-gray-800"
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
          console.log('Requesting location permission...');
          requestLocation();
        }}
        className="text-sm text-gray-600 hover:text-gray-800"
      >
        <MapPin className="h-4 w-4 mr-1" />
        Enable Location
      </Button>
    );
  }

  const displayLocation = location.city && location.city !== 'Unknown' 
    ? location.city 
    : `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`;

  return (
    <div className="flex items-center text-sm text-gray-600">
      <MapPin className="h-4 w-4 mr-1 text-green-600" />
      <span title={`${location.latitude}, ${location.longitude}`}>
        {displayLocation}
      </span>
    </div>
  );
};

export default LocationIndicator;

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

// Sanitize city/location input to prevent XSS
const sanitizeInput = (input: string) => input.replace(/[<>]/g, "").trim();

interface LocationSearchProps {
  onLocationChange: (location: {
    latitude: number;
    longitude: number;
    city?: string;
  }) => void;
  currentLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
  } | null;
}

const LocationSearch = ({
  onLocationChange,
  currentLocation,
}: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { location, loading, requestLocation } = useGeolocation();

  const handleUseCurrentLocation = () => {
    if (location) {
      onLocationChange(location);
    } else {
      requestLocation();
    }
  };

  const handleLocationSearch = async () => {
    const sanitizedQuery = sanitizeInput(searchQuery);
    if (!sanitizedQuery) return;

    setIsSearching(true);
    try {
      // Mock geocoding - in real app would use Google Maps Geocoding API
      const mockLocations: Record<
        string,
        { latitude: number; longitude: number; city: string }
      > = {
        "new york": { latitude: 40.7128, longitude: -74.006, city: "New York" },
        london: { latitude: 51.5074, longitude: -0.1278, city: "London" },
        tokyo: { latitude: 35.6762, longitude: 139.6503, city: "Tokyo" },
        paris: { latitude: 48.8566, longitude: 2.3522, city: "Paris" },
        "san francisco": {
          latitude: 37.7749,
          longitude: -122.4194,
          city: "San Francisco",
        },
      };

      const searchKey = sanitizedQuery.toLowerCase();
      const foundLocation = mockLocations[searchKey] || {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
        city: sanitizedQuery,
      };

      onLocationChange(foundLocation);
    } catch (error) {
      // Optionally show a toast or error message
      // console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search city or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            maxLength={80}
            autoComplete="off"
            aria-label="Search city or location"
            onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
          />
        </div>
        <Button
          onClick={handleLocationSearch}
          disabled={isSearching || !searchQuery.trim()}
          type="button"
          aria-label="Search location"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={handleUseCurrentLocation}
        disabled={loading}
        className="w-full"
        type="button"
        aria-label="Use current location"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4 mr-2" />
        )}
        Use Current Location
      </Button>

      {currentLocation && (
        <div className="text-sm text-gray-600 text-center">
          <MapPin className="h-4 w-4 inline mr-1" />
          {currentLocation.city
            ? sanitizeInput(currentLocation.city)
            : `${currentLocation.latitude.toFixed(
                4
              )}, ${currentLocation.longitude.toFixed(4)}`}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
// This component provides a search input for locations, allowing users to search by city or use their current location.
// It includes a button to search for a location and another to use the current geolocation.
// The component handles loading states and sanitizes user input to prevent XSS attacks.

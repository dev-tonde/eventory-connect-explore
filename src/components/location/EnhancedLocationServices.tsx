import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { useEnhancedGeolocation } from "@/hooks/useEnhancedGeolocation";

// Basic sanitization to prevent XSS in address input
const sanitizeInput = (input: string) => input.replace(/[<>]/g, "").trim();

const EnhancedLocationServices = () => {
  const [searchAddress, setSearchAddress] = useState("");
  const {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    geocodeAddress,
  } = useEnhancedGeolocation();

  const handleAddressSearch = async () => {
    const sanitized = sanitizeInput(searchAddress);
    if (!sanitized) return;
    await geocodeAddress(sanitized);
  };

  const handleGetCurrentLocation = async () => {
    await getCurrentLocation();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Enhanced Location Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Display */}
        {currentLocation && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">
              Current Location
            </h3>
            <div className="space-y-1 text-sm text-green-700">
              <p>
                <strong>Address:</strong>{" "}
                {sanitizeInput(currentLocation.address)}
              </p>
              <p>
                <strong>Coordinates:</strong>{" "}
                {currentLocation.latitude.toFixed(6)},{" "}
                {currentLocation.longitude.toFixed(6)}
              </p>
              {currentLocation.city && (
                <p>
                  <strong>City:</strong> {sanitizeInput(currentLocation.city)}
                </p>
              )}
              {currentLocation.country && (
                <p>
                  <strong>Country:</strong>{" "}
                  {sanitizeInput(currentLocation.country)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{sanitizeInput(error)}</p>
          </div>
        )}

        {/* Get Current Location */}
        <div className="flex gap-2">
          <Button
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className="flex items-center gap-2"
            aria-label="Get current location"
            type="button"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Get Current Location
          </Button>
        </div>

        {/* Address Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="address-search">
            Search Address
          </label>
          <div className="flex gap-2">
            <Input
              id="address-search"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter address to geocode..."
              onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
              maxLength={120}
              autoComplete="off"
              aria-label="Search address"
            />
            <Button
              onClick={handleAddressSearch}
              disabled={isLoading || !searchAddress.trim()}
              variant="outline"
              aria-label="Search address"
              type="button"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-medium">Available Features:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Real-time Geolocation</Badge>
            <Badge variant="secondary">Address Geocoding</Badge>
            <Badge variant="secondary">Location Caching</Badge>
            <Badge variant="secondary">Reverse Geocoding</Badge>
            <Badge variant="secondary">Map Integration Ready</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedLocationServices;
// This component provides enhanced location services with features like real-time geolocation, address geocoding, and error handling.
// It includes a search input for address lookup, a button to get the current location, and displays the current location details.

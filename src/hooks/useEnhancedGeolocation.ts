import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  country?: string;
}

interface GeolocationHook {
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationData | null>;
  geocodeAddress: (address: string) => Promise<LocationData | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<LocationData | null>;
}

/**
 * Enhanced geolocation hook with caching, error handling, and mock geocoding.
 */
export const useEnhancedGeolocation = (): GeolocationHook => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<LocationData | null> => {
      try {
        // In production, integrate with a real reverse geocoding service
        const mockAddress = await mockReverseGeocodeService(lat, lng);
        return mockAddress;
      } catch {
        setError("Failed to reverse geocode location");
        return null;
      }
    },
    []
  );

  const getCurrentLocation =
    useCallback(async (): Promise<LocationData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            });
          }
        );

        const { latitude, longitude } = position.coords;
        const locationData = await reverseGeocode(latitude, longitude);

        if (locationData) {
          setCurrentLocation(locationData);
          return locationData;
        }

        return null;
      } catch {
        const errorMessage =
          "Unable to get your location. Please check permissions.";
        setError(errorMessage);
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [reverseGeocode, toast]);

  const geocodeAddress = useCallback(
    async (address: string): Promise<LocationData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const { data: cachedLocation } = await supabase.rpc(
          "get_cached_location",
          { _address: address }
        );

        if (cachedLocation && cachedLocation.length > 0) {
          const cached = cachedLocation[0];
          return {
            latitude: Number(cached.latitude),
            longitude: Number(cached.longitude),
            address,
            city: cached.city || undefined,
            country: cached.country || undefined,
          };
        }

        // Use mock geocoding service (replace with real service in production)
        const mockGeocode = await mockGeocodeService(address);

        if (mockGeocode) {
          // Cache the result
          await supabase.rpc("cache_location", {
            _address: address,
            _latitude: mockGeocode.latitude,
            _longitude: mockGeocode.longitude,
            _city: mockGeocode.city,
            _country: mockGeocode.country,
          });

          return mockGeocode;
        }

        return null;
      } catch {
        const errorMessage = "Failed to geocode address";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    geocodeAddress,
    reverseGeocode,
  };
};

// Mock services - replace with real geocoding services in production
const mockGeocodeService = async (
  address: string
): Promise<LocationData | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockLocations: Record<string, LocationData> = {
    "New York": {
      latitude: 40.7128,
      longitude: -74.006,
      address,
      city: "New York",
      country: "USA",
    },
    London: {
      latitude: 51.5074,
      longitude: -0.1278,
      address,
      city: "London",
      country: "UK",
    },
    Paris: {
      latitude: 48.8566,
      longitude: 2.3522,
      address,
      city: "Paris",
      country: "France",
    },
    Tokyo: {
      latitude: 35.6762,
      longitude: 139.6503,
      address,
      city: "Tokyo",
      country: "Japan",
    },
  };

  const found = Object.keys(mockLocations).find((city) =>
    address.toLowerCase().includes(city.toLowerCase())
  );

  return found
    ? mockLocations[found]
    : {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
        address,
        city: "Unknown City",
        country: "Unknown Country",
      };
};

const mockReverseGeocodeService = async (
  lat: number,
  lng: number
): Promise<LocationData> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    latitude: lat,
    longitude: lng,
    address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: "Current Location",
    country: "Local Area",
  };
};

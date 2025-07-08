import { useState, useEffect, useRef } from "react";
import { useErrorTracking } from "@/hooks/useErrorTracking";

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timestamp: number;
}

/**
 * Secure geolocation hook that doesn't use localStorage
 * Implements proper error handling and security practices
 */
export const useSecureGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackError } = useErrorTracking();
  const abortControllerRef = useRef<AbortController | null>(null);

  const requestLocation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = "Geolocation is not supported by this browser";
        setError(errorMsg);
        trackError(new Error(errorMsg), { 
          component: "useSecureGeolocation", 
          action: "requestLocation" 
        });
        reject(new Error(errorMsg));
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (abortControllerRef.current?.signal.aborted) {
            reject(new Error("Request aborted"));
            return;
          }

          const { latitude, longitude } = position.coords;

          try {
            const locationData: LocationData = {
              latitude,
              longitude,
              city: getApproximateCity(latitude, longitude),
              country: getApproximateCountry(latitude, longitude),
              timestamp: Date.now(),
            };

            setLocation(locationData);
            setLoading(false);
            resolve();
          } catch (err) {
            const errorMsg = "Error processing location data";
            trackError(err as Error, { 
              component: "useSecureGeolocation", 
              action: "processLocation" 
            });
            setLocation({ latitude, longitude, timestamp: Date.now() });
            setLoading(false);
            resolve();
          }
        },
        (err) => {
          if (abortControllerRef.current?.signal.aborted) {
            reject(new Error("Request aborted"));
            return;
          }

          const errorMsg = getLocationErrorMessage(err);
          setError(errorMsg);
          setLoading(false);
          trackError(new Error(`Geolocation error: ${err.message}`), { 
            component: "useSecureGeolocation", 
            action: "getCurrentPosition",
            errorCode: err.code.toString()
          });
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds
          maximumAge: 300000, // 5 minutes
        }
      );

      // Set up abort handling
      abortControllerRef.current.signal.addEventListener('abort', () => {
        setLoading(false);
      });
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
  };
};

// Helper function to convert GeolocationPositionError to user-friendly message
function getLocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access denied. Please enable location services.";
    case error.POSITION_UNAVAILABLE:
      return "Location information unavailable. Please try again.";
    case error.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return "An unknown location error occurred.";
  }
}

// Secure helper functions for approximate location (replace with real geocoding service in production)
function getApproximateCity(lat: number, lng: number): string {
  // Validate coordinates
  if (!isValidCoordinate(lat, lng)) {
    return "Invalid Location";
  }

  // South African major cities (sanitized data)
  const cities = [
    { name: "Cape Town", lat: -33.9249, lng: 18.4241, radius: 0.5 },
    { name: "Johannesburg", lat: -26.2041, lng: 28.0473, radius: 0.5 },
    { name: "Durban", lat: -29.8587, lng: 31.0218, radius: 0.3 },
    { name: "Pretoria", lat: -25.7479, lng: 28.2293, radius: 0.3 },
    { name: "Stellenbosch", lat: -33.9321, lng: 18.8602, radius: 0.2 },
  ] as const;

  for (const city of cities) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    if (distance < city.radius) {
      return city.name;
    }
  }

  // Return sanitized coordinates if no city match
  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}

function getApproximateCountry(lat: number, lng: number): string {
  if (!isValidCoordinate(lat, lng)) {
    return "Unknown";
  }

  // Simple South Africa bounds check (secure bounds)
  if (lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33) {
    return "South Africa";
  }
  
  return "International";
}

// Helper functions for security
function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    !isNaN(lat) && 
    !isNaN(lng) &&
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180
  );
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine formula for more accurate distance calculation
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
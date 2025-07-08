import { useState, useEffect, useCallback } from 'react';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timestamp: number;
}

/**
 * Secure geolocation hook that stores data in Supabase instead of localStorage
 */
export const useSecureLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const { getItem, setItem } = useSupabaseStorage();
  const { user } = useAuth();

  // Load cached location from Supabase
  useEffect(() => {
    if (!user) return;
    
    const loadCachedData = async () => {
      try {
        const [cachedLocation, askedPermission] = await Promise.all([
          getItem('user_location'),
          getItem('location_permission_asked')
        ]);
        
        if (cachedLocation) {
          setLocation(cachedLocation);
        }
        
        if (askedPermission) {
          setPermissionAsked(true);
        }
      } catch (err) {
        console.error('Error loading cached location:', err);
      }
    };

    loadCachedData();
  }, [user, getItem]);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const locationData: LocationData = {
        latitude,
        longitude,
        city: getApproximateCity(latitude, longitude),
        country: getApproximateCountry(latitude, longitude),
        timestamp: Date.now(),
      };

      setLocation(locationData);
      
      // Store in Supabase instead of localStorage
      if (user) {
        await setItem('user_location', locationData);
        await setItem('location_permission_asked', true);
      }
      
      setPermissionAsked(true);
    } catch (err) {
      const errorMessage = err instanceof GeolocationPositionError 
        ? getLocationErrorMessage(err)
        : 'An unknown location error occurred.';
      setError(errorMessage);
      
      if (user) {
        await setItem('location_permission_asked', true);
      }
      setPermissionAsked(true);
    } finally {
      setLoading(false);
    }
  }, [user, setItem]);

  return {
    location,
    loading,
    error,
    permissionAsked,
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

// Secure helper functions for approximate location
function getApproximateCity(lat: number, lng: number): string {
  if (!isValidCoordinate(lat, lng)) {
    return "Invalid Location";
  }

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

  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}

function getApproximateCountry(lat: number, lng: number): string {
  if (!isValidCoordinate(lat, lng)) {
    return "Unknown";
  }

  if (lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33) {
    return "South Africa";
  }
  
  return "International";
}

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

import { useState, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // For now, use approximate location based on coordinates
          // In production, integrate with a real geocoding service
          const locationData: LocationData = {
            latitude,
            longitude,
            city: getApproximateCity(latitude, longitude),
            country: getApproximateCountry(latitude, longitude)
          };
          
          setLocation(locationData);
          localStorage.setItem('user_location', JSON.stringify(locationData));
        } catch (err) {
          console.error('Error getting location details:', err);
          setLocation({ latitude, longitude });
        }
        
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
    // Check for stored location
    const storedLocation = localStorage.getItem('user_location');
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);
        setLocation(parsedLocation);
      } catch (err) {
        console.error('Error parsing stored location:', err);
        localStorage.removeItem('user_location');
      }
    }
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation
  };
};

// Helper functions for approximate location (replace with real geocoding service)
function getApproximateCity(lat: number, lng: number): string {
  // South African major cities (for your target market)
  const cities = [
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, radius: 0.5 },
    { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, radius: 0.5 },
    { name: 'Durban', lat: -29.8587, lng: 31.0218, radius: 0.3 },
    { name: 'Pretoria', lat: -25.7479, lng: 28.2293, radius: 0.3 },
    { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, radius: 0.3 },
  ];

  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
    );
    if (distance < city.radius) {
      return city.name;
    }
  }

  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}

function getApproximateCountry(lat: number, lng: number): string {
  // Simple South Africa bounds check
  if (lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33) {
    return 'South Africa';
  }
  return 'Unknown';
}

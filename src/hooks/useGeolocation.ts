
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
          // Mock reverse geocoding - in real app you'd use a service like Google Maps API
          const locationData: LocationData = {
            latitude,
            longitude,
            city: 'Current City', // This would come from reverse geocoding
            country: 'Current Country'
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
        setLocation(JSON.parse(storedLocation));
      } catch (err) {
        console.error('Error parsing stored location:', err);
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

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface EventMapProps {
  venue: string;
  address?: string;
  coordinates?: [number, number]; // [longitude, latitude]
}

export const EventMap: React.FC<EventMapProps> = ({
  venue,
  address,
  coordinates,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = React.useState<string>("");

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch("/api/mapbox-config");
        if (response.ok) {
          const data = await response.json();
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error("Failed to fetch Mapbox token:", error);
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken;

    // Default coordinates (Cape Town city center)
    const defaultCoords: [number, number] = [18.4241, -33.9249];
    const mapCoords = coordinates || defaultCoords;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: mapCoords,
      zoom: coordinates ? 15 : 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker if coordinates are provided
    if (coordinates) {
      new mapboxgl.Marker({
        color: "#7c3aed", // Purple color to match theme
      })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<div class="p-2">
              <h3 class="font-semibold">${venue}</h3>
              ${address ? `<p class="text-sm text-gray-600">${address}</p>` : ""}
            </div>`
          )
        )
        .addTo(map.current);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, coordinates, venue, address]);

  if (!mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Event Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">{venue}</h4>
            {address && <p className="text-sm text-gray-600">{address}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Event Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            ref={mapContainer}
            className="w-full h-64 rounded-lg overflow-hidden border"
          />
          <div className="space-y-2">
            <h4 className="font-medium">{venue}</h4>
            {address && <p className="text-sm text-gray-600">{address}</p>}
            {!coordinates && (
              <p className="text-xs text-orange-600">
                Exact coordinates not available. Showing approximate location.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
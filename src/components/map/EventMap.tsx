
import { useEffect, useRef } from "react";
import { Event } from "@/types/event";
import { MapPin } from "lucide-react";

interface EventMapProps {
  events: Event[];
  userLocation?: { latitude: number; longitude: number } | null;
}

const EventMap = ({ events, userLocation }: EventMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // This is a mock map component - in a real app you'd use Google Maps, Mapbox, etc.
  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            Interactive map showing {events.length} nearby events
          </p>
          {userLocation && (
            <p className="text-sm text-gray-500 mt-1">
              Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>
      
      {/* Mock event markers */}
      {events.slice(0, 5).map((event, index) => (
        <div
          key={event.id}
          className="absolute w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${20 + index * 15}%`,
            top: `${30 + index * 10}%`
          }}
          title={event.title}
        />
      ))}
      
      {/* User location marker */}
      {userLocation && (
        <div
          className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          title="Your location"
        />
      )}
    </div>
  );
};

export default EventMap;

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { Event } from "@/types/event";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface OrganizerEventGridProps {
  events: Event[];
  organizerName: string;
}

const OrganizerEventGrid = ({
  events,
  organizerName,
}: OrganizerEventGridProps) => {
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar
          className="h-12 w-12 mx-auto mb-4 text-gray-300"
          aria-hidden="true"
        />
        <p>No upcoming events from this organizer</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.slice(0, 6).map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            aria-label={`View event: ${sanitizeText(event.title)}`}
          >
            <Card className="hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={sanitizeText(event.title)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={400}
                  height={225}
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                  {sanitizeText(event.title)}
                </h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "Date TBA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {sanitizeText(event.location || "Location TBA")}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-bold text-purple-600">
                    {event.price === 0 || event.price === undefined
                      ? "Free"
                      : `$${event.price}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {events.length > 6 && (
        <div className="text-center mt-4">
          <Link
            to={`/events?organizer=${encodeURIComponent(organizerName)}`}
            aria-label={`View all events by ${sanitizeText(organizerName)}`}
          >
            <Button variant="outline" size="sm" type="button">
              View All {events.length} Events
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default OrganizerEventGrid;
// This component renders a grid of events for a specific organizer.
// It displays up to 6 events with their title, date, location, and price.

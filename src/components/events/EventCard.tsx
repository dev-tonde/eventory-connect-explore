import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    category: string;
    image_url: string;
    price: number;
    max_attendees: number;
    current_attendees: number;
  };
}

const isTrustedImageUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    // Replace with your trusted domain if needed
    return (
      parsed.protocol === "https:" && parsed.hostname.endsWith("supabase.co")
    );
  } catch {
    return false;
  }
};

const EventCard = ({ event }: EventCardProps) => {
  const safeImageUrl =
    event.image_url && isTrustedImageUrl(event.image_url)
      ? event.image_url
      : "/placeholder.svg";

  return (
    <Link
      to={`/events/${event.id}`}
      className="block group"
      aria-label={`View details for ${event.title}`}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 group-hover:scale-[1.02]">
        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={safeImageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
              {event.title}
            </CardTitle>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {event.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-600 text-sm line-clamp-2">
            {event.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {event.current_attendees}/{event.max_attendees}
                </span>
              </div>
              <div className="flex items-center gap-1 text-lg font-semibold text-purple-600">
                <DollarSign className="h-4 w-4" />
                <span>
                  {event.price === 0 ? "Free" : `R${event.price.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;
// This component renders a card for an event with details like title, date, time, venue, category, image, and price.
// It uses a placeholder image if the event's image URL is not trusted or available.
// The card is clickable and links to the event's detail page. It also handles image loading errors by displaying a placeholder image.

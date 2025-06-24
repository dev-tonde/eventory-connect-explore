
import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const EventCard = ({ event }: EventCardProps) => {
  const isLowTickets = event.max_attendees - event.current_attendees <= 20;
  const ticketsLeft = event.max_attendees - event.current_attendees;
  
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={event.image_url || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isLowTickets && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Only {ticketsLeft} left!
          </Badge>
        )}
        <Badge className="absolute top-2 left-2 bg-purple-600">
          {event.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span>•</span>
          <span>{event.time}</span>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Users className="h-4 w-4" />
          <span>{event.current_attendees} / {event.max_attendees} attending</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-purple-600">R{event.price}</span>
          <Link to={`/events/${event.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;

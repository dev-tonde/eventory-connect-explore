/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users } from "lucide-react";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    image_url?: string;
    date: string;
    venue: string;
    current_attendees?: number;
    max_attendees?: number;
    price?: number;
    [key: string]: any;
  };
  isPast?: boolean;
  onManagePricing?: (eventId: string) => void;
}

const EventCard = ({
  event,
  isPast = false,
  onManagePricing,
}: EventCardProps) => {
  const navigate = useNavigate();
  const currentAttendees = Number(event.current_attendees) || 0;
  const maxAttendees = Number(event.max_attendees) || 100;
  const soldPercentage = Math.min((currentAttendees / maxAttendees) * 100, 100);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={sanitizeText(event.title)}
                className="w-full h-full object-cover"
                loading="lazy"
                width={80}
                height={80}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg truncate">
                  {sanitizeText(event.title)}
                </h3>
                {isPast ? (
                  <Badge variant="outline">Completed</Badge>
                ) : (
                  <Badge variant="secondary">Upcoming</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 truncate">
                {event.date
                  ? new Date(event.date).toLocaleDateString()
                  : "Date TBA"}{" "}
                • {sanitizeText(event.venue)}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Tickets Sold</span>
                  <span className="font-medium">
                    {currentAttendees}/{maxAttendees}
                  </span>
                </div>
                <Progress value={soldPercentage} className="h-2" />
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign
                    className="h-4 w-4 text-green-600"
                    aria-hidden="true"
                  />
                  <span className="font-medium">
                    $
                    {(
                      (Number(event.price) || 0) * currentAttendees
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span>{currentAttendees} attendees</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            {!isPast && onManagePricing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManagePricing(event.id)}
                type="button"
                aria-label="Manage Pricing"
              >
                Manage Pricing
              </Button>
            )}
            {!isPast && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}/edit`)}
                type="button"
                aria-label="Edit Event"
              >
                Edit Event
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/events/${event.id}`)}
              type="button"
              aria-label="View Details"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
// This component renders an event card with details such as title, date, venue, tickets sold, and pricing.
// It includes buttons for managing pricing, editing the event, and viewing details.

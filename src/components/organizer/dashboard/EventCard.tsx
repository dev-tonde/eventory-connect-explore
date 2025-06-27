
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users } from "lucide-react";

interface EventCardProps {
  event: any;
  isPast?: boolean;
  onManagePricing?: (eventId: string) => void;
}

const EventCard = ({ event, isPast = false, onManagePricing }: EventCardProps) => {
  const navigate = useNavigate();
  const soldPercentage = ((event.current_attendees || 0) / (event.max_attendees || 100)) * 100;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                {isPast ? (
                  <Badge variant="outline">Completed</Badge>
                ) : (
                  <Badge variant="secondary">Upcoming</Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {new Date(event.date).toLocaleDateString()} • {event.venue}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Tickets Sold</span>
                  <span className="font-medium">
                    {event.current_attendees || 0}/{event.max_attendees || 100}
                  </span>
                </div>
                <Progress value={soldPercentage} className="h-2" />
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    ${(Number(event.price) * (event.current_attendees || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>{event.current_attendees || 0} attendees</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!isPast && onManagePricing && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onManagePricing(event.id)}
                >
                  Manage Pricing
                </Button>
                <Button variant="outline" size="sm">
                  Edit Event
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/events/${event.id}`)}
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

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { useTickets } from "@/hooks/useTickets";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const MyRSVPsTab = () => {
  const navigate = useNavigate();
  const { tickets } = useTickets();

  // Filter tickets by event date
  const now = new Date();
  const futureTickets = tickets.filter(ticket => 
    ticket.events?.date && new Date(ticket.events.date) >= now
  );
  const pastTickets = tickets.filter(ticket => 
    ticket.events?.date && new Date(ticket.events.date) < now
  );

  const renderTicketList = (ticketList: typeof tickets, emptyMessage: string) => {
    if (ticketList.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-600 mb-4">
            Explore events and purchase tickets to see them here!
          </p>
          <Button
            onClick={() => navigate("/events")}
            type="button"
            aria-label="Browse Events"
          >
            Browse Events
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {ticketList.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={ticket.events?.image_url || "/placeholder.svg"}
                  alt={sanitizeText(ticket.events?.title) || "Event poster"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={64}
                  height={64}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {sanitizeText(ticket.events?.title)}
                </h3>
                <p className="text-sm text-gray-600">
                  {ticket.events?.date
                    ? new Date(ticket.events.date).toLocaleDateString()
                    : ""}
                  {ticket.events?.venue && (
                    <> • {sanitizeText(ticket.events.venue)}</>
                  )}
                </p>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span className="text-green-600">
                    {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                  </span>
                  <span className="text-purple-600">
                    ${ticket.total_price}
                  </span>
                  <Badge 
                    variant={ticket.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ticket.qr_scanned_at && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Attended
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${ticket.event_id}`)}
                type="button"
                aria-label={`View Event: ${sanitizeText(ticket.events?.title)}`}
              >
                View Event
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" aria-hidden="true" />
          My RSVPs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming ({futureTickets.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Past ({pastTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {renderTicketList(futureTickets, "No upcoming events")}
          </TabsContent>

          <TabsContent value="past">
            {renderTicketList(pastTickets, "No past events")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MyRSVPsTab;
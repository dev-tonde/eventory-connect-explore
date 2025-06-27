
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Ticket } from "lucide-react";
import { useTickets } from "@/hooks/useTickets";

const TicketsTab = () => {
  const navigate = useNavigate();
  const { tickets } = useTickets();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          My Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't purchased any tickets yet. Explore events to get started!
            </p>
            <Button onClick={() => navigate("/events")}>
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={ticket.events?.image_url || "/placeholder.svg"}
                      alt={ticket.events?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{ticket.events?.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(ticket.events?.date || "").toLocaleDateString()} •{" "}
                      {ticket.events?.venue}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-green-600">
                        {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}
                      </span>
                      <span className="text-purple-600">
                        ${ticket.total_price}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/events/${ticket.event_id}`)}
                >
                  View Event
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketsTab;

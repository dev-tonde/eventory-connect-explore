import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const SavedEventsTab = () => {
  const navigate = useNavigate();
  const { favorites, isLoading: favoritesLoading } = useFavorites();

  // Fetch full event details for favorites
  const { data: savedEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["saved-events", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", favorites)
        .eq("is_active", true)
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: favorites.length > 0,
  });

  const isLoading = favoritesLoading || eventsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />
          Saved Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading saved events...</p>
          </div>
        ) : savedEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved events yet
            </h3>
            <p className="text-gray-600 mb-4">
              Save events you're interested in to see them here!
            </p>
            <Button
              onClick={() => navigate("/events")}
              type="button"
              aria-label="Browse Events"
            >
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={event.image_url || "/placeholder.svg"}
                      alt={sanitizeText(event.title) || "Event poster"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={64}
                      height={64}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {sanitizeText(event.title)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : ""}
                      {event.venue && (
                        <> • {sanitizeText(event.venue)}</>
                      )}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-green-600">
                        {event.category}
                      </span>
                      <span className="text-purple-600">
                        ${event.price}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/events/${event.id}`)}
                  type="button"
                  aria-label={`View Event: ${sanitizeText(event.title)}`}
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

export default SavedEventsTab;
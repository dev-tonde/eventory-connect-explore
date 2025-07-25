import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface RelatedEventsCarouselProps {
  currentEventId: string;
  category: string;
  limit?: number;
}

export const RelatedEventsCarousel: React.FC<RelatedEventsCarouselProps> = ({
  currentEventId,
  category,
  limit = 4,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const { data: relatedEvents, isLoading } = useQuery({
    queryKey: ["relatedEvents", currentEventId, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          date,
          time,
          venue,
          price,
          image_url,
          category,
          current_attendees,
          max_attendees
        `)
        .eq("category", category)
        .eq("is_active", true)
        .neq("id", currentEventId)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });

  const handlePrevious = () => {
    if (relatedEvents) {
      setCurrentIndex((prev) => 
        prev === 0 ? Math.max(0, relatedEvents.length - 2) : prev - 1
      );
    }
  };

  const handleNext = () => {
    if (relatedEvents) {
      setCurrentIndex((prev) => 
        prev >= relatedEvents.length - 2 ? 0 : prev + 1
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Loading related events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!relatedEvents || relatedEvents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Related Events</h3>
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No related events found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Related Events</h3>
          {relatedEvents.length > 2 && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex >= relatedEvents.length - 2}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {relatedEvents.slice(currentIndex, currentIndex + 2).map((event) => (
            <Link key={event.id} to={`/event/${event.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={event.image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {event.title}
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at {event.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-medium text-purple-600">
                          {event.price === 0 ? "Free" : `R${event.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {relatedEvents.length > 2 && (
          <div className="flex justify-center mt-4">
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(relatedEvents.length / 2) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / 2) === index
                      ? "bg-purple-600"
                      : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentIndex(index * 2)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
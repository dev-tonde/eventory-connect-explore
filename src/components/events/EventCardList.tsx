import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";

interface EventCardListProps {
  events: Event[];
  searchTerm?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const ITEMS_PER_PAGE = 12;

const EventCardList = ({ 
  events, 
  searchTerm = "",
  isLoading = false,
  hasMore = false,
  onLoadMore
}: EventCardListProps) => {
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset when events change
  useEffect(() => {
    setDisplayedEvents(events.slice(0, ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [events]);

  // Infinite scroll implementation
  const loadMoreEvents = useCallback(() => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    if (startIndex < events.length) {
      setDisplayedEvents(prev => [...prev, ...events.slice(startIndex, endIndex)]);
      setCurrentPage(nextPage);
    } else if (onLoadMore && hasMore) {
      onLoadMore();
    }
  }, [currentPage, events, onLoadMore, hasMore]);

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMoreEvents();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreEvents]);

  // Highlight search terms in text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
        part
    );
  };

  if (events.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Calendar className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No events found
        </h3>
        <p className="text-gray-600">
          {searchTerm ? 
            "Try adjusting your search criteria or clear the filters." :
            "No events are currently available."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      {events.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {displayedEvents.length} of {events.length} events
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents.map((event) => (
          <Link key={event.id} to={`/event/${event.id}`}>
            <Card className="hover:shadow-lg transition-shadow group cursor-pointer h-full">
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                    loading="lazy"
                  />
                </div>
                <Badge className="absolute top-2 right-2 bg-primary">
                  {event.category}
                </Badge>
                {Number(event.price) === 0 && (
                  <Badge className="absolute top-2 left-2 bg-green-600">
                    Free
                  </Badge>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {highlightText(event.title, searchTerm)}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {highlightText(event.description || "", searchTerm)}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-2 text-sm text-muted-foreground mb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">
                      {highlightText(event.location || "", searchTerm)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attendeeCount || 0} attending</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    {Number(event.price) === 0
                      ? "Free"
                      : `R${Number(event.price).toFixed(2)}`}
                  </span>
                  <Button
                    size="sm"
                    className="group-hover:bg-primary/90 transition-colors"
                    tabIndex={-1}
                  >
                    View Details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Load More Button / Infinite Scroll Indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && displayedEvents.length < events.length && (
        <div className="flex justify-center py-8">
          <Button onClick={loadMoreEvents} variant="outline" size="lg">
            Load More Events
          </Button>
        </div>
      )}

      {hasMore && !isLoading && displayedEvents.length === events.length && (
        <div className="flex justify-center py-8">
          <Button onClick={onLoadMore} variant="outline" size="lg">
            <Loader2 className="h-4 w-4 mr-2" />
            Load More from Server
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventCardList;
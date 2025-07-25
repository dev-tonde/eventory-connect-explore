import { useState, useMemo } from "react";
import { useOptimizedEvents } from "@/hooks/useOptimizedEvents";
import { useMetadata } from "@/hooks/useMetadata";
import EventsFilterBar from "@/components/events/EventsFilterBar";
import EventCardList from "@/components/events/EventCardList";
import MapboxComponent from "@/components/maps/MapboxComponent";
import { Event } from "@/types/event";

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  });

  const { events, isLoading } = useOptimizedEvents();

  // Set SEO metadata for events page
  useMetadata({
    title: "All Events | Eventory - Find Amazing Events Near You",
    description: `Discover ${events.length}+ amazing events. Find concerts, conferences, workshops, meetups and more. Browse by category, location, and date.`,
    keywords:
      "events, find events, event listings, concerts, conferences, workshops, meetups, community events, event search",
    type: "website",
  });

  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !filters.search ||
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (event.description || "").toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category ||
        event.category.toLowerCase() === filters.category.toLowerCase();

      const matchesLocation =
        !filters.location ||
        (event.location || "").toLowerCase().includes(filters.location.toLowerCase()) ||
        (event.address || "").toLowerCase().includes(filters.location.toLowerCase());

      const matchesDateFrom = 
        !filters.dateFrom ||
        new Date(event.date) >= filters.dateFrom;

      const matchesDateTo =
        !filters.dateTo ||
        new Date(event.date) <= filters.dateTo;

      return matchesSearch && matchesCategory && matchesLocation && matchesDateFrom && matchesDateTo;
    });
  }, [events, filters]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Events
          </h1>
          <p className="text-gray-600">
            Find amazing events happening around you ({events.length} events
            available)
          </p>
        </div>

        {/* Enhanced Filter Bar */}
        <EventsFilterBar onFiltersChange={setFilters} />

        {/* Map Section */}
        <div className="mb-8">
          <MapboxComponent
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
            className="w-full h-96"
          />
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {/* Event Card List with Infinite Scroll */}
        <EventCardList
          events={filteredEvents}
          searchTerm={filters.search}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Events;
// This code defines an Events page that allows users to search and filter events by category, location, and keywords. It displays a list of events with details like title, description, date, time, location, and price. The page also includes a loading state while fetching events and handles cases where no events match the search criteria.

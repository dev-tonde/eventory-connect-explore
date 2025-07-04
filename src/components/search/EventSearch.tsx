import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useOptimizedEventSearch } from "@/hooks/useOptimizedEventSearch";

// Defensive: sanitize text for display (future-proofing for dynamic data)
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const EventSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const { events, isLoading } = useOptimizedEventSearch({
    searchTerm: searchTerm || undefined,
    category: selectedCategory || undefined,
    location: selectedLocation || undefined,
    priceRange:
      priceRange.min > 0 || priceRange.max < 1000 ? priceRange : undefined,
  });

  const categories = [
    "Music",
    "Technology",
    "Food & Drink",
    "Business",
    "Arts & Culture",
    "Health & Wellness",
    "Sports",
    "Entertainment",
  ];

  const locations = [
    "Cape Town",
    "Johannesburg",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Stellenbosch",
    "Bloemfontein",
    "New York",
    "San Francisco",
    "Los Angeles",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search events"
              maxLength={100}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedLocation("");
              setPriceRange({ min: 0, max: 1000 });
            }}
            variant="outline"
            type="button"
            aria-label="Clear Filters"
          >
            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-lg transition-shadow group"
            >
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={sanitizeText(event.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                    loading="lazy"
                    width={400}
                    height={225}
                  />
                </div>
                <Badge className="absolute top-2 right-2 bg-purple-600">
                  {sanitizeText(event.category)}
                </Badge>
              </div>

              <Link to={`/events/${encodeURIComponent(event.id)}`}>
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
                    {sanitizeText(event.title)}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {sanitizeText(event.description)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {event.date
                          ? new Date(event.date).toLocaleDateString()
                          : ""}
                        {event.time && ` at ${sanitizeText(event.time)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span className="line-clamp-1">
                        {sanitizeText(event.location)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      <span>{event.attendeeCount} attending</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-purple-600">
                      {event.price === 0 ? "Free" : `$${event.price}`}
                    </span>
                    <Button
                      size="sm"
                      className="group-hover:bg-purple-700 transition-colors"
                      type="button"
                      aria-label={`View details for ${sanitizeText(
                        event.title
                      )}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or clear the filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSearch;
// This component provides a search interface for events, allowing users to filter by category, location, and price range.
// It uses a custom hook `useOptimizedEventSearch` to fetch and display events based on the search criteria.

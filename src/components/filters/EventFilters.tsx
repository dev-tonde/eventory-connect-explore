import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, MapPin, Calendar, DollarSign, X } from "lucide-react";
import { EventFilters as EventFiltersType } from "@/types/event";

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
  onClearFilters: () => void;
}

const categories = [
  "Music",
  "Technology",
  "Food",
  "Sports",
  "Arts",
  "Business",
  "Education",
  "Health",
];

const sanitizeInput = (input: string) => input.replace(/[<>]/g, ""); // Basic sanitization for location input

const EventFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: EventFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<EventFiltersType>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const hasActiveFilters =
    filters.category ||
    filters.location ||
    (filters.priceRange &&
      (filters.priceRange.min > 0 || filters.priceRange.max < 1000)) ||
    (filters.dateRange && (filters.dateRange.start || filters.dateRange.end));

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls="event-filters-content"
            >
              {isExpanded ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4" id="event-filters-content">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category || "all"}
              onChange={(e) =>
                updateFilters({
                  category:
                    e.target.value === "all" ? undefined : e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Category"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </label>
            <Input
              value={filters.location || ""}
              onChange={(e) =>
                updateFilters({
                  location: sanitizeInput(e.target.value) || undefined,
                })
              }
              placeholder="Enter city or venue"
              aria-label="Location"
              maxLength={80}
              autoComplete="off"
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      start: e.target.value,
                      end: filters.dateRange?.end || "",
                    },
                  })
                }
                placeholder="Start date"
                aria-label="Start date"
              />
              <Input
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      start: filters.dateRange?.start || "",
                      end: e.target.value,
                    },
                  })
                }
                placeholder="End date"
                aria-label="End date"
              />
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Price Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                value={filters.priceRange?.min ?? ""}
                onChange={(e) =>
                  updateFilters({
                    priceRange: {
                      min: parseInt(e.target.value) || 0,
                      max: filters.priceRange?.max ?? 1000,
                    },
                  })
                }
                placeholder="Min price"
                aria-label="Min price"
              />
              <Input
                type="number"
                min="0"
                value={filters.priceRange?.max ?? ""}
                onChange={(e) =>
                  updateFilters({
                    priceRange: {
                      min: filters.priceRange?.min ?? 0,
                      max: parseInt(e.target.value) || 1000,
                    },
                  })
                }
                placeholder="Max price"
                aria-label="Max price"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFilters({
                    priceRange: { min: 0, max: 0 },
                  })
                }
                aria-label="Free only"
              >
                Free Only
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EventFilters;
// This component provides a set of filters for events, allowing users to filter by category, location, date range, and price range.
// It includes a button to clear all filters and toggle the visibility of the filter options.

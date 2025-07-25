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
import { Calendar, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useSearchParams } from "react-router-dom";

interface EventsFilterBarProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    location: string;
    dateFrom: Date | null;
    dateTo: Date | null;
  }) => void;
}

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
];

const EventsFilterBar = ({ onFiltersChange }: EventsFilterBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");
  const [dateFrom, setDateFrom] = useState<Date | null>(
    searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : null
  );

  const updateFilters = () => {
    const filters = {
      search: searchTerm,
      category: selectedCategory,
      location: selectedLocation,
      dateFrom,
      dateTo,
    };

    // Update URL params
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (selectedCategory) newParams.set("category", selectedCategory);
    if (selectedLocation) newParams.set("location", selectedLocation);
    if (dateFrom) newParams.set("dateFrom", dateFrom.toISOString());
    if (dateTo) newParams.set("dateTo", dateTo.toISOString());
    
    setSearchParams(newParams);
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedLocation("");
    setDateFrom(null);
    setDateTo(null);
    setSearchParams(new URLSearchParams());
    onFiltersChange({
      search: "",
      category: "",
      location: "",
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filter Events</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateFilters()}
            className="pl-10"
            aria-label="Search events"
          />
        </div>

        {/* Category Filter */}
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

        {/* Location Filter */}
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger>
            <MapPin className="h-4 w-4 mr-2" />
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

        {/* Date From Filter */}
        <DatePicker
          selected={dateFrom}
          onSelect={setDateFrom}
          placeholder="From Date"
          triggerProps={{
            className: "w-full",
            children: (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {dateFrom ? dateFrom.toLocaleDateString() : "From Date"}
              </div>
            ),
          }}
        />

        {/* Date To Filter */}
        <DatePicker
          selected={dateTo}
          onSelect={setDateTo}
          placeholder="To Date"
          triggerProps={{
            className: "w-full",
            children: (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {dateTo ? dateTo.toLocaleDateString() : "To Date"}
              </div>
            ),
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <Button 
          onClick={clearFilters} 
          variant="outline"
          size="sm"
        >
          Clear All
        </Button>
        <Button 
          onClick={updateFilters}
          size="sm"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default EventsFilterBar;
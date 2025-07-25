import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Filter, X, MapPin, DollarSign, Baby } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

export interface FilterState {
  category: string;
  isFree: boolean;
  isFamilyFriendly: boolean;
}

const categories = [
  "All",
  "Music",
  "Technology", 
  "Food & Drink",
  "Business",
  "Arts & Culture",
  "Health & Wellness",
  "Sports",
  "Entertainment"
];

const FilterBar = ({ onFiltersChange, activeFilters }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...activeFilters, ...updates };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: "All",
      isFree: false,
      isFamilyFriendly: false
    });
  };

  const hasActiveFilters = 
    activeFilters.category !== "All" || 
    activeFilters.isFree || 
    activeFilters.isFamilyFriendly;

  const activeFilterCount = [
    activeFilters.category !== "All",
    activeFilters.isFree,
    activeFilters.isFamilyFriendly
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-4 ${!isExpanded ? "hidden lg:block" : "block"}`}>
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeFilters.category === category ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ category })}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Toggle Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={activeFilters.isFree}
              onPressedChange={(pressed) => updateFilters({ isFree: pressed })}
              aria-label="Show only free events"
              className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Free Events
            </Toggle>
          </div>

          <div className="flex items-center space-x-2">
            <Toggle
              pressed={activeFilters.isFamilyFriendly}
              onPressedChange={(pressed) => updateFilters({ isFamilyFriendly: pressed })}
              aria-label="Show only family-friendly events"
              className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
            >
              <Baby className="h-4 w-4 mr-1" />
              Family Friendly
            </Toggle>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-gray-600">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
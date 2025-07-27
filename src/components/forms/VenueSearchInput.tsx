import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import { MapPin, Loader2 } from 'lucide-react';

interface VenueSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const VenueSearchInput = ({
  value,
  onChange,
  onAddressSelect,
  label = "Venue Name",
  placeholder = "Search for a venue...",
  required = false
}: VenueSearchInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, isLoading, searchVenues } = useVenueSearch();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchVenues(searchQuery);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchVenues]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: any) => {
    onChange(suggestion.venue_name);
    onAddressSelect(suggestion.address);
    setSearchQuery(suggestion.venue_name);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Label htmlFor="venue-search">{label} {required && "*"}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="venue-search"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="pr-10"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium text-sm">{suggestion.venue_name}</div>
              <div className="text-xs text-gray-600">{suggestion.address}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
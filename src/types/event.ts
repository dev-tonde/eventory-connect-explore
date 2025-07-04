/**
 * Event type definition.
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // ISO time string (HH:mm or HH:mm:ss)
  location: string;
  address: string;
  price: number;
  category: string;
  image: string; // URL to event image
  organizer: string;
  attendeeCount: number;
  maxAttendees: number;
  tags: string[];
}

/**
 * Filters for querying events.
 */
export interface EventFilters {
  category?: string;
  dateRange?: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  search?: string; // Optional: keyword search
}

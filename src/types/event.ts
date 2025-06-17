
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  category: string;
  image: string;
  organizer: string;
  attendeeCount: number;
  maxAttendees: number;
  tags: string[];
}

export interface EventFilters {
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VenueSuggestion {
  id: string;
  venue_name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

export const useVenueSearch = () => {
  const [suggestions, setSuggestions] = useState<VenueSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchVenues = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('venue_suggestions')
        .select('*')
        .or(`venue_name.ilike.%${query}%,address.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error searching venues:', error);
      toast({
        title: "Error",
        description: "Failed to search venues",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVenueSuggestion = async (venue: Omit<VenueSuggestion, 'id'>) => {
    try {
      const { error } = await supabase
        .from('venue_suggestions')
        .insert(venue);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding venue suggestion:', error);
    }
  };

  return {
    suggestions,
    isLoading,
    searchVenues,
    addVenueSuggestion
  };
};
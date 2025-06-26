
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("favorites")
        .select("event_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(fav => fav.event_id);
    },
    enabled: !!user,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error("User not authenticated");

      const isFavorited = favorites.includes(eventId);

      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("event_id", eventId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert([{
            user_id: user.id,
            event_id: eventId,
          }]);

        if (error) throw error;
      }

      return !isFavorited;
    },
    onSuccess: (isFavorited, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast({
        title: isFavorited ? "Added to Favorites" : "Removed from Favorites",
        description: isFavorited 
          ? "Event has been added to your favorites." 
          : "Event has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    favorites,
    isLoading,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isToggling: toggleFavoriteMutation.isPending,
  };
};

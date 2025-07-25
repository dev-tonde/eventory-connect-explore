import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EventLineup, CurrentPerformer } from "@/types/lineup";

export const useEventLineup = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch lineup for an event
  const { data: lineup, isLoading } = useQuery({
    queryKey: ["event-lineup", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from("event_lineup")
        .select("*")
        .eq("event_id", eventId)
        .order("start_time");

      if (error) throw error;
      return data as EventLineup[];
    },
    enabled: !!eventId,
  });

  // Get current performer
  const { data: currentPerformer, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ["current-performer", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase.rpc("get_current_performer", {
        event_uuid: eventId,
      });

      if (error) throw error;
      return data?.[0] as CurrentPerformer || null;
    },
    enabled: !!eventId,
    refetchInterval: 30000, // Refetch every 30 seconds during event
  });

  // Add lineup item
  const addLineupMutation = useMutation({
    mutationFn: async (lineupData: Omit<EventLineup, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("event_lineup")
        .insert(lineupData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-lineup", eventId] });
      toast({
        title: "Performer Added",
        description: "Successfully added to lineup",
      });
    },
    onError: (error) => {
      console.error("Error adding lineup item:", error);
      toast({
        title: "Error",
        description: "Failed to add performer to lineup",
        variant: "destructive",
      });
    },
  });

  // Update lineup item
  const updateLineupMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<EventLineup> & { id: string }) => {
      const { data, error } = await supabase
        .from("event_lineup")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-lineup", eventId] });
      toast({
        title: "Lineup Updated",
        description: "Successfully updated performer details",
      });
    },
    onError: (error) => {
      console.error("Error updating lineup item:", error);
      toast({
        title: "Error",
        description: "Failed to update lineup",
        variant: "destructive",
      });
    },
  });

  // Delete lineup item
  const deleteLineupMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("event_lineup")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-lineup", eventId] });
      toast({
        title: "Performer Removed",
        description: "Successfully removed from lineup",
      });
    },
    onError: (error) => {
      console.error("Error deleting lineup item:", error);
      toast({
        title: "Error",
        description: "Failed to remove performer",
        variant: "destructive",
      });
    },
  });

  return {
    lineup,
    currentPerformer,
    isLoading,
    isLoadingCurrent,
    addLineup: addLineupMutation.mutate,
    updateLineup: updateLineupMutation.mutate,
    deleteLineup: deleteLineupMutation.mutate,
    isAdding: addLineupMutation.isPending,
    isUpdating: updateLineupMutation.isPending,
    isDeleting: deleteLineupMutation.isPending,
  };
};
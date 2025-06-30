
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WaitlistEntry {
  id: string;
  event_id: string;
  user_id: string;
  position: number;
  notified: boolean;
  created_at: string;
}

export const useWaitlist = (eventId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is on waitlist
  const { data: waitlistEntry, isLoading } = useQuery({
    queryKey: ["waitlist-entry", eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("event_waitlist")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as WaitlistEntry | null;
    },
    enabled: !!user && !!eventId,
  });

  // Get waitlist count
  const { data: waitlistCount = 0 } = useQuery({
    queryKey: ["waitlist-count", eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("event_waitlist")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventId,
  });

  // Join waitlist mutation
  const joinWaitlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("event_waitlist")
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-entry", eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["waitlist-count", eventId] });
      toast({
        title: "Added to Waitlist",
        description: "You'll be notified when a spot becomes available!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Leave waitlist mutation
  const leaveWaitlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("event_waitlist")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist-entry", eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["waitlist-count", eventId] });
      toast({
        title: "Removed from Waitlist",
        description: "You've been removed from the event waitlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to leave waitlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    isOnWaitlist: !!waitlistEntry,
    waitlistEntry,
    waitlistCount,
    waitlistPosition: waitlistEntry?.position || 0,
    isLoading,
    joinWaitlist: joinWaitlistMutation.mutate,
    leaveWaitlist: leaveWaitlistMutation.mutate,
    isJoining: joinWaitlistMutation.isPending,
    isLeaving: leaveWaitlistMutation.isPending,
  };
};

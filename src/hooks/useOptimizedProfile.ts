/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Custom hook to fetch and manage the current user's profile with caching and utilities.
 */
export const useOptimizedProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
  });

  /**
   * Invalidate the cached profile for the current user.
   */
  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
  };

  /**
   * Update the cached profile for the current user.
   */
  const updateProfileCache = (newData: any) => {
    queryClient.setQueryData(["profile", user?.id], newData);
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    invalidateProfile,
    updateProfileCache,
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface GeneratedPoster {
  id: string;
  event_id: string;
  user_id: string;
  prompt: string;
  image_url?: string;
  image_data?: string;
  dimensions: {
    width: number;
    height: number;
  };
  social_platform?: string;
  status: "generating" | "completed" | "failed";
  created_at: string;
}

interface GeneratePosterRequest {
  eventId: string;
  prompt: string;
  dimensions: {
    width: number;
    height: number;
  };
  socialPlatform?: string;
  style?: string;
}

/**
 * Custom hook for AI poster generation and management.
 */
export const useAIPosterGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's generated posters
  const { data: posters = [], isLoading } = useQuery<GeneratedPoster[]>({
    queryKey: ["generated-posters", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("generated_posters")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((poster) => ({
        ...poster,
        dimensions: poster.dimensions as { width: number; height: number },
      })) as GeneratedPoster[];
    },
    enabled: !!user,
  });

  // Generate new poster
  const generatePosterMutation = useMutation({
    mutationFn: async (request: GeneratePosterRequest) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase.functions.invoke(
        "generate-ai-poster",
        {
          body: request,
          headers: {
            "user-id": user.id,
          },
        }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generated-posters", user?.id],
      });
      toast({
        title: "Poster Generated!",
        description: "Your AI-generated poster is ready for download.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description:
          error?.message || "Failed to generate poster. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete poster
  const deletePosterMutation = useMutation({
    mutationFn: async (posterId: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("generated_posters")
        .delete()
        .eq("id", posterId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generated-posters", user?.id],
      });
      toast({
        title: "Poster Deleted",
        description: "The poster has been removed from your collection.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error?.message || "Failed to delete poster.",
        variant: "destructive",
      });
    },
  });

  // Get poster by ID
  const getPosterById = (posterId: string) =>
    posters.find((poster) => poster.id === posterId);

  // Download poster utility
  const downloadPoster = (poster: GeneratedPoster) => {
    if (!poster.image_data && !poster.image_url) {
      toast({
        title: "Download Failed",
        description: "Poster data is not available.",
        variant: "destructive",
      });
      return;
    }
    const link = document.createElement("a");
    link.href = poster.image_data || poster.image_url!;
    link.download = `poster-${poster.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    posters,
    isLoading,
    generatePoster: generatePosterMutation.mutate,
    isGenerating: generatePosterMutation.isPending,
    deletePoster: deletePosterMutation.mutate,
    isDeleting: deletePosterMutation.isPending,
    getPosterById,
    downloadPoster,
  };
};

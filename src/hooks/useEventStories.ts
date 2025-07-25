import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateStoryData {
  eventId: string;
  file: File;
  caption?: string;
  isPinned?: boolean;
}

interface Story {
  id: string;
  event_id: string;
  user_id: string;
  file_url: string;
  file_type: 'image' | 'video';
  caption?: string;
  expires_at: string;
  is_pinned: boolean;
  display_order: number;
  created_at: string;
  views_count: number;
}

export const useEventStories = (eventId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch stories for an event
  const { data: stories, isLoading } = useQuery({
    queryKey: ['event-stories', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_stories')
        .select('*')
        .eq('event_id', eventId)
        .gt('expires_at', new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Story[];
    },
    enabled: !!eventId,
  });

  // Upload story file to storage
  const uploadStoryFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `stories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('event-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async ({ eventId, file, caption, isPinned = false }: CreateStoryData) => {
      if (!user) throw new Error('User not authenticated');

      // Upload file
      const fileUrl = await uploadStoryFile(file);
      
      // Determine file type
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Create story record
      const { data, error } = await supabase
        .from('event_stories')
        .insert({
          event_id: eventId,
          user_id: user.id,
          file_url: fileUrl,
          file_type: fileType,
          caption,
          is_pinned: isPinned,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-stories'] });
      toast({
        title: 'Story Uploaded',
        description: 'Your story has been shared successfully!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: `Failed to upload story: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update story views
  const incrementViewsMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from('event_stories')
        .update({ views_count: 1 })
        .eq('id', storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-stories'] });
    },
  });

  // Delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-stories'] });
      toast({
        title: 'Story Deleted',
        description: 'Your story has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Delete Failed',
        description: `Failed to delete story: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    stories,
    isLoading,
    createStory: createStoryMutation.mutate,
    isCreating: createStoryMutation.isPending,
    incrementViews: incrementViewsMutation.mutate,
    deleteStory: deleteStoryMutation.mutate,
    isDeleting: deleteStoryMutation.isPending,
  };
};
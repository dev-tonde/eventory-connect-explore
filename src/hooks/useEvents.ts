
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/types/event";

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("is_active", true)
        .order("date", { ascending: true });

      if (error) throw error;
      
      return data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        location: event.venue,
        address: event.address || "",
        price: Number(event.price),
        category: event.category,
        image: event.image_url || "/placeholder.svg",
        organizer: event.profiles 
          ? `${event.profiles.first_name} ${event.profiles.last_name}`.trim()
          : 'Unknown Organizer',
        attendeeCount: event.current_attendees || 0,
        maxAttendees: event.max_attendees || 100,
        tags: event.tags || []
      })) as Event[];
    },
  });

  const uploadEventImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${(await supabase.auth.getUser()).data.user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<Event> & { imageFile?: File }) => {
      const { imageFile, ...restEventData } = eventData;
      let imageUrl = eventData.image;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile);
      }

      const { data, error } = await supabase
        .from("events")
        .insert([{
          title: restEventData.title,
          description: restEventData.description,
          date: restEventData.date,
          time: restEventData.time,
          venue: restEventData.location,
          address: restEventData.address,
          price: restEventData.price,
          category: restEventData.category,
          image_url: imageUrl,
          max_attendees: restEventData.maxAttendees,
          tags: restEventData.tags,
          organizer_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Event creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    events,
    isLoading,
    createEvent: createEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    uploadEventImage,
  };
};

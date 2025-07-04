import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/types/event";

/**
 * Custom hook to fetch, create, and upload images for events.
 */
export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active, upcoming events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          id,
          title,
          description,
          date,
          time,
          venue,
          address,
          price,
          category,
          image_url,
          current_attendees,
          max_attendees,
          tags,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name
          )
        `
        )
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(50);

      if (error) throw error;

      return (data || []).map((event) => ({
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
          : "Unknown Organizer",
        attendeeCount: event.current_attendees || 0,
        maxAttendees: event.max_attendees || 100,
        tags: event.tags || [],
      })) as Event[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  /**
   * Uploads an event image to Supabase Storage and returns the public URL.
   */
  const uploadEventImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not authenticated");
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /**
   * Mutation to create a new event.
   */
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<Event> & { imageFile?: File }) => {
      const { imageFile, ...restEventData } = eventData;
      let imageUrl = eventData.image;

      // Upload image if provided
      if (imageFile) {
        try {
          imageUrl = await uploadEventImage(imageFile);
        } catch (error) {
          console.error("Image upload failed:", error);
          imageUrl = "/placeholder.svg";
        }
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("events")
        .insert([
          {
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
            organizer_id: user.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-events"] });
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

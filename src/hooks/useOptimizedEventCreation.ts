
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/types/event";

interface EnhancedEventData extends Partial<Event> {
  imageFile?: File;
  // Enhanced metadata for better SEO and discoverability
  metaDescription?: string;
  seoKeywords?: string[];
  socialMediaLinks?: Record<string, string>;
  accessibilityInfo?: string;
  parkingInfo?: string;
  publicTransportInfo?: string;
  ageRestrictions?: string;
  dresscode?: string;
  languages?: string[];
}

export const useOptimizedEventCreation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadEventImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createOptimizedEvent = useMutation({
    mutationFn: async (eventData: EnhancedEventData) => {
      const { imageFile, ...restEventData } = eventData;
      let imageUrl = eventData.image;

      // Upload image if provided
      if (imageFile) {
        try {
          imageUrl = await uploadEventImage(imageFile);
        } catch (error) {
          console.error('Image upload failed:', error);
          imageUrl = "/placeholder.svg";
        }
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Generate enhanced metadata for better SEO
      const enhancedMetadata = {
        metaDescription: eventData.metaDescription || 
          `${eventData.title} - ${eventData.description?.substring(0, 120)}... Join us on ${eventData.date} at ${eventData.location}`,
        seoKeywords: [
          eventData.category?.toLowerCase(),
          eventData.location?.toLowerCase(),
          ...(eventData.tags || []),
          ...(eventData.seoKeywords || []),
          'event', 'community', 'tickets'
        ].filter(Boolean),
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": eventData.title,
          "description": eventData.description,
          "startDate": `${eventData.date}T${eventData.time}`,
          "location": {
            "@type": "Place",
            "name": eventData.location,
            "address": eventData.address
          },
          "offers": {
            "@type": "Offer",
            "price": eventData.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "organizer": {
            "@type": "Organization",
            "name": "Eventory"
          }
        }
      };

      const { data, error } = await supabase
        .from("events")
        .insert([{
          title: restEventData.title,
          description: restEventData.description,
          date: restEventData.date,
          time: restEventData.time,
          venue: restEventData.location,
          address: restEventData.address,
          price: restEventData.price || 0,
          category: restEventData.category,
          image_url: imageUrl,
          max_attendees: restEventData.maxAttendees || 100,
          tags: restEventData.tags || [],
          organizer_id: user.user.id,
          social_links: eventData.socialMediaLinks || {},
          // Store enhanced metadata in a JSONB field for better performance
          metadata: {
            seo: enhancedMetadata,
            accessibility: eventData.accessibilityInfo,
            parking: eventData.parkingInfo,
            transport: eventData.publicTransportInfo,
            ageRestrictions: eventData.ageRestrictions,
            dresscode: eventData.dresscode,
            languages: eventData.languages
          }
        }])
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name,
            username
          )
        `)
        .single();

      if (error) throw error;

      // Track event creation for analytics
      await supabase.from('event_analytics').insert({
        event_id: data.id,
        metric_type: 'created',
        user_id: user.user.id
      });

      return data;
    },
    onSuccess: (data) => {
      // Invalidate all event-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-events"] });
      queryClient.invalidateQueries({ queryKey: ["user-events"] });
      
      toast({
        title: "Event Created Successfully",
        description: `${data.title} has been created and is now live!`,
      });
    },
    onError: (error: any) => {
      console.error("Event creation error:", error);
      toast({
        title: "Event Creation Failed",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    createEvent: createOptimizedEvent.mutate,
    isCreating: createOptimizedEvent.isPending,
    uploadEventImage,
  };
};

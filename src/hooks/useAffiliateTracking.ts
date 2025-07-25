import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useToast } from '@/hooks/use-toast';

interface AffiliateLink {
  id: string;
  event_id: string;
  organizer_id: string;
  promoter_name: string;
  promoter_email?: string;
  affiliate_code: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  notes?: string;
}

interface AffiliateConversion {
  id: string;
  affiliate_link_id: string;
  event_id: string;
  user_id?: string;
  ticket_id?: string;
  conversion_type: 'rsvp' | 'ticket_purchase' | 'registration';
  conversion_value: number;
  commission_amount: number;
  commission_status: 'pending' | 'approved' | 'paid' | 'rejected';
  converted_at: string;
  guest_email?: string;
  guest_name?: string;
}

export const useAffiliateLinks = (eventId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch affiliate links for an event
  const { data: affiliateLinks, isLoading } = useQuery({
    queryKey: ['affiliate-links', eventId],
    queryFn: async () => {
      if (!eventId || !user) return [];
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('event_id', eventId)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AffiliateLink[];
    },
    enabled: !!eventId && !!user,
  });

  // Create affiliate link mutation
  const createAffiliateMutation = useMutation({
    mutationFn: async (affiliateData: {
      promoter_name: string;
      promoter_email?: string;
      commission_rate: number;
      notes?: string;
    }) => {
      if (!user || !eventId) throw new Error('Missing required data');

      // Generate affiliate code - the database will handle this
      const { error } = await supabase.rpc('generate_affiliate_code');
      if (error) console.warn('Failed to pre-generate code:', error);

      const { error: insertError } = await supabase
        .from('affiliate_links')
        .insert({
          event_id: eventId,
          organizer_id: user.id,
          affiliate_code: 'TEMP_' + Date.now(), // Temporary, will be overridden by DB
          ...affiliateData,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] });
      toast({
        title: 'Affiliate Link Created',
        description: 'New affiliate link has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed',
        description: `Failed to create affiliate link: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Toggle affiliate link status
  const toggleAffiliateMutation = useMutation({
    mutationFn: async ({ linkId, isActive }: { linkId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('affiliate_links')
        .update({ is_active: !isActive })
        .eq('id', linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] });
      toast({
        title: 'Status Updated',
        description: 'Affiliate link status has been updated.',
      });
    },
  });

  return {
    affiliateLinks,
    isLoading,
    createAffiliate: createAffiliateMutation.mutate,
    isCreating: createAffiliateMutation.isPending,
    toggleAffiliate: toggleAffiliateMutation.mutate,
    isToggling: toggleAffiliateMutation.isPending,
  };
};

export const useAffiliateTracking = () => {
  const { toast } = useToast();

  // Track affiliate click
  const trackClickMutation = useMutation({
    mutationFn: async (clickData: {
      affiliate_code: string;
      event_id: string;
      referrer?: string;
      session_id?: string;
    }) => {
      // First, get the affiliate link ID
      const { data: affiliateLink } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('affiliate_code', clickData.affiliate_code)
        .eq('event_id', clickData.event_id)
        .eq('is_active', true)
        .single();

      if (!affiliateLink) return;

      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          affiliate_link_id: affiliateLink.id,
          event_id: clickData.event_id,
          referrer: clickData.referrer,
          session_id: clickData.session_id,
        });

      if (error) throw error;
    },
  });

  // Track affiliate conversion
  const trackConversionMutation = useMutation({
    mutationFn: async (conversionData: {
      affiliate_code: string;
      event_id: string;
      user_id?: string;
      ticket_id?: string;
      conversion_type: 'rsvp' | 'ticket_purchase' | 'registration';
      conversion_value: number;
      guest_email?: string;
      guest_name?: string;
    }) => {
      const { data, error } = await supabase
        .rpc('track_affiliate_conversion', {
          p_affiliate_code: conversionData.affiliate_code,
          p_event_id: conversionData.event_id,
          p_user_id: conversionData.user_id,
          p_ticket_id: conversionData.ticket_id,
          p_conversion_type: conversionData.conversion_type,
          p_conversion_value: conversionData.conversion_value,
          p_guest_email: conversionData.guest_email,
          p_guest_name: conversionData.guest_name,
        });

      if (error) throw error;
      return data;
    },
  });

  return {
    trackClick: trackClickMutation.mutate,
    trackConversion: trackConversionMutation.mutate,
    isTracking: trackClickMutation.isPending || trackConversionMutation.isPending,
  };
};

// Hook to get affiliate stats
export const useAffiliateStats = (affiliateLinkId?: string) => {
  return useQuery({
    queryKey: ['affiliate-stats', affiliateLinkId],
    queryFn: async () => {
      if (!affiliateLinkId) return null;
      
      const { data, error } = await supabase
        .rpc('get_affiliate_stats', { p_affiliate_link_id: affiliateLinkId });

      if (error) throw error;
      return data[0];
    },
    enabled: !!affiliateLinkId,
  });
};
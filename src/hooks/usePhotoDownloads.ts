import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhotoDownload {
  id: string;
  photo_id: string;
  event_id: string;
  download_type: 'standard' | 'high_res' | 'print_ready';
  guest_email?: string;
  guest_name?: string;
  downloaded_at: string;
  resolution?: string;
}

interface PrintOrder {
  id: string;
  photo_id: string;
  event_id: string;
  guest_email: string;
  guest_name: string;
  phone_number?: string;
  shipping_address: any;
  print_size: string;
  frame_type?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  tracking_number?: string;
  created_at: string;
}

export const usePhotoDownloads = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch photo downloads for an event
  const { data: downloads, isLoading } = useQuery({
    queryKey: ['photo-downloads', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('photo_downloads')
        .select('*')
        .eq('event_id', eventId)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      return data as PhotoDownload[];
    },
    enabled: !!eventId,
  });

  // Log download mutation
  const logDownloadMutation = useMutation({
    mutationFn: async (downloadData: {
      photo_id: string;
      event_id: string;
      download_type: 'standard' | 'high_res' | 'print_ready';
      guest_email?: string;
      guest_name?: string;
      resolution?: string;
    }) => {
      const { error } = await supabase
        .from('photo_downloads')
        .insert(downloadData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-downloads'] });
    },
  });

  return {
    downloads,
    isLoading,
    logDownload: logDownloadMutation.mutate,
    isLogging: logDownloadMutation.isPending,
  };
};

export const usePrintOrders = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch print orders for an event
  const { data: orders, isLoading } = useQuery({
    queryKey: ['print-orders', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('print_orders')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PrintOrder[];
    },
    enabled: !!eventId,
  });

  // Create print order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      photo_id: string;
      event_id: string;
      guest_email: string;
      guest_name: string;
      phone_number?: string;
      shipping_address: any;
      print_size: string;
      frame_type?: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }) => {
      const { error } = await supabase
        .from('print_orders')
        .insert(orderData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-orders'] });
      toast({
        title: 'Print Order Created',
        description: 'Print order has been submitted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Order Failed',
        description: `Failed to create print order: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<PrintOrder> }) => {
      const { error } = await supabase
        .from('print_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-orders'] });
      toast({
        title: 'Order Updated',
        description: 'Print order has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: `Failed to update order: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    orders,
    isLoading,
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    updateOrder: updateOrderMutation.mutate,
    isUpdating: updateOrderMutation.isPending,
  };
};
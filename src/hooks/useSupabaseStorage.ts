import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

/**
 * Secure storage hook that uses Supabase instead of localStorage
 * All data is stored with user-specific keys and RLS policies
 */
export const useSupabaseStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const setItem = useCallback(async (key: string, value: any): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_storage')
        .upsert({
          user_id: user.id,
          storage_key: key,
          storage_value: typeof value === 'string' ? value : JSON.stringify(value),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getItem = useCallback(async (key: string): Promise<any> => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_storage')
        .select('storage_value')
        .eq('user_id', user.id)
        .eq('storage_key', key)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(data.storage_value);
      } catch {
        return data.storage_value;
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_storage')
        .delete()
        .eq('user_id', user.id)
        .eq('storage_key', key);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clear = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_storage')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    setItem,
    getItem,
    removeItem,
    clear,
    isLoading
  };
};
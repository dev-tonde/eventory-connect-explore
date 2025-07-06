import { useCallback, useEffect } from 'react';
import { updateIntercomUser, showIntercom, hideIntercom } from '@/lib/intercom';
import { useAuth } from '@/contexts/AuthContext';

export const useCustomerSupport = () => {
  const { user, profile } = useAuth();

  // Update Intercom user data when auth state changes
  useEffect(() => {
    if (user && profile) {
      updateIntercomUser({
        user_id: user.id,
        email: user.email || profile.email,
        name: profile.name || `${profile.first_name} ${profile.last_name}`.trim(),
        created_at: Math.floor(new Date(user.created_at || '').getTime() / 1000),
        custom_attributes: {
          role: profile.role,
          username: profile.username,
          plan: 'free', // You can update this based on user's subscription
        },
      });
    }
  }, [user, profile]);

  const openSupport = useCallback(() => {
    showIntercom();
  }, []);

  const closeSupport = useCallback(() => {
    hideIntercom();
  }, []);

  const updateSupportUser = useCallback((userData: {
    email?: string;
    name?: string;
    custom_attributes?: Record<string, any>;
  }) => {
    if (user) {
      updateIntercomUser({
        user_id: user.id,
        ...userData,
      });
    }
  }, [user]);

  return {
    openSupport,
    closeSupport,
    updateSupportUser,
  };
};
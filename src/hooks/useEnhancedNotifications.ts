
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  event_id?: string;
  action_url?: string;
}

export const useEnhancedNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  // Send browser notification
  const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  // Load notifications from database
  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // For now, we'll create mock notifications since we don't have a notifications table
      const mockNotifications: NotificationItem[] = [
        {
          id: '1',
          title: 'Welcome to Eventory!',
          message: 'Start exploring events in your area',
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Event Reminder',
          message: 'Your event "Tech Meetup" starts in 1 hour',
          type: 'warning',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          event_id: 'sample-event-id'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Add new notification
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'created_at'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }

    // Send browser notification
    sendBrowserNotification(notification.title, {
      body: notification.message,
      tag: newNotification.id
    });
  };

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
    addNotification,
    sendBrowserNotification,
    refresh: loadNotifications
  };
};

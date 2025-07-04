/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook to manage push notification subscription and permissions.
 */
export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermissionMutation = useMutation({
    mutationFn: async () => {
      if (!isSupported) {
        throw new Error("Push notifications are not supported");
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        // Register service worker and create subscription
        const registration = await navigator.serviceWorker.register("/sw.js");
        const vapidKey =
          import.meta.env.VITE_VAPID_PUBLIC_KEY ||
          process.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidKey) throw new Error("VAPID public key is not set");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        // Save subscription to database
        const { error } = await supabase.from("push_subscriptions").upsert({
          user_id: user?.id,
          endpoint: subscription.endpoint,
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        });

        if (error) throw error;
        setIsSubscribed(true);
      }

      return permission;
    },
    onSuccess: (permission) => {
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description:
            "You'll now receive important updates about your events.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Push notification error:", error);
      toast({
        title: "Permission Denied",
        description: "Unable to enable push notifications.",
        variant: "destructive",
      });
    },
  });

  /**
   * Send a test notification (browser only, not push).
   */
  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification from Eventory!",
        icon: "/favicon.ico",
      });
    }
  };

  /**
   * Helper to convert VAPID key from base64 to Uint8Array.
   */
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission: requestPermissionMutation.mutate,
    isRequesting: requestPermissionMutation.isPending,
    sendTestNotification,
  };
};

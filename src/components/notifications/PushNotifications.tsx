import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY =
  "BEl62iUYgUivxIkv69yViEuiBIa40HI6YVOk5gKSR3-IiQtpmC2HIy_E-T0FCzd5DPyPU-p_aDDVjOLIzjk8gI4"; // Replace with your actual VAPID key

const PushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);
    if (user) {
      checkSubscriptionStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user || !isSupported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
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
  };

  const subscribeToPush = async () => {
    if (!user || !isSupported) return;
    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save subscription to database
      const { error } = await supabase.from("push_subscriptions").upsert([
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
      ]);

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for events.",
      });
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!user || !isSupported) return;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from database
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setIsSubscribed(false);
      toast({
        title: "Notifications Disabled",
        description: "You'll no longer receive push notifications.",
      });
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast({
        title: "Error",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" aria-hidden="true" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Push notifications are not supported in your browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" aria-hidden="true" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Get notified about event updates, reminders, and new events from
          organizers you follow.
        </p>
        <Button
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          disabled={isLoading}
          variant={isSubscribed ? "outline" : "default"}
          className="w-full"
          type="button"
          aria-label={
            isSubscribed ? "Disable notifications" : "Enable notifications"
          }
        >
          {isLoading
            ? "Processing..."
            : isSubscribed
            ? "Disable Notifications"
            : "Enable Notifications"}
        </Button>
        {isSubscribed && (
          <p className="text-sm text-green-600">
            ✓ You're receiving push notifications
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotifications;
// This component provides a user interface for managing push notifications in the Eventory application.
// It allows users to enable or disable push notifications, and it handles the subscription process using the Push API.
// The component checks for browser support, requests notification permissions, and manages the subscription state.
// It also integrates with Supabase to store and manage push subscription data for each user.

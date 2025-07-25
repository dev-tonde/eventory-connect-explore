import React, { useEffect } from "react";
import { useOfflineEventData } from "@/hooks/useOfflineEventData";
import { useWeatherNotifications } from "@/hooks/useWeatherNotifications";
import OfflineIndicator from "./OfflineIndicator";
import PWAInstaller from "./PWAInstaller";

interface PWAProviderProps {
  children: React.ReactNode;
}

const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const { events, isOnline, syncData, isLoading } = useOfflineEventData();
  const { notifications, checkUpcomingEvents } = useWeatherNotifications();

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      syncData();
      checkUpcomingEvents();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncData, checkUpcomingEvents]);

  return (
    <>
      <OfflineIndicator
        isOnline={isOnline}
        hasOfflineData={events.length > 0}
        syncInProgress={isLoading}
      />
      <PWAInstaller />
      {children}
    </>
  );
};

export default PWAProvider;
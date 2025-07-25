import React, { useEffect, useState } from "react";
import { useOfflineEventData } from "@/hooks/useOfflineEventData";
import { useWeatherNotifications } from "@/hooks/useWeatherNotifications";
import OfflineIndicator from "./OfflineIndicator";
import PWAInstaller from "./PWAInstaller";

interface PWAProviderProps {
  children: React.ReactNode;
}

const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  
  // Initialize PWA features only after component is mounted
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Only use PWA hooks after the component is ready
  const PWAFeatures = () => {
    const { events, isOnline, syncData, isLoading } = useOfflineEventData();
    const { checkUpcomingEvents } = useWeatherNotifications();

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
      <OfflineIndicator
        isOnline={isOnline}
        hasOfflineData={events.length > 0}
        syncInProgress={isLoading}
      />
    );
  };

  return (
    <>
      {isReady && <PWAFeatures />}
      <PWAInstaller />
      {children}
    </>
  );
};

export default PWAProvider;
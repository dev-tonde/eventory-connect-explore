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

  // Always call hooks at the top level
  const offlineData = useOfflineEventData();
  const weatherNotifications = useWeatherNotifications();

  // Register service worker
  useEffect(() => {
    if (!isReady) return;
    
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
  }, [isReady]);

  // Handle online/offline events
  useEffect(() => {
    if (!isReady) return;
    
    const handleOnline = () => {
      if (isReady) {
        offlineData.syncData();
        weatherNotifications.checkUpcomingEvents();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isReady, offlineData, weatherNotifications]);

  return (
    <>
      {isReady && (
        <OfflineIndicator
          isOnline={offlineData.isOnline}
          hasOfflineData={offlineData.events.length > 0}
          syncInProgress={offlineData.isLoading}
        />
      )}
      <PWAInstaller />
      {children}
    </>
  );
};

export default PWAProvider;
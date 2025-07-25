import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

interface WeatherNotification {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  weather: WeatherData;
  suggestions: string[];
  sent: boolean;
}

export const useWeatherNotifications = () => {
  const [notifications, setNotifications] = useState<WeatherNotification[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();

  // Mock weather API call (replace with real weather service)
  const fetchWeatherData = useCallback(async (coordinates: [number, number], date: string): Promise<WeatherData> => {
    // This would typically call a real weather API like OpenWeatherMap
    // For demo purposes, we'll return mock data
    const mockWeatherConditions = [
      { condition: "rainy", precipitation: 80, description: "Heavy rain expected" },
      { condition: "cold", temperature: 8, description: "Cold weather expected" },
      { condition: "windy", windSpeed: 25, description: "Strong winds expected" },
      { condition: "clear", temperature: 22, description: "Clear skies" },
    ];
    
    const randomCondition = mockWeatherConditions[Math.floor(Math.random() * mockWeatherConditions.length)];
    
    return {
      temperature: randomCondition.temperature || 18,
      condition: randomCondition.condition,
      humidity: 65,
      windSpeed: randomCondition.windSpeed || 10,
      precipitation: randomCondition.precipitation || 0,
      description: randomCondition.description,
    };
  }, []);

  // Generate weather-based suggestions
  const generateSuggestions = useCallback((weather: WeatherData): string[] => {
    const suggestions: string[] = [];

    if (weather.precipitation > 50) {
      suggestions.push("🌧️ Bring an umbrella or raincoat");
      suggestions.push("👟 Wear waterproof shoes");
    }

    if (weather.temperature < 12) {
      suggestions.push("🧥 Bring a warm jacket or coat");
      suggestions.push("🧤 Consider gloves and warm accessories");
    }

    if (weather.windSpeed > 20) {
      suggestions.push("💨 Secure loose items and hair");
      suggestions.push("🧥 Wear wind-resistant clothing");
    }

    if (weather.temperature > 25) {
      suggestions.push("☀️ Bring sunscreen and a hat");
      suggestions.push("💧 Stay hydrated with water");
    }

    if (suggestions.length === 0) {
      suggestions.push("✨ Perfect weather for the event!");
    }

    return suggestions;
  }, []);

  // Check weather for upcoming events
  const checkUpcomingEvents = useCallback(async () => {
    if (!user) return;

    setIsChecking(true);

    try {
      // Get user's upcoming events (tickets purchased)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data: tickets, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events!inner (
            id,
            title,
            date,
            time,
            venue,
            location_coordinates
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .eq("events.date", tomorrowStr);

      if (error) throw error;

      const weatherNotifications: WeatherNotification[] = [];

      for (const ticket of tickets || []) {
        const event = ticket.events;
        if (!event.location_coordinates) continue;

        // Check if we already sent a notification for this event
        const existingNotification = notifications.find(n => n.eventId === event.id);
        if (existingNotification?.sent) continue;

        // Get weather data
        const coordinates: [number, number] = [
          (event.location_coordinates as any)?.x || 0,
          (event.location_coordinates as any)?.y || 0
        ];
        
        const weather = await fetchWeatherData(coordinates, event.date);
        const suggestions = generateSuggestions(weather);

        // Only create notification if weather conditions warrant it
        if (weather.precipitation > 30 || weather.temperature < 12 || weather.windSpeed > 20) {
          const notification: WeatherNotification = {
            id: `weather-${event.id}-${Date.now()}`,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            weather,
            suggestions,
            sent: false,
          };

          weatherNotifications.push(notification);
        }
      }

      setNotifications(prev => [...prev, ...weatherNotifications]);

      // Send push notifications for new weather alerts
      for (const notification of weatherNotifications) {
        await sendWeatherNotification(notification);
      }

    } catch (error) {
      console.error("Error checking weather notifications:", error);
    } finally {
      setIsChecking(false);
    }
  }, [user, notifications, fetchWeatherData, generateSuggestions]);

  // Send push notification
  const sendWeatherNotification = useCallback(async (notification: WeatherNotification) => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

    try {
      // Check if notifications are enabled
      if (Notification.permission !== "granted") return;

      const title = `Weather Alert: ${notification.eventTitle}`;
      const body = `${notification.weather.description}. ${notification.suggestions[0]}`;

      // Send via service worker for better reliability
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `weather-${notification.eventId}`,
        data: {
          eventId: notification.eventId,
          type: "weather-alert",
        },
      } as NotificationOptions);

      // Mark as sent
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, sent: true } : n
        )
      );

    } catch (error) {
      console.error("Error sending weather notification:", error);
    }
  }, []);

  // Schedule periodic weather checks
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      // Check weather at 8 AM and 6 PM (12 hours before typical event times)
      if (hour === 8 || hour === 18) {
        checkUpcomingEvents();
      }
    }, 60 * 60 * 1000); // Check every hour

    // Initial check
    checkUpcomingEvents();

    return () => clearInterval(checkInterval);
  }, [checkUpcomingEvents]);

  return {
    notifications,
    isChecking,
    checkUpcomingEvents,
    sendWeatherNotification,
  };
};
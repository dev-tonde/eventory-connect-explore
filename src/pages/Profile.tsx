
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import UserProfile from "@/components/profile/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: purchasedTickets = [] } = useQuery({
    queryKey: ["user-tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (
            id,
            title,
            description,
            date,
            time,
            venue,
            address,
            price,
            category,
            image_url,
            max_attendees,
            current_attendees,
            tags
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error("Error loading tickets:", error);
        return [];
      }

      return data.map((ticket: any) => ({
        id: ticket.events.id,
        title: ticket.events.title,
        description: ticket.events.description || "",
        date: ticket.events.date,
        time: ticket.events.time,
        location: ticket.events.venue,
        address: ticket.events.address || "",
        price: Number(ticket.events.price),
        category: ticket.events.category,
        image: ticket.events.image_url || "/placeholder.svg",
        organizer: "Organizer", // We'll need to join with profiles later
        attendeeCount: ticket.events.current_attendees || 0,
        maxAttendees: ticket.events.max_attendees || 100,
        tags: ticket.events.tags || []
      }));
    },
    enabled: !!user,
  });

  const { data: favoriteEvents = [] } = useQuery({
    queryKey: ["user-favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          events (
            id,
            title,
            description,
            date,
            time,
            venue,
            address,
            price,
            category,
            image_url,
            max_attendees,
            current_attendees,
            tags
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading favorites:", error);
        return [];
      }

      return data.map((fav: any) => ({
        id: fav.events.id,
        title: fav.events.title,
        description: fav.events.description || "",
        date: fav.events.date,
        time: fav.events.time,
        location: fav.events.venue,
        address: fav.events.address || "",
        price: Number(fav.events.price),
        category: fav.events.category,
        image: fav.events.image_url || "/placeholder.svg",
        organizer: "Organizer", // We'll need to join with profiles later
        attendeeCount: fav.events.current_attendees || 0,
        maxAttendees: fav.events.max_attendees || 100,
        tags: fav.events.tags || []
      }));
    },
    enabled: !!user,
  });

  const { data: hostedEvents = [] } = useQuery({
    queryKey: ["hosted-events", user?.id],
    queryFn: async () => {
      if (!user || profile?.role !== "organizer") return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .eq("is_active", true);

      if (error) {
        console.error("Error loading hosted events:", error);
        return [];
      }

      return data.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        location: event.venue,
        address: event.address || "",
        price: Number(event.price),
        category: event.category,
        image: event.image_url || "/placeholder.svg",
        organizer: `${profile?.first_name} ${profile?.last_name}`.trim(),
        attendeeCount: event.current_attendees || 0,
        maxAttendees: event.max_attendees || 100,
        tags: event.tags || []
      }));
    },
    enabled: !!user && profile?.role === "organizer",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // For followed organizers, we'll still use localStorage temporarily
  const follows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
  const userFollows = follows.filter((f: any) => f.userId === user?.id);
  const followedOrganizers = userFollows.map((f: any) => f.organizerName);
  
  // Get events from followed organizers (simplified for now)
  const followedOrganizerEvents: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <UserProfile
          purchasedTickets={purchasedTickets}
          favoriteEvents={favoriteEvents}
          hostedEvents={hostedEvents}
          followedOrganizers={followedOrganizers}
          followedOrganizerEvents={followedOrganizerEvents}
        />
      </div>
    </div>
  );
};

export default Profile;

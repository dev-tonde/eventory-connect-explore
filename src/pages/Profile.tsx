
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import UserProfile from "@/components/profile/UserProfile";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { Event } from "@/types/event";

const Profile = () => {
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();
  const [purchasedTickets, setPurchasedTickets] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [followedOrganizers, setFollowedOrganizers] = useState<string[]>([]);
  const [followedOrganizerEvents, setFollowedOrganizerEvents] = useState<
    Event[]
  >([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load user's data from localStorage
    const purchases = JSON.parse(
      localStorage.getItem("eventory_purchases") || "[]"
    );
    const events = JSON.parse(localStorage.getItem("eventory_events") || "[]");
    const favorites = JSON.parse(
      localStorage.getItem("eventory_favorites") || "[]"
    );
    const follows = JSON.parse(
      localStorage.getItem("eventory_follows") || "[]"
    );

    // Get purchased tickets
    const userPurchases = purchases.filter((p: any) => p.userId === user?.id);
    const purchasedEventIds = userPurchases.map((p: any) => p.eventId);
    const purchased = events.filter((e: Event) =>
      purchasedEventIds.includes(e.id)
    );
    setPurchasedTickets(purchased);

    // Get favorite events
    const userFavorites = favorites.filter((f: any) => f.userId === user?.id);
    const favoriteEventIds = userFavorites.map((f: any) => f.eventId);
    const favorited = events.filter((e: Event) =>
      favoriteEventIds.includes(e.id)
    );
    setFavoriteEvents(favorited);

    // Get followed organizers
    const userFollows = follows.filter((f: any) => f.userId === user?.id);
    const followedOrganizerNames = userFollows.map((f: any) => f.organizerName);
    setFollowedOrganizers(followedOrganizerNames);

    // Get events from followed organizers
    const followedEvents = events
      .filter((e: Event) => followedOrganizerNames.includes(e.organizer))
      .sort((a: Event, b: Event) => {
        // Sort by popularity (attendee count) and then by date
        if (a.attendeeCount !== b.attendeeCount) {
          return b.attendeeCount - a.attendeeCount;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    setFollowedOrganizerEvents(followedEvents);

    // Get hosted events (for organizers)
    if (profile?.role === "organizer") {
      const organizerName = `${profile.first_name} ${profile.last_name}`.trim();
      const hosted = events.filter((e: Event) => e.organizer === organizerName);
      setHostedEvents(hosted);
    }
  }, [isAuthenticated, user, profile, navigate]);

  if (!isAuthenticated) {
    return null;
  }

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

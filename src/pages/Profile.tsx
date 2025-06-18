
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import UserProfile from "@/components/profile/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Event } from "@/types/event";

const Profile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [purchasedTickets, setPurchasedTickets] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load user's data from localStorage
    const purchases = JSON.parse(localStorage.getItem('eventory_purchases') || '[]');
    const events = JSON.parse(localStorage.getItem('eventory_events') || '[]');
    const favorites = JSON.parse(localStorage.getItem('eventory_favorites') || '[]');

    // Get purchased tickets
    const userPurchases = purchases.filter((p: any) => p.userId === user?.id);
    const purchasedEventIds = userPurchases.map((p: any) => p.eventId);
    const purchased = events.filter((e: Event) => purchasedEventIds.includes(e.id));
    setPurchasedTickets(purchased);

    // Get favorite events
    const userFavorites = favorites.filter((f: any) => f.userId === user?.id);
    const favoriteEventIds = userFavorites.map((f: any) => f.eventId);
    const favorited = events.filter((e: Event) => favoriteEventIds.includes(e.id));
    setFavoriteEvents(favorited);

    // Get hosted events (for organizers)
    if (user?.role === 'organizer') {
      const hosted = events.filter((e: Event) => e.organizer === user.name);
      setHostedEvents(hosted);
    }
  }, [isAuthenticated, user, navigate]);

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
        />
      </div>
    </div>
  );
};

export default Profile;

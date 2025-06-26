
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { useToast } from "@/hooks/use-toast";
import OrganizerCard from "@/components/organizers/OrganizerCard";
import EmptyFollowedOrganizers from "@/components/organizers/EmptyFollowedOrganizers";

interface OrganizerProfile {
  name: string;
  followerCount: number;
  isVerified: boolean;
  events: Event[];
}

const FollowedOrganizers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followedOrganizers, setFollowedOrganizers] = useState<OrganizerProfile[]>([]);

  useEffect(() => {
    if (!user) return;
    loadFollowedOrganizers();
  }, [user]);

  const loadFollowedOrganizers = () => {
    const follows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
    const events = JSON.parse(localStorage.getItem('eventory_events') || '[]');
    const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
    
    const userFollows = follows.filter((f: any) => f.userId === user?.id);
    const organizerNames = userFollows.map((f: any) => f.organizerName);

    // Create organizer profiles with their events
    const organizerProfiles: OrganizerProfile[] = organizerNames.map(name => {
      const organizerEvents = events.filter((e: Event) => e.organizer === name);
      const followerCount = followerCounts[name] || 0;
      const isVerified = followerCount >= 10000;

      return {
        name,
        followerCount,
        isVerified,
        events: organizerEvents.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    });

    setFollowedOrganizers(organizerProfiles);
  };

  const unfollowOrganizer = (organizerName: string) => {
    const follows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
    const updatedFollows = follows.filter((f: any) => !(f.userId === user?.id && f.organizerName === organizerName));
    
    localStorage.setItem('eventory_follows', JSON.stringify(updatedFollows));
    
    // Update follower count
    const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
    if (followerCounts[organizerName]) {
      followerCounts[organizerName] = Math.max(0, followerCounts[organizerName] - 1);
      localStorage.setItem('eventory_follower_counts', JSON.stringify(followerCounts));
    }

    loadFollowedOrganizers();
    
    toast({
      title: "Unfollowed organizer",
      description: `You are no longer following ${organizerName}.`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your followed organizers</h1>
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Followed Organizers</h1>
          <p className="text-gray-600">Stay updated with events from your favorite organizers</p>
        </div>

        {followedOrganizers.length === 0 ? (
          <EmptyFollowedOrganizers />
        ) : (
          <div className="space-y-8">
            {followedOrganizers.map((organizer) => (
              <OrganizerCard
                key={organizer.name}
                organizer={organizer}
                onUnfollow={unfollowOrganizer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowedOrganizers;

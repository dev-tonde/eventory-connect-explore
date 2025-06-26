
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OrganizerCard from "@/components/organizers/OrganizerCard";
import EmptyFollowedOrganizers from "@/components/organizers/EmptyFollowedOrganizers";

interface OrganizerProfile {
  name: string;
  followerCount: number;
  isVerified: boolean;
  events: any[];
}

const FollowedOrganizers = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: followedOrganizers = [], isLoading } = useQuery({
    queryKey: ["followed-organizers", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // For now, we'll use localStorage for follows until we create a follows table
      const follows = JSON.parse(localStorage.getItem('eventory_follows') || '[]');
      const userFollows = follows.filter((f: any) => f.userId === user.id);
      
      if (userFollows.length === 0) return [];

      // Get events from Supabase for followed organizers
      const { data: events, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("is_active", true)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error loading events:", error);
        return [];
      }

      // Group events by organizer
      const organizerMap = new Map<string, any[]>();
      const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');

      userFollows.forEach((follow: any) => {
        const organizerEvents = events.filter((event: any) => {
          const organizerName = event.profiles 
            ? `${event.profiles.first_name} ${event.profiles.last_name}`.trim()
            : 'Unknown Organizer';
          return organizerName === follow.organizerName;
        });

        const followerCount = followerCounts[follow.organizerName] || 0;
        
        organizerMap.set(follow.organizerName, {
          name: follow.organizerName,
          followerCount,
          isVerified: followerCount >= 10000,
          events: organizerEvents.map((event: any) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.venue,
            price: Number(event.price),
            image: event.image_url || "/placeholder.svg",
            organizer: follow.organizerName,
            attendeeCount: event.current_attendees || 0,
            maxAttendees: event.max_attendees || 100,
            tags: event.tags || [],
            description: event.description || "",
            address: event.address || "",
            category: event.category
          }))
        });
      });

      return Array.from(organizerMap.values());
    },
    enabled: !!user,
  });

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

    // Refresh the query
    window.location.reload();
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your followed organizers...</div>
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

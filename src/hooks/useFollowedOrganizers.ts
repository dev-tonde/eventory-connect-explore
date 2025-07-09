import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Organizer {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  bio: string;
  followerCount: number;
  eventCount: number;
  category: string;
}

export const useFollowedOrganizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Mock data for demonstration - in real app this would come from database
  const mockOrganizers: Organizer[] = [
    {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      bio: "Professional event organizer specializing in music events",
      followerCount: 1250,
      eventCount: 45,
      category: "Music",
    },
    {
      id: "2", 
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      bio: "Tech conference organizer and startup enthusiast",
      followerCount: 890,
      eventCount: 23,
      category: "Technology",
    },
  ];

  const fetchFollowedOrganizers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would fetch from the database
      setOrganizers(mockOrganizers);
    } catch (error) {
      console.error('Error fetching followed organizers:', error);
      toast({
        title: "Error",
        description: "Failed to load followed organizers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unfollowOrganizer = async (organizerId: string, organizerName: string) => {
    if (!user) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from local state
      setOrganizers(prev => prev.filter(org => org.id !== organizerId));
      
      toast({
        title: "Unfollowed",
        description: `You unfollowed ${organizerName}`,
      });
    } catch (error) {
      console.error('Error unfollowing organizer:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow organizer.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFollowedOrganizers();
    }
  }, [user, isAuthenticated]);

  return {
    organizers,
    loading,
    unfollowOrganizer,
    refetch: fetchFollowedOrganizers
  };
};
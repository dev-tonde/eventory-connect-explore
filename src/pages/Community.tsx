import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CommunityHeader from "@/components/community/CommunityHeader";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CommunityPhotos } from "@/components/community/CommunityPhotos";
import { MoodTrendsComponent } from "@/components/community/MoodTrendsComponent";
import { StoriesCarousel } from "@/components/community/StoriesCarousel";
import CommunityChat from "@/components/community/CommunityChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Calendar, Camera, Smile, Eye, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("feed");

  // Fetch community details
  const { data: community, isLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      if (!id) throw new Error("Community ID is required");
      const { data, error } = await supabase
        .from("communities")
        .select(
          `
          *,
          community_members (
            id,
            user_id,
            role,
            joined_at
          )
        `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch community members with profiles
  const { data: communityMembers = [] } = useQuery({
    queryKey: ["community-members-with-profiles", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("community_members")
        .select(
          `
          id,
          user_id,
          role,
          joined_at
        `
        )
        .eq("community_id", id);
      if (error) throw error;
      // Get profile data for each member
      return Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, username")
            .eq("id", member.user_id)
            .single();
          return { ...member, profile };
        })
      );
    },
    enabled: !!id,
  });

  // Check if current user is a member
  const { data: isMember } = useQuery({
    queryKey: ["community-membership", id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return false;
      const { data, error } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!id && !!user?.id,
  });

  // Join/Leave community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user?.id) throw new Error("Missing ID or user");
      
      if (isMember) {
        // Leave community
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Join community
        const { error } = await supabase
          .from("community_members")
          .insert({
            community_id: id,
            user_id: user.id,
            role: "member",
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-membership", id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["community-members-with-profiles", id] });
      queryClient.invalidateQueries({ queryKey: ["community-members-count", id] });
      toast({
        title: isMember ? "Left community" : "Joined community",
        description: isMember ? "You have left this community" : "Welcome to the community!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update membership",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CommunityHeader communityId={id!} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Photos</span>
                </TabsTrigger>
                <TabsTrigger value="mood" className="flex items-center gap-2">
                  <Smile className="h-4 w-4" />
                  <span className="hidden sm:inline">Mood</span>
                </TabsTrigger>
                <TabsTrigger value="stories" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Stories</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                <CommunityFeed communityId={id!} />
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Community Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4" />
                      <p>No events scheduled yet</p>
                      <Button variant="outline" className="mt-4">
                        Create Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="space-y-6">
                <CommunityPhotos communityId={id!} />
              </TabsContent>

              <TabsContent value="mood" className="space-y-6">
                <MoodTrendsComponent communityId={id!} />
              </TabsContent>

              <TabsContent value="stories" className="space-y-6">
                <StoriesCarousel communityId={id!} />
              </TabsContent>

              <TabsContent value="members" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Community Members ({communityMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {communityMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium">
                                {(member.profile?.first_name || member.profile?.username || "U").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.profile?.first_name && member.profile?.last_name
                                  ? `${member.profile.first_name} ${member.profile.last_name}`
                                  : member.profile?.username || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Joined {new Date(member.joined_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={member.role === "admin" ? "default" : "secondary"}
                            >
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Card */}
            <Card>
              <CardHeader>
                <CardTitle>Membership</CardTitle>
              </CardHeader>
              <CardContent>
                {isMember ? (
                  <div className="text-center">
                    <p className="text-green-600 mb-4">
                      You are a member of this community
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => joinCommunityMutation.mutate()}
                      disabled={joinCommunityMutation.isPending}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Leave Community
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Join this community to participate
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => joinCommunityMutation.mutate()}
                      disabled={joinCommunityMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Community
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-medium">{communityMembers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Tab:</span>
                  <Badge variant="outline" className="capitalize">{activeTab}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Role:</span>
                  <span className="font-medium capitalize">
                    {isMember ? communityMembers.find(m => m.user_id === user?.id)?.role || "member" : "visitor"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Community Chat */}
            {isMember && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CommunityChat communityId={id!} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
// This code defines a Community page that displays community details, members, and allows users to join or leave the community.

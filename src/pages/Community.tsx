
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CommunityHeader from "@/components/community/CommunityHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Calendar } from "lucide-react";

const Community = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      if (!id) throw new Error("Community ID is required");
      
      const { data, error } = await supabase
        .from("communities")
        .select(`
          *,
          community_members (
            id,
            user_id,
            role,
            joined_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: communityMembers } = useQuery({
    queryKey: ["community-members-with-profiles", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("community_members")
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq("community_id", id);

      if (error) throw error;

      // Get profile data for each member
      const membersWithProfiles = await Promise.all(
        data.map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, username")
            .eq("id", member.user_id)
            .single();

          return {
            ...member,
            profile
          };
        })
      );

      return membersWithProfiles;
    },
    enabled: !!id,
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Community Not Found</h2>
            <p className="text-gray-600 mb-4">The community you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CommunityHeader communityId={id!} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Community Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Chat feature coming soon!</p>
                </div>
              </CardContent>
            </Card>

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
                </div>
              </CardContent>
            </Card>
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
                    <p className="text-green-600 mb-4">You are a member of this community</p>
                    <Button variant="outline" className="w-full">
                      Leave Community
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Join this community to participate</p>
                    <Button className="w-full">
                      Join Community
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({communityMembers?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {communityMembers?.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <span className="text-sm">
                        {member.profile?.first_name && member.profile?.last_name
                          ? `${member.profile.first_name} ${member.profile.last_name}`
                          : member.profile?.username || "Unknown User"
                        }
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {member.role}
                      </span>
                    </div>
                  ))}
                  {(communityMembers?.length || 0) > 5 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      +{(communityMembers?.length || 0) - 5} more members
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;

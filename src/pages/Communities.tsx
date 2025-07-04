import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Lock, Globe } from "lucide-react";
import CreateCommunityDialog from "@/components/community/CreateCommunityDialog";

const Communities = () => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's communities
  const {
    data: myCommunities = [],
    refetch: refetchMyCommunities,
    isLoading: loadingMyCommunities,
  } = useQuery({
    queryKey: ["my-communities", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("communities")
        .select(
          `
          *,
          community_members!inner(role, user_id)
        `
        )
        .eq("community_members.user_id", user.id);
      if (error) {
        console.error("Error fetching my communities:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch public communities
  const { data: publicCommunities = [], isLoading: loadingPublicCommunities } =
    useQuery({
      queryKey: ["public-communities"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("communities")
          .select(
            `
          *,
          community_members(id)
        `
          )
          .eq("is_public", true)
          .limit(10);
        if (error) {
          console.error("Error fetching public communities:", error);
          return [];
        }
        return data || [];
      },
    });

  const handleCommunityCreated = () => {
    refetchMyCommunities();
    setShowCreateDialog(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">
              Please log in to view and create communities
            </p>
            <Link to="/auth">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Connect with others, share experiences, and plan events together
          </p>
        </div>

        {/* My Communities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Communities
          </h2>
          {loadingMyCommunities ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : myCommunities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No communities yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first community or join an existing one
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCommunities.map((community) => (
                <Link key={community.id} to={`/community/${community.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{community.name}</span>
                        {community.is_public ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {community.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>Member</span>
                        </div>
                        <Badge
                          variant={
                            community.community_members?.[0]?.role === "admin"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {community.community_members?.[0]?.role || "member"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Public Communities */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Discover Communities
          </h2>
          {loadingPublicCommunities ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicCommunities.map((community) => (
                <Card
                  key={community.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{community.name}</span>
                      <Globe className="h-4 w-4 text-green-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {community.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>
                          {community.community_members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <CreateCommunityDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCommunityCreated={handleCommunityCreated}
        />
      </div>
    </div>
  );
};

export default Communities;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityHeaderProps {
  communityId: string;
}

const CommunityHeader = ({ communityId }: CommunityHeaderProps) => {
  const { data: community, isLoading: isCommunityLoading } = useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: memberCount, isLoading: isMembersLoading } = useQuery({
    queryKey: ["community-members-count", communityId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("community_members")
        .select("*", { count: "exact", head: true })
        .eq("community_id", communityId);
      if (error) throw error;
      return count || 0;
    },
  });

  if (isCommunityLoading || isMembersLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!community) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Community not found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-gray-600 mt-1">{community.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>
                {typeof memberCount === "number" ? memberCount : 0} member
                {memberCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" aria-label="Community settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityHeader;
// This component fetches and displays the community header information, including the name, description, and member count. It also includes a button for community settings. The component uses React Query for data fetching and handles loading states gracefully.

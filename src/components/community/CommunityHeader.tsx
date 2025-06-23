
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityHeaderProps {
  communityId: string;
}

const CommunityHeader = ({ communityId }: CommunityHeaderProps) => {
  const { data: community } = useQuery({
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

  const { data: memberCount } = useQuery({
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

  if (!community) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
            {community.description && (
              <p className="text-gray-600 mt-1">{community.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{memberCount} members</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityHeader;

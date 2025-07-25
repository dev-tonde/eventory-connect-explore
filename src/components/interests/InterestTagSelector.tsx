import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Plus, Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useToast } from '@/hooks/use-toast';

interface InterestTag {
  id: string;
  name: string;
  category: string;
  description?: string;
  color_hex: string;
  is_active: boolean;
}

interface UserInterestFollow {
  id: string;
  user_id: string;
  tag_id: string;
  followed_at: string;
  interest_tags: InterestTag;
}

export const InterestTagSelector: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available interest tags
  const { data: allTags, isLoading: isLoadingTags } = useQuery({
    queryKey: ['interest-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interest_tags')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) throw error;
      return data as InterestTag[];
    },
  });

  // Fetch user's followed tags
  const { data: followedTags, isLoading: isLoadingFollowed } = useQuery({
    queryKey: ['user-interest-follows', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_interest_follows')
        .select(`
          *,
          interest_tags (
            id,
            name,
            category,
            description,
            color_hex,
            is_active
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ tagId, action }: { tagId: string; action: 'follow' | 'unfollow' }) => {
      if (!user) throw new Error('User not authenticated');

      if (action === 'follow') {
        const { error } = await supabase
          .from('user_interest_follows')
          .insert({ user_id: user.id, tag_id: tagId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_interest_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('tag_id', tagId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['user-interest-follows'] });
      toast({
        title: action === 'follow' ? 'Interest Added' : 'Interest Removed',
        description: `Successfully ${action === 'follow' ? 'added' : 'removed'} interest.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update interests: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please sign in to customize your interests.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingTags || isLoadingFollowed) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const followedTagIds = new Set(followedTags?.map(f => f.tag_id) || []);
  
  const filteredTags = allTags?.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, InterestTag[]>);

  const handleToggleTag = (tagId: string) => {
    const isFollowed = followedTagIds.has(tagId);
    followMutation.mutate({
      tagId,
      action: isFollowed ? 'unfollow' : 'follow',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Your Interests
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {followedTags && followedTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Following ({followedTags.length})</h3>
            <div className="flex flex-wrap gap-2">
              {followedTags.map((follow) => (
                <Badge
                  key={follow.id}
                  variant="default"
                  className="cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: follow.interest_tags.color_hex }}
                  onClick={() => handleToggleTag(follow.tag_id)}
                >
                  {follow.interest_tags.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue={Object.keys(groupedTags)[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {Object.keys(groupedTags).map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(groupedTags).map(([category, tags]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-3">
                {tags.map((tag) => {
                  const isFollowed = followedTagIds.has(tag.id);
                  
                  return (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            style={{ borderColor: tag.color_hex, color: tag.color_hex }}
                          >
                            {tag.name}
                          </Badge>
                        </div>
                        {tag.description && (
                          <p className="text-sm text-muted-foreground">{tag.description}</p>
                        )}
                      </div>
                      
                      <Button
                        variant={isFollowed ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleTag(tag.id)}
                        disabled={followMutation.isPending}
                        className={isFollowed ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {isFollowed ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
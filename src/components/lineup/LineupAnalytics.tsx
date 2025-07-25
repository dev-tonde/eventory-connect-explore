import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, MessageSquare, Users } from "lucide-react";
import { useLineupAnalytics, type LineupMoodData } from "@/hooks/useLineupAnalytics";

interface LineupAnalyticsProps {
  eventId: string;
}

const getMoodEmoji = (score: number) => {
  if (score >= 4.5) return "😄";
  if (score >= 3.5) return "😊";
  if (score >= 2.5) return "😐";
  if (score >= 1.5) return "😞";
  return "😔";
};

const getMoodColor = (score: number) => {
  if (score >= 4) return "text-green-600";
  if (score >= 3) return "text-yellow-600";
  return "text-red-600";
};

export const LineupAnalytics: React.FC<LineupAnalyticsProps> = ({ eventId }) => {
  const { data: analytics, isLoading, error } = useLineupAnalytics(eventId);

  if (isLoading) {
    return <div className="animate-pulse">Loading lineup analytics...</div>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load lineup analytics. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No lineup data available yet. Add performers to your lineup to see analytics.
        </CardContent>
      </Card>
    );
  }

  const totalCheckins = analytics.reduce((sum, item) => sum + item.total_checkins, 0);
  const overallMood = analytics.length > 0 
    ? analytics.reduce((sum, item) => sum + (item.average_mood * item.total_checkins), 0) / totalCheckins
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Overall Event Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-1">{getMoodEmoji(overallMood)}</div>
              <div className={`text-2xl font-bold ${getMoodColor(overallMood)}`}>
                {overallMood.toFixed(1)}/5.0
              </div>
              <div className="text-sm text-muted-foreground">Average Mood</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalCheckins}</div>
              <div className="text-sm text-muted-foreground">Total Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.length}</div>
              <div className="text-sm text-muted-foreground">Performers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Performer Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Performer Breakdown</h3>
        {analytics.map((performer: LineupMoodData) => (
          <Card key={performer.lineup_id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{performer.artist_name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {performer.total_checkins} check-ins
                  </Badge>
                  <div className={`flex items-center gap-1 ${getMoodColor(performer.average_mood)}`}>
                    <span className="text-lg">{getMoodEmoji(performer.average_mood)}</span>
                    <span className="font-semibold">{performer.average_mood.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mood Distribution */}
              <div>
                <h4 className="text-sm font-medium mb-2">Mood Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const count = performer.mood_distribution[score] || 0;
                    const percentage = performer.total_checkins > 0 
                      ? (count / performer.total_checkins) * 100 
                      : 0;
                    
                    return (
                      <div key={score} className="flex items-center gap-2">
                        <span className="text-sm w-6">{getMoodEmoji(score)}</span>
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-12">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Comments */}
              {performer.comments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Recent Feedback
                  </h4>
                  <div className="space-y-2">
                    {performer.comments.slice(0, 3).map((comment, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getMoodEmoji(comment.mood_score)}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(comment.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
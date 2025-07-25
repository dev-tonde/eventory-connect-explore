import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Smile, Meh, Frown, TrendingUp, Users } from "lucide-react";

interface MoodTrendsComponentProps {
  communityId: string;
}

interface MoodData {
  date: string;
  very_happy: number;
  happy: number;
  neutral: number;
  sad: number;
  very_sad: number;
  average_mood: number;
  total_checkins: number;
}

export const MoodTrendsComponent: React.FC<MoodTrendsComponentProps> = ({ communityId }) => {
  const { data: moodTrends = [], isLoading } = useQuery({
    queryKey: ["community-mood-trends", communityId],
    queryFn: async () => {
      // Get mood check-ins from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("mood_checkins")
        .select("*")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date and calculate mood statistics
      const moodByDate: { [key: string]: MoodData } = {};

      data?.forEach((checkin) => {
        const date = new Date(checkin.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (!moodByDate[date]) {
          moodByDate[date] = {
            date,
            very_happy: 0,
            happy: 0,
            neutral: 0,
            sad: 0,
            very_sad: 0,
            average_mood: 0,
            total_checkins: 0,
          };
        }

        const mood = moodByDate[date];
        mood.total_checkins++;

        switch (checkin.mood_score) {
          case 5:
            mood.very_happy++;
            break;
          case 4:
            mood.happy++;
            break;
          case 3:
            mood.neutral++;
            break;
          case 2:
            mood.sad++;
            break;
          case 1:
            mood.very_sad++;
            break;
        }
      });

      // Calculate average mood for each date
      Object.values(moodByDate).forEach((mood) => {
        const totalMoodScore = 
          mood.very_happy * 5 + 
          mood.happy * 4 + 
          mood.neutral * 3 + 
          mood.sad * 2 + 
          mood.very_sad * 1;
        
        mood.average_mood = mood.total_checkins > 0 ? 
          Number((totalMoodScore / mood.total_checkins).toFixed(1)) : 0;
      });

      return Object.values(moodByDate).slice(-14); // Last 14 days
    },
  });

  const totalCheckins = moodTrends.reduce((sum, day) => sum + day.total_checkins, 0);
  const averageMood = moodTrends.length > 0 ? 
    Number((moodTrends.reduce((sum, day) => sum + day.average_mood, 0) / moodTrends.length).toFixed(1)) : 0;

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="h-5 w-5 text-green-500" />;
    if (mood >= 3) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return "text-green-600";
    if (mood >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mood Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              {getMoodIcon(averageMood)}
            </div>
            <div className={`text-2xl font-bold ${getMoodColor(averageMood)}`}>
              {averageMood}/5
            </div>
            <p className="text-sm text-gray-600">Average Mood</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {totalCheckins}
            </div>
            <p className="text-sm text-gray-600">Total Check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {moodTrends.length > 1 && moodTrends[moodTrends.length - 1].average_mood > moodTrends[0].average_mood ? "↑" : "↓"}
            </div>
            <p className="text-sm text-gray-600">Trend</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {moodTrends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Smile className="h-12 w-12 mx-auto mb-4" />
              <p>No mood data available yet</p>
              <p className="text-sm">Encourage community members to check in with their mood!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} />
                <Tooltip 
                  formatter={(value) => [`${value}/5`, "Average Mood"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="average_mood" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  dot={{ fill: "#7c3aed", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Mood Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Distribution (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {moodTrends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No distribution data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moodTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="very_happy" stackId="a" fill="#10b981" name="Very Happy" />
                <Bar dataKey="happy" stackId="a" fill="#84cc16" name="Happy" />
                <Bar dataKey="neutral" stackId="a" fill="#eab308" name="Neutral" />
                <Bar dataKey="sad" stackId="a" fill="#f97316" name="Sad" />
                <Bar dataKey="very_sad" stackId="a" fill="#ef4444" name="Very Sad" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
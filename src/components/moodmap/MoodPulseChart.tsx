import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { TrendingUp, Users, MessageCircle } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodPulseChartProps {
  eventId: string;
}

interface MoodCheckin {
  id: string;
  mood_score: number;
  comment: string | null;
  created_at: string;
}

interface MoodSummary {
  average_mood: number;
  total_checkins: number;
  mood_distribution: {
    very_happy: number;
    happy: number;
    neutral: number;
    sad: number;
    very_sad: number;
  };
}

const MOOD_LABELS = ["😔", "😞", "😐", "😊", "😄"];
const MOOD_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

export function MoodPulseChart({ eventId }: MoodPulseChartProps) {
  const { data: checkins, isLoading: checkinsLoading } = useQuery({
    queryKey: ["mood-checkins", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mood_checkins")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as MoodCheckin[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["mood-summary", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_mood_summary", {
        event_uuid: eventId,
      });

      if (error) throw error;
      return data as unknown as MoodSummary;
    },
    refetchInterval: 30000,
  });

  // Group checkins by hour for timeline
  const getHourlyData = () => {
    if (!checkins || checkins.length === 0) return { labels: [], data: [] };

    const hourlyGroups: { [key: string]: number[] } = {};
    
    checkins.forEach((checkin) => {
      const hour = new Date(checkin.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      
      if (!hourlyGroups[hour]) {
        hourlyGroups[hour] = [];
      }
      hourlyGroups[hour].push(checkin.mood_score);
    });

    const labels = Object.keys(hourlyGroups).sort();
    const data = labels.map((hour) => {
      const scores = hourlyGroups[hour];
      return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    return { labels, data };
  };

  const getMoodColor = (avgMood: number) => {
    if (avgMood >= 4.5) return "text-green-500";
    if (avgMood >= 3.5) return "text-green-400";
    if (avgMood >= 2.5) return "text-yellow-500";
    if (avgMood >= 1.5) return "text-orange-500";
    return "text-red-500";
  };

  const getMoodEmoji = (avgMood: number) => {
    if (avgMood >= 4.5) return "😄";
    if (avgMood >= 3.5) return "😊";
    if (avgMood >= 2.5) return "😐";
    if (avgMood >= 1.5) return "😞";
    return "😔";
  };

  const chartData = getHourlyData();
  
  const chartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Average Mood",
        data: chartData.data,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "hsl(var(--primary))",
        pointBorderColor: "hsl(var(--background))",
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const emoji = getMoodEmoji(value);
            return `${emoji} Mood: ${value.toFixed(1)}/5`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        min: 1,
        max: 5,
        title: {
          display: true,
          text: "Mood Score",
        },
        ticks: {
          stepSize: 1,
          callback: (value) => MOOD_LABELS[Number(value) - 1],
        },
      },
    },
  };

  if (checkinsLoading || summaryLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!checkins || checkins.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No mood data yet</h3>
            <p>Be the first to share how you're feeling!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Mood</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(summary?.average_mood || 0)}</span>
                  <span className={`text-2xl font-bold ${getMoodColor(summary?.average_mood || 0)}`}>
                    {summary?.average_mood.toFixed(1)}/5
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                <p className="text-2xl font-bold">{summary?.total_checkins || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Mood Distribution</p>
              <div className="flex gap-1">
                {MOOD_LABELS.map((emoji, index) => {
                  const count = summary?.mood_distribution 
                    ? Object.values(summary.mood_distribution)[4 - index] 
                    : 0;
                  const percentage = summary?.total_checkins 
                    ? (count / summary.total_checkins) * 100 
                    : 0;
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 text-center"
                      title={`${emoji} ${count} votes (${percentage.toFixed(1)}%)`}
                    >
                      <div className="text-sm">{emoji}</div>
                      <div
                        className="h-2 rounded-full mt-1"
                        style={{
                          backgroundColor: MOOD_COLORS[index],
                          opacity: percentage > 0 ? Math.max(0.3, percentage / 100) : 0.1,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how the event mood has evolved over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={chartConfig} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Comments */}
      {checkins.some(c => c.comment) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkins
                .filter(c => c.comment)
                .slice(-5)
                .reverse()
                .map((checkin) => (
                  <div key={checkin.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-lg">
                      {getMoodEmoji(checkin.mood_score)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">{checkin.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(checkin.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, DollarSign, Calendar } from "lucide-react";

interface EventStatsBoxProps {
  className?: string;
}

export const EventStatsBox: React.FC<EventStatsBoxProps> = ({ className = "" }) => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["event-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get organizer's events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .eq("is_active", true);

      if (eventsError) throw eventsError;

      // Get total views for all events
      const eventIds = events?.map(e => e.id) || [];
      const { count: totalViews } = await supabase
        .from("event_analytics")
        .select("*", { count: "exact", head: true })
        .in("event_id", eventIds)
        .eq("metric_type", "view");

      // Get total tickets sold
      const { count: totalRSVPs } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .in("event_id", eventIds);

      // Calculate total earnings
      const totalEarnings = events?.reduce((sum, event) => {
        return sum + (Number(event.price) * (event.current_attendees || 0));
      }, 0) || 0;

      return {
        totalEvents: events?.length || 0,
        totalViews: totalViews || 0,
        totalRSVPs: totalRSVPs || 0,
        totalEarnings,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="w-12 h-4 bg-gray-200 rounded" />
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded" />
                <div className="w-20 h-4 bg-gray-100 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Events",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Views",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total RSVPs",
      value: stats?.totalRSVPs || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Earnings",
      value: `R${(stats?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
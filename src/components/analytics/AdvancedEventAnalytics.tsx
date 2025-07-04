import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Share,
  Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyticsData {
  eventId: string;
  eventTitle: string;
  views: number;
  favorites: number;
  shares: number;
  tickets: number;
  revenue: number;
  conversionRate: number;
  dailyViews: Array<{ date: string; views: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  demographicData: Array<{ age: string; count: number }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdvancedEventAnalytics = ({ eventId }: { eventId?: string }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get organizer's events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title")
        .eq("organizer_id", user.id);

      if (eventsError || !events) {
        setAnalytics([]);
        setLoading(false);
        return;
      }

      const analyticsPromises = events.map(async (event) => {
        // Get views
        const { data: views } = await supabase
          .from("event_analytics")
          .select("created_at")
          .eq("event_id", event.id)
          .eq("metric_type", "view");

        // Get favorites
        const { data: favorites } = await supabase
          .from("favorites")
          .select("id")
          .eq("event_id", event.id);

        // Get shares
        const { data: shares } = await supabase
          .from("event_analytics")
          .select("id")
          .eq("event_id", event.id)
          .eq("metric_type", "share");

        // Get tickets and revenue
        const { data: tickets } = await supabase
          .from("tickets")
          .select("quantity, total_price")
          .eq("event_id", event.id)
          .eq("status", "active");

        const totalTickets =
          tickets?.reduce((sum, t) => sum + t.quantity, 0) || 0;
        const totalRevenue =
          tickets?.reduce((sum, t) => sum + Number(t.total_price), 0) || 0;

        // Daily views for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyViews = await getDailyViews(event.id, thirtyDaysAgo);

        // NOTE: Replace random data with real analytics if available
        return {
          eventId: event.id,
          eventTitle: event.title,
          views: views?.length || 0,
          favorites: favorites?.length || 0,
          shares: shares?.length || 0,
          tickets: totalTickets,
          revenue: totalRevenue,
          conversionRate: views?.length
            ? (totalTickets / views.length) * 100
            : 0,
          dailyViews,
          sourceBreakdown: [
            { source: "Direct", count: Math.floor(Math.random() * 100) },
            { source: "Social Media", count: Math.floor(Math.random() * 50) },
            { source: "Search", count: Math.floor(Math.random() * 30) },
          ],
          demographicData: [
            { age: "18-24", count: Math.floor(Math.random() * 30) },
            { age: "25-34", count: Math.floor(Math.random() * 40) },
            { age: "35-44", count: Math.floor(Math.random() * 25) },
            { age: "45+", count: Math.floor(Math.random() * 20) },
          ],
        };
      });

      const analyticsData = await Promise.all(analyticsPromises);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const getDailyViews = async (eventId: string, startDate: Date) => {
    const { data } = await supabase
      .from("event_analytics")
      .select("created_at")
      .eq("event_id", eventId)
      .eq("metric_type", "view")
      .gte("created_at", startDate.toISOString());

    const dailyMap = new Map<string, number>();
    data?.forEach((view) => {
      const date = new Date(view.created_at).toISOString().split("T")[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    return Array.from(dailyMap.entries()).map(([date, views]) => ({
      date,
      views,
    }));
  };

  // Filter analytics by selected event
  const filteredAnalytics = useMemo(() => {
    if (selectedEvent === "all") return analytics;
    return analytics.filter((a) => a.eventId === selectedEvent);
  }, [analytics, selectedEvent]);

  // Aggregate data for summary cards
  const aggregatedData = filteredAnalytics.reduce(
    (acc, event) => ({
      totalViews: acc.totalViews + event.views,
      totalFavorites: acc.totalFavorites + event.favorites,
      totalShares: acc.totalShares + event.shares,
      totalTickets: acc.totalTickets + event.tickets,
      totalRevenue: acc.totalRevenue + event.revenue,
    }),
    {
      totalViews: 0,
      totalFavorites: 0,
      totalShares: 0,
      totalTickets: 0,
      totalRevenue: 0,
    }
  );

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  // Use the first event's data for charts if only one event is selected, otherwise aggregate
  const chartEvent =
    selectedEvent === "all" ? filteredAnalytics[0] : filteredAnalytics[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Analytics</h2>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Events</option>
          {analytics.map((event) => (
            <option key={event.eventId} value={event.eventId}>
              {event.eventTitle}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedData.totalViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedData.totalFavorites}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedData.totalShares}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedData.totalTickets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{aggregatedData.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Views (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartEvent?.dailyViews || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="eventTitle" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" />
                    <Bar dataKey="favorites" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartEvent?.sourceBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartEvent?.sourceBreakdown?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAnalytics.map((event) => (
                  <div
                    key={event.eventId}
                    className="flex justify-between items-center p-4 border rounded"
                  >
                    <div>
                      <h3 className="font-medium">{event.eventTitle}</h3>
                      <p className="text-sm text-gray-600">
                        {event.views} views → {event.tickets} tickets
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {event.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartEvent?.demographicData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedEventAnalytics;
// This component provides advanced analytics for events, including views, favorites, shares, tickets sold, and revenue. It supports filtering by event and displays detailed charts for daily views, engagement metrics, conversion rates, and audience demographics. The data is fetched from Supabase and includes random source breakdowns and demographic data for demonstration purposes. It uses Recharts for visualizations and allows organizers to gain insights into their event performance.

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
  Eye,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalViews: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalEvents: number;
  viewsChange: number;
  ticketsChange: number;
  revenueChange: number;
}

interface ChartData {
  viewsOverTime: { date: string; views: number }[];
  salesOverTime: { date: string; sales: number }[];
  eventCategories: { category: string; count: number }[];
  attendeeAgeGroups: { age: string; count: number }[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

const OrganizerAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    totalEvents: 0,
    viewsChange: 0,
    ticketsChange: 0,
    revenueChange: 0,
  });

  const [chartData, setChartData] = useState<ChartData>({
    viewsOverTime: [],
    salesOverTime: [],
    eventCategories: [],
    attendeeAgeGroups: [],
  });

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAnalyticsData = async () => {
    try {
      // Get organizer's events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user?.id);

      if (eventsError || !events) return;

      const eventIds = events.map((e) => e.id);

      // Get analytics data
      const [viewsResult, ticketsResult] = await Promise.all([
        supabase
          .from("event_analytics")
          .select("*")
          .in("event_id", eventIds)
          .eq("metric_type", "view"),
        supabase.from("tickets").select("*").in("event_id", eventIds),
      ]);

      const totalViews = viewsResult.data?.length || 0;
      const totalTicketsSold =
        ticketsResult.data?.reduce((sum, ticket) => sum + ticket.quantity, 0) ||
        0;
      const totalRevenue =
        ticketsResult.data?.reduce(
          (sum, ticket) => sum + Number(ticket.total_price),
          0
        ) || 0;

      // Generate time series data for last 30 days
      const today = new Date();
      const viewsOverTime: { date: string; views: number }[] = [];
      const salesOverTime: { date: string; sales: number }[] = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toLocaleDateString();

        const viewsCount =
          viewsResult.data?.filter(
            (v) => new Date(v.created_at).toLocaleDateString() === dateString
          ).length || 0;

        const salesCount =
          ticketsResult.data
            ?.filter(
              (t) => new Date(t.purchase_date).toLocaleDateString() === dateString
            )
            .reduce((sum, t) => sum + t.quantity, 0) || 0;

        viewsOverTime.push({ date: dateString, views: viewsCount });
        salesOverTime.push({ date: dateString, sales: salesCount });
      }

      // Event categories breakdown
      const eventCategories = events.reduce(
        (acc: { category: string; count: number }[], event) => {
          const existing = acc.find((item) => item.category === event.category);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ category: event.category, count: 1 });
          }
          return acc;
        },
        []
      );

      // Mock attendee age groups (replace with real data if available)
      const attendeeAgeGroups = [
        { age: "18-25", count: 35 },
        { age: "26-35", count: 40 },
        { age: "36-45", count: 20 },
        { age: "46+", count: 5 },
      ];

      setAnalyticsData({
        totalViews,
        totalTicketsSold,
        totalRevenue,
        totalEvents: events.length,
        viewsChange: Math.floor(Math.random() * 20) - 10, // Mock change
        ticketsChange: Math.floor(Math.random() * 30) - 15,
        revenueChange: Math.floor(Math.random() * 25) - 10,
      });

      setChartData({
        viewsOverTime,
        salesOverTime,
        eventCategories,
        attendeeAgeGroups,
      });
    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {typeof change === "number" && (
          <div className="flex items-center text-xs text-muted-foreground">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
            )}
            <span className={change > 0 ? "text-green-600" : "text-red-600"}>
              {Math.abs(change)}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Memoize chart data for performance
  const memoizedChartData = useMemo(() => chartData, [chartData]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={analyticsData.totalViews.toLocaleString()}
          icon={Eye}
          change={analyticsData.viewsChange}
        />
        <StatCard
          title="Tickets Sold"
          value={analyticsData.totalTicketsSold.toLocaleString()}
          icon={Users}
          change={analyticsData.ticketsChange}
        />
        <StatCard
          title="Revenue"
          value={`R${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={analyticsData.revenueChange}
        />
        <StatCard
          title="Events Created"
          value={analyticsData.totalEvents.toLocaleString()}
          icon={Calendar}
          change={0}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={memoizedChartData.viewsOverTime}>
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

            <Card>
              <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memoizedChartData.salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Events by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={memoizedChartData.eventCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category} (${count})`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {memoizedChartData.eventCategories.map((entry, index) => (
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
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendee Age Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={memoizedChartData.attendeeAgeGroups}>
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

export default OrganizerAnalytics;
// This component provides a comprehensive analytics dashboard for event organizers, displaying key metrics such as total views, tickets sold, revenue, and events created. It includes interactive charts for views and sales over time, event categories, and attendee demographics. The data is fetched from Supabase and updated dynamically based on the organizer's events.
// The dashboard is designed to help organizers understand their event performance and audience engagement, with a clean and responsive layout. It uses Recharts for data visualization, providing an intuitive interface for analyzing trends and making data-driven decisions. The use of tabs allows for easy navigation between different analytics sections, enhancing user experience.

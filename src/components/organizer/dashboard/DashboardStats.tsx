import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";

interface OrganizerEvent {
  created_at: string;
  // Add other event properties as needed
}

interface PerformanceMetrics {
  totalAttendees: number;
  conversionRate: number;
  totalRevenue: number;
  averageRating: number;
}

interface DashboardStatsProps {
  organizerEvents: OrganizerEvent[];
  performanceMetrics: PerformanceMetrics;
}

const DashboardStats = ({
  organizerEvents = [],
  performanceMetrics = {
    totalAttendees: 0,
    conversionRate: 0,
    totalRevenue: 0,
    averageRating: 0,
  },
}: DashboardStatsProps) => {
  // Defensive checks and calculations
  const totalEvents = Array.isArray(organizerEvents)
    ? organizerEvents.length
    : 0;
  const eventsThisMonth = Array.isArray(organizerEvents)
    ? organizerEvents.filter((e) => {
        const eventDate = new Date(e.created_at);
        const now = new Date();
        return (
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear()
        );
      }).length
    : 0;

  const totalAttendees = Number(performanceMetrics?.totalAttendees) || 0;
  const conversionRate = Number(performanceMetrics?.conversionRate) || 0;
  const totalRevenue = Number(performanceMetrics?.totalRevenue) || 0;
  const averageRating = Number(performanceMetrics?.averageRating) || 0;
  const avgRevenuePerEvent =
    totalEvents > 0 ? (totalRevenue / totalEvents).toFixed(0) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-purple-600" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            +{eventsThisMonth} this month
          </p>
        </CardContent>
      </Card>

      {/* Total Attendees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
          <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAttendees}</div>
          <p className="text-xs text-muted-foreground">
            {conversionRate.toFixed(1)}% conversion rate
          </p>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            ${avgRevenuePerEvent} avg per event
          </p>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Out of 5.0 stars</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
// This component displays key statistics for the organizer's dashboard, including total events, total attendees, revenue, and average rating.
// It uses defensive programming techniques to ensure that the data is valid and handles cases where data may be missing or malformed.
// The statistics are displayed in a grid layout with cards for each metric, providing a clear and concise overview of the organizer's performance.
// The component also includes icons for visual distinction and better user experience.
// The calculations for metrics like average revenue per event and conversion rate are performed safely, ensuring that division by zero is avoided.
// The component is designed to be responsive, adapting to different screen sizes with a grid layout that adjusts the number of columns based on the viewport width.

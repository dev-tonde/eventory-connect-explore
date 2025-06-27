
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  organizerEvents: any[];
  performanceMetrics: any;
}

const DashboardStats = ({ organizerEvents, performanceMetrics }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{organizerEvents.length}</div>
          <p className="text-xs text-muted-foreground">
            +{organizerEvents.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performanceMetrics?.totalAttendees || 0}</div>
          <p className="text-xs text-muted-foreground">
            {performanceMetrics?.conversionRate.toFixed(1)}% conversion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${performanceMetrics?.totalRevenue.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            ${((performanceMetrics?.totalRevenue || 0) / (organizerEvents.length || 1)).toFixed(0)} avg per event
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {performanceMetrics?.averageRating.toFixed(1) || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Out of 5.0 stars
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;

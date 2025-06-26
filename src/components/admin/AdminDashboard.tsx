
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, AlertTriangle, DollarSign, TrendingUp, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalReports: number;
  totalRevenue: number;
  pendingApprovals: number;
  pendingRefunds: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalReports: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    pendingRefunds: 0,
  });

  const [pendingEvents, setPendingEvents] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const [usersResult, eventsResult, reportsResult, ticketsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('user_reports').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('tickets').select('total_price')
      ]);

      const totalRevenue = ticketsResult.data?.reduce((sum, ticket) => sum + Number(ticket.total_price), 0) || 0;

      // Get pending approvals
      const { data: pendingApprovalsData } = await supabase
        .from('event_approvals')
        .select('*')
        .eq('status', 'pending');

      // Get pending refunds
      const { data: pendingRefundsData } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('status', 'pending');

      setStats({
        totalUsers: usersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalReports: reportsResult.count || 0,
        totalRevenue,
        pendingApprovals: pendingApprovalsData?.length || 0,
        pendingRefunds: pendingRefundsData?.length || 0,
      });

      // Load detailed data for tables
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          event_approvals(status, created_at)
        `)
        .limit(10);

      const { data: reportsData } = await supabase
        .from('user_reports')
        .select(`
          *,
          reporter:reporter_id(first_name, last_name),
          reported_user:reported_user_id(first_name, last_name)
        `)
        .eq('status', 'pending')
        .limit(10);

      setPendingEvents(eventsData || []);
      setRecentReports(reportsData || []);
      setRefundRequests(pendingRefundsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const approveEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_approvals')
        .upsert([{
          event_id: eventId,
          status: 'approved',
          admin_id: user?.id,
          reviewed_at: new Date().toISOString()
        }]);

      if (error) throw error;
      loadDashboardData();
    } catch (error) {
      console.error('Error approving event:', error);
    }
  };

  const rejectEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_approvals')
        .upsert([{
          event_id: eventId,
          status: 'rejected',
          admin_id: user?.id,
          reviewed_at: new Date().toISOString()
        }]);

      if (error) throw error;
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting event:', error);
    }
  };

  const resolveReport = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      loadDashboardData();
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRefunds}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Event Approvals</TabsTrigger>
          <TabsTrigger value="reports">User Reports</TabsTrigger>
          <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Event Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEvents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending events to review</p>
                ) : (
                  pendingEvents.map((event: any) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            <span>{event.venue}</span>
                            <span>${event.price}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveEvent(event.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectEvent(event.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending reports</p>
                ) : (
                  recentReports.map((report: any) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{report.report_type}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{report.description}</p>
                          <div className="text-xs text-gray-500">
                            Reporter: {report.reporter?.first_name} {report.reporter?.last_name}
                            {report.reported_user && (
                              <span> | Reported User: {report.reported_user.first_name} {report.reported_user.last_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => resolveReport(report.id, 'resolved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveReport(report.id, 'dismissed')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {refundRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending refund requests</p>
                ) : (
                  refundRequests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${request.refund_amount}</span>
                            <Badge variant="outline">{request.status}</Badge>
                          </div>
                          <p className="text-sm">{request.reason}</p>
                          <div className="text-xs text-gray-500">
                            Requested: {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DollarSign, Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

interface PaymentRecord {
  id: string;
  payment_reference: string | null;
  total_price: number;
  payment_status: string | null;
  payment_method: string | null;
  purchase_date: string;
  event_title?: string;
  user_email?: string;
}

const PaymentReconciliation = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadPayments();
  }, [dateRange, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tickets')
        .select(`
          id,
          payment_reference,
          total_price,
          payment_status,
          payment_method,
          purchase_date,
          event_id,
          user_id
        `)
        .order('purchase_date', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter);
      }

      if (dateRange?.from) {
        query = query.gte('purchase_date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('purchase_date', dateRange.to.toISOString());
      }

      const { data: ticketsData, error } = await query;
      
      if (error) {
        console.error('Error loading payments:', error);
        setPayments([]);
        return;
      }

      if (!ticketsData || ticketsData.length === 0) {
        setPayments([]);
        return;
      }

      // Get unique event IDs and user IDs
      const eventIds = [...new Set(ticketsData.map(t => t.event_id).filter(Boolean))];
      const userIds = [...new Set(ticketsData.map(t => t.user_id).filter(Boolean))];

      // Fetch events data
      let eventsData: any[] = [];
      if (eventIds.length > 0) {
        const { data: events } = await supabase
          .from('events')
          .select('id, title')
          .in('id', eventIds);
        eventsData = events || [];
      }

      // Fetch profiles data
      let profilesData: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        profilesData = profiles || [];
      }

      // Combine the data
      const enrichedPayments: PaymentRecord[] = ticketsData.map(ticket => {
        const event = eventsData.find(e => e.id === ticket.event_id);
        const profile = profilesData.find(p => p.id === ticket.user_id);
        
        return {
          id: ticket.id,
          payment_reference: ticket.payment_reference,
          total_price: ticket.total_price,
          payment_status: ticket.payment_status,
          payment_method: ticket.payment_method,
          purchase_date: ticket.purchase_date,
          event_title: event?.title,
          user_email: profile?.email
        };
      });

      setPayments(enrichedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = () => {
    const csv = [
      ['Date', 'Reference', 'Event', 'User Email', 'Amount', 'Status', 'Method'].join(','),
      ...payments.map(payment => [
        new Date(payment.purchase_date).toLocaleDateString(),
        payment.payment_reference || 'N/A',
        payment.event_title || 'N/A',
        payment.user_email || 'N/A',
        `R${payment.total_price.toFixed(2)}`,
        payment.payment_status || 'N/A',
        payment.payment_method || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredPayments = payments.filter(payment =>
    (payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.event_title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRevenue = filteredPayments.reduce((sum, payment) => 
    payment.payment_status === 'completed' ? sum + Number(payment.total_price) : sum, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Reconciliation</h2>
        <Button onClick={exportPayments} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPayments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredPayments.filter(p => p.payment_status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, event, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {payment.payment_reference || 'N/A'}
                  </TableCell>
                  <TableCell>{payment.event_title || 'N/A'}</TableCell>
                  <TableCell>{payment.user_email || 'N/A'}</TableCell>
                  <TableCell>R{payment.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      payment.payment_status === 'completed' ? 'default' :
                      payment.payment_status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {payment.payment_status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPayments.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No payments found matching your criteria.
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading payments...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReconciliation;

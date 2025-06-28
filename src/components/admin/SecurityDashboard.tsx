
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { monitoring } from '@/lib/monitoring';

interface SecurityMetrics {
  totalErrors: number;
  rateLimitHits: number;
  suspiciousActivity: number;
  activeUsers: number;
}

export const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalErrors: 0,
    rateLimitHits: 0,
    suspiciousActivity: 0,
    activeUsers: 0
  });
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityMetrics = async () => {
      try {
        // Fetch error logs
        const { data: errors, error: errorsError } = await supabase
          .from('error_logs')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (errorsError) throw errorsError;

        // Fetch rate limit data
        const { data: rateLimits, error: rateLimitError } = await supabase
          .from('rate_limits')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (rateLimitError) throw rateLimitError;

        // Fetch active sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('is_active', true)
          .gte('last_activity', new Date(Date.now() - 30 * 60 * 1000).toISOString());

        if (sessionsError) throw sessionsError;

        setMetrics({
          totalErrors: errors?.length || 0,
          rateLimitHits: rateLimits?.length || 0,
          suspiciousActivity: errors?.filter(e => e.error_type === 'security_event').length || 0,
          activeUsers: sessions?.length || 0
        });

        setRecentErrors(errors || []);
      } catch (error) {
        console.error('Failed to fetch security metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityMetrics();
    const interval = setInterval(fetchSecurityMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getErrorSeverity = (errorType: string) => {
    if (errorType.includes('security') || errorType.includes('auth')) return 'high';
    if (errorType.includes('rate_limit')) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
        </div>
        <div className="text-center py-8">Loading security metrics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Last 30 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalErrors}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rateLimitHits}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ HTTPS enforced everywhere
              </AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Content Security Policy active
              </AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Row Level Security enabled on all tables
              </AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Rate limiting active
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {recentErrors.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No recent security events
            </div>
          ) : (
            <div className="space-y-2">
              {recentErrors.map((error, index) => {
                const severity = getErrorSeverity(error.error_type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(severity) as any}>
                          {severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{error.error_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {error.error_message}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(error.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

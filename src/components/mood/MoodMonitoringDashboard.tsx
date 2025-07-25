import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock, TrendingDown, Users, CheckCircle } from "lucide-react";
import { useMoodMonitoring } from "@/hooks/useMoodMonitoring";
import { format } from "date-fns";

interface MoodMonitoringDashboardProps {
  eventId: string;
  organizerId: string;
}

export const MoodMonitoringDashboard: React.FC<MoodMonitoringDashboardProps> = ({
  eventId,
  organizerId
}) => {
  const {
    alerts,
    currentPerformance,
    isMonitoring,
    resolveAlert,
    startMonitoring,
    stopMonitoring
  } = useMoodMonitoring(eventId, organizerId);

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved_at);

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return "text-green-600";
    if (mood >= 3) return "text-yellow-600";
    if (mood >= 2) return "text-orange-600";
    return "text-red-600";
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 4) return "Great";
    if (mood >= 3) return "Good";
    if (mood >= 2) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mood Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time audience mood tracking and alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
          </Badge>
          {!isMonitoring && (
            <Button onClick={startMonitoring} variant="outline">
              Start Monitoring
            </Button>
          )}
          {isMonitoring && (
            <Button onClick={stopMonitoring} variant="outline">
              Stop Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* Current Performance */}
      {currentPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Current Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Artist</p>
                <p className="font-semibold">{currentPerformance.artist_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Slot</p>
                <p className="font-semibold">
                  {currentPerformance.start_time} - {currentPerformance.end_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Mood</p>
                <p className={`font-semibold text-2xl ${getMoodColor(currentPerformance.average_mood)}`}>
                  {currentPerformance.average_mood.toFixed(1)}/5
                </p>
                <p className="text-sm text-muted-foreground">
                  {getMoodLabel(currentPerformance.average_mood)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-ins</p>
                <p className="font-semibold flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{currentPerformance.checkin_count}</span>
                </p>
              </div>
            </div>

            {currentPerformance.average_mood < currentPerformance.alert_threshold && (
              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <TrendingDown className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention:</strong> Mood is below threshold ({currentPerformance.alert_threshold}). 
                  Monitoring for potential alert...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {unresolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Active Mood Alerts ({unresolvedAlerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unresolvedAlerts.map((alert) => (
              <Alert key={alert.id} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        Low mood detected: {alert.alert_data?.artist_name}
                      </p>
                      <p className="text-sm">
                        Average mood: {alert.average_mood.toFixed(1)}/5 for {alert.duration_minutes} minutes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alert History */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alert History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {alert.alert_data?.artist_name || 'Unknown Artist'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mood: {alert.average_mood.toFixed(1)}/5 for {alert.duration_minutes} minutes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.resolved_at ? "secondary" : "destructive"}>
                      {alert.resolved_at ? "Resolved" : "Active"}
                    </Badge>
                    {alert.resolved_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolved: {format(new Date(alert.resolved_at), 'HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No current performance */}
      {!currentPerformance && isMonitoring && (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No performance currently active. Monitoring for mood data during scheduled performances.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
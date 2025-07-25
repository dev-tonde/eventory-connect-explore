import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MoodAlert {
  id: string;
  event_id: string;
  lineup_id?: string;
  organizer_id: string;
  alert_type: string;
  threshold_value: number;
  average_mood: number;
  duration_minutes: number;
  resolved_at?: string;
  created_at: string;
  alert_data: any;
}

interface CurrentPerformance {
  lineup_id: string;
  artist_name: string;
  start_time: string;
  end_time: string;
  average_mood: number;
  checkin_count: number;
  alert_threshold: number;
}

export const useMoodMonitoring = (eventId: string, organizerId?: string) => {
  const [alerts, setAlerts] = useState<MoodAlert[]>([]);
  const [currentPerformance, setCurrentPerformance] = useState<CurrentPerformance | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  // Track mood state for alert thresholds
  const [lowMoodStartTime, setLowMoodStartTime] = useState<Date | null>(null);

  // Fetch current performance and mood data
  const fetchCurrentPerformance = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_performance_with_mood', {
        event_uuid: eventId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const performance = data[0];
        setCurrentPerformance(performance);

        // Check if mood is below threshold
        if (performance.average_mood < performance.alert_threshold && performance.checkin_count > 5) {
          if (!lowMoodStartTime) {
            setLowMoodStartTime(new Date());
          } else {
            // Check if low mood has persisted for more than 3 minutes
            const duration = (new Date().getTime() - lowMoodStartTime.getTime()) / (1000 * 60);
            if (duration >= 3) {
              await createMoodAlert(performance, Math.floor(duration));
              setLowMoodStartTime(null); // Reset after creating alert
            }
          }
        } else {
          setLowMoodStartTime(null); // Reset if mood improves
        }
      } else {
        setCurrentPerformance(null);
        setLowMoodStartTime(null);
      }
    } catch (error) {
      console.error('Error fetching current performance:', error);
    }
  };

  // Create mood alert
  const createMoodAlert = async (performance: CurrentPerformance, durationMinutes: number) => {
    if (!organizerId) return;

    try {
      const { error } = await supabase
        .from('mood_alerts')
        .insert({
          event_id: eventId,
          lineup_id: performance.lineup_id,
          organizer_id: organizerId,
          alert_type: 'low_mood',
          threshold_value: performance.alert_threshold,
          average_mood: performance.average_mood,
          duration_minutes: durationMinutes,
          alert_data: {
            artist_name: performance.artist_name,
            checkin_count: performance.checkin_count,
            start_time: performance.start_time,
            end_time: performance.end_time
          }
        });

      if (error) throw error;

      toast({
        title: "Mood Alert",
        description: `Low audience mood detected for ${performance.artist_name}. Average mood: ${performance.average_mood.toFixed(1)}/5`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error creating mood alert:', error);
    }
  };

  // Fetch mood alerts
  const fetchAlerts = async () => {
    if (!organizerId) return;

    try {
      const { data, error } = await supabase
        .from('mood_alerts')
        .select('*')
        .eq('event_id', eventId)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('mood_alerts')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, resolved_at: new Date().toISOString() }
            : alert
        )
      );

      toast({
        title: "Alert Resolved",
        description: "Mood alert has been marked as resolved.",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  // Start monitoring
  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // Initial fetch
    fetchCurrentPerformance();
    fetchAlerts();

    // Set up real-time subscriptions
    const moodChannel = supabase
      .channel('mood-monitoring')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mood_checkins', filter: `event_id=eq.${eventId}` },
        () => {
          fetchCurrentPerformance();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mood_alerts', filter: `event_id=eq.${eventId}` },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchCurrentPerformance, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(moodChannel);
    };
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  useEffect(() => {
    if (eventId && organizerId) {
      return startMonitoring();
    }
  }, [eventId, organizerId]);

  return {
    alerts,
    currentPerformance,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resolveAlert,
    fetchAlerts,
    fetchCurrentPerformance
  };
};
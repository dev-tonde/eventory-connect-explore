import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_id?: string;
  user_id?: string;
  properties?: Record<string, any>;
}

interface AnalyticsMetrics {
  pageViews: number;
  uniqueVisitors: number;
  eventViews: number;
  ticketSales: number;
  revenue: number;
  conversionRate: number;
}

export function useAdvancedAnalytics() {
  const [isTracking, setIsTracking] = useState(false);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  // Track events to Google Analytics and internal database
  const trackEvent = async (eventData: AnalyticsEvent) => {
    try {
      setIsTracking(true);

      // Track to internal database
      await supabase.from('event_analytics').insert({
        event_id: eventData.event_id,
        user_id: eventData.user_id,
        metric_type: eventData.event_name,
        session_id: generateSessionId(),
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      });

      // Track to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventData.event_name, {
          event_category: 'eventory',
          event_label: eventData.event_id,
          custom_parameter_1: eventData.user_id,
          ...eventData.properties,
        });
      }

      console.log('Analytics event tracked:', eventData.event_name);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    } finally {
      setIsTracking(false);
    }
  };

  // Track page views
  const trackPageView = async (page: string, eventId?: string) => {
    await trackEvent({
      event_name: 'page_view',
      event_id: eventId,
      properties: { page },
    });
  };

  // Track event interactions
  const trackEventInteraction = async (
    interaction: string,
    eventId: string,
    properties?: Record<string, any>
  ) => {
    await trackEvent({
      event_name: `event_${interaction}`,
      event_id: eventId,
      properties,
    });
  };

  // Track user actions
  const trackUserAction = async (
    action: string,
    properties?: Record<string, any>
  ) => {
    await trackEvent({
      event_name: `user_${action}`,
      properties,
    });
  };

  // Fetch analytics metrics
  const fetchMetrics = async (dateRange: { start: Date; end: Date }) => {
    try {
      const { data: analyticsData, error } = await supabase
        .from('event_analytics')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      if (error) throw error;

      // Calculate metrics
      const pageViews = analyticsData?.filter(d => d.metric_type === 'page_view').length || 0;
      const uniqueVisitors = new Set(analyticsData?.map(d => d.user_id)).size;
      const eventViews = analyticsData?.filter(d => d.metric_type === 'event_view').length || 0;

      // Fetch ticket sales and revenue
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('quantity, total_price')
        .gte('purchase_date', dateRange.start.toISOString())
        .lte('purchase_date', dateRange.end.toISOString())
        .eq('payment_status', 'completed');

      const ticketSales = ticketData?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
      const revenue = ticketData?.reduce((sum, ticket) => sum + Number(ticket.total_price), 0) || 0;
      const conversionRate = eventViews > 0 ? (ticketSales / eventViews) * 100 : 0;

      const calculatedMetrics = {
        pageViews,
        uniqueVisitors,
        eventViews,
        ticketSales,
        revenue,
        conversionRate,
      };

      setMetrics(calculatedMetrics);
      return calculatedMetrics;
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return null;
    }
  };

  // Generate session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize Google Analytics
  useEffect(() => {
    const initializeGA = async () => {
      try {
        const { data } = await supabase.functions.invoke('google-analytics-config');
        
        if (data?.trackingId) {
          // Load Google Analytics script
          const script = document.createElement('script');
          script.src = `https://www.googletagmanager.com/gtag/js?id=${data.trackingId}`;
          script.async = true;
          document.head.appendChild(script);

          // Initialize gtag
          (window as any).dataLayer = (window as any).dataLayer || [];
          function gtag(...args: any[]) {
            (window as any).dataLayer.push(args);
          }
          (window as any).gtag = gtag;

          gtag('js', new Date());
          gtag('config', data.trackingId, {
            page_title: 'Eventory',
            page_location: window.location.href,
          });

          console.log('Google Analytics initialized');
        }
      } catch (error) {
        console.warn('Google Analytics initialization failed:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initializeGA();
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackEventInteraction,
    trackUserAction,
    fetchMetrics,
    metrics,
    isTracking,
  };
}
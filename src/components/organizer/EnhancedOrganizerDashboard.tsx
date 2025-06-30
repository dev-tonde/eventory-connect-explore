import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Calendar, Sparkles, History, Target, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import OrganizerAnalytics from "@/components/analytics/OrganizerAnalytics";
import EnhancedDynamicPricing from "./EnhancedDynamicPricing";
import DashboardStats from "./dashboard/DashboardStats";
import EventCard from "./dashboard/EventCard";
import AIInsightsTab from "./dashboard/AIInsightsTab";
import DashboardTools from "./dashboard/DashboardTools";
import RevenueAnalyticsDashboard from "@/components/analytics/RevenueAnalyticsDashboard";

const EnhancedOrganizerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Get organizer's events with enhanced data
  const { data: organizerEvents = [] } = useQuery({
    queryKey: ["enhanced-organizer-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          tickets:tickets(count),
          favorites:favorites(count),
          reviews:event_reviews(rating)
        `)
        .eq("organizer_id", user.id)
        .eq("is_active", true)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && profile?.role === "organizer",
  });

  // Separate upcoming and past events
  const upcomingEvents = organizerEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = organizerEvents.filter(event => new Date(event.date) < new Date());

  // AI-powered event recommendations
  const { data: aiRecommendations } = useQuery({
    queryKey: ["ai-recommendations", user?.id],
    queryFn: async () => {
      return [
        {
          type: "pricing",
          title: "Optimize Pricing Strategy",
          description: "Consider increasing prices for 'Summer Music Festival' by 15% based on high demand signals.",
          confidence: 85,
          actionable: true
        },
        {
          type: "promotion",
          title: "Promote on Social Media",
          description: "Your 'Tech Conference 2024' could benefit from Instagram promotion targeting developers aged 25-35.",
          confidence: 92,
          actionable: true
        },
        {
          type: "timing",
          title: "Optimal Event Timing",
          description: "Saturday evening events show 23% higher attendance in your area.",
          confidence: 78,
          actionable: false
        }
      ];
    },
    enabled: !!user && profile?.role === "organizer",
  });

  // Performance metrics
  const { data: performanceMetrics } = useQuery({
    queryKey: ["performance-metrics", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: analytics } = await supabase
        .from("event_analytics")
        .select("*")
        .in("event_id", organizerEvents.map(e => e.id))
        .eq("metric_type", "view");

      const totalViews = analytics?.length || 0;
      const totalRevenue = organizerEvents.reduce((sum, event) => 
        sum + (Number(event.price) * (event.current_attendees || 0)), 0
      );
      const totalAttendees = organizerEvents.reduce((sum, event) => 
        sum + (event.current_attendees || 0), 0
      );
      const averageRating = organizerEvents.reduce((sum, event) => {
        const reviews = event.reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((rSum: number, r: any) => rSum + r.rating, 0) / reviews.length 
          : 0;
        return sum + avgRating;
      }, 0) / organizerEvents.length;

      return {
        totalViews,
        totalRevenue,
        totalAttendees,
        averageRating: averageRating || 0,
        conversionRate: totalViews > 0 ? (totalAttendees / totalViews) * 100 : 0,
        events: organizerEvents.length
      };
    },
    enabled: !!user && organizerEvents.length > 0,
  });

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  const handlePriceUpdate = (eventId: string, newPrice: number) => {
    console.log(`Price updated for event ${eventId}: $${newPrice}`);
  };

  return (
    <div className="space-y-8">
      {/* AI-Powered Insights Banner */}
      {aiRecommendations && aiRecommendations.length > 0 && (
        <Alert className="border-purple-200 bg-purple-50">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <div className="flex items-center justify-between">
              <span>AI has {aiRecommendations.length} new recommendations for your events</span>
              <Button variant="outline" size="sm" className="ml-4">
                View All
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <DashboardStats organizerEvents={organizerEvents} performanceMetrics={performanceMetrics} />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="past-events">Past Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button onClick={handleCreateEvent} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Event
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onManagePricing={setSelectedEventId}
              />
            ))}

            {upcomingEvents.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No upcoming events
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first event to get started with advanced features
                  </p>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past-events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Past Events</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <History className="h-3 w-3" />
              {pastEvents.length} completed
            </Badge>
          </div>

          <div className="space-y-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast={true} />
            ))}

            {pastEvents.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No past events
                  </h3>
                  <p className="text-gray-600">
                    Your completed events will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <OrganizerAnalytics />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Revenue Analytics</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Advanced Analytics
            </Badge>
          </div>
          <RevenueAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid gap-6">
            {selectedEventId ? (
              <EnhancedDynamicPricing
                eventId={selectedEventId}
                basePrice={organizerEvents.find(e => e.id === selectedEventId)?.price || 0}
                attendeeCount={organizerEvents.find(e => e.id === selectedEventId)?.current_attendees || 0}
                maxAttendees={organizerEvents.find(e => e.id === selectedEventId)?.max_attendees || 100}
                eventDate={organizerEvents.find(e => e.id === selectedEventId)?.date || ''}
                onPriceUpdate={(newPrice) => handlePriceUpdate(selectedEventId, newPrice)}
                isEditable={true}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select an Event</h3>
                  <p className="text-gray-600 mb-4">
                    Choose an event from the Events tab to manage its dynamic pricing
                  </p>
                  <Button onClick={() => navigate('#events')}>
                    Go to Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <AIInsightsTab aiRecommendations={aiRecommendations || []} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <DashboardTools />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedOrganizerDashboard;

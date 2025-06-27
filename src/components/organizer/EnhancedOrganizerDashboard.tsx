import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Wand2,
  BarChart3,
  MessageSquare,
  Settings,
  AlertCircle,
  Target,
  Sparkles,
  History
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import OrganizerAnalytics from "@/components/analytics/OrganizerAnalytics";
import EnhancedDynamicPricing from "./EnhancedDynamicPricing";

const EnhancedOrganizerDashboard = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { events: allEvents } = useEvents();
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
      // Mock AI recommendations (in production, this would call an AI service)
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
    // Update event price in database
  };

  const EventCard = ({ event, isPast = false }: { event: any, isPast?: boolean }) => {
    const soldPercentage = ((event.current_attendees || 0) / (event.max_attendees || 100)) * 100;
    
    return (
      <Card key={event.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={event.image_url || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  {isPast ? (
                    <Badge variant="outline">Completed</Badge>
                  ) : (
                    <Badge variant="secondary">Upcoming</Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {new Date(event.date).toLocaleDateString()} • {event.venue}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tickets Sold</span>
                    <span className="font-medium">
                      {event.current_attendees || 0}/{event.max_attendees || 100}
                    </span>
                  </div>
                  <Progress value={soldPercentage} className="h-2" />
                </div>
                
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      ${(Number(event.price) * (event.current_attendees || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{event.current_attendees || 0} attendees</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!isPast && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    Manage Pricing
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit Event
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="past-events">Past Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
              <EventCard key={event.id} event={event} />
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
          <div className="grid gap-6">
            {aiRecommendations?.map((recommendation, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                      {recommendation.title}
                    </CardTitle>
                    <Badge variant="outline">
                      {recommendation.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{recommendation.description}</p>
                  {recommendation.actionable && (
                    <Button size="sm" variant="outline">
                      Apply Recommendation
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  AI Poster Generator
                </CardTitle>
                <CardDescription>
                  Generate stunning event posters with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/poster-studio")}>
                  Create Poster
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>
                  Deep dive into your event performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  Community Tools
                </CardTitle>
                <CardDescription>
                  Manage event communities and chat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Manage Communities
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedOrganizerDashboard;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { events: allEvents } = useEvents();

  // Get organizer's events
  const { data: organizerEvents = [] } = useQuery({
    queryKey: ["organizer-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .eq("is_active", true)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && profile?.role === "organizer",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "organizer") {
      navigate("/become-organizer");
      return;
    }
  }, [isAuthenticated, profile, navigate]);

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  // Don't render anything if user is not authenticated or not an organizer
  if (!isAuthenticated || profile?.role !== "organizer") {
    return null;
  }

  const totalRevenue = organizerEvents.reduce(
    (sum, event) => sum + (Number(event.price) * (event.current_attendees || 0)),
    0
  );
  const totalAttendees = organizerEvents.reduce(
    (sum, event) => sum + (event.current_attendees || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your events and track performance
            </p>
          </div>
          <Button onClick={handleCreateEvent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizerEvents.length}</div>
              <p className="text-xs text-muted-foreground">Active events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Attendees
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendees}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Attendance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizerEvents.length > 0
                  ? Math.round(totalAttendees / organizerEvents.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Per event</p>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>
              Manage and track your event performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizerEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={event.image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()} •{" "}
                        {event.venue}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-green-600">
                          {event.current_attendees || 0}/{event.max_attendees || 100} tickets
                          sold
                        </span>
                        <span className="text-purple-600">
                          $
                          {(Number(event.price) * (event.current_attendees || 0)).toLocaleString()}{" "}
                          revenue
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}

              {organizerEvents.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No events yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first event to get started
                  </p>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

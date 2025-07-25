import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { EventListTable } from "@/components/organizer/EventListTable";
import { CreateEventButton } from "@/components/organizer/CreateEventButton";
import { EventStatsBox } from "@/components/organizer/EventStatsBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, UserPlus } from "lucide-react";

const OrganizerEvents = () => {
  const { user, profile, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to become organizer if not an organizer
  if (profile?.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Organizer Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-gray-600">
                You need to be an organizer to access this page. Upgrade your
                account to start creating and managing events.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Current Status: {profile?.role || "Attendee"}
                </h4>
                <p className="text-sm text-blue-800">
                  Upgrade to organizer to unlock event creation, analytics, and
                  management tools.
                </p>
              </div>
              <CreateEventButton variant="outline" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your events, track performance, and grow your audience
            </p>
          </div>
          <CreateEventButton size="lg" />
        </div>

        {/* Stats Overview */}
        <EventStatsBox className="mb-8" />

        {/* Events Table */}
        <EventListTable />
      </div>
    </div>
  );
};

export default OrganizerEvents;
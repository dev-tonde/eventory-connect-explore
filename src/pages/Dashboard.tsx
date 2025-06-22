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
import { Event } from "@/types/event";
import { useAuth } from "@/contexts/useAuth";

// Mock data for organizer's events
const mockOrganizerEvents: Event[] = [
  {
    id: "org-1",
    title: "Summer Music Festival",
    description: "Amazing day of live music",
    date: "2024-07-15",
    time: "14:00",
    location: "Central Park",
    address: "123 Park Avenue, New York, NY",
    price: 75,
    category: "Music",
    image: "/placeholder.svg",
    organizer: "Music Events Co.",
    attendeeCount: 150,
    maxAttendees: 500,
    tags: ["outdoor", "festival", "music"],
  },
  {
    id: "org-2",
    title: "Art Gallery Opening",
    description: "Exclusive art exhibition opening",
    date: "2024-07-25",
    time: "18:00",
    location: "Downtown Gallery",
    address: "456 Art Street, New York, NY",
    price: 30,
    category: "Arts",
    image: "/placeholder.svg",
    organizer: "Music Events Co.",
    attendeeCount: 45,
    maxAttendees: 100,
    tags: ["art", "gallery", "exhibition"],
  },
];

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [events] = useState<Event[]>(mockOrganizerEvents);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "organizer") {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render anything if user is not authenticated or not an organizer
  if (!isAuthenticated || user?.role !== "organizer") {
    return null;
  }

  const totalRevenue = events.reduce(
    (sum, event) => sum + event.price * event.attendeeCount,
    0
  );
  const totalAttendees = events.reduce(
    (sum, event) => sum + event.attendeeCount,
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
          <Button className="flex items-center gap-2">
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
              <div className="text-2xl font-bold">{events.length}</div>
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
                {events.length > 0
                  ? Math.round(totalAttendees / events.length)
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
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()} •{" "}
                        {event.location}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-green-600">
                          {event.attendeeCount}/{event.maxAttendees} tickets
                          sold
                        </span>
                        <span className="text-purple-600">
                          $
                          {(event.price * event.attendeeCount).toLocaleString()}{" "}
                          revenue
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No events yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first event to get started
                  </p>
                  <Button>
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

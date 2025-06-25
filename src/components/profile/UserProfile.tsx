
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Calendar, Heart, Settings, LogOut, Users } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { Event } from "@/types/event";
import { Link } from "react-router-dom";

interface UserProfileProps {
  purchasedTickets?: Event[];
  favoriteEvents?: Event[];
  hostedEvents?: Event[];
  followedOrganizers?: string[];
  followedOrganizerEvents?: Event[];
}

const UserProfile = ({
  purchasedTickets = [],
  favoriteEvents = [],
  hostedEvents = [],
  followedOrganizers = [],
  followedOrganizerEvents = [],
}: UserProfileProps) => {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "tickets" | "favorites" | "hosted" | "following"
  >("tickets");

  if (!user || !profile) return null;

  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || profile.username;

  const tabs = [
    {
      id: "tickets" as const,
      label: "My Tickets",
      icon: Calendar,
      count: purchasedTickets.length,
    },
    {
      id: "favorites" as const,
      label: "Favorites",
      icon: Heart,
      count: favoriteEvents.length,
    },
    {
      id: "following" as const,
      label: "Following",
      icon: Users,
      count: followedOrganizers.length,
    },
    ...(profile.role === "organizer"
      ? [
          {
            id: "hosted" as const,
            label: "My Events",
            icon: User,
            count: hostedEvents.length,
          },
        ]
      : []),
  ];

  const renderEventList = (events: Event[], emptyMessage: string) => (
    <div className="space-y-4">
      {events.length > 0 ? (
        events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()} •{" "}
                    {event.location}
                  </p>
                  <p className="text-sm text-purple-600">
                    {event.price === 0 ? "Free" : `$${event.price}`}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  const renderFollowingTab = () => (
    <div className="space-y-6">
      {/* Quick link to detailed view */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Manage Your Followed Organizers</h3>
            <p className="text-gray-600 mb-4">
              View all events from organizers you follow and manage your following list
            </p>
            <Link to="/followed-organizers">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Users className="h-4 w-4 mr-2" />
                View All Followed Organizers
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Followed Organizers Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Followed Organizers ({followedOrganizers.length})
        </h3>
        {followedOrganizers.length > 0 ? (
          <div className="grid gap-3">
            {followedOrganizers.slice(0, 3).map((organizer) => (
              <Card key={organizer}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-medium">{organizer}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {followedOrganizers.length > 3 && (
              <div className="text-center py-4">
                <Link to="/followed-organizers">
                  <Button variant="outline" size="sm">
                    View {followedOrganizers.length - 3} More
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>You're not following any organizers yet.</p>
          </div>
        )}
      </div>

      {/* Recent Events from Followed Organizers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Events from Followed Organizers</h3>
        {renderEventList(
          followedOrganizerEvents.slice(0, 3),
          "No recent events from your followed organizers."
        )}
        {followedOrganizerEvents.length > 3 && (
          <div className="text-center mt-4">
            <Link to="/followed-organizers">
              <Button variant="outline" size="sm">
                View All Events from Followed Organizers
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Info Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <CardTitle>{fullName}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                  {profile.role === "organizer" ? "Event Organizer" : "Attendee"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "tickets" &&
          renderEventList(
            purchasedTickets,
            "You haven't purchased any tickets yet. Browse events to get started!"
          )}

        {activeTab === "favorites" &&
          renderEventList(
            favoriteEvents,
            "You haven't favorited any events yet. Add events to your favorites to see them here!"
          )}

        {activeTab === "following" && renderFollowingTab()}

        {activeTab === "hosted" &&
          user.role === "organizer" &&
          renderEventList(
            hostedEvents,
            "You haven't created any events yet. Start by creating your first event!"
          )}
      </div>
    </div>
  );
};

export default UserProfile;

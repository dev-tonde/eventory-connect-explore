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
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { Link } from "react-router-dom";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

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

  const fullName =
    `${sanitizeText(profile.first_name)} ${sanitizeText(
      profile.last_name
    )}`.trim() || sanitizeText(profile.username);

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
                    src={event.image || "/placeholder.svg"}
                    alt={sanitizeText(event.title)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={64}
                    height={64}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{sanitizeText(event.title)}</h3>
                  <p className="text-sm text-gray-600">
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : ""}
                    {event.location && <> • {sanitizeText(event.location)}</>}
                  </p>
                  <p className="text-sm text-purple-600">
                    {event.price === 0 || event.price === undefined
                      ? "Free"
                      : `$${event.price}`}
                  </p>
                </div>
                <Link to={`/events/${event.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    aria-label={`View Details for ${sanitizeText(event.title)}`}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Calendar
            className="h-12 w-12 mx-auto mb-4 text-gray-300"
            aria-hidden="true"
          />
          <p>{sanitizeText(emptyMessage)}</p>
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
            <h3 className="text-lg font-semibold mb-2">
              Manage Your Followed Organizers
            </h3>
            <p className="text-gray-600 mb-4">
              View all events from organizers you follow and manage your
              following list
            </p>
            <Link to="/followed-organizers">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                type="button"
                aria-label="View All Followed Organizers"
              >
                <Users className="h-4 w-4 mr-2" aria-hidden="true" />
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
                        <User
                          className="h-5 w-5 text-purple-600"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="font-medium">
                        {sanitizeText(organizer)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {followedOrganizers.length > 3 && (
              <div className="text-center py-4">
                <Link to="/followed-organizers">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    aria-label="View More Followed Organizers"
                  >
                    View {followedOrganizers.length - 3} More
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users
              className="h-12 w-12 mx-auto mb-4 text-gray-300"
              aria-hidden="true"
            />
            <p>You're not following any organizers yet.</p>
          </div>
        )}
      </div>

      {/* Recent Events from Followed Organizers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Recent Events from Followed Organizers
        </h3>
        {renderEventList(
          followedOrganizerEvents.slice(0, 3),
          "No recent events from your followed organizers."
        )}
        {followedOrganizerEvents.length > 3 && (
          <div className="text-center mt-4">
            <Link to="/followed-organizers">
              <Button
                variant="outline"
                size="sm"
                type="button"
                aria-label="View All Events from Followed Organizers"
              >
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
                <User className="h-8 w-8 text-purple-600" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>{fullName}</CardTitle>
                <CardDescription>{sanitizeText(profile.email)}</CardDescription>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                  {profile.role === "organizer"
                    ? "Event Organizer"
                    : "Attendee"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                type="button"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
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
            type="button"
            aria-label={tab.label}
          >
            <tab.icon className="h-4 w-4" aria-hidden="true" />
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
// This component allows users to view and manage their profile information, including purchased tickets, favorite events, hosted events, and followed organizers.
// It provides a tabbed interface for easy navigation between different sections.
// The component uses the `useAuth` context to access user and profile information, and it sanitizes text to prevent XSS attacks.


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Heart, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";

interface UserProfileProps {
  purchasedTickets?: Event[];
  favoriteEvents?: Event[];
  hostedEvents?: Event[];
}

const UserProfile = ({ purchasedTickets = [], favoriteEvents = [], hostedEvents = [] }: UserProfileProps) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'favorites' | 'hosted'>('tickets');

  if (!user) return null;

  const tabs = [
    { id: 'tickets' as const, label: 'My Tickets', icon: Calendar, count: purchasedTickets.length },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, count: favoriteEvents.length },
    ...(user.role === 'organizer' ? [{ id: 'hosted' as const, label: 'My Events', icon: User, count: hostedEvents.length }] : [])
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
                    {new Date(event.date).toLocaleDateString()} • {event.location}
                  </p>
                  <p className="text-sm text-purple-600">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
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
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                  {user.role === 'organizer' ? 'Event Organizer' : 'Attendee'}
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
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
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
        {activeTab === 'tickets' && renderEventList(
          purchasedTickets,
          "You haven't purchased any tickets yet. Browse events to get started!"
        )}
        
        {activeTab === 'favorites' && renderEventList(
          favoriteEvents,
          "You haven't favorited any events yet. Add events to your favorites to see them here!"
        )}
        
        {activeTab === 'hosted' && user.role === 'organizer' && renderEventList(
          hostedEvents,
          "You haven't created any events yet. Start by creating your first event!"
        )}
      </div>
    </div>
  );
};

export default UserProfile;

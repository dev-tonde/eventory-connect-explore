import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Ticket, Heart, Users, Calendar, Settings } from "lucide-react";
import MyRSVPsTab from "./MyRSVPsTab";
import SavedEventsTab from "./SavedEventsTab";
import FollowedOrganizersTab from "./FollowedOrganizersTab";
import TicketsTab from "./TicketsTab";
import AccountSettingsTab from "./AccountSettingsTab";
import ProfileSettingsTab from "./ProfileSettingsTab";
import NotificationsPage from "@/pages/NotificationsPage";

interface ProfileTabsProps {
  defaultTab?: string;
  onProfileUpdate?: () => void;
}

const ProfileTabs = ({ defaultTab = "rsvps", onProfileUpdate }: ProfileTabsProps) => {
  const { profile } = useAuth();
  const isOrganizer = profile?.role === 'organizer';

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        {isOrganizer ? (
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
        ) : (
          <TabsTrigger value="rsvps" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">RSVPs</span>
          </TabsTrigger>
        )}
        
        <TabsTrigger value="saved" className="flex items-center space-x-2">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Saved</span>
        </TabsTrigger>
        
        <TabsTrigger value="following" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Following</span>
        </TabsTrigger>
        
        <TabsTrigger value="notifications" className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        
        <TabsTrigger value="settings" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      {isOrganizer ? (
        <TabsContent value="events">
          <MyRSVPsTab />
        </TabsContent>
      ) : (
        <TabsContent value="rsvps">
          <MyRSVPsTab />
        </TabsContent>
      )}

      <TabsContent value="saved">
        <SavedEventsTab />
      </TabsContent>

      <TabsContent value="following">
        <FollowedOrganizersTab />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsPage />
      </TabsContent>

      <TabsContent value="settings">
        <ProfileSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
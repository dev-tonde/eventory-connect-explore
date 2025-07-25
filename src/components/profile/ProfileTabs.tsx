import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Ticket, Heart, Users, Calendar, Settings } from "lucide-react";
import EnhancedNotificationPanel from "@/components/notifications/EnhancedNotificationPanel";
import MyRSVPsTab from "./MyRSVPsTab";
import SavedEventsTab from "./SavedEventsTab";
import FollowedOrganizersTab from "./FollowedOrganizersTab";
import AccountSettingsTab from "./AccountSettingsTab";

const ProfileTabs = () => {
  return (
    <Tabs defaultValue="rsvps" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger
          value="rsvps"
          className="flex items-center gap-2"
          aria-label="My RSVPs"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          RSVPs
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="flex items-center gap-2"
          aria-label="Saved Events"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          Saved
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className="flex items-center gap-2"
          aria-label="Followed Organizers"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Following
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="flex items-center gap-2"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          Notifications
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="flex items-center gap-2"
          aria-label="Account Settings"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rsvps">
        <MyRSVPsTab />
      </TabsContent>

      <TabsContent value="saved">
        <SavedEventsTab />
      </TabsContent>

      <TabsContent value="following">
        <FollowedOrganizersTab />
      </TabsContent>

      <TabsContent value="notifications">
        <EnhancedNotificationPanel />
      </TabsContent>

      <TabsContent value="settings">
        <AccountSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
// This component renders a tabbed interface for the user profile section.
// It includes tabs for Profile, Notifications, and My Tickets.
// Each tab displays a different component: ProfileForm for user details, EnhancedNotificationPanel for notifications, and TicketsTab for viewing user tickets.

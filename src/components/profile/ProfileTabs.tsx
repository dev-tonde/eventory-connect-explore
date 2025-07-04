import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Ticket } from "lucide-react";
import ProfileForm from "./ProfileForm";
import EnhancedNotificationPanel from "@/components/notifications/EnhancedNotificationPanel";
import TicketsTab from "./TicketsTab";

const ProfileTabs = () => {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger
          value="profile"
          className="flex items-center gap-2"
          aria-label="Profile"
        >
          <User className="h-4 w-4" aria-hidden="true" />
          Profile
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
          value="tickets"
          className="flex items-center gap-2"
          aria-label="My Tickets"
        >
          <Ticket className="h-4 w-4" aria-hidden="true" />
          My Tickets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileForm />
      </TabsContent>

      <TabsContent value="notifications">
        <EnhancedNotificationPanel />
      </TabsContent>

      <TabsContent value="tickets">
        <TicketsTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
// This component renders a tabbed interface for the user profile section.
// It includes tabs for Profile, Notifications, and My Tickets.
// Each tab displays a different component: ProfileForm for user details, EnhancedNotificationPanel for notifications, and TicketsTab for viewing user tickets.

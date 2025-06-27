
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Ticket } from "lucide-react";
import ProfileForm from "./ProfileForm";
import EnhancedNotificationPanel from "@/components/notifications/EnhancedNotificationPanel";
import TicketsTab from "./TicketsTab";

const ProfileTabs = () => {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="tickets" className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />
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

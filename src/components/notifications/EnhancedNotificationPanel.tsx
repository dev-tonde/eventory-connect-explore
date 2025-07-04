import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { useEnhancedNotifications } from "@/hooks/useEnhancedNotifications";
import { formatDistanceToNow } from "date-fns";
import PushNotifications from "./PushNotifications";

// Sanitize notification text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const EnhancedNotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
    addNotification,
  } = useEnhancedNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleTestNotification = () => {
    addNotification({
      title: "Test Notification",
      message: "This is a test notification to verify everything is working!",
      type: "info",
      read: false,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Permission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" aria-hidden="true" />
            Browser Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Status:{" "}
                {permission === "granted"
                  ? "Enabled"
                  : permission === "denied"
                  ? "Blocked"
                  : "Not Set"}
              </p>
              <p className="text-xs text-gray-600">
                {permission === "granted"
                  ? "You'll receive browser notifications for important updates"
                  : "Enable notifications to stay updated with event reminders and updates"}
              </p>
            </div>
            {permission !== "granted" && (
              <Button
                onClick={requestPermission}
                size="sm"
                type="button"
                aria-label="Enable notifications"
              >
                <Bell className="h-4 w-4 mr-2" aria-hidden="true" />
                Enable
              </Button>
            )}
          </div>

          {permission === "granted" && (
            <Button
              onClick={handleTestNotification}
              variant="outline"
              size="sm"
              type="button"
            >
              Send Test Notification
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" aria-hidden="true" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="text-xs"
                type="button"
                aria-label="Mark all as read"
              >
                <CheckCheck className="h-4 w-4 mr-1" aria-hidden="true" />
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "all" | "unread")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BellOff
                    className="h-12 w-12 mx-auto mb-4 text-gray-300"
                    aria-hidden="true"
                  />
                  <p>
                    {activeTab === "unread"
                      ? "No unread notifications"
                      : "No notifications yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all ${
                        notification.read
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-purple-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm" aria-hidden="true">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <h4 className="font-medium text-sm">
                              {sanitizeText(notification.title)}
                            </h4>
                            {!notification.read && (
                              <div
                                className="w-2 h-2 bg-purple-600 rounded-full"
                                aria-label="Unread notification"
                              ></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {sanitizeText(notification.message)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>

                        {!notification.read && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            type="button"
                            aria-label="Mark as read"
                          >
                            <Check className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Push Notifications Component */}
      <PushNotifications />
    </div>
  );
};

export default EnhancedNotificationPanel;
// This component provides an enhanced notification panel with browser notification support, a list of notifications, and push notification management.
// It allows users to enable/disable notifications, mark notifications as read, and send test notifications.
// The notifications are displayed in a tabbed interface, allowing users to filter between all notifications and unread notifications.
// Each notification shows the title, message, type, and time since it was created. Unread notifications are highlighted and can be marked as read individually or all at once.

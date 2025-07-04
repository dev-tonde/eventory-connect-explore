import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Calendar, Ticket, Users } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

// Sanitize notification text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const NotificationPanel = () => {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket_purchase":
        return <Ticket className="h-4 w-4 text-green-600" aria-hidden="true" />;
      case "event_reminder":
        return (
          <Calendar className="h-4 w-4 text-blue-600" aria-hidden="true" />
        );
      case "community":
        return <Users className="h-4 w-4 text-purple-600" aria-hidden="true" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" aria-hidden="true" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" aria-hidden="true" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2"
            type="button"
            aria-label="Mark all as read"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell
              className="h-12 w-12 text-gray-300 mx-auto mb-4"
              aria-hidden="true"
            />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.is_read
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() =>
                  !notification.is_read && markAsRead(notification.id)
                }
                tabIndex={0}
                role="button"
                aria-label={
                  !notification.is_read
                    ? `Mark notification "${sanitizeText(
                        notification.title
                      )}" as read`
                    : undefined
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !notification.is_read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {sanitizeText(notification.title)}
                      </h4>
                      {!notification.is_read && (
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                          aria-label="Unread notification"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {sanitizeText(notification.message)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
// This component renders a notification panel that displays a list of notifications.
// It includes functionality to mark notifications as read and to mark all notifications as read.
// Notifications are categorized by type and include an icon for visual distinction.

import React from "react";
import { Button } from "@/components/ui/button";
import { User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface OrganizerProfileProps {
  organizerId?: string;
  organizerName: string;
  organizerAvatar?: string;
  followersCount?: number;
  eventsCount?: number;
}

export const OrganizerProfile: React.FC<OrganizerProfileProps> = ({
  organizerId,
  organizerName,
  organizerAvatar,
  followersCount,
  eventsCount,
}) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-semibold mb-4">Organized by</h3>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
          {organizerAvatar ? (
            <img
              src={organizerAvatar}
              alt={organizerName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-purple-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-lg">{organizerName}</p>
          {(followersCount || eventsCount) && (
            <div className="flex gap-4 text-sm text-gray-600 mt-1">
              {followersCount && (
                <span>{followersCount} followers</span>
              )}
              {eventsCount && (
                <span>{eventsCount} events</span>
              )}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              Follow Organizer
            </Button>
            {organizerId && (
              <Link to={`/organizer/${organizerId}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-700"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
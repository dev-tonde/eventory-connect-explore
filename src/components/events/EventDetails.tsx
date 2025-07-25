import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventDetailsProps {
  description?: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  currentAttendees: number;
  maxAttendees: number;
  tags?: string[];
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  description,
  date,
  time,
  venue,
  address,
  currentAttendees,
  maxAttendees,
  tags,
}) => {
  return (
    <div className="space-y-6">
      {/* Event Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at {time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{venue}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span>
            {currentAttendees} / {maxAttendees} attending
          </span>
        </div>
      </div>

      {/* Address */}
      {address && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">{address}</p>
        </div>
      )}

      {/* Description */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-2">About This Event</h3>
        <p className="text-gray-700 whitespace-pre-line">
          {description || "No description available."}
        </p>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
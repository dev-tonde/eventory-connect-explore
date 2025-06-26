
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, UserMinus } from "lucide-react";
import { Event } from "@/types/event";
import OrganizerEventGrid from "./OrganizerEventGrid";

interface OrganizerProfile {
  name: string;
  followerCount: number;
  isVerified: boolean;
  events: Event[];
}

interface OrganizerCardProps {
  organizer: OrganizerProfile;
  onUnfollow: (organizerName: string) => void;
}

const OrganizerCard = ({ organizer, onUnfollow }: OrganizerCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{organizer.name}</CardTitle>
                {organizer.isVerified && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span>{organizer.followerCount.toLocaleString()} followers</span>
                {organizer.isVerified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Verified
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnfollow(organizer.name)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Unfollow
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Upcoming Events ({organizer.events.length})
        </h3>
        
        <OrganizerEventGrid events={organizer.events} organizerName={organizer.name} />
      </CardContent>
    </Card>
  );
};

export default OrganizerCard;

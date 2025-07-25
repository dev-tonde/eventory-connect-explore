import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Play } from "lucide-react";
import { useEventLineup } from "@/hooks/useEventLineup";
import type { EventLineup } from "@/types/lineup";

interface LineupDisplayProps {
  eventId: string;
  showCurrentPerformer?: boolean;
}

export const LineupDisplay: React.FC<LineupDisplayProps> = ({ 
  eventId, 
  showCurrentPerformer = true 
}) => {
  const { lineup, currentPerformer, isLoading } = useEventLineup(eventId);

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isCurrentlyPerforming = (item: EventLineup) => {
    return currentPerformer?.lineup_id === item.id;
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading lineup...</div>;
  }

  if (!lineup || lineup.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No lineup information available for this event.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showCurrentPerformer && currentPerformer && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Now Performing</span>
            </div>
            <h3 className="font-bold text-lg">{currentPerformer.artist_name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(currentPerformer.start_time)} - {formatTime(currentPerformer.end_time)}
              </div>
              {currentPerformer.stage_name && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {currentPerformer.stage_name}
                </div>
              )}
            </div>
            {currentPerformer.description && (
              <p className="text-sm mt-2">{currentPerformer.description}</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Complete Lineup</h3>
        {lineup.map((item) => (
          <Card 
            key={item.id} 
            className={isCurrentlyPerforming(item) ? "border-primary" : ""}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.artist_name}</h4>
                    {isCurrentlyPerforming(item) && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Play className="w-3 h-3 mr-1" />
                        Live Now
                      </Badge>
                    )}
                    {item.stage_name && (
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.stage_name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
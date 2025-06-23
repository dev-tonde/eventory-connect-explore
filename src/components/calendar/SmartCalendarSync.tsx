
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmartCalendarSyncProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
}

const SmartCalendarSync = ({ eventId, eventTitle, eventDate, eventLocation }: SmartCalendarSyncProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prepTime, setPrepTime] = useState(30);
  const [travelTime, setTravelTime] = useState(15);
  const [provider, setProvider] = useState<string>("");

  const { data: syncData } = useQuery({
    queryKey: ["calendar-sync", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_sync")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const syncToCalendarMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("calendar_sync")
        .upsert({
          user_id: user?.id,
          event_id: eventId,
          calendar_provider: provider,
          prep_time_minutes: prepTime,
          travel_time_minutes: travelTime,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-sync", eventId] });
      toast({
        title: "Success!",
        description: "Event synced to your calendar with smart time blocking.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync to calendar",
        variant: "destructive",
      });
    },
  });

  const suggestTravelTime = () => {
    // Mock AI suggestion based on location
    if (eventLocation?.toLowerCase().includes("downtown")) {
      setTravelTime(45);
      toast({
        title: "AI Suggestion",
        description: "Based on traffic patterns, 45 minutes travel time recommended for downtown location.",
      });
    } else {
      setTravelTime(20);
      toast({
        title: "AI Suggestion",
        description: "Suggested 20 minutes travel time based on typical traffic.",
      });
    }
  };

  const handleSync = () => {
    if (!provider) {
      toast({
        title: "Error",
        description: "Please select a calendar provider",
        variant: "destructive",
      });
      return;
    }
    syncToCalendarMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Smart Calendar Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncData ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Synced to {syncData.calendar_provider} Calendar</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Prep time: {syncData.prep_time_minutes}min | Travel time: {syncData.travel_time_minutes}min
            </p>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="provider">Calendar Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select calendar provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  <SelectItem value="apple">Apple Calendar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Input
                    id="prepTime"
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    min="0"
                    max="120"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="travelTime">Travel Time (minutes)</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Input
                    id="travelTime"
                    type="number"
                    value={travelTime}
                    onChange={(e) => setTravelTime(Number(e.target.value))}
                    min="0"
                    max="180"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={suggestTravelTime}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              AI Suggest Travel Time
            </Button>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <h4 className="font-medium text-blue-900 mb-1">Smart Blocking Preview:</h4>
              <div className="text-blue-700 space-y-1">
                <p>• Prep time: {new Date(new Date(eventDate).getTime() - prepTime * 60000).toLocaleTimeString()}</p>
                <p>• Leave for event: {new Date(new Date(eventDate).getTime() - travelTime * 60000).toLocaleTimeString()}</p>
                <p>• Event starts: {new Date(eventDate).toLocaleTimeString()}</p>
              </div>
            </div>

            <Button
              onClick={handleSync}
              disabled={syncToCalendarMutation.isPending}
              className="w-full"
            >
              {syncToCalendarMutation.isPending ? "Syncing..." : "Sync to Calendar"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartCalendarSync;

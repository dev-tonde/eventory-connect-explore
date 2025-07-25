import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, MoreHorizontal, Eye, Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  current_attendees: number;
  max_attendees: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

interface EventListTableProps {
  className?: string;
}

export const EventListTable: React.FC<EventListTableProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  // Fetch organizer's events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["organizer-events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user?.id,
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .update({ is_active: false })
        .eq("id", eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["event-stats", user?.id] });
      toast({
        title: "Event deleted",
        description: "Event has been successfully deleted.",
      });
      setDeleteEventId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
      console.error("Delete event error:", error);
    },
  });

  const handleEdit = (eventId: string) => {
    navigate(`/create-event?edit=${eventId}`);
  };

  const handleView = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleDelete = () => {
    if (deleteEventId) {
      deleteEventMutation.mutate(deleteEventId);
    }
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isUpcoming = eventDate >= now;
    const isFull = event.current_attendees >= event.max_attendees;

    if (!event.is_active) return { label: "Deleted", variant: "destructive" as const };
    if (isFull) return { label: "Sold Out", variant: "secondary" as const };
    if (isUpcoming) return { label: "Upcoming", variant: "default" as const };
    return { label: "Past", variant: "outline" as const };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
            <Button onClick={() => navigate("/create-event")}>
              Create Your First Event
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Events ({events.length})
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/create-event")}
            >
              Create New Event
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm">
                              {format(new Date(event.date), "MMM dd, yyyy")}
                            </div>
                            <div className="text-xs text-gray-500">{event.time}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm truncate max-w-[150px]">
                            {event.venue}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {event.current_attendees}/{event.max_attendees}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {event.price === 0 ? "Free" : `R${event.price}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(event.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(event.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteEventId(event.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
              The event will be marked as inactive and hidden from public view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Settings, User, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfileForm from "@/components/profile/ProfileForm";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  role?: string;
}

interface UserTicket {
  id: string;
  event_id: string;
  quantity: number;
  total_price: number;
  status: string;
  purchase_date: string;
  ticket_number?: string;
  events?: {
    title: string;
    date: string;
    time: string;
    venue: string;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTickets();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Create a basic profile if it doesn't exist
        const newProfile: UserProfile = {
          id: user.id,
          email: user.email || "",
          first_name: "",
          last_name: "",
          username: "",
          bio: "",
          role: "attendee"
        };
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (
            title,
            date,
            time,
            venue
          )
        `)
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
            <p className="text-gray-600 mb-4">Please log in to view your profile</p>
            <Link to="/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your events</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.username || "User"
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">{profile?.email}</p>
                  <Badge variant="secondary">{profile?.role || "Attendee"}</Badge>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>My Event Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id} className="border-l-4 border-l-purple-600">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg mb-2">
                                {ticket.events?.title || "Event"}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {ticket.events?.date && new Date(ticket.events.date).toLocaleDateString()} at {ticket.events?.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{ticket.events?.venue}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Ticket className="h-4 w-4" />
                                  <span>Ticket #{ticket.ticket_number || ticket.id.slice(0, 8)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={ticket.status === 'active' ? 'default' : 'secondary'}
                                className="mb-2"
                              >
                                {ticket.status}
                              </Badge>
                              <p className="text-sm text-gray-600">
                                Qty: {ticket.quantity}
                              </p>
                              <p className="font-semibold">
                                ${ticket.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No tickets yet</h3>
                    <p className="text-gray-600 mb-4">You haven't purchased any event tickets yet.</p>
                    <Link to="/events">
                      <Button>Browse Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        <span>Email notifications for new events</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        <span>Reminders before events</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span>Marketing emails</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Privacy</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        <span>Make my profile public</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span>Show my attendance to other users</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

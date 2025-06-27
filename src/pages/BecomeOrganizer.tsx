
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Star, Calendar, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const BecomeOrganizer = () => {
  const { user, profile, updateProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organization_name: "",
    bio: "",
    experience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (profile?.role === "organizer") {
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await updateProfile({
        role: "organizer",
        bio: formData.bio,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update your role. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to Eventory Organizers!",
          description: "You can now create and manage events.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || profile?.role === "organizer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <UserPlus className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Become an Event Organizer
            </h1>
            <p className="text-gray-600">
              Join thousands of organizers creating amazing experiences
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Create Events</h3>
                <p className="text-sm text-gray-600">
                  Set up and manage your events with our easy-to-use tools
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Build Community</h3>
                <p className="text-sm text-gray-600">
                  Connect with attendees and build a loyal following
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Grow Your Brand</h3>
                <p className="text-sm text-gray-600">
                  Establish yourself as a trusted event organizer
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Tell Us About Yourself</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization/Company Name (Optional)
                  </label>
                  <Input
                    value={formData.organization_name}
                    onChange={(e) =>
                      setFormData({ ...formData, organization_name: e.target.value })
                    }
                    placeholder="Your organization or company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About You *
                  </label>
                  <textarea
                    required
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself and why you want to organize events..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Experience (Optional)
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    placeholder="Describe any previous event organizing experience..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your organizer status will be activated immediately</li>
                    <li>• You'll get access to the organizer dashboard</li>
                    <li>• You can start creating events right away</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? "Processing..." : "Become an Organizer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BecomeOrganizer;

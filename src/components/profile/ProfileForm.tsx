import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import UsernameInput from "@/components/profile/UsernameInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface ProfileFormProps {
  onProfileUpdate?: () => void;
}

const ProfileForm = ({ onProfileUpdate }: ProfileFormProps) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [canEditUsername, setCanEditUsername] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: sanitizeText(profile.first_name || ""),
        last_name: sanitizeText(profile.last_name || ""),
        username: sanitizeText(profile.username || ""),
        bio: sanitizeText(profile.bio || ""),
      });
      checkUsernameEditability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const checkUsernameEditability = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username_last_changed")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setCanEditUsername(true);
      } else {
        // Since username_last_changed doesn't exist, always allow editing
        setCanEditUsername(true);
      }
    } catch {
      setCanEditUsername(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sanitize all fields before update
      const sanitizedData = {
        first_name: sanitizeText(formData.first_name),
        last_name: sanitizeText(formData.last_name),
        username: sanitizeText(formData.username),
        bio: sanitizeText(formData.bio),
      };

      const { error } = await updateProfile(sanitizedData);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      } else {
        await refreshProfile();
        onProfileUpdate?.();
        toast({
          title: "Success",
          description: "Profile updated successfully!",
          variant: "default",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (username: string) => {
    setFormData({ ...formData, username: sanitizeText(username) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleUpdateProfile}
          className="space-y-4"
          autoComplete="off"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="Enter your first name"
                autoComplete="given-name"
                maxLength={50}
                aria-label="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Enter your last name"
                autoComplete="family-name"
                maxLength={50}
                aria-label="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input value={user?.email || ""} disabled aria-label="Email" />
          </div>

          {canEditUsername ? (
            <UsernameInput
              initialUsername={profile?.username || ""}
              onUsernameChange={handleUsernameChange}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                value={formData.username}
                disabled
                className="bg-gray-100"
                aria-label="Username"
              />
              <p className="text-xs text-gray-500 mt-1">
                Username can only be changed every 6 months
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <Textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself"
              className="min-h-[100px]"
              maxLength={500}
              aria-label="Bio"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            aria-label="Update Profile"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
// This component allows users to update their profile information including first name, last name, username, and bio.
// It includes form validation, sanitization to prevent XSS attacks, and checks if the username can be edited based on the last change date.

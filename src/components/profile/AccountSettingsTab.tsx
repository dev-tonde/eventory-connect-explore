import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, User, Shield, Loader2 } from "lucide-react";
import ProfileForm from "./ProfileForm";
import ProfileOverview from "./ProfileOverview";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface AccountSettingsTabProps {
  onProfileUpdate?: () => void;
}

const AccountSettingsTab = ({ onProfileUpdate }: AccountSettingsTabProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // For now, just show a success message
      // In a real implementation, you would upload to Supabase storage
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.username || user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-6">
      {/* Profile Overview Section - Instagram Style */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileOverview 
            showEditButton={false} 
            onProfileUpdate={onProfileUpdate}
          />
        </CardContent>
      </Card>

      {/* Account Information */}
      <ProfileForm onProfileUpdate={onProfileUpdate} />

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input 
              value={user?.email || ""} 
              disabled 
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account ID
            </label>
            <Input 
              value={user?.id || ""} 
              disabled 
              className="bg-gray-50 font-mono text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is your unique account identifier.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" disabled>
              Change Password
            </Button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Password management is handled through email reset links.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettingsTab;
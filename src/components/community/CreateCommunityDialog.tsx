import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Helper to sanitize input and prevent XSS or injection
const sanitizeInput = (input: string) => {
  return input
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/<style.*?>.*?<\/style>/gi, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommunityCreated?: () => void;
}

const CreateCommunityDialog = ({
  open,
  onOpenChange,
  onCommunityCreated,
}: CreateCommunityDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a community.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize input before sending to backend
    const safeName = sanitizeInput(formData.name.trim());
    const safeDescription = sanitizeInput(formData.description.trim());

    if (!safeName) {
      toast({
        title: "Error",
        description: "Community name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the community
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .insert({
          name: safeName,
          description: safeDescription,
          is_public: formData.isPublic,
          created_by: user.id,
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Community created successfully!",
      });

      setFormData({
        name: "",
        description: "",
        isPublic: true,
      });

      onCommunityCreated?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating community:", error);
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter community name"
              required
              maxLength={80}
              autoComplete="off"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your community"
              className="min-h-[100px]"
              maxLength={500}
              autoComplete="off"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                handleInputChange("isPublic", checked.toString())
              }
            />
            <Label htmlFor="public">Make this community public</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityDialog;
// This component provides a dialog for creating a new community. It includes fields for the community name, description, and a toggle for public visibility. The form validates input and sanitizes it to prevent XSS attacks before sending it to the backend. It also handles loading states and displays success or error messages using a toast notification system.
// The component uses Supabase for data storage and retrieval, ensuring that the community is created with the current user's ID as the creator. It also adds the creator as an admin member of the new community. The dialog can be opened and closed through props, allowing it to be used in various parts of the application. The form is designed to be user-friendly, with clear labels and placeholders, and it resets after successful submission.

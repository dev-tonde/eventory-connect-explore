import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateImageFile, sanitizeText, validateStringLength } from "@/utils/validation";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface GuestUploadFormProps {
  eventId: string;
}

export function GuestUploadForm({ eventId }: GuestUploadFormProps) {
  const { toast } = useToast();
  const { handleAsyncError } = useErrorHandler();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Use validation utility
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Input validation
    if (!eventId) {
      toast({
        title: "Error",
        description: "Event ID is missing. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    // Validate file again before upload
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate caption length
    if (caption.length > 200) {
      toast({
        title: "Caption too long",
        description: "Please keep your caption under 200 characters.",
        variant: "destructive",
      });
      return;
    }

    // Validate uploader name length
    if (uploaderName.length > 50) {
      toast({
        title: "Name too long",
        description: "Please keep your name under 50 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const sessionToken = generateSessionToken();
      const fileExt = selectedFile.name.split(".").pop();
      
      // Validate file extension
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!fileExt || !allowedExts.includes(fileExt.toLowerCase())) {
        throw new Error("Unsupported file format");
      }

      const fileName = `${eventId}-${Date.now()}.${fileExt}`;

      // Upload to storage with error handling
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("snaploop-uploads")
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        
        if (uploadError.message.includes('file size')) {
          throw new Error("File is too large");
        } else if (uploadError.message.includes('not allowed')) {
          throw new Error("File type not allowed");
        } else {
          throw uploadError;
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("snaploop-uploads")
        .getPublicUrl(fileName);

      // Validate public URL
      if (!publicUrl) {
        throw new Error("Failed to generate file URL");
      }

      // Save to database with validation
      const { error: dbError } = await supabase
        .from("snaploop_uploads")
        .insert({
          event_id: eventId,
          image_url: publicUrl,
          caption: caption.trim() || null,
          uploaded_by: uploaderName.trim() || "Anonymous",
          session_token: sessionToken,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        
        // Clean up uploaded file if database save fails
        await supabase.storage
          .from("snaploop-uploads")
          .remove([fileName]);
          
        throw dbError;
      }

      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl("");
      setCaption("");
      setUploaderName("");
      
      toast({
        title: "Photo uploaded!",
        description: "Your photo is pending approval and will appear in the gallery soon.",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Upload error:", error);
      
      // Specific error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Connection error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else if (error.message === "File is too large") {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB.",
          variant: "destructive",
        });
      } else if (error.message === "Unsupported file format") {
        toast({
          title: "Unsupported format",
          description: "Please select a JPG, PNG, GIF, or WebP image.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload failed",
          description: "There was an error uploading your photo. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Photo Uploaded!</h3>
            <p className="text-sm text-muted-foreground">
              Your photo is being reviewed and will appear in the gallery once approved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="h-5 w-5" />
          Share Your Photo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a photo from this event to share with everyone!
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="uploader-name">Your Name (Optional)</Label>
            <Input
              id="uploader-name"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
            />
          </div>

          <div>
            <Label>Photo</Label>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload a photo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption to your photo..."
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {caption.length}/200 characters
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
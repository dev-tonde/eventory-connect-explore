import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedSocialScheduler from "./EnhancedSocialScheduler";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface PosterTemplate {
  id: string;
  name: string;
  description: string;
  social_platform: string;
  dimensions: { width: number; height: number };
}

interface PosterGeneratorProps {
  eventId?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
}

const PosterGenerator = ({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
}: PosterGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PosterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPosterId, setCurrentPosterId] = useState<string | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("poster_templates")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error",
          description: "Failed to fetch poster templates.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const transformedTemplates: PosterTemplate[] = data.map((template) => ({
          id: template.id,
          name: sanitizeText(template.name),
          description: sanitizeText(template.description || ""),
          social_platform: sanitizeText(template.social_platform || ""),
          dimensions: template.dimensions as { width: number; height: number },
        }));
        setTemplates(transformedTemplates);
      }
    } catch (error) {
      console.error("Error in fetchTemplates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch poster templates.",
        variant: "destructive",
      });
    }
  };

  const generatePoster = async () => {
    if (!selectedTemplate || !user) {
      toast({
        title: "Error",
        description: "Please select a template and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (!template) throw new Error("Template not found");

      // Insert a new poster record with status "generating"
      const { data: posterRecord, error: dbError } = await supabase
        .from("generated_posters")
        .insert({
          event_id: eventId || "demo",
          user_id: user.id,
          template_id: selectedTemplate,
          prompt: sanitizeText(customPrompt),
          social_platform: template.social_platform,
          dimensions: template.dimensions,
          status: "generating",
        })
        .select()
        .single();

      if (dbError) throw dbError;
      setCurrentPosterId(posterRecord.id);

      // Call backend function to generate poster
      const { data, error } = await supabase.functions.invoke(
        "generate-poster",
        {
          body: {
            eventTitle: sanitizeText(eventTitle || "Sample Event"),
            eventDate: sanitizeText(
              eventDate || new Date().toISOString().split("T")[0]
            ),
            eventLocation: sanitizeText(eventLocation || "Sample Location"),
            templateId: selectedTemplate,
            socialPlatform: template.social_platform,
            customPrompt: sanitizeText(customPrompt),
          },
        }
      );

      if (error) throw error;

      // Update poster record with generated image
      await supabase
        .from("generated_posters")
        .update({
          image_data: data.imageData,
          image_url: data.imageUrl,
          status: "completed",
        })
        .eq("id", posterRecord.id);

      setGeneratedImage(`data:image/png;base64,${data.imageData}`);

      toast({
        title: "Success!",
        description: "Your poster has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating poster:", error);
      toast({
        title: "Error",
        description: "Failed to generate poster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "event-poster.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" aria-hidden="true" />
            AI Poster Generator
          </CardTitle>
          <CardDescription>
            Create stunning event posters optimized for different social media
            platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a poster template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.social_platform} (
                    {template.dimensions.width}x{template.dimensions.height})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add any specific design requirements or style preferences..."
              className="h-24"
              maxLength={500}
              aria-label="Custom poster instructions"
            />
          </div>

          <Button
            onClick={generatePoster}
            disabled={isGenerating || !selectedTemplate}
            className="w-full"
            type="button"
            aria-label="Generate Poster"
          >
            {isGenerating ? "Generating Poster..." : "Generate Poster"}
          </Button>
        </CardContent>
      </Card>

      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Poster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={generatedImage}
                alt="Generated poster"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: "500px" }}
                loading="lazy"
                width={400}
                height={500}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  type="button"
                  aria-label="Download Poster"
                >
                  Download
                </Button>
                <Button
                  onClick={() => setShowScheduler(true)}
                  type="button"
                  aria-label="Share to Social Media"
                >
                  Share to Social Media
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showScheduler && generatedImage && (
        <EnhancedSocialScheduler
          posterId={currentPosterId || undefined}
          eventId={eventId}
          imageUrl={generatedImage}
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
        />
      )}
    </div>
  );
};

export default PosterGenerator;
// This component allows users to generate event posters using AI.
// It fetches poster templates from a Supabase database, allows users to select a template and provide custom instructions, and generates a poster image using a backend function.
// The generated poster can be downloaded or shared to social media platforms.

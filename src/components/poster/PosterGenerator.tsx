
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedSocialScheduler from "./EnhancedSocialScheduler";

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

const PosterGenerator = ({ eventId, eventTitle, eventDate, eventLocation }: PosterGeneratorProps) => {
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
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('poster_templates')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }

      if (data) {
        const transformedTemplates: PosterTemplate[] = data.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description || '',
          social_platform: template.social_platform || '',
          dimensions: template.dimensions as { width: number; height: number }
        }));
        setTemplates(transformedTemplates);
      }
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
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
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      const { data: posterRecord, error: dbError } = await supabase
        .from('generated_posters')
        .insert({
          event_id: eventId || 'demo',
          user_id: user.id,
          template_id: selectedTemplate,
          prompt: customPrompt,
          social_platform: template.social_platform,
          dimensions: template.dimensions,
          status: 'generating'
        })
        .select()
        .single();

      if (dbError) throw dbError;
      setCurrentPosterId(posterRecord.id);

      const { data, error } = await supabase.functions.invoke('generate-poster', {
        body: {
          eventTitle: eventTitle || 'Sample Event',
          eventDate: eventDate || new Date().toISOString().split('T')[0],
          eventLocation: eventLocation || 'Sample Location',
          templateId: selectedTemplate,
          socialPlatform: template.social_platform,
          customPrompt
        }
      });

      if (error) throw error;

      await supabase
        .from('generated_posters')
        .update({
          image_data: data.imageData,
          image_url: data.imageUrl,
          status: 'completed'
        })
        .eq('id', posterRecord.id);

      setGeneratedImage(`data:image/png;base64,${data.imageData}`);
      
      toast({
        title: "Success!",
        description: "Your poster has been generated successfully.",
      });

    } catch (error) {
      console.error('Error generating poster:', error);
      toast({
        title: "Error",
        description: "Failed to generate poster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            AI Poster Generator
          </CardTitle>
          <CardDescription>
            Create stunning event posters optimized for different social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a poster template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.social_platform} 
                    ({template.dimensions.width}x{template.dimensions.height})
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
            />
          </div>

          <Button 
            onClick={generatePoster} 
            disabled={isGenerating || !selectedTemplate}
            className="w-full"
          >
            {isGenerating ? 'Generating Poster...' : 'Generate Poster'}
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
                style={{ maxHeight: '500px' }}
              />
              <div className="flex gap-2">
                <Button variant="outline">
                  Download
                </Button>
                <Button onClick={() => setShowScheduler(true)}>
                  Share to Social Media
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showScheduler && generatedImage && (
        <EnhancedSocialScheduler
          posterId={currentPosterId}
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

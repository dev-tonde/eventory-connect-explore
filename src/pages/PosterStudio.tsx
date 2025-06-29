
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, Download, Share2, Palette, Image, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PosterStudio = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const { toast } = useToast();

  const templates = [
    { id: "modern", name: "Modern", description: "Clean and minimalist design" },
    { id: "vibrant", name: "Vibrant", description: "Bold colors and dynamic layouts" },
    { id: "elegant", name: "Elegant", description: "Sophisticated and professional" },
    { id: "festival", name: "Festival", description: "Fun and energetic style" },
  ];

  const handleGeneratePoster = async () => {
    if (!eventTitle || !eventDate || !eventVenue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate poster generation
    setTimeout(() => {
      setGeneratedPoster("/placeholder.svg");
      setIsGenerating(false);
      toast({
        title: "Poster Generated!",
        description: "Your event poster has been created successfully.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Poster Studio</h1>
          <p className="text-gray-600">Create stunning event posters using AI technology</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title *</label>
                <Input
                  placeholder="Enter your event title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Date *</label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Venue *</label>
                <Input
                  placeholder="Enter event venue"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Brief description of your event"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Template Style</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template style" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGeneratePoster}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Poster...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate AI Poster
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Poster Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedPoster ? (
                <div className="space-y-4">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={generatedPoster}
                      alt="Generated Poster"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button className="flex-1" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No poster generated yet</p>
                    <p className="text-sm text-gray-400">Fill in the details and click generate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Poster Studio Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Palette className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">AI-Powered Design</h3>
                <p className="text-sm text-gray-600">
                  Our AI creates unique, professional designs tailored to your event
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Type className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Multiple Templates</h3>
                <p className="text-sm text-gray-600">
                  Choose from various styles to match your event's personality
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">High-Quality Output</h3>
                <p className="text-sm text-gray-600">
                  Download in multiple formats suitable for print and digital use
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterStudio;

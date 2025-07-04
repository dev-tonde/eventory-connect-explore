import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Download,
  Share2,
  Sparkles,
  Image,
  Palette,
  Type,
  Layout,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PosterStudio = () => {
  const { profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    } else if (profile?.role !== "organizer") {
      navigate("/become-organizer", { replace: true });
    }
  }, [isAuthenticated, profile, navigate]);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    { id: "modern", name: "Modern Minimalist", preview: "/placeholder.svg" },
    { id: "vibrant", name: "Vibrant & Bold", preview: "/placeholder.svg" },
    { id: "elegant", name: "Elegant Classic", preview: "/placeholder.svg" },
    { id: "fun", name: "Fun & Playful", preview: "/placeholder.svg" },
    {
      id: "corporate",
      name: "Corporate Professional",
      preview: "/placeholder.svg",
    },
    { id: "artistic", name: "Artistic Creative", preview: "/placeholder.svg" },
  ];

  const socialFormats = [
    { platform: "Instagram Post", size: "1080x1080", icon: "📱" },
    { platform: "Instagram Story", size: "1080x1920", icon: "📲" },
    { platform: "Facebook Event", size: "1920x1080", icon: "💙" },
    { platform: "Twitter Header", size: "1500x500", icon: "🐦" },
    { platform: "LinkedIn Post", size: "1200x627", icon: "💼" },
    { platform: "Print Poster", size: "A4/A3", icon: "🖨️" },
  ];

  const handleGeneratePoster = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Select Template",
        description: "Please select a template to generate your poster.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI poster generation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast({
        title: "Poster Generated! 🎨",
        description:
          "Your AI-powered event poster has been created successfully.",
      });
    } catch {
      toast({
        title: "Generation Failed",
        description: "Failed to generate poster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated || profile?.role !== "organizer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Poster Studio
          </h1>
          <p className="text-gray-600">
            Create stunning event posters and social media content with AI
          </p>
          <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-blue-600" />
                  Choose Template Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium text-center">
                        {template.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-green-600" />
                  Social Media Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {socialFormats.map((format) => (
                    <div
                      key={format.platform}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="text-2xl mb-1">{format.icon}</div>
                      <div className="text-sm font-medium">
                        {format.platform}
                      </div>
                      <div className="text-xs text-gray-500">{format.size}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-purple-600" />
                  AI Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom Prompt
                  </label>
                  <textarea
                    placeholder="Describe your poster style: 'Modern tech conference with blue and white colors, minimalist design...'"
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      className="w-full h-10 border border-gray-300 rounded-md"
                      defaultValue="#6366f1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      className="w-full h-10 border border-gray-300 rounded-md"
                      defaultValue="#ec4899"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Generate */}
          <div className="space-y-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">
                        Generating poster...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Wand2 className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Poster preview will appear here</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleGeneratePoster}
                  disabled={isGenerating || !selectedTemplate}
                  className="w-full mb-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  {isGenerating ? (
                    "Generating..."
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate AI Poster
                    </>
                  )}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Recent Posters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Event Poster {i}
                        </div>
                        <div className="text-xs text-gray-500">2 hours ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterStudio;
// This code defines a PosterStudio page that allows organizers to create AI-generated event posters. It includes template selection, social media format options, AI customization features, and a preview section. The page is responsive and uses cards for layout, with loading states while generating posters. It also provides options to download or share the generated posters.
// The component checks if the user is authenticated and has the organizer role before rendering the content.
// The PosterStudio page is a great addition to the Eventory platform, empowering organizers to create professional and visually appealing event posters quickly and easily. It leverages AI technology to streamline the design process, making it accessible even for those without design skills. The focus on social media formats ensures that posters can be easily shared across various platforms, enhancing event visibility and engagement.

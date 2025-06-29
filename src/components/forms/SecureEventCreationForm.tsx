
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, DollarSign, Tag, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedEventCreation } from "@/hooks/useOptimizedEventCreation";
import { useSecurityFeatures } from "@/hooks/useSecurityFeatures";
import { SecureFileUpload } from "@/components/security/SecureFileUpload";
import { CSRFToken } from "@/components/security/CSRFProtection";
import { toast } from "sonner";

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  category: string;
  maxAttendees: number;
  image: string;
  tags: string[];
  enableDynamicPricing: boolean;
  minPrice?: number;
  maxPrice?: number;
  // Enhanced metadata fields
  metaDescription?: string;
  seoKeywords?: string[];
  accessibilityInfo?: string;
  parkingInfo?: string;
  publicTransportInfo?: string;
  ageRestrictions?: string;
  dresscode?: string;
  languages?: string[];
}

interface SecureEventCreationFormProps {
  onSuccess?: () => void;
}

const SecureEventCreationForm = ({ onSuccess }: SecureEventCreationFormProps) => {
  const { profile } = useAuth();
  const { createEvent, isCreating } = useOptimizedEventCreation();
  const { checkFormRateLimit, sanitizeInput } = useSecurityFeatures();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    address: "",
    price: 0,
    category: "Music",
    maxAttendees: 100,
    image: "/placeholder.svg",
    tags: [],
    enableDynamicPricing: false,
    minPrice: 0,
    maxPrice: 0,
    // Enhanced metadata defaults
    metaDescription: "",
    seoKeywords: [],
    accessibilityInfo: "",
    parkingInfo: "",
    publicTransportInfo: "",
    ageRestrictions: "",
    dresscode: "",
    languages: ["English"]
  });
  
  const [imagePreview, setImagePreview] = useState<string>("/placeholder.svg");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Music", "Technology", "Food & Drink", "Sports", "Arts & Culture", "Business", 
    "Education", "Health & Wellness", "Entertainment"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const canSubmit = await checkFormRateLimit("event_creation", 3);
    if (!canSubmit) {
      toast.error("Too many submissions. Please wait before creating another event.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Sanitize inputs
      const sanitizedData = {
        ...formData,
        title: sanitizeInput(formData.title),
        description: sanitizeInput(formData.description),
        location: sanitizeInput(formData.location),
        address: sanitizeInput(formData.address),
        tags: formData.tags.map(tag => sanitizeInput(tag)).filter(tag => tag.trim() !== ""),
        metaDescription: sanitizeInput(formData.metaDescription || ""),
        seoKeywords: formData.seoKeywords?.map(keyword => sanitizeInput(keyword)).filter(Boolean) || [],
        accessibilityInfo: sanitizeInput(formData.accessibilityInfo || ""),
        parkingInfo: sanitizeInput(formData.parkingInfo || ""),
        publicTransportInfo: sanitizeInput(formData.publicTransportInfo || ""),
        ageRestrictions: sanitizeInput(formData.ageRestrictions || ""),
        dresscode: sanitizeInput(formData.dresscode || ""),
      };

      // Validate dynamic pricing settings
      if (sanitizedData.enableDynamicPricing) {
        if (!sanitizedData.minPrice || !sanitizedData.maxPrice) {
          toast.error("Please set minimum and maximum prices for dynamic pricing.");
          return;
        }
        if (sanitizedData.minPrice >= sanitizedData.maxPrice) {
          toast.error("Maximum price must be higher than minimum price.");
          return;
        }
      }

      // Auto-generate SEO metadata if not provided
      if (!sanitizedData.metaDescription) {
        sanitizedData.metaDescription = `Join ${sanitizedData.title} on ${new Date(sanitizedData.date).toLocaleDateString()} at ${sanitizedData.location}. ${sanitizedData.description.substring(0, 100)}...`;
      }

      if (!sanitizedData.seoKeywords || sanitizedData.seoKeywords.length === 0) {
        sanitizedData.seoKeywords = [
          sanitizedData.category.toLowerCase(),
          sanitizedData.location.toLowerCase().split(' ')[0],
          'event',
          'tickets'
        ];
      }

      await createEvent(sanitizedData);
      toast.success("Event created successfully with enhanced SEO metadata!");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create event. Please try again.");
      console.error("Event creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (fileUrl: string) => {
    setImagePreview(fileUrl);
    setFormData({ ...formData, image: fileUrl });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData({ ...formData, tags });
  };

  const handleSeoKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(",").map((keyword) => keyword.trim());
    setFormData({ ...formData, seoKeywords: keywords });
  };

  const handleDynamicPricingToggle = (enabled: boolean) => {
    setFormData({ 
      ...formData, 
      enableDynamicPricing: enabled,
      minPrice: enabled ? formData.price * 0.5 : undefined,
      maxPrice: enabled ? formData.price * 2 : undefined,
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create New Event
        </CardTitle>
        <CardDescription>
          Create your event with advanced security, SEO optimization, and AI-powered assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <CSRFToken />
          
          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Event Image</Label>
            <div className="flex items-start gap-6">
              <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <SecureFileUpload
                  onUploadSuccess={handleImageUpload}
                  onUploadError={(error) => toast.error(error)}
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Venue Name *</Label>
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Central Park"
                />
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Street Name, City, State, ZIP"
                />
              </div>

              <div>
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={2000}
            />
          </div>

          {/* SEO & Metadata Section */}
          <div className="space-y-6 p-6 border rounded-lg bg-blue-50">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5" />
                SEO & Discoverability
              </h3>
              <p className="text-sm text-gray-600 mb-4">Optimize your event for search engines and better discoverability</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <textarea
                  id="metaDescription"
                  value={formData.metaDescription || ""}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Brief description for search engines (160 characters max)"
                  className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  maxLength={160}
                />
              </div>

              <div>
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoKeywords?.join(", ") || ""}
                  onChange={handleSeoKeywordsChange}
                  placeholder="tech, conference, networking (separate with commas)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Keywords to help people find your event
                </p>
              </div>
            </div>
          </div>

          {/* Additional Event Information */}
          <div className="space-y-6 p-6 border rounded-lg bg-green-50">
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Event Information</h3>
              <p className="text-sm text-gray-600 mb-4">Help attendees plan better with detailed information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accessibilityInfo">Accessibility Information</Label>
                <Input
                  id="accessibilityInfo"
                  value={formData.accessibilityInfo || ""}
                  onChange={(e) => setFormData({ ...formData, accessibilityInfo: e.target.value })}
                  placeholder="Wheelchair accessible, sign language interpreter, etc."
                />
              </div>

              <div>
                <Label htmlFor="parkingInfo">Parking Information</Label>
                <Input
                  id="parkingInfo"
                  value={formData.parkingInfo || ""}
                  onChange={(e) => setFormData({ ...formData, parkingInfo: e.target.value })}
                  placeholder="Free parking available, $10 valet, street parking only, etc."
                />
              </div>

              <div>
                <Label htmlFor="publicTransportInfo">Public Transport</Label>
                <Input
                  id="publicTransportInfo"
                  value={formData.publicTransportInfo || ""}
                  onChange={(e) => setFormData({ ...formData, publicTransportInfo: e.target.value })}
                  placeholder="Metro Station 5 mins walk, Bus route 123, etc."
                />
              </div>

              <div>
                <Label htmlFor="ageRestrictions">Age Restrictions</Label>
                <Input
                  id="ageRestrictions"
                  value={formData.ageRestrictions || ""}
                  onChange={(e) => setFormData({ ...formData, ageRestrictions: e.target.value })}
                  placeholder="All ages, 18+, 21+, Family friendly, etc."
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-6 p-6 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Configuration
                </h3>
                <p className="text-sm text-gray-600">Set up your ticket pricing strategy</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Base Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Set to 0 for free events</p>
              </div>
            </div>

            {/* Dynamic Pricing */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dynamicPricing"
                  checked={formData.enableDynamicPricing}
                  onCheckedChange={handleDynamicPricingToggle}
                />
                <Label htmlFor="dynamicPricing" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Enable Dynamic Pricing (AI-Powered)
                </Label>
              </div>
              
              {formData.enableDynamicPricing && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="minPrice">Minimum Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minPrice || ''}
                      onChange={(e) => setFormData({ ...formData, minPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Minimum ticket price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice">Maximum Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxPrice || ''}
                      onChange={(e) => setFormData({ ...formData, maxPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Maximum ticket price"
                    />
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    Prices will automatically adjust based on demand, time until event, and attendance rates.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags.join(", ")}
              onChange={handleTagsChange}
              placeholder="outdoor, family-friendly, music (separate with commas)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add tags to help people discover your event
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isCreating || isSubmitting} 
            className="w-full"
          >
            {isCreating || isSubmitting ? "Creating Event..." : "Create Event with Enhanced SEO"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureEventCreationForm;

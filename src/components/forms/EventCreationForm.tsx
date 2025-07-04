import { useState } from "react";
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
  Calendar,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";

// Sanitize all user input to prevent XSS or injection
const sanitizeText = (text: string) => text.replace(/[<>]/g, "").trim();

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
  imageFile?: File;
}

interface EventCreationFormProps {
  onSuccess?: () => void;
}

const categories = [
  "Music",
  "Technology",
  "Food",
  "Sports",
  "Arts",
  "Business",
  "Education",
  "Health",
];

const EventCreationForm = ({ onSuccess }: EventCreationFormProps) => {
  const { profile } = useAuth();
  const { createEvent, isCreating } = useEvents();
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
  });
  const [imagePreview, setImagePreview] = useState<string>("/placeholder.svg");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize all text fields before submission
    const sanitizedData = {
      ...formData,
      title: sanitizeText(formData.title),
      description: sanitizeText(formData.description),
      location: sanitizeText(formData.location),
      address: sanitizeText(formData.address),
      tags: formData.tags.map(sanitizeText).filter((tag) => tag !== ""),
    };

    await createEvent(sanitizedData);
    onSuccess?.();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => sanitizeText(tag));
    setFormData({ ...formData, tags });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create New Event
        </CardTitle>
        <CardDescription>
          Fill out the details below to create your event listing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ImageIcon className="inline h-4 w-4 mr-1" />
                Event Image
              </label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    Upload a poster or image for your event
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter event title"
                maxLength={80}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your event"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={500}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  aria-label="Event date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <Input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  aria-label="Event time"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                Venue Name *
              </label>
              <Input
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Central Park"
                maxLength={80}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address *
              </label>
              <Input
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Street Name, City, State, ZIP"
                maxLength={120}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Ticket Price
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                aria-label="Ticket price"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 for free events
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Event category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attendees
              </label>
              <Input
                type="number"
                min="1"
                value={formData.maxAttendees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAttendees: parseInt(e.target.value) || 100,
                  })
                }
                placeholder="100"
                aria-label="Max attendees"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <Input
              value={formData.tags.join(", ")}
              onChange={handleTagsChange}
              placeholder="outdoor, family-friendly, music (separate with commas)"
              maxLength={100}
              autoComplete="off"
              aria-label="Event tags"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add tags to help people discover your event
            </p>
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? "Creating Event..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventCreationForm;
// This component provides a form for creating new events with fields for title, description, date, time, location, pricing, and more.
// It includes image upload functionality with a preview, and sanitizes all user input to prevent XSS or injection attacks.
// The form uses a card layout for better organization and includes icons for visual clarity

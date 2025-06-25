
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
import { Calendar, MapPin, DollarSign, Image, Tag } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useToast } from "@/hooks/use-toast";

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
}

interface EventCreationFormProps {
  onSuccess?: () => void;
}

const EventCreationForm = ({ onSuccess }: EventCreationFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock event creation - replace with Supabase later
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        organizer: profile ? `${profile.first_name} ${profile.last_name}` : "Unknown",
        attendeeCount: 0,
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
      };

      console.log("Creating event:", newEvent);

      // Store in localStorage for now
      const existingEvents = JSON.parse(
        localStorage.getItem("eventory_events") || "[]"
      );
      existingEvents.push(newEvent);
      localStorage.setItem("eventory_events", JSON.stringify(existingEvents));

      toast({
        title: "Event Created!",
        description: "Your event has been successfully created and published.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
            />
            <p className="text-xs text-gray-500 mt-1">
              Add tags to help people discover your event
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating Event..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventCreationForm;

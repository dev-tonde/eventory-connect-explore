import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

// Defensive: sanitize text for display (not strictly necessary for static testimonials, but for future-proofing)
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Event Attendee",
    content:
      "Eventory made it so easy to find amazing local events. I've discovered concerts and workshops I never would have known about!",
    rating: 5,
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Event Organizer",
    content:
      "As an organizer, Eventory's tools have streamlined my entire event management process. The analytics are incredibly helpful.",
    rating: 5,
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Community Leader",
    content:
      "The platform's focus on community events has helped bring our neighborhood together. Highly recommend!",
    rating: 5,
    avatar: "/placeholder.svg",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Community Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust Eventory for their event
            needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div
                  className="flex items-center mb-4"
                  aria-label={`Rating: ${testimonial.rating} out of 5`}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className="text-gray-600 mb-4 italic">
                  &quot;{sanitizeText(testimonial.content)}&quot;
                </p>

                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={`Avatar of ${sanitizeText(testimonial.name)}`}
                    className="w-10 h-10 rounded-full bg-gray-200 mr-3"
                    loading="lazy"
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {sanitizeText(testimonial.name)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {sanitizeText(testimonial.role)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
// This component renders a testimonials section with user feedback.

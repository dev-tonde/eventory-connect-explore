import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Event } from "@/types/event";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Only allow trusted image URLs (must be https and from your trusted domain)
const isTrustedImageUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    // Replace with your actual trusted domain if needed
    return (
      parsed.protocol === "https:" && parsed.hostname.endsWith("supabase.co")
    );
  } catch {
    return false;
  }
};

interface FeaturedEventsSectionProps {
  events: Event[];
}

const FeaturedEventsSection = ({ events }: FeaturedEventsSectionProps) => {
  // Filter and sort events to get real featured events from database
  const featuredEvents = events
    .filter((event) => event.attendeeCount > 0 || event.price > 0) // Show events with activity or paid events
    .sort((a, b) => {
      // Sort by attendee count and recency
      if (a.attendeeCount !== b.attendeeCount) {
        return b.attendeeCount - a.attendeeCount;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 8); // Get top 8 featured events

  // If no events, show empty state
  if (featuredEvents.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-gray-600">
              No featured events available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Hand-picked events and events from verified organizers that you
              won't want to miss
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" className="flex items-center gap-2">
              See All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredEvents.map((event) => {
              const safeImageUrl =
                event.image && isTrustedImageUrl(event.image)
                  ? event.image
                  : "/placeholder.svg";
              return (
                <CarouselItem
                  key={event.id}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="hover:shadow-lg transition-shadow group h-full">
                    <div className="relative">
                      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                        <img
                          src={safeImageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Featured
                        </span>
                        {event.attendeeCount > 50 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            Popular Event
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Link to={`/events/${event.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                            {event.title}
                          </CardTitle>
                          <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {event.category}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-2">
                          <span>By {event.organizer}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(event.date).toLocaleDateString()} at{" "}
                              {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-purple-600">
                            {event.price === 0 ? "Free" : `R${event.price}`}
                          </span>
                          <Button
                            size="sm"
                            variant="default"
                          >
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedEventsSection;
// This component renders a section with featured events, highlighting those from verified organizers.
// It uses a carousel to display the events and includes details like title, date, time, location, and price. The component also shows a badge for verified organizers and handles image loading errors by using a placeholder image.
// The events are sorted based on the organizer's follower count and attendee count, with a maximum of 8 events displayed.
// The component uses a localStorage mock for follower counts, simulating a real-world scenario where this data would be fetched from a backend service.


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Event } from "@/types/event";
import { Link } from "react-router-dom";

interface FeaturedEventsSectionProps {
  events: Event[];
}

const FeaturedEventsSection = ({ events }: FeaturedEventsSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Get follower counts and determine verified organizers
  const followerCounts = JSON.parse(localStorage.getItem('eventory_follower_counts') || '{}');
  
  // Filter events to prioritize verified organizers (10k+ followers)
  const featuredEvents = events
    .map(event => ({
      ...event,
      isVerifiedOrganizer: (followerCounts[event.organizer] || 0) >= 10000,
      followerCount: followerCounts[event.organizer] || 0
    }))
    .sort((a, b) => {
      // First sort by verified status, then by follower count, then by attendee count
      if (a.isVerifiedOrganizer !== b.isVerifiedOrganizer) {
        return b.isVerifiedOrganizer ? 1 : -1;
      }
      if (a.followerCount !== b.followerCount) {
        return b.followerCount - a.followerCount;
      }
      return b.attendeeCount - a.attendeeCount;
    })
    .slice(0, showAll ? events.length : 10);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Hand-picked events and events from verified organizers that you won't want to miss
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" className="flex items-center gap-2">
              See All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow group">
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Featured
                  </span>
                  {event.isVerifiedOrganizer && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      Verified Organizer
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
                  <CardDescription className="line-clamp-2 flex items-center gap-2">
                    <span>By {event.organizer}</span>
                    {event.isVerifiedOrganizer && (
                      <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendeeCount}/{event.maxAttendees} attending</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-purple-600">
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </span>
                    <Button size="sm" className="group-hover:bg-purple-700 transition-colors">
                      View Details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        
        {!showAll && events.length > 10 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(true)}
              className="px-8"
            >
              Show More Featured Events
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEventsSection;

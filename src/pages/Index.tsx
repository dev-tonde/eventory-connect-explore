
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Users, Zap, MapPin, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useEmblaCarousel from 'embla-carousel-react';
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  image_url: string;
  price: number;
  max_attendees: number;
  current_attendees: number;
  organizer_id: string;
}

const EventCard = ({ event }: { event: Event }) => {
  const isLowTickets = event.max_attendees - event.current_attendees <= 20;
  
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 flex-shrink-0 w-80 mx-2">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={event.image_url || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isLowTickets && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Only {event.max_attendees - event.current_attendees} tickets left!
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span>•</span>
          <span>{event.time}</span>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4" />
          <span>{event.venue}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">R{event.price}</span>
          <Link to={`/events/${event.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const EventCarousel = ({ title, events }: { title: string; events: Event[] }) => {
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (events) {
        setFeaturedEvents(events.slice(0, 3));
        setNearbyEvents(events.slice(3, 6));
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Amazing
            <span className="text-yellow-300"> Events</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connect with your community through AI-powered event discovery, 
            dynamic pricing, and seamless social integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/create-event">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      {featuredEvents.length > 0 && (
        <EventCarousel title="Featured Events" events={featuredEvents} />
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Eventory?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Discovery</h3>
              <p className="text-gray-600">
                Smart recommendations based on your interests, location, and past events.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Event Communities</h3>
              <p className="text-gray-600">
                Connect with attendees through WhatsApp-style group chats for every event.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Calendar Sync</h3>
              <p className="text-gray-600">
                AI-powered calendar integration with travel time and intelligent scheduling.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dynamic Pricing</h3>
              <p className="text-gray-600">
                AI-driven pricing optimization with early-bird discounts and surge pricing.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Poster Studio</h3>
              <p className="text-gray-600">
                Generate stunning event posters and social media content with AI.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location-Based Discovery</h3>
              <p className="text-gray-600">
                Interactive maps with proximity filters and real-time event updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Events Carousel */}
      {nearbyEvents.length > 0 && (
        <EventCarousel title="Events Near You" events={nearbyEvents} />
      )}

      {/* Communities CTA */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Event Communities</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with like-minded people, share experiences, and build lasting relationships 
            through our event-based communities.
          </p>
          <Link to="/communities">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Explore Communities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of event enthusiasts and organizers who are already using Eventory 
            to create memorable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

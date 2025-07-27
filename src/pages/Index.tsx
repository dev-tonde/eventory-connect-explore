/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Users,
  Zap,
  MapPin,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeaturedEventsSection from "@/components/events/FeaturedEventsSection";
import NearbyEventsSection from "@/components/events/NearbyEventsSection";
import EventsWithFilters from "@/components/events/EventsWithFilters";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import GoogleSignInModal from "@/components/auth/GoogleSignInModal";
import { NearbyEventsFeed } from "@/components/feed/NearbyEventsFeed";
import FilterBar, { FilterState } from "@/components/filters/FilterBar";
import { useOptimizedEvents } from "@/hooks/useOptimizedEvents";
import { useMetadata } from "@/hooks/useMetadata";
import { defaultMetadata } from "@/lib/metadata";
import { Event } from "@/types/event";
import { useAuth } from "@/contexts/AuthContext";
import EventRecommendations from "@/components/recommendations/EventRecommendations";
import EventCollections from "@/components/collections/EventCollections";
import UserPointsDisplay from "@/components/gamification/UserPointsDisplay";

const Index = () => {
  const { events: optimizedEvents, isLoading } = useOptimizedEvents();
  const { isAuthenticated } = useAuth();
  const [filterState, setFilterState] = useState<FilterState>({
    category: "All",
    isFree: false,
    isFamilyFriendly: false
  });

  // Set SEO metadata for homepage - moved to prevent re-rendering loops
  useMetadata({
    ...defaultMetadata,
    title: "Eventory - Discover Amazing Events | AI-Powered Event Discovery",
    description:
      "Connect with your community through AI-powered event discovery, dynamic pricing, and seamless social integration. Find concerts, conferences, workshops and more.",
    keywords:
      "events, event discovery, AI events, community events, concerts, conferences, workshops, meetups, social events",
  });

  // Filter events based on FilterBar state - memoized to prevent re-renders
  const filteredEvents = useMemo(() => {
    if (!optimizedEvents) return [];
    
    return optimizedEvents.filter(event => {
      if (filterState.category !== "All" && event.category !== filterState.category) {
        return false;
      }
      if (filterState.isFree && Number(event.price) > 0) {
        return false;
      }
      if (filterState.isFamilyFriendly && !event.tags?.includes("family-friendly")) {
        return false;
      }
      return true;
    });
  }, [optimizedEvents, filterState]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GoogleSignInModal />

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
              <Button size="lg" variant="secondary">
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/create-event">
              <Button size="lg" variant="outline">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* AI Recommendations (for authenticated users) */}
      {isAuthenticated && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EventRecommendations />
          </div>
        </section>
      )}

      {/* Event Collections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <EventCollections />
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <FilterBar 
            activeFilters={filterState}
            onFiltersChange={setFilterState}
          />
        </div>
      </section>

      {/* Featured Events Carousel - Right after hero */}
      <FeaturedEventsSection events={filteredEvents.slice(0, 8)} />

      {/* Events with Tab Filtering */}
      <EventsWithFilters />

      {/* Live Events Feed */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Live from Events Near You</h2>
            <p className="text-muted-foreground">
              See real-time photos and mood from events happening within 50km
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <NearbyEventsFeed />
          </div>
        </div>
      </section>

      {/* Communities CTA */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Event Communities</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with like-minded people, share experiences, and build
            lasting relationships through our event-based communities.
          </p>
          <Link to="/communities">
            <Button size="lg" variant="secondary">
              Explore Communities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Events Near You with Map */}
      <NearbyEventsSection />

      {/* Newsletter Signup CTA */}
      <NewsletterSignup />

      {/* Why Choose Eventory */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Eventory?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Discovery
              </h3>
              <p className="text-gray-600">
                Smart recommendations based on your interests, location, and
                past events.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Event Communities</h3>
              <p className="text-gray-600">
                Connect with attendees through WhatsApp-style group chats for
                every event.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smart Calendar Sync
              </h3>
              <p className="text-gray-600">
                AI-powered calendar integration with travel time and intelligent
                scheduling.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dynamic Pricing</h3>
              <p className="text-gray-600">
                AI-driven pricing optimization with early-bird discounts and
                surge pricing.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Poster Studio</h3>
              <p className="text-gray-600">
                Generate stunning event posters and social media content with
                AI.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Location-Based Discovery
              </h3>
              <p className="text-gray-600">
                Interactive maps with proximity filters and real-time event
                updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of event enthusiasts and organizers who are already
            using Eventory to create memorable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <Link to="/auth">
                <Button size="lg" variant="default">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/events">
              <Button size="lg" variant="outline">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

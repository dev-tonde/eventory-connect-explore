
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Users, Zap, MapPin, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/events/EventCard";
import FeaturedEventsSection from "@/components/events/FeaturedEventsSection";
import NearbyEventsSection from "@/components/events/NearbyEventsSection";
import EventsWithFilters from "@/components/events/EventsWithFilters";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import GoogleSignInModal from "@/components/auth/GoogleSignInModal";
import { useOptimizedEvents } from "@/hooks/useOptimizedEvents";
import { Event } from "@/types/event";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { events: optimizedEvents, isLoading } = useOptimizedEvents();
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Enhanced mock data for demo purposes - this ensures we always have events to show
    const mockEvents: Event[] = [
      {
        id: "mock-1",
        title: "Electronic Music Festival 2024",
        description: "Experience the biggest electronic music festival of the year featuring world-renowned DJs, stunning light shows, and immersive art installations across multiple stages.",
        date: "2024-08-25",
        time: "16:00",
        location: "Electric Arena",
        address: "500 Festival Grounds, Miami, FL 33101",
        price: 89,
        category: "Music",
        image: "/placeholder.svg",
        organizer: "Bass Drop Entertainment",
        attendeeCount: 2847,
        maxAttendees: 5000,
        tags: ["electronic", "festival", "music", "nightlife"]
      },
      {
        id: "mock-2",
        title: "Global Innovation Conference",
        description: "Join 500+ tech leaders, entrepreneurs, and innovators for three days of cutting-edge presentations, workshops, and networking opportunities shaping the future of technology.",
        date: "2024-09-12",
        time: "08:30",
        location: "Innovation Center",
        address: "1200 Tech Plaza, Seattle, WA 98101",
        price: 299,
        category: "Technology",
        image: "/placeholder.svg",
        organizer: "Future Tech Society",
        attendeeCount: 567,
        maxAttendees: 800,
        tags: ["technology", "innovation", "conference", "networking"]
      },
      {
        id: "mock-3",
        title: "International Food & Culture Fair",
        description: "Taste authentic cuisines from 30+ countries, watch live cooking demonstrations, enjoy cultural performances, and shop for unique artisanal products from around the world.",
        date: "2024-08-05",
        time: "11:00",
        location: "Cultural Heritage Park",
        address: "750 Heritage Avenue, Portland, OR 97201",
        price: 25,
        category: "Food & Drink",
        image: "/placeholder.svg",
        organizer: "World Cultures United",
        attendeeCount: 1234,
        maxAttendees: 2000,
        tags: ["food", "culture", "international", "family"]
      },
      {
        id: "mock-4",
        title: "Entrepreneurship Bootcamp",
        description: "Intensive 3-day program for aspiring entrepreneurs featuring successful founders, venture capitalists, and hands-on workshops covering everything from ideation to scaling.",
        date: "2024-09-20",
        time: "09:00",
        location: "Business Innovation Hub",
        address: "300 Entrepreneur Way, Denver, CO 80202",
        price: 199,
        category: "Business",
        image: "/placeholder.svg",
        organizer: "Startup Accelerator Network",
        attendeeCount: 145,
        maxAttendees: 200,
        tags: ["business", "entrepreneurship", "bootcamp", "startup"]
      },
      {
        id: "mock-5",
        title: "Modern Art & Design Exhibition",
        description: "Explore contemporary masterpieces from renowned artists alongside emerging talent. Features interactive installations, guided tours, and exclusive artist meet & greets.",
        date: "2024-08-15",
        time: "10:00",
        location: "Metropolitan Museum of Art",
        address: "1000 Museum Mile, New York, NY 10028",
        price: 0,
        category: "Arts & Culture",
        image: "/placeholder.svg",
        organizer: "Contemporary Arts Foundation",
        attendeeCount: 892,
        maxAttendees: 1500,
        tags: ["art", "exhibition", "contemporary", "free"]
      },
      {
        id: "mock-6",
        title: "Marathon Training Camp",
        description: "Professional coaching, nutrition workshops, and group training sessions to prepare for your next marathon. Suitable for beginners to advanced runners.",
        date: "2024-07-30",
        time: "06:00",
        location: "Olympic Training Facility",
        address: "400 Athletic Drive, Boulder, CO 80301",
        price: 150,
        category: "Sports",
        image: "/placeholder.svg",
        organizer: "Elite Running Academy",
        attendeeCount: 78,
        maxAttendees: 100,
        tags: ["sports", "running", "marathon", "training"]
      },
      {
        id: "mock-7",
        title: "Holistic Wellness Festival",
        description: "A transformative weekend featuring yoga masters, meditation experts, wellness workshops, organic food vendors, and healing practitioners from various traditions.",
        date: "2024-08-12",
        time: "07:00",
        location: "Harmony Retreat Center",
        address: "200 Wellness Way, Asheville, NC 28801",
        price: 75,
        category: "Health & Wellness",
        image: "/placeholder.svg",
        organizer: "Mind Body Spirit Collective",
        attendeeCount: 234,
        maxAttendees: 400,
        tags: ["wellness", "yoga", "meditation", "festival"]
      },
      {
        id: "mock-8",
        title: "Comedy Night Spectacular",
        description: "Laugh until your sides hurt with performances from top comedians, rising stars, and surprise guest appearances. Premium seating includes complimentary drinks and appetizers.",
        date: "2024-08-22",
        time: "20:00",
        location: "Comedy Club Downtown",
        address: "150 Laugh Lane, Nashville, TN 37201",
        price: 45,
        category: "Entertainment",
        image: "/placeholder.svg",
        organizer: "Laugh Factory Productions",
        attendeeCount: 187,
        maxAttendees: 250,
        tags: ["comedy", "entertainment", "nightlife", "drinks"]
      }
    ];

    // Combine database events with mock events, prioritizing database events
    const combinedEvents = [...optimizedEvents, ...mockEvents];
    
    // Remove duplicates based on title to avoid showing the same event twice
    const uniqueEvents = combinedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.title === event.title)
    );
    
    setAllEvents(uniqueEvents);
  }, [optimizedEvents]);

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

      {/* 1. Featured Events Carousel */}
      <FeaturedEventsSection events={allEvents} />

      {/* 2. Events with Tab Filtering */}
      <EventsWithFilters />

      {/* 3. Communities CTA */}
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

      {/* 4. Events Near You with Map */}
      <NearbyEventsSection />

      {/* 5. Newsletter Signup CTA */}
      <NewsletterSignup />

      {/* 6. Why Choose Eventory */}
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

      {/* 7. Ready to Get Started CTA - Only show Sign Up Free if user is not logged in */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of event enthusiasts and organizers who are already using Eventory 
            to create memorable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Link to="/login">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/events">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
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

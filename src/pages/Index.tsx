
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Search, Users, Heart, DollarSign, TrendingUp, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import EventMap from "@/components/map/EventMap";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import FeaturedEventsSection from "@/components/events/FeaturedEventsSection";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import { Event } from "@/types/event";

// Mock events data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Music Festival",
    description: "Join us for an amazing day of live music featuring local and international artists.",
    date: "2024-07-15",
    time: "14:00",
    location: "Central Park",
    address: "123 Park Avenue, New York, NY",
    price: 75,
    category: "Music",
    image: "/placeholder.svg",
    organizer: "Music Events Co.",
    attendeeCount: 150,
    maxAttendees: 500,
    tags: ["outdoor", "festival", "music"]
  },
  {
    id: "2",
    title: "Tech Innovation Workshop",
    description: "Learn about the latest trends in AI and machine learning from industry experts.",
    date: "2024-07-20",
    time: "10:00",
    location: "Tech Hub",
    address: "456 Innovation Street, San Francisco, CA",
    price: 25,
    category: "Technology",
    image: "/placeholder.svg",
    organizer: "TechLearn",
    attendeeCount: 45,
    maxAttendees: 100,
    tags: ["workshop", "technology", "AI"]
  },
  {
    id: "3",
    title: "Community Food Fair",
    description: "Taste delicious food from local vendors and support your community.",
    date: "2024-07-22",
    time: "11:00",
    location: "Community Center",
    address: "789 Main Street, Austin, TX",
    price: 0,
    category: "Food",
    image: "/placeholder.svg",
    organizer: "Austin Community",
    attendeeCount: 200,
    maxAttendees: 300,
    tags: ["food", "community", "free"]
  },
  {
    id: "4",
    title: "Family Fun Day",
    description: "A day of fun activities for the whole family.",
    date: "2024-08-10",
    time: "10:00",
    location: "Local Park",
    address: "100 Park Lane, Anytown, USA",
    price: 10,
    category: "Family",
    image: "/placeholder.svg",
    organizer: "Family Events Inc.",
    attendeeCount: 100,
    maxAttendees: 200,
    tags: ["family", "kids", "outdoor"]
  },
  {
    id: "5",
    title: "Charity Golf Tournament",
    description: "Raise money for a good cause while enjoying a day of golf.",
    date: "2024-09-05",
    time: "08:00",
    location: "Golf Course",
    address: "456 Fairway Drive, Golfville, USA",
    price: 100,
    category: "Sports",
    image: "/placeholder.svg",
    organizer: "Charity Events Org.",
    attendeeCount: 50,
    maxAttendees: 100,
    tags: ["golf", "charity", "sports"]
  },
  {
    id: "6",
    title: "Art Exhibition",
    description: "A showcase of local artists and their amazing creations.",
    date: "2024-09-15",
    time: "18:00",
    location: "Art Gallery",
    address: "789 Art Street, Artville, USA",
    price: 15,
    category: "Arts",
    image: "/placeholder.svg",
    organizer: "Art Society",
    attendeeCount: 75,
    maxAttendees: 150,
    tags: ["art", "exhibition", "local"]
  }
];

const Index = () => {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [attendedEvents, setAttendedEvents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("nearby");

  useEffect(() => {
    // Load stored data
    const storedEvents = JSON.parse(localStorage.getItem('eventory_events') || '[]');
    if (storedEvents.length > 0) {
      setEvents([...mockEvents, ...storedEvents]);
    }

    if (user) {
      const storedFavorites = JSON.parse(localStorage.getItem('eventory_favorites') || '[]');
      const userFavorites = storedFavorites
        .filter((f: any) => f.userId === user.id)
        .map((f: any) => f.eventId);
      setFavorites(userFavorites);

      const purchases = JSON.parse(localStorage.getItem('eventory_purchases') || '[]');
      const userPurchases = purchases
        .filter((p: any) => p.userId === user.id)
        .map((p: any) => p.eventId);
      setAttendedEvents(userPurchases);
    }
  }, [user]);

  // Filter events based on different criteria
  const nearbyEvents = events.filter(event => {
    // Mock distance calculation - in real app use actual coordinates
    return Math.random() > 0.3; // ~70% of events are "nearby"
  });

  const pastAttendedEvents = events.filter(event => 
    attendedEvents.includes(event.id)
  );

  const favoriteEvents = events.filter(event => 
    favorites.includes(event.id)
  );

  const freeEvents = events.filter(event => event.price === 0);

  const familyFriendlyEvents = events.filter(event => 
    event.tags?.includes('family') || event.category === 'Family'
  );

  // Sort all events by popularity (sales + favorites + shares)
  const allEventsByPopularity = [...events].sort((a, b) => {
    const aPopularity = a.attendeeCount + (favorites.includes(a.id) ? 10 : 0);
    const bPopularity = b.attendeeCount + (favorites.includes(b.id) ? 10 : 0);
    return bPopularity - aPopularity;
  });

  // Filter events based on search term
  const getFilteredEvents = (eventList: Event[]) => {
    if (!searchTerm) return eventList;
    return eventList.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getEventsForTab = () => {
    switch (activeTab) {
      case "nearby": return getFilteredEvents(nearbyEvents);
      case "attended": return getFilteredEvents(pastAttendedEvents);
      case "favorites": return getFilteredEvents(favoriteEvents);
      case "free": return getFilteredEvents(freeEvents);
      case "family": return getFilteredEvents(familyFriendlyEvents);
      case "all": return getFilteredEvents(allEventsByPopularity);
      default: return getFilteredEvents(nearbyEvents);
    }
  };

  const EventGrid = ({ events: gridEvents }: { events: Event[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gridEvents.slice(0, 6).map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <Link to={`/events/${event.id}`}>
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-purple-600">
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </span>
                <Button size="sm">View Details</Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Eventory</span>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/login">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Discover Events That
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Matter</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with events you care about while empowering organizers to promote, manage, and monetize their experiences effortlessly.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search events, locations, or organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/events">
            <Button size="lg" className="text-lg px-8 py-3">
              Explore Events
            </Button>
          </Link>
          <Link to={user ? "/dashboard" : "/login"}>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              {user ? "Go to Dashboard" : "Create an Event"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      <FeaturedEventsSection events={events} />

      {/* Tabbed Events Section with Map */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Find Your Perfect Event
          </h2>
          <Link to="/events">
            <Button variant="outline" className="flex items-center gap-2">
              See All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="attended" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Past Events
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="free" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Free
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Family
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              All Events
            </TabsTrigger>
          </TabsList>
          
          {/* Map Section */}
          <div className="mt-8 mb-8">
            <h3 className="text-xl font-semibold mb-4">Events Near You</h3>
            <EventMap events={getEventsForTab().slice(0, 10)} userLocation={location} />
          </div>

          <TabsContent value="nearby" className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Events within 10km</h3>
              <p className="text-gray-600">
                {getFilteredEvents(nearbyEvents).length} events found near your location
              </p>
            </div>
            <EventGrid events={getFilteredEvents(nearbyEvents)} />
          </TabsContent>
          
          <TabsContent value="attended" className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Based on Past Events</h3>
              <p className="text-gray-600">
                {getFilteredEvents(pastAttendedEvents).length > 0 
                  ? `Recommendations based on ${getFilteredEvents(pastAttendedEvents).length} past events`
                  : "Start attending events to get personalized recommendations"
                }
              </p>
            </div>
            {getFilteredEvents(pastAttendedEvents).length > 0 ? (
              <EventGrid events={getFilteredEvents(pastAttendedEvents)} />
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No past events found. Start exploring!</p>
                <Link to="/events">
                  <Button className="mt-4">Browse Events</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Your Favorite Events</h3>
              <p className="text-gray-600">
                {getFilteredEvents(favoriteEvents).length} favorite events and organizers
              </p>
            </div>
            {getFilteredEvents(favoriteEvents).length > 0 ? (
              <EventGrid events={getFilteredEvents(favoriteEvents)} />
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No favorites yet. Heart events you love!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="free" className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Free Events</h3>
              <p className="text-gray-600">
                {getFilteredEvents(freeEvents).length} free events available
              </p>
            </div>
            <EventGrid events={getFilteredEvents(freeEvents)} />
          </TabsContent>
          
          <TabsContent value="family" className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Family-Friendly Events</h3>
              <p className="text-gray-600">
                {getFilteredEvents(familyFriendlyEvents).length} events perfect for families
              </p>
            </div>
            <EventGrid events={getFilteredEvents(familyFriendlyEvents)} />
          </TabsContent>

          <TabsContent value="all" className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">All Events by Popularity</h3>
              <p className="text-gray-600">
                {getFilteredEvents(allEventsByPopularity).length} events sorted by popularity
              </p>
            </div>
            <EventGrid events={getFilteredEvents(allEventsByPopularity)} />
          </TabsContent>
        </Tabs>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Eventory?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Search className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Smart Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Personalized event recommendations based on your interests and location with AI-powered search capabilities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Location-Aware</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Geo-targeted search and interactive maps help you find events nearby and explore new venues.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Full Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Complete event lifecycle management from creation to post-event engagement with powerful organizer tools.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* For Organizers Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Event Organizers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools to streamline your event promotion, management, and monetization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Generated Marketing</h3>
                  <p className="text-gray-600">Create stunning event posters and social media banners with AI assistance</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dynamic Pricing</h3>
                  <p className="text-gray-600">Smart pricing tools that adapt based on demand and market conditions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multilingual Support</h3>
                  <p className="text-gray-600">Expand your reach with automatic multilingual event listings</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Split Payments</h3>
                  <p className="text-gray-600">Enable group purchases with flexible split payment options</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">SnapLoop Integration</h3>
                  <p className="text-gray-600">Let attendees upload and share photos during your event</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
                  <p className="text-gray-600">Track performance and gain insights to improve future events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Event Experience?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of organizers and attendees who trust Eventory for their event needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Creating Events
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-purple-600">
                Explore Events Near You
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">Eventory</span>
              </div>
              <p className="text-gray-400">
                Connecting people through meaningful events.
              </p>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Get Help</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Account Links (for logged in users) */}
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              {user ? (
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                  <li><Link to="/profile" className="hover:text-white transition-colors">My Orders</Link></li>
                  <li><Link to="/profile" className="hover:text-white transition-colors">Favorites</Link></li>
                  <li><Link to="/profile" className="hover:text-white transition-colors">Following</Link></li>
                </ul>
              ) : (
                <div>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-gray-900">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Organizers */}
            <div>
              <h3 className="font-semibold mb-4">For Organizers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/switch-to-selling" className="hover:text-white transition-colors">Switch to Selling</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Organizer Dashboard</Link></li>
              </ul>
              
              {/* Social Media */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Facebook</span>
                    📘
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Twitter</span>
                    🐦
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Instagram</span>
                    📷
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    💼
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Eventory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

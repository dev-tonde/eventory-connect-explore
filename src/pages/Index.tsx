import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button>Get Started</Button>
            </Link>
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
          Connect with events you care about while empowering organizers to promote, manage, and monetize their experiences effortlessly. Find music festivals, workshops, sports games, and community gatherings—all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/events">
            <Button size="lg" className="text-lg px-8 py-3">
              Explore Events
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Create an Event
            </Button>
          </Link>
        </div>
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
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Calendar className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold">Eventory</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 Eventory. Connecting people through meaningful events.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

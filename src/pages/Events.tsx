
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Event } from "@/types/event";

// Mock data for demonstration
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
  }
];

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Events</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="music">Music</option>
              <option value="technology">Technology</option>
              <option value="food">Food</option>
              <option value="sports">Sports</option>
              <option value="arts">Arts</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={`/events/${event.id}`}>
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {event.category}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
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
                  
                  <div className="flex justify-between items-center mt-4">
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
      </div>
    </div>
  );
};

export default Events;

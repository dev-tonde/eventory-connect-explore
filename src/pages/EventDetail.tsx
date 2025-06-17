
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import { Event } from "@/types/event";

// Mock data - in real app this would come from API
const mockEvent: Event = {
  id: "1",
  title: "Summer Music Festival",
  description: "Join us for an amazing day of live music featuring local and international artists. This festival brings together the best of contemporary music with food trucks, art installations, and a vibrant community atmosphere. Whether you're a music lover or just looking for a great day out, this event promises unforgettable memories.",
  date: "2024-07-15",
  time: "14:00",
  location: "Central Park",
  address: "123 Park Avenue, New York, NY 10001",
  price: 75,
  category: "Music",
  image: "/placeholder.svg",
  organizer: "Music Events Co.",
  attendeeCount: 150,
  maxAttendees: 500,
  tags: ["outdoor", "festival", "music", "family-friendly"]
};

const EventDetail = () => {
  const { id } = useParams();
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // In a real app, you'd fetch the event based on the ID
  const event = mockEvent;

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
            <Link to="/events">
              <Button>Back to Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/events" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
                <CardDescription className="text-base">
                  Organized by {event.organizer}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600">Date</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.time}</div>
                      <div className="text-sm text-gray-600">Time</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.location}</div>
                      <div className="text-sm text-gray-600">{event.address}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.attendeeCount}/{event.maxAttendees}</div>
                      <div className="text-sm text-gray-600">Attendees</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About This Event</h3>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Get Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </div>
                  <div className="text-sm text-gray-600">per ticket</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of tickets
                  </label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                    >
                      -
                    </Button>
                    <span className="px-4 py-2 bg-gray-50 rounded text-center min-w-[60px]">
                      {ticketQuantity}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setTicketQuantity(ticketQuantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold">
                      {event.price === 0 ? 'Free' : `$${event.price * ticketQuantity}`}
                    </span>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    {event.price === 0 ? 'Register for Free' : 'Buy Tickets'}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>{event.maxAttendees - event.attendeeCount} tickets remaining</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

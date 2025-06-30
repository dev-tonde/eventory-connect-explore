
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEventCollections } from "@/hooks/useEventCollections";

const EventCollections = () => {
  const { data: collections = [], isLoading } = useEventCollections();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Collections Available</h3>
        <p className="text-gray-600">Check back soon for curated event collections!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {collections.map((collection) => (
        <div key={collection.id} className="space-y-6">
          {/* Collection Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{collection.name}</h2>
              <p className="text-gray-600 mt-1">{collection.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Curated by {collection.curator}</span>
                <div className="flex gap-1">
                  {collection.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Collection Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collection.events.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow group cursor-pointer h-full">
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-purple-600">
                      {event.category}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1 text-xs">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">{event.attendeeCount} attending</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-purple-600">
                        {Number(event.price) === 0 ? "Free" : `$${Number(event.price).toFixed(2)}`}
                      </span>
                      <Button size="sm" variant="ghost" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventCollections;

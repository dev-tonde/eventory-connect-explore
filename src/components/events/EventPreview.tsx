import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface EventPreviewData {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  category: string;
  price: number;
  maxAttendees: number;
  image: string;
  tags: string[];
}

interface EventPreviewProps {
  eventData: EventPreviewData;
  className?: string;
}

export const EventPreview = ({ eventData, className = "" }: EventPreviewProps) => {
  const formattedDate = eventData.date 
    ? format(new Date(eventData.date), 'MMM dd, yyyy')
    : 'Date TBD';

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
      
      <Card className="overflow-hidden max-w-sm">
        <div className="aspect-video relative">
          <img
            src={eventData.image || '/placeholder.svg'}
            alt={eventData.title || 'Event preview'}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">{eventData.category || 'Category'}</Badge>
          </div>
          {eventData.price === 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Free
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h4 className="font-semibold text-lg mb-2 line-clamp-2">
            {eventData.title || 'Event Title'}
          </h4>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{eventData.time || 'Time TBD'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">
                {eventData.venue || 'Venue TBD'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Up to {eventData.maxAttendees || 100} attendees</span>
            </div>
          </div>
          
          {eventData.description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-3">
              {eventData.description}
            </p>
          )}
          
          {eventData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {eventData.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {eventData.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{eventData.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {eventData.price > 0 && (
            <div className="mt-4 pt-3 border-t">
              <span className="text-lg font-bold text-green-600">
                ${eventData.price}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
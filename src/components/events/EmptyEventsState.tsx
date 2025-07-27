import { Calendar, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyEventsStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  className?: string;
}

export const EmptyEventsState = ({
  title = "Sorry there are no events at the moment",
  description = "Check back later for new events or create your own event to get started.",
  showCreateButton = true,
  className = ""
}: EmptyEventsStateProps) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/events">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse All Events
            </Button>
          </Link>
          
          {showCreateButton && (
            <Link to="/create-event">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
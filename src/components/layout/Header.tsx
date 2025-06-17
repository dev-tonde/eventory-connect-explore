
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Eventory</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/events" 
              className={`hover:text-purple-600 transition-colors ${
                location.pathname === '/events' ? 'text-purple-600 font-medium' : 'text-gray-600'
              }`}
            >
              Explore Events
            </Link>
            <Link 
              to="/dashboard" 
              className={`hover:text-purple-600 transition-colors ${
                location.pathname === '/dashboard' ? 'text-purple-600 font-medium' : 'text-gray-600'
              }`}
            >
              Organizer Dashboard
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button>Create Event</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

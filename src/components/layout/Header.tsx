import { Button } from "@/components/ui/button";
import { Calendar, User, Plus, Image } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import LocationIndicator from "@/components/location/LocationIndicator";

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

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
                location.pathname === "/events"
                  ? "text-purple-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Explore Events
            </Link>
<<<<<<< HEAD
            {isAuthenticated && user?.role === "organizer" && (
              <Link
                to="/dashboard"
                className={`hover:text-purple-600 transition-colors ${
                  location.pathname === "/dashboard"
                    ? "text-purple-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                Dashboard
              </Link>
=======
            {isAuthenticated && user?.role === 'organizer' && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`hover:text-purple-600 transition-colors ${
                    location.pathname === '/dashboard' ? 'text-purple-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/poster-studio" 
                  className={`hover:text-purple-600 transition-colors ${
                    location.pathname === '/poster-studio' ? 'text-purple-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  Poster Studio
                </Link>
              </>
>>>>>>> db4f02f8b1d364f6cab2fa231a6e01d0de8471c8
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                className={`hover:text-purple-600 transition-colors ${
                  location.pathname === "/profile"
                    ? "text-purple-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                Profile
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <LocationIndicator />

            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
<<<<<<< HEAD
                {user?.role === "organizer" && (
                  <Link to="/create-event">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
=======
                {user?.role === 'organizer' && (
                  <>
                    <Link to="/create-event">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </Link>
                    <Link to="/poster-studio">
                      <Button variant="outline" size="sm">
                        <Image className="h-4 w-4 mr-2" />
                        Poster Studio
                      </Button>
                    </Link>
                  </>
>>>>>>> db4f02f8b1d364f6cab2fa231a6e01d0de8471c8
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/login">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

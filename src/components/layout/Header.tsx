
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Plus, User, LogOut, Settings, UserPlus, Heart, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import LocationIndicator from "@/components/location/LocationIndicator";
import HeaderLogo from "./HeaderLogo";
import NavigationMenu from "./NavigationMenu";
import UserMenu from "./UserMenu";
import HamburgerMenu from "./HamburgerMenu";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <HeaderLogo />
            <NavigationMenu />
          </div>

          <div className="flex items-center space-x-4">
            <LocationIndicator />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Button size="sm" variant="ghost" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="hidden lg:block">
                        {profile?.first_name || user.email}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm border-b">
                      <div className="font-medium">{profile?.first_name} {profile?.last_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      {profile?.role && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {profile.role}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>

                      <Link 
                        to="/followed-organizers" 
                        className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Following
                      </Link>

                      {profile?.role === "organizer" && (
                        <Link 
                          to="/dashboard" 
                          className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      )}

                      {profile?.role === "attendee" && (
                        <Link 
                          to="/become-organizer" 
                          className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Organizer Account
                        </Link>
                      )}

                      <div className="border-t my-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md text-red-600 w-full text-left"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                {profile?.role === "organizer" && (
                  <Link to="/create-event" className="hidden sm:block">
                    <Button size="sm" className="flex items-center space-x-1">
                      <Plus className="h-4 w-4" />
                      <span className="hidden md:inline">Create Event</span>
                      <span className="md:hidden">Create</span>
                    </Button>
                  </Link>
                )}

                <div className="hidden min-[601px]:block">
                  <UserMenu onLogout={handleLogout} />
                </div>
              </div>
            ) : (
              <div className="hidden min-[601px]:flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <HamburgerMenu onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";
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


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";
import NavigationMenu from "./NavigationMenu";
import HeaderLogo from "./HeaderLogo";
import LocationIndicator from "../location/LocationIndicator";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <HeaderLogo />
          
          <div className="flex items-center space-x-6">
            <LocationIndicator />
            <NavigationMenu />
            
            <div className="flex items-center space-x-4">
              {user ? (
                <UserMenu onLogout={handleLogout} />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/auth">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

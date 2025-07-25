import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SimpleAuthContext";
import UserMenu from "./UserMenu";
import NavigationMenu from "./NavigationMenu";
import HeaderLogo from "./HeaderLogo";
import LocationIndicator from "../location/LocationIndicator";
import NotificationIcon from "../notifications/NotificationIcon";

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
    <header
      className="bg-white shadow-sm border-b sticky top-0 z-50"
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <HeaderLogo />

          <div className="flex items-center space-x-6">
            <LocationIndicator />
            <NavigationMenu />

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationIcon />
                  <UserMenu onLogout={handleLogout} />
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/auth" aria-label="Log in to your account">
                    <Button variant="ghost" type="button">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth" aria-label="Sign up for an account">
                    <Button variant="default" type="button">Sign Up</Button>
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
// This component renders the header of the application, including the logo, navigation menu, location indicator, and user authentication options.
// It uses the `useAuth` context to manage user authentication state and provides links for logging

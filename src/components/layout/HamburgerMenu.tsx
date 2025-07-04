import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Plus,
  X,
  Calendar,
  Users,
  Palette,
  Heart,
  User,
  Settings,
  UserPlus,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HamburgerMenuProps {
  onLogout: () => void;
}

const HamburgerMenu = ({ onLogout }: HamburgerMenuProps) => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Navigation items for all users
  const navigationItems = [
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/communities", label: "Communities", icon: Users },
    { href: "/poster-studio", label: "Poster Studio", icon: Palette },
  ];

  // Add user-specific navigation
  if (user) {
    navigationItems.push(
      { href: "/followed-organizers", label: "Following", icon: Heart },
      { href: "/dashboard", label: "Dashboard", icon: User }
    );
  }

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    onLogout();
    closeMenu();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="max-[600px]:flex hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        type="button"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="fixed top-4 right-4 left-auto translate-x-0 translate-y-0 max-w-sm w-full p-0 gap-0"
          aria-modal="true"
          role="dialog"
        >
          <div className="p-6">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <DialogTitle className="text-lg font-semibold">Menu</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMenu}
                className="h-6 w-6 p-0"
                aria-label="Close menu"
                type="button"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DialogHeader>

            <nav className="space-y-1" aria-label="Main navigation">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    onClick={closeMenu}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {profile?.role === "organizer" && (
                <Link
                  to="/create-event"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-purple-600 font-medium hover:bg-purple-50 transition-colors"
                  onClick={closeMenu}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Create Event</span>
                </Link>
              )}
            </nav>

            {user ? (
              <div className="mt-6 pt-4 border-t">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  {profile?.role && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {profile.role}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 mt-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    onClick={closeMenu}
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    onClick={closeMenu}
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                  {profile?.role === "attendee" && (
                    <Link
                      to="/become-organizer"
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      onClick={closeMenu}
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      <span>Become Organizer</span>
                    </Link>
                  )}
                  {profile?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                      onClick={closeMenu}
                    >
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    type="button"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t space-y-2">
                <Link to="/auth" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    type="button"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth" onClick={closeMenu}>
                  <Button size="sm" className="w-full" type="button">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HamburgerMenu;
// This component provides a responsive hamburger menu for navigation in the Eventory application.
// It includes links to various sections of the site, user profile information, and options for logging out.


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Menu, Plus, User, LogOut, Settings, Users, MapPin, Palette, Heart, UserPlus, Shield, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import LocationIndicator from "@/components/location/LocationIndicator";

const Header = () => {
  const { user, profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navigationItems = [
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/communities", label: "Communities", icon: Users },
    { href: "/poster-studio", label: "Poster Studio", icon: Palette },
  ];

  if (user) {
    navigationItems.push(
      { href: "/followed-organizers", label: "Following", icon: Heart },
      { href: "/dashboard", label: "Dashboard", icon: User }
    );
  }

  const closeHamburgerMenu = () => {
    setIsHamburgerMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-purple-600">
                Eventory
              </Link>
              
              {/* Desktop Navigation - hidden on tablet and mobile */}
              <nav className="hidden lg:flex space-x-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
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

                  {/* User dropdown - hidden on small screens when hamburger is active */}
                  <div className="hidden min-[601px]:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="hidden lg:block">
                            {profile?.first_name || user.email}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5 text-sm">
                          <div className="font-medium">{profile?.first_name} {profile?.last_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          {profile?.role && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {profile.role}
                            </Badge>
                          )}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {profile?.role === "attendee" && (
                          <DropdownMenuItem asChild>
                            <Link to="/become-organizer" className="flex items-center">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Become Organizer
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {profile?.role === "admin" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to="/admin" className="flex items-center text-red-600">
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Panel
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

              {/* Hamburger Menu Button - shows at 601px and below */}
              <Button
                variant="ghost"
                size="sm"
                className="max-[600px]:flex hidden"
                onClick={() => setIsHamburgerMenuOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Modal */}
      <Dialog open={isHamburgerMenuOpen} onOpenChange={setIsHamburgerMenuOpen}>
        <DialogContent className="fixed top-4 right-4 left-auto translate-x-0 translate-y-0 max-w-sm w-full p-0 gap-0">
          <div className="p-6">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <DialogTitle className="text-lg font-semibold">Menu</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeHamburgerMenu}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    onClick={closeHamburgerMenu}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {profile?.role === "organizer" && (
                <Link
                  to="/create-event"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-purple-600 font-medium hover:bg-purple-50 transition-colors"
                  onClick={closeHamburgerMenu}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Event</span>
                </Link>
              )}
            </nav>

            {user ? (
              <div className="mt-6 pt-4 border-t">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium">{profile?.first_name} {profile?.last_name}</div>
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
                    onClick={closeHamburgerMenu}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    onClick={closeHamburgerMenu}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  {profile?.role === "attendee" && (
                    <Link
                      to="/become-organizer"
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      onClick={closeHamburgerMenu}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Become Organizer</span>
                    </Link>
                  )}
                  {profile?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                      onClick={closeHamburgerMenu}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      closeHamburgerMenu();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t space-y-2">
                <Link to="/auth" onClick={closeHamburgerMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/auth" onClick={closeHamburgerMenu}>
                  <Button size="sm" className="w-full">
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

export default Header;

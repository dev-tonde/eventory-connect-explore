import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Heart,
  Calendar,
  Users,
  Building2,
  Settings,
  LogOut,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LocationIndicator from "../location/LocationIndicator";

interface ProfileMenuProps {
  onLogout: () => void;
}

const ProfileMenu = ({ onLogout }: ProfileMenuProps) => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.username ||
        profile?.email?.split("@")[0] ||
        user?.email?.split("@")[0] ||
        "User";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0"
          aria-label="Open profile menu"
        >
          <Avatar className="h-10 w-10 ring-2 ring-purple-100 hover:ring-purple-200 transition-all">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-white/95 backdrop-blur-md border border-white/20 shadow-lg"
        align="end"
        sideOffset={4}
      >
        {/* Profile Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-sm text-gray-500 truncate">
                {profile?.email || user?.email}
              </p>
              <Badge
                variant={profile?.role === "organizer" ? "default" : "secondary"}
                className="mt-1 text-xs"
              >
                {profile?.role === "organizer" ? "Organizer" : "Attendee"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Location Indicator - Mobile/Tablet only */}
        <div className="lg:hidden p-2 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <div className="flex-1">
              <LocationIndicator />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="p-1">
          <DropdownMenuItem asChild>
            <Link
              to="/profile"
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              to="/profile?tab=favorites"
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="h-4 w-4" />
              <span>My Favourites</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              to="/profile?tab=events"
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="h-4 w-4" />
              <span>My Events</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              to="/profile?tab=following"
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>Following</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              to="/communities"
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              <span>Communities</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              to="/profile?tab=settings"
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex items-center space-x-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
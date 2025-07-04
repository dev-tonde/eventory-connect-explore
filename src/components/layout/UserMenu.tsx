import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  User,
  LogOut,
  Settings,
  UserPlus,
  Heart,
  BarChart3,
  Users,
  Wand2,
  Calendar,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserMenuProps {
  onLogout: () => void;
}

const UserMenu = ({ onLogout }: UserMenuProps) => {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md transition-colors"
          aria-label="Open user menu"
          type="button"
        >
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-purple-600" aria-hidden="true" />
          </div>
          <span className="hidden lg:block">
            {profile?.first_name || user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white border shadow-lg"
      >
        <div className="px-2 py-1.5 text-sm">
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
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/profile"
            className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
          >
            <User className="mr-2 h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/communities"
            className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
          >
            <Users className="mr-2 h-4 w-4" aria-hidden="true" />
            Communities
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/followed-organizers"
            className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
          >
            <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
            Following
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/gamification"
            className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
          >
            <Trophy className="mr-2 h-4 w-4" aria-hidden="true" />
            Points & Badges
          </Link>
        </DropdownMenuItem>

        {profile?.role === "organizer" && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organizer Tools
            </div>

            <DropdownMenuItem asChild>
              <Link
                to="/dashboard"
                className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                to="/create-event"
                className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                Create Event
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                to="/poster-studio"
                className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                <Wand2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Poster Studio
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {profile?.role === "attendee" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/become-organizer"
                className="flex items-center hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Become an Organizer
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors cursor-pointer"
          aria-label="Logout"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
// This component provides a user menu with options for profile, communities, followed organizers, gamification, and organizer tools.
// It uses the `useAuth` context to access user and profile information.
// The menu includes links to various sections of the application and a logout option.

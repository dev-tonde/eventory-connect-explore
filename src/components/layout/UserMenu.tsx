
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
import { User, LogOut, Settings, UserPlus, Shield } from "lucide-react";
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
        <DropdownMenuItem onClick={onLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

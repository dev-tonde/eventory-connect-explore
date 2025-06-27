
import { Link } from "react-router-dom";
import { Calendar, Users, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
}

const NavigationMenu = () => {
  const { user } = useAuth();

  const navigationItems: NavigationItem[] = [
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/communities", label: "Communities", icon: Users },
    { href: "/poster-studio", label: "Poster Studio", icon: Palette },
  ];

  return (
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
  );
};

export default NavigationMenu;

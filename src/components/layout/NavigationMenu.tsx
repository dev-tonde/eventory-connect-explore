import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const NavigationMenu = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { href: "/events", label: "Events" },
    // Show "Communities" only if not authenticated
    ...(!isAuthenticated
      ? [{ href: "/communities", label: "Communities" }]
      : []),
  ];

  return (
    <nav
      className="hidden md:flex items-center space-x-8"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-1",
            location.pathname === item.href
              ? "text-purple-600"
              : "text-gray-700 hover:bg-purple-50"
          )}
          aria-current={location.pathname === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavigationMenu;
// This component renders the main navigation menu for the application.
// It uses the `useLocation` hook to determine the current path and highlight the active link.
// The menu includes links to "Home", "Events", and conditionally "Communities" if the user is not authenticated.

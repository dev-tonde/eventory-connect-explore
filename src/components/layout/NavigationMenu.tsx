
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NavigationMenu = () => {
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/communities", label: "Communities" },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-purple-600",
            location.pathname === item.href
              ? "text-purple-600"
              : "text-gray-700"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavigationMenu;

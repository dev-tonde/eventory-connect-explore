import { Calendar, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Only allow safe external URLs for social links
const socialLinks = [
  {
    href: "https://twitter.com/eventory",
    label: "Twitter",
    icon: Twitter,
  },
  {
    href: "https://facebook.com/eventory",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://instagram.com/eventory",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://linkedin.com/company/eventory",
    label: "LinkedIn",
    icon: Linkedin,
  },
];

const Footer = () => {
  const { user, profile, logout } = useAuth();
  const currentYear = new Date().getFullYear();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar
                className="h-8 w-8 text-purple-400"
                aria-hidden="true"
              />
              <span className="text-2xl font-bold">Eventory</span>
            </div>
            <p className="text-gray-300 mb-4">
              Discover amazing events and connect with your community through
              AI-powered event discovery.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/events" className="hover:text-purple-400">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="hover:text-purple-400">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/communities" className="hover:text-purple-400">
                  Communities
                </Link>
              </li>
              <li>
                <Link to="/poster-studio" className="hover:text-purple-400">
                  Poster Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="mailto:support@eventory.com"
                  className="hover:text-purple-400"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/help" className="hover:text-purple-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-purple-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-purple-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-gray-300">
              {user ? (
                <>
                  <li>
                    <Link to="/profile" className="hover:text-purple-400">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/followed-organizers"
                      className="hover:text-purple-400"
                    >
                      Following
                    </Link>
                  </li>
                  {profile?.role === "organizer" ? (
                    <li>
                      <Link to="/dashboard" className="hover:text-purple-400">
                        Dashboard
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link
                        to="/become-organizer"
                        className="hover:text-purple-400"
                      >
                        Become Organizer
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="hover:text-purple-400 text-left bg-transparent border-0 p-0"
                      type="button"
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/auth" className="hover:text-purple-400">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth" className="hover:text-purple-400">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/become-organizer"
                      className="hover:text-purple-400"
                    >
                      Become Organizer
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mt-8 pt-8 border-t border-gray-700">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="text-gray-400 hover:text-purple-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>

        <div className="border-t border-gray-700 mt-6 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} Eventory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// This component provides a footer for the Eventory platform, including links to various sections of the site, social media icons, and account management options.


import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold">Eventory</span>
            </div>
            <p className="text-gray-300 mb-4">
              Discover amazing events and connect with your community through AI-powered event discovery.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/events" className="hover:text-purple-400">Browse Events</Link></li>
              <li><Link to="/create-event" className="hover:text-purple-400">Create Event</Link></li>
              <li><Link to="/communities" className="hover:text-purple-400">Communities</Link></li>
              <li><Link to="/poster-studio" className="hover:text-purple-400">Poster Studio</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="mailto:support@eventory.com" className="hover:text-purple-400">Contact Us</a></li>
              <li><a href="/help" className="hover:text-purple-400">Help Center</a></li>
              <li><a href="/privacy" className="hover:text-purple-400">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-purple-400">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="https://twitter.com/eventory" className="hover:text-purple-400">Twitter</a></li>
              <li><a href="https://facebook.com/eventory" className="hover:text-purple-400">Facebook</a></li>
              <li><a href="https://instagram.com/eventory" className="hover:text-purple-400">Instagram</a></li>
              <li><a href="https://linkedin.com/company/eventory" className="hover:text-purple-400">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Eventory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

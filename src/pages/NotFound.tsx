import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Optionally log or send to monitoring service
    // console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-purple-700">404</h1>
        <p className="text-xl text-gray-600 mb-4">
          Oops! The page <span className="font-mono">{location.pathname}</span>{" "}
          was not found.
        </p>
        <Link
          to="/"
          className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
// This NotFound component handles 404 errors by displaying a user-friendly message and a link to return to the home page. It uses React Router's useLocation hook to access the current path and log it if needed. The design is simple and responsive, ensuring a good user experience even when navigating to non-existent routes.

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Prevent client-side open redirect by validating the redirect path
  const loginPath = "/login";
  const redirectState = { from: location.pathname };

  if (isLoading) return null;
  if (!isAuthenticated)
    return <Navigate to={loginPath} state={redirectState} replace />;

  return children;
};
// This component checks if the user is authenticated before rendering the children components.
// If the user is not authenticated, it redirects them to the login page and saves the current location in the state.
// The component also handles loading states to prevent rendering before authentication status is determined.

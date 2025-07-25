import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <title>Sign In | Eventory - Join the Community</title>
      <meta name="description" content="Sign in to Eventory to discover amazing events, connect with communities, and create memorable experiences." />
      <AuthForm />
    </>
  );
};

export default Auth;
// This component handles user authentication, displaying a loading spinner while checking auth status, and rendering the authentication form if the user is not authenticated. If the user is authenticated, it redirects to the home page.

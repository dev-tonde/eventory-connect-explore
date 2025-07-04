import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedCSRFProvider } from "@/components/security/EnhancedCSRFProtection";
import SecureAuthForm from "@/components/security/SecureAuthForm";

const SecureAuth = () => {
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <EnhancedCSRFProvider>
      <SecureAuthForm />
    </EnhancedCSRFProvider>
  );
};

export default SecureAuth;
// This component handles secure authentication by checking if the user is authenticated. If they are, it redirects them to the home page. If not, it displays a loading spinner while checking authentication status and renders the SecureAuthForm for user login or registration. The EnhancedCSRFProvider ensures that CSRF protection is applied to the authentication form.

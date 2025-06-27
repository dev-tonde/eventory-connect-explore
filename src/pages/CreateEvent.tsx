
import Header from "@/components/layout/Header";
import SecureEventCreationForm from "@/components/forms/SecureEventCreationForm";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CSRFProvider } from "@/components/security/CSRFProtection";

const CreateEvent = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (profile?.role !== "organizer") {
      navigate("/become-organizer");
    }
  }, [isAuthenticated, profile, navigate]);

  const handleEventCreated = () => {
    navigate("/dashboard");
  };

  if (!isAuthenticated || profile?.role !== "organizer") {
    return null;
  }

  return (
    <CSRFProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <SecureEventCreationForm onSuccess={handleEventCreated} />
        </div>
      </div>
    </CSRFProvider>
  );
};

export default CreateEvent;

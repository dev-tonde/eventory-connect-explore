import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SecureEventCreationForm from "@/components/forms/SecureEventCreationForm";
import { CSRFProvider } from "@/components/security/CSRFProtection";

const CreateEvent = () => {
  const { profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (profile?.role !== "organizer") {
      navigate("/become-organizer", { replace: true });
    }
  }, [isAuthenticated, profile, navigate]);

  const handleEventCreated = () => {
    navigate("/dashboard");
  };

  if (!isAuthenticated || profile?.role !== "organizer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500">Checking permissions...</span>
      </div>
    );
  }

  return (
    <CSRFProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <SecureEventCreationForm onSuccess={handleEventCreated} />
        </div>
      </div>
    </CSRFProvider>
  );
};

export default CreateEvent;

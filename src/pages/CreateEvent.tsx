import Header from "@/components/layout/Header";
import EventCreationForm from "@/components/forms/EventCreationForm";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CreateEvent = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?.role !== "organizer") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleEventCreated = () => {
    navigate("/dashboard");
  };

  if (!isAuthenticated || user?.role !== "organizer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <EventCreationForm onSuccess={handleEventCreated} />
      </div>
    </div>
  );
};

export default CreateEvent;

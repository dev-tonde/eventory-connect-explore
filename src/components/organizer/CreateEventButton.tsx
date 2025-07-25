import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateEventButtonProps {
  className?: string;
  size?: "sm" | "lg" | "default";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export const CreateEventButton: React.FC<CreateEventButtonProps> = ({
  className = "",
  size = "default",
  variant = "default",
}) => {
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  return (
    <Button
      onClick={handleCreateEvent}
      className={`flex items-center gap-2 ${className}`}
      size={size}
      variant={variant}
      type="button"
      aria-label="Create New Event"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Create New Event
    </Button>
  );
};
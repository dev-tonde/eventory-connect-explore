import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const GoogleSignInModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Disable automatic modal opening - let users choose when to sign in
  useEffect(() => {
    // Modal will only open if manually triggered
    return;
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => handleClose(), 60000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenGoogleSignInModal", "true");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) {
        toast({
          title: "Google Sign In failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        handleClose();
      }
    } catch {
      toast({
        title: "Google Sign In failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Welcome to Eventory!
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-center">
            Sign in with Google to discover amazing events and connect with your
            community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center gap-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
            disabled={isLoading}
            aria-label="Sign in with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-sm text-gray-600 hover:text-gray-800"
              aria-label="Maybe later"
            >
              Maybe later
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          This modal will close automatically in 1 minute
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleSignInModal;
// This component provides a modal for Google sign-in, which appears after a short delay if the user is not authenticated. It includes a button to sign in with Google, which uses Supabase's OAuth functionality. The modal can be closed manually or will automatically close after 1 minute. It also stores a flag in localStorage to prevent showing the modal again once the user has seen it.
// The modal includes a loading state while the sign-in process is ongoing and displays appropriate error messages if the sign-in fails. The design is user-friendly, with clear instructions and a fallback option to close the modal without signing in. The Google sign-in button is styled to match the application's theme, and the modal is responsive for different screen sizes. The component uses Tailwind CSS for styling and integrates with the `useToast` hook for displaying notifications.

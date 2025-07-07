import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/EnhancedAuthContext";
import { LanguageProvider } from "./contexts/SecureLanguageContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Communities from "./pages/Communities";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import BecomeOrganizer from "./pages/BecomeOrganizer";
import Gamification from "./pages/Gamification";
import PosterStudio from "./pages/PosterStudio";
import FollowedOrganizers from "./pages/FollowedOrganizers";
import SupportWidget from "./components/support/SupportWidget";
import PrivacyBanner from "./components/legal/PrivacyBanner";
import ErrorBoundaryWithSentry from "./components/error/ErrorBoundaryWithSentry";
import { analytics, trackPageView } from "@/lib/analytics";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Component to handle analytics tracking on route changes
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return null;
}

function AppContent() {
  useEffect(() => {
    // Initialize Google Analytics on app load
    analytics.initialize();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnalyticsTracker />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route
            path="/become-organizer"
            element={<BecomeOrganizer />}
          />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/poster-studio" element={<PosterStudio />} />
          <Route
            path="/followed-organizers"
            element={<FollowedOrganizers />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <LanguageProvider>
              <ErrorBoundaryWithSentry>
                <AppContent />
                <SupportWidget />
                <PrivacyBanner />
              </ErrorBoundaryWithSentry>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import NotFound from "./pages/NotFound";
import SupportWidget from "./components/support/SupportWidget";
import PrivacyBanner from "./components/legal/PrivacyBanner";
import ErrorBoundaryWithSentry from "./components/error/ErrorBoundaryWithSentry";
import { SecurityWrapper } from "./components/security/SecurityWrapper";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/become-organizer"
            element={
              <ProtectedRoute>
                <BecomeOrganizer />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <Gamification />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/poster-studio" 
            element={
              <ProtectedRoute>
                <PosterStudio />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/followed-organizers"
            element={
              <ProtectedRoute>
                <FollowedOrganizers />
              </ProtectedRoute>
            }
          />
          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundaryWithSentry>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AuthProvider>
              <LanguageProvider>
                <SecurityWrapper>
                  <AppContent />
                  <SupportWidget />
                  <PrivacyBanner />
                  <Toaster />
                  <Sonner />
                </SecurityWrapper>
              </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundaryWithSentry>
  );
}

export default App;

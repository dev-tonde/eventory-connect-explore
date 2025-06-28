
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"
import Index from './pages/Index';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import BecomeOrganizer from './pages/BecomeOrganizer';
import AdminPanel from './pages/AdminPanel';
import PosterStudio from './pages/PosterStudio';
import FollowedOrganizers from './pages/FollowedOrganizers';
import Communities from './pages/Communities';
import Community from './pages/Community';
import OrganizerProfile from './pages/OrganizerProfile';
import SplitPaymentPage from './pages/SplitPaymentPage';
import NotFound from './pages/NotFound';
import { LanguageProvider } from "@/contexts/LanguageContext";
import PWAInstaller from './components/pwa/PWAInstaller';
import { monitoring } from './lib/monitoring';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Log API failures
        monitoring.trackApiCall('query_error', 0, false);
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        monitoring.trackApiCall('mutation_error', 0, false);
      }
    }
  }
});

function App() {
  React.useEffect(() => {
    // Track app initialization
    monitoring.trackPageLoad('app_init');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<><Header /><Index /><Footer /></>} />
              <Route path="/events" element={<><Header /><Events /><Footer /></>} />
              <Route path="/events/:eventId" element={<><Header /><EventDetail /><Footer /></>} />
              <Route path="/create-event" element={<><Header /><CreateEvent /><Footer /></>} />
              <Route path="/auth" element={<><Header /><Auth /><Footer /></>} />
              <Route path="/login" element={<><Header /><Login /><Footer /></>} />
              <Route path="/profile" element={<><Header /><Profile /><Footer /></>} />
              <Route path="/dashboard" element={<><Header /><Dashboard /><Footer /></>} />
              <Route path="/become-organizer" element={<><Header /><BecomeOrganizer /><Footer /></>} />
              <Route path="/followed-organizers" element={<><Header /><FollowedOrganizers /><Footer /></>} />
              <Route path="/communities" element={<><Header /><Communities /><Footer /></>} />
              <Route path="/community/:communityId" element={<><Header /><Community /><Footer /></>} />
              <Route path="/organizer/:organizerName" element={<><Header /><OrganizerProfile /><Footer /></>} />
              <Route path="/split-payment/:splitId" element={<><Header /><SplitPaymentPage /><Footer /></>} />
              <Route path="/admin-panel" element={<><Header /><AdminPanel /><Footer /></>} />
              <Route path="/poster-studio" element={<><Header /><PosterStudio /><Footer /></>} />
              <Route path="*" element={<><Header /><NotFound /><Footer /></>} />
            </Routes>
            <PWAInstaller />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

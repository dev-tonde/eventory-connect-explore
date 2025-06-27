
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"
import Index from './pages/Index';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import BecomeOrganizer from './pages/BecomeOrganizer';
import AdminPanel from './pages/AdminPanel';
import PosterStudio from './pages/PosterStudio';
import FollowedOrganizers from './pages/FollowedOrganizers';
import { LanguageProvider } from "@/contexts/LanguageContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<><Header /><Index /><Footer /></>} />
              <Route path="/events/:eventId" element={<><Header /><EventDetail /><Footer /></>} />
              <Route path="/create-event" element={<><Header /><CreateEvent /><Footer /></>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<><Header /><Profile /><Footer /></>} />
              <Route path="/dashboard" element={<><Header /><Dashboard /><Footer /></>} />
              <Route path="/organizer-dashboard" element={<><Header /><Dashboard /><Footer /></>} />
              <Route path="/become-organizer" element={<><Header /><BecomeOrganizer /><Footer /></>} />
              <Route path="/followed-organizers" element={<><Header /><FollowedOrganizers /><Footer /></>} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/poster-studio" element={<><Header /><PosterStudio /><Footer /></>} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

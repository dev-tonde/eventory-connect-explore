import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthContextProvider } from './contexts/AuthContext';
import OrganizerDashboard from './pages/OrganizerDashboard';
import BecomeOrganizer from './pages/BecomeOrganizer';
import AdminPanel from './pages/AdminPanel';
import EnhancedOrganizerDashboard from './components/organizer/EnhancedOrganizerDashboard';
import PosterStudio from './pages/PosterStudio';
import { QueryClient } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <Toaster />
        <LanguageProvider>
          <AuthContextProvider>
            <Routes>
              <Route path="/" element={<><Header /><EventList /><Footer /></>} />
              <Route path="/events/:eventId" element={<><Header /><EventDetails /><Footer /></>} />
              <Route path="/create-event" element={<><Header /><CreateEvent /><Footer /></>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<><Header /><Profile /><Footer /></>} />
              <Route path="/organizer-dashboard" element={<><Header /><EnhancedOrganizerDashboard /><Footer /></>} />
              <Route path="/become-organizer" element={<><Header /><BecomeOrganizer /><Footer /></>} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/poster-studio" element={<><Header /><PosterStudio /><Footer /></>} />
            </Routes>
          </AuthContextProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;

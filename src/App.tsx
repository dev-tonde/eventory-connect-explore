import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Header from "@/components/layout/Header";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import Communities from "@/pages/Communities";
import Community from "@/pages/Community";
import CreateEvent from "@/pages/CreateEvent";
import BecomeOrganizer from "@/pages/BecomeOrganizer";
import OrganizerProfile from "@/pages/OrganizerProfile";
import PosterStudio from "@/pages/PosterStudio";
import { PostEventSummary } from "@/pages/PostEventSummary";
import Gamification from "@/pages/Gamification";
import FollowedOrganizers from "@/pages/FollowedOrganizers";
import NotFound from "@/pages/NotFound";
import Footer from "@/components/layout/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:id" element={<Community />} />
          <Route path="/organizer/:id" element={<OrganizerProfile />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-event" element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="/become-organizer" element={
            <ProtectedRoute>
              <BecomeOrganizer />
            </ProtectedRoute>
          } />
          <Route path="/poster-studio" element={
            <ProtectedRoute>
              <PosterStudio />
            </ProtectedRoute>
          } />
          <Route path="/post-event-summary/:id" element={
            <ProtectedRoute>
              <PostEventSummary />
            </ProtectedRoute>
          } />
          <Route path="/gamification" element={
            <ProtectedRoute>
              <Gamification />
            </ProtectedRoute>
          } />
          <Route path="/followed-organizers" element={
            <ProtectedRoute>
              <FollowedOrganizers />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
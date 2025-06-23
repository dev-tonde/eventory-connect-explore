
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import CreateEvent from "@/pages/CreateEvent";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import FollowedOrganizers from "@/pages/FollowedOrganizers";
import OrganizerProfile from "@/pages/OrganizerProfile";
import PosterStudio from "@/pages/PosterStudio";
import Communities from "@/pages/Communities";
import Community from "@/pages/Community";
import SplitPaymentPage from "@/pages/SplitPaymentPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/followed-organizers" element={<FollowedOrganizers />} />
              <Route path="/organizer/:organizerName" element={<OrganizerProfile />} />
              <Route path="/poster-studio" element={<PosterStudio />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/community/:communityId" element={<Community />} />
              <Route path="/split-payment/:splitId" element={<SplitPaymentPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

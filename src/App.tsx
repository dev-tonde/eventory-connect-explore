import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background flex flex-col">
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

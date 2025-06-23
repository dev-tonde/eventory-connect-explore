
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import PosterGenerator from "@/components/poster/PosterGenerator";
import SocialScheduler from "@/components/poster/SocialScheduler";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PosterStudio = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string>();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'organizer') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'organizer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Poster Studio</h1>
          <p className="text-gray-600 mt-2">Create AI-generated posters and schedule social media posts</p>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Poster Generator</TabsTrigger>
            <TabsTrigger value="scheduler">Social Scheduler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator">
            <PosterGenerator 
              eventId={selectedEventId}
              eventTitle="Sample Event"
              eventDate="2024-07-15"
              eventLocation="Sample Location"
            />
          </TabsContent>
          
          <TabsContent value="scheduler">
            <SocialScheduler eventId={selectedEventId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PosterStudio;

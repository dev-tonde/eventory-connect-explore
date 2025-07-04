/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Calendar, Users, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

// Only allow trusted image URLs (must be https and from your trusted domain)
const isTrustedImageUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    // Replace with your trusted domain if needed
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "your-supabase-project-id.supabase.co" // <-- Use your actual trusted domain here
    );
  } catch {
    return false;
  }
};

const EventRecommendations = () => {
  const { user } = useAuth();

  // Get user's event history and preferences for AI matching
  const { data: userPreferences } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's past events and favorites to build preferences
      const { data: pastEvents } = await supabase
        .from("tickets")
        .select(
          `
          event_id,
          events (
            category,
            tags,
            price
          )
        `
        )
        .eq("user_id", user.id);

      const { data: favorites } = await supabase
        .from("favorites")
        .select(
          `
          events (
            category,
            tags,
            price
          )
        `
        )
        .eq("user_id", user.id);

      return { pastEvents: pastEvents || [], favorites: favorites || [] };
    },
    enabled: !!user,
  });

  // Get AI-powered event recommendations
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["event-recommendations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name,
            username
          )
        `
        )
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      // AI-powered scoring algorithm
      const scoredEvents = data.map((event) => {
        let score = 50; // Base score
        const reasons: string[] = [];

        // Category matching
        if (
          userPreferences?.pastEvents?.some(
            (pe: any) => pe.events?.category === event.category
          )
        ) {
          score += 20;
          reasons.push(`You've attended ${event.category} events`);
        }

        // Price preference matching
        const avgUserPrice =
          (userPreferences?.pastEvents?.reduce(
            (sum: number, pe: any) => sum + (pe.events?.price || 0),
            0
          ) || 0) / (userPreferences?.pastEvents?.length || 1);

        if (event.price <= avgUserPrice * 1.2) {
          score += 15;
          reasons.push("Within your price range");
        }

        // Popularity boost
        if (event.current_attendees > event.max_attendees * 0.7) {
          score += 10;
          reasons.push("High demand event");
        }

        // Date proximity (events happening soon get slight boost)
        const daysUntil = Math.ceil(
          (new Date(event.date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysUntil <= 7) {
          score += 5;
          reasons.push("Happening soon");
        }

        // Tag matching
        const userTags = [
          ...(userPreferences?.pastEvents?.flatMap(
            (pe: any) => pe.events?.tags || []
          ) || []),
          ...(userPreferences?.favorites?.flatMap(
            (f: any) => f.events?.tags || []
          ) || []),
        ];

        const matchingTags =
          event.tags?.filter((tag: string) => userTags.includes(tag)) || [];

        if (matchingTags.length > 0) {
          score += matchingTags.length * 5;
          reasons.push(
            `Matches your interests: ${matchingTags.slice(0, 2).join(", ")}`
          );
        }

        // Random factor for discovery
        score += Math.random() * 10;

        return {
          ...event,
          aiScore: Math.min(Math.round(score), 99),
          matchReasons: reasons.slice(0, 3), // Top 3 reasons
        };
      });

      return scoredEvents.sort((a, b) => b.aiScore - a.aiScore).slice(0, 6);
    },
    enabled: !!user && !!userPreferences,
  });

  if (!user || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Building Your Recommendations
          </h3>
          <p className="text-gray-600">
            Attend a few events to get personalized AI-powered recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Recommendations for You
        </h2>
        <p className="text-gray-600">
          Personalized event suggestions based on your preferences and activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((event) => {
          const safeImageUrl =
            event.image_url && isTrustedImageUrl(event.image_url)
              ? event.image_url
              : "/placeholder.svg";
          return (
            <Card
              key={event.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={safeImageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    {event.aiScore}% Match
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-red-500 hover:bg-white/20 transition-colors"
                    aria-label="Add to favorites"
                    type="button"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-1 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at {event.time}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.current_attendees || 0} attending
                </div>

                {/* AI Match Reasons */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-purple-600 mb-1">
                    Why this matches:
                  </div>
                  {event.matchReasons
                    ?.slice(0, 2)
                    .map((reason: string, index: number) => (
                      <div
                        key={index}
                        className="text-xs text-gray-500 flex items-center"
                      >
                        <div className="w-1 h-1 bg-purple-400 rounded-full mr-2" />
                        {reason}
                      </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-bold text-purple-600">
                    {event.price === 0 ? "Free" : `R${event.price}`}
                  </div>
                  <Link to={`/events/${event.id}`}>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EventRecommendations;
// This component fetches AI-powered event recommendations based on user preferences and displays them in a card format.
// It includes event details, AI match score, and reasons for the match. The component uses React Query for data fetching and handles loading states gracefully.
// The recommendations are personalized based on the user's past events, favorites, and other preferences.
// The component also includes a fallback image for events without a trusted image URL.

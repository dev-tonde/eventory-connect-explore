import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEventRecommendations } from "@/hooks/useEventRecommendations";
import { useAuth } from "@/contexts/AuthContext";

// Defensive: sanitize text for display (future-proofing for dynamic data)
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const EventRecommendations = () => {
  const { isAuthenticated } = useAuth();
  const { data: recommendations = [], isLoading } = useEventRecommendations();

  if (!isAuthenticated || recommendations.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" aria-hidden="true" />
          <h2 className="text-xl font-semibold">AI Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" aria-hidden="true" />
        <h2 className="text-2xl font-bold">Events Picked Just for You</h2>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.slice(0, 6).map((recommendation) => (
          <Card
            key={recommendation.event.id}
            className="hover:shadow-lg transition-shadow group"
          >
            <div className="relative">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={recommendation.event.image || "/placeholder.svg"}
                  alt={sanitizeText(recommendation.event.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                  loading="lazy"
                  width={400}
                  height={225}
                />
              </div>
              <div className="absolute top-2 left-2">
                <Badge className="bg-purple-600">
                  {Math.round(recommendation.score)}% Match
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge className="bg-white text-purple-600">
                  {sanitizeText(recommendation.event.category)}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                {sanitizeText(recommendation.event.title)}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {recommendation.event.date
                      ? new Date(recommendation.event.date).toLocaleDateString()
                      : ""}
                    {recommendation.event.time &&
                      ` at ${sanitizeText(recommendation.event.time)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span className="line-clamp-1">
                    {sanitizeText(recommendation.event.location)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-600">
                  Why this matches you:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {recommendation.reasons.slice(0, 2).map((reason, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <Heart
                        className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {sanitizeText(reason)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-purple-600">
                  {Number(recommendation.event.price) === 0
                    ? "Free"
                    : `$${Number(recommendation.event.price).toFixed(2)}`}
                </span>
                <Link
                  to={`/events/${encodeURIComponent(recommendation.event.id)}`}
                >
                  <Button
                    size="sm"
                    className="group-hover:bg-purple-700 transition-colors"
                    type="button"
                    aria-label={`View details for ${sanitizeText(
                      recommendation.event.title
                    )}`}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length > 6 && (
        <div className="text-center">
          <Button variant="outline" size="lg" type="button">
            View All {recommendations.length} Recommendations
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventRecommendations;
// This component fetches and displays personalized event recommendations for authenticated users.
// It uses the `useEventRecommendations` hook to get recommendations based on the user's profile and

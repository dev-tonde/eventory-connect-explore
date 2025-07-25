import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Star, Brain, TrendingUp } from "lucide-react";
import { useEventRecommendations } from "@/hooks/useEventRecommendations";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function PersonalizedRecommendations() {
  const { 
    recommendations, 
    isLoading, 
    isGenerating, 
    generateRecommendations, 
    markAsViewed, 
    markAsClicked 
  } = useEventRecommendations();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEventClick = (recommendationId: string) => {
    markAsViewed(recommendationId);
    markAsClicked(recommendationId);
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground mb-4">
            Attend some events to get personalized AI recommendations
          </p>
          <Button 
            onClick={generateRecommendations} 
            disabled={isGenerating}
          >
            {isGenerating ? "Analyzing..." : "Generate Recommendations"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Recommended for You
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateRecommendations}
          disabled={isGenerating}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          {isGenerating ? "Updating..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.slice(0, 3).map((rec) => (
          <div key={rec.id} className="border rounded-lg p-4 space-y-3">
            {/* Score Badge */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Star className="h-3 w-3 mr-1" />
                {rec.score}% match
              </Badge>
              <Badge variant="outline">{rec.event.category}</Badge>
            </div>

            {/* Event Info */}
            <div className="space-y-2">
              <h3 className="font-semibold line-clamp-1">{rec.event.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(rec.event.date), "MMM d")}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {rec.event.venue}
                </div>
              </div>
              
              {/* AI Reasoning */}
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                💡 {rec.reasoning}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to={`/event/${rec.event_id}`}
                className="flex-1"
                onClick={() => handleEventClick(rec.id)}
              >
                <Button className="w-full" size="sm">
                  View Event
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                R{rec.event.price || 0}
              </Button>
            </div>
          </div>
        ))}
        
        {recommendations.length > 3 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              View All {recommendations.length} Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
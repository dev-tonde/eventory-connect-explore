import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePerformanceRating } from "@/hooks/usePerformanceRating";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PerformanceRatingWidgetProps {
  eventId: string;
  lineupId: string;
  artistName: string;
  onRatingSubmitted?: () => void;
}

export const PerformanceRatingWidget: React.FC<PerformanceRatingWidgetProps> = ({
  eventId,
  lineupId,
  artistName,
  onRatingSubmitted
}) => {
  const { user } = useAuth();
  const { 
    isSubmitting, 
    ratingSummary, 
    submitRating, 
    fetchRatingSummary, 
    getUserRating,
    RATING_CONFIG 
  } = usePerformanceRating();
  
  const [userRating, setUserRating] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Fetch initial rating summary
    fetchRatingSummary(eventId, lineupId);

    // Check if user has already rated this performance
    if (user?.id) {
      getUserRating(eventId, lineupId, user.id).then(rating => {
        if (rating) {
          setUserRating(rating.rating_type);
        }
      });
    }
  }, [eventId, lineupId, user?.id]);

  // Show rating prompt after performance ends (in real implementation, 
  // this would be triggered by lineup timing)
  useEffect(() => {
    // Simulate showing prompt after performance
    const timer = setTimeout(() => {
      if (!userRating) {
        setShowPrompt(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [userRating]);

  const handleRating = async (ratingType: keyof typeof RATING_CONFIG) => {
    const success = await submitRating(eventId, lineupId, ratingType, user?.id);
    
    if (success) {
      setUserRating(ratingType);
      setShowPrompt(false);
      onRatingSubmitted?.();
    }
  };

  const getRatingPercentage = (ratingType: keyof typeof RATING_CONFIG) => {
    if (!ratingSummary || ratingSummary.total_ratings === 0) return 0;
    return Math.round((ratingSummary[ratingType] / ratingSummary.total_ratings) * 100);
  };

  if (!showPrompt && !userRating && !ratingSummary) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Rate the Performance
        </CardTitle>
        <p className="text-center text-muted-foreground">{artistName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating Buttons */}
        {(showPrompt || !userRating) && (
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(RATING_CONFIG) as Array<keyof typeof RATING_CONFIG>).map((ratingType) => {
              const config = RATING_CONFIG[ratingType];
              const isSelected = userRating === ratingType;
              
              return (
                <Button
                  key={ratingType}
                  variant={isSelected ? "default" : "outline"}
                  className="h-16 flex flex-col space-y-1"
                  onClick={() => handleRating(ratingType)}
                  disabled={isSubmitting || Boolean(userRating)}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-sm">{config.label}</span>
                </Button>
              );
            })}
          </div>
        )}

        {/* User's rating confirmation */}
        {userRating && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              Thanks for rating! {RATING_CONFIG[userRating as keyof typeof RATING_CONFIG].emoji}
            </p>
            <p className="text-sm text-green-600">
              You rated this performance as "{RATING_CONFIG[userRating as keyof typeof RATING_CONFIG].label}"
            </p>
          </div>
        )}

        {/* Rating Summary */}
        {ratingSummary && ratingSummary.total_ratings > 0 && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {ratingSummary.total_ratings} total ratings
              </p>
              <p className="text-lg font-semibold">
                Average: {ratingSummary.average_score?.toFixed(1)}/4
              </p>
            </div>

            <div className="space-y-2">
              {(Object.keys(RATING_CONFIG) as Array<keyof typeof RATING_CONFIG>).map((ratingType) => {
                const config = RATING_CONFIG[ratingType];
                const percentage = getRatingPercentage(ratingType);
                const count = ratingSummary[ratingType];
                
                return (
                  <div key={ratingType} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{config.emoji}</span>
                      <span className="text-sm">{config.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {count} ({percentage}%)
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No ratings yet */}
        {ratingSummary && ratingSummary.total_ratings === 0 && !showPrompt && (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No ratings yet for this performance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
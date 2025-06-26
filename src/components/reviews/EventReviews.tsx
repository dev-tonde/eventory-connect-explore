
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  is_verified_attendee: boolean;
  created_at: string;
  user_id: string;
}

interface UserReview {
  id: string;
  rating: number;
  review_text: string | null;
  is_verified_attendee: boolean;
  created_at: string;
  user_id: string;
}

interface EventReviewsProps {
  eventId: string;
}

const EventReviews = ({ eventId }: EventReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadReviews();
    loadAverageRating();
    if (user) {
      loadUserReview();
    }
  }, [eventId, user]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('event_reviews')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews.",
        variant: "destructive",
      });
    }
  };

  const loadAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_event_rating', { event_uuid: eventId });

      if (error) {
        console.error('Error loading average rating:', error);
        return;
      }

      setAverageRating(data || 0);
    } catch (error) {
      console.error('Error loading average rating:', error);
    }
  };

  const loadUserReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_reviews')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user review:', error);
        return;
      }

      if (data) {
        setUserReview(data);
        setRating(data.rating);
        setReviewText(data.review_text || '');
      }
    } catch (error) {
      console.error('Error loading user review:', error);
    }
  };

  const submitReview = async () => {
    if (!user || !rating) {
      toast({
        title: "Error",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        event_id: eventId,
        user_id: user.id,
        rating,
        review_text: reviewText.trim() || null,
      };

      if (userReview) {
        const { error } = await supabase
          .from('event_reviews')
          .update(reviewData)
          .eq('id', userReview.id);

        if (error) throw error;

        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('event_reviews')
          .insert([reviewData]);

        if (error) throw error;

        toast({
          title: "Review Submitted",
          description: "Thank you for your review!",
        });
      }

      loadReviews();
      loadAverageRating();
      loadUserReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < count
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reviews & Ratings</span>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">
                {userReview ? "Update Your Review" : "Write a Review"}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {renderStars(rating, true)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Review (Optional)</label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button 
                  onClick={submitReview} 
                  disabled={isSubmitting || !rating}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No reviews yet. Be the first to review this event!
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Anonymous User</span>
                          {review.is_verified_attendee && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified Attendee
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-gray-700 mt-2">{review.review_text}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventReviews;

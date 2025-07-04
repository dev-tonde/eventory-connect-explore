import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2 } from "lucide-react";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface AIRecommendation {
  title: string;
  description: string;
  confidence: number;
  actionable?: boolean;
}

interface AIInsightsTabProps {
  aiRecommendations: AIRecommendation[];
}

const AIInsightsTab = ({ aiRecommendations }: AIInsightsTabProps) => {
  return (
    <div className="grid gap-6">
      {aiRecommendations && aiRecommendations.length > 0 ? (
        aiRecommendations.map((recommendation, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wand2
                    className="h-5 w-5 text-purple-600"
                    aria-hidden="true"
                  />
                  {sanitizeText(recommendation.title)}
                </CardTitle>
                <Badge
                  variant="outline"
                  aria-label={`Confidence: ${recommendation.confidence}%`}
                >
                  {recommendation.confidence}% confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {sanitizeText(recommendation.description)}
              </p>
              {recommendation.actionable && (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-label="Apply Recommendation"
                >
                  Apply Recommendation
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          No AI recommendations available.
        </div>
      )}
    </div>
  );
};

export default AIInsightsTab;
// This component displays AI-generated insights and recommendations for the organizer's dashboard.
// It takes an array of AI recommendations as props and renders each recommendation in a card format.

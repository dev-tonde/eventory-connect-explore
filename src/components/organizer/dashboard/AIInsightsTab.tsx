
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2 } from "lucide-react";

interface AIInsightsTabProps {
  aiRecommendations: any[];
}

const AIInsightsTab = ({ aiRecommendations }: AIInsightsTabProps) => {
  return (
    <div className="grid gap-6">
      {aiRecommendations?.map((recommendation, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                {recommendation.title}
              </CardTitle>
              <Badge variant="outline">
                {recommendation.confidence}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{recommendation.description}</p>
            {recommendation.actionable && (
              <Button size="sm" variant="outline">
                Apply Recommendation
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIInsightsTab;

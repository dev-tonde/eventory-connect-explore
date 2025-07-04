import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Flame } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

const sanitizeBadgeText = (text: string) => text.replace(/[<>]/g, ""); // Prevent badge XSS

const UserPointsDisplay = () => {
  const { userPoints, earnedBadges, isLoading } = useGamification();

  if (isLoading || !userPoints) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = userPoints.level;
  const pointsInCurrentLevel = userPoints.total_points % 100;
  const pointsToNextLevel = 100 - pointsInCurrentLevel;

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level and Points */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 hover:bg-purple-700">
                Level {currentLevel}
              </Badge>
              <span className="text-2xl font-bold text-purple-700">
                {userPoints.total_points.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">points</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {pointsToNextLevel} points to Level {currentLevel + 1}
            </p>
          </div>

          {userPoints.streak_days > 0 && (
            <div className="text-center">
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="h-4 w-4" />
                <span className="font-bold">{userPoints.streak_days}</span>
              </div>
              <p className="text-xs text-gray-600">day streak</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={pointsInCurrentLevel} className="h-2" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Level {currentLevel}</span>
            <span>Level {currentLevel + 1}</span>
          </div>
        </div>

        {/* Recent Badges */}
        {earnedBadges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              Recent Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.slice(-3).map((badge) => (
                <Badge
                  key={badge.id}
                  variant="outline"
                  className="bg-yellow-50 border-yellow-200 text-yellow-800"
                  title={sanitizeBadgeText(badge.name)}
                >
                  <span className="mr-1" aria-hidden="true">
                    {sanitizeBadgeText(badge.icon)}
                  </span>
                  {sanitizeBadgeText(badge.name)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPointsDisplay;
// This component displays the user's gamification points, level, progress towards the next level, and recently earned badges.
// It uses a card layout with a gradient background and includes a progress bar to visualize the user's progress within the current level.
// The component also handles loading states and sanitizes badge names to prevent XSS attacks.

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Target,
  Calendar,
  Users,
  Award,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import UserPointsDisplay from "@/components/gamification/UserPointsDisplay";

const Gamification = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    userPoints,
    leaderboard,
    earnedBadges,
    availableBadges,
    allBadges,
    isLoading,
  } = useGamification();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!userPoints) return null;

  const nextLevelPoints = userPoints.level * 100;
  const currentLevelPoints = (userPoints.level - 1) * 100;
  const progressToNext =
    ((userPoints.total_points - currentLevelPoints) /
      (nextLevelPoints - currentLevelPoints)) *
    100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Gaming Progress
          </h1>
          <p className="text-gray-600">
            Earn points, unlock badges, and climb the leaderboard!
          </p>
        </div>

        {/* User Points Display */}
        <div className="mb-8">
          <UserPointsDisplay />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Level {userPoints.level}
                  </span>
                  <span className="text-sm text-gray-600">
                    Level {userPoints.level + 1}
                  </span>
                </div>
                <Progress value={progressToNext} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span>{userPoints.total_points} points</span>
                  <span>{nextLevelPoints} points</span>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userPoints.total_points}
                    </div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userPoints.level}
                    </div>
                    <div className="text-sm text-gray-600">Current Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {earnedBadges.length}
                    </div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5" />
                      {userPoints.streak_days}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earned Badges */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Your Badges ({earnedBadges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {earnedBadges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {earnedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border"
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {badge.description}
                        </div>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {badge.points_required} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>
                      No badges earned yet. Keep participating to unlock
                      achievements!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Badges */}
            {availableBadges.length > 0 && (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    Available Badges ({availableBadges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="text-center p-4 bg-gray-50 rounded-lg border border-dashed"
                      >
                        <div className="text-3xl mb-2 opacity-50">
                          {badge.icon}
                        </div>
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {badge.description}
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {badge.points_required} pts required
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((leader, index) => (
                      <div
                        key={leader.user_id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : index === 1
                                ? "bg-gray-100 text-gray-800"
                                : index === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-50 text-blue-800"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {leader.profiles?.[0]?.first_name}{" "}
                              {leader.profiles?.[0]?.last_name}
                              {leader.user_id === user?.id && (
                                <span className="text-purple-600"> (You)</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Level {leader.level}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {leader.total_points}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No leaderboard data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Badges Overview */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-indigo-600" />
                  Badge Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Attendance</span>
                    <span className="text-gray-500">
                      {
                        earnedBadges.filter((b) => b.category === "attendance")
                          .length
                      }
                      /
                      {
                        allBadges.filter((b) => b.category === "attendance")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organizing</span>
                    <span className="text-gray-500">
                      {
                        earnedBadges.filter((b) => b.category === "organizing")
                          .length
                      }
                      /
                      {
                        allBadges.filter((b) => b.category === "organizing")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement</span>
                    <span className="text-gray-500">
                      {
                        earnedBadges.filter((b) => b.category === "engagement")
                          .length
                      }
                      /
                      {
                        allBadges.filter((b) => b.category === "engagement")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planning</span>
                    <span className="text-gray-500">
                      {
                        earnedBadges.filter((b) => b.category === "planning")
                          .length
                      }
                      /
                      {
                        allBadges.filter((b) => b.category === "planning")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
// This code defines a Gamification page that displays user points, badges, and leaderboard information. It includes components for user points display, level progress, activity stats, earned badges, available badges, and a leaderboard. The page is responsive and uses cards for layout, with loading states while fetching data.

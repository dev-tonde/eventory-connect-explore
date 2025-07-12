import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Users, Calendar, MessageSquare, Flame, Star, Gift } from 'lucide-react';
import { useEnhancedGamification } from '@/hooks/useEnhancedGamification';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface GamificationDashboardProps {
  className?: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const {
    userPoints,
    leaderboard,
    isLoading,
    getPointsToNextLevel,
    getAchievementProgress,
    fetchLeaderboard,
  } = useEnhancedGamification();

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to view your gamification progress.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading your progress...</p>
        </CardContent>
      </Card>
    );
  }

  const achievements = getAchievementProgress();
  const pointsToNextLevel = getPointsToNextLevel();
  const currentLevel = userPoints?.level || 1;
  const currentPoints = userPoints?.total_points || 0;
  const levelProgress = ((currentPoints % 100) / 100) * 100;

  const getAchievementIcon = (achievementId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      first_event: <Calendar className="h-5 w-5" />,
      event_master: <Trophy className="h-5 w-5" />,
      social_butterfly: <Users className="h-5 w-5" />,
      party_animal: <Gift className="h-5 w-5" />,
      community_helper: <MessageSquare className="h-5 w-5" />,
      streak_master: <Flame className="h-5 w-5" />,
      influencer: <Star className="h-5 w-5" />,
    };
    return iconMap[achievementId] || <Target className="h-5 w-5" />;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Navigation Tabs */}
      <div className="flex space-x-2">
        {['overview', 'achievements', 'leaderboard'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab as any)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{currentPoints}</div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {currentLevel}</span>
                  <span>Level {currentLevel + 1}</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {pointsToNextLevel} points to next level
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-xl font-semibold">{userPoints?.badges?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{userPoints?.streak_days || 0}</div>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements
                  .filter(a => a.unlocked)
                  .slice(0, 3)
                  .map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="text-primary">
                        {getAchievementIcon(achievement.id)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="secondary">+{achievement.points}</Badge>
                    </div>
                  ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No achievements unlocked yet. Start participating to earn your first badge!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className={cn(
              "transition-all duration-200",
              achievement.unlocked ? "bg-primary/5 border-primary/20" : "opacity-75"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-full",
                    achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {getAchievementIcon(achievement.id)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">{achievement.name}</CardTitle>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs mb-2">
                  {achievement.description}
                </CardDescription>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {achievement.requirement.count} {achievement.requirement.type.replace('_', ' ')}
                  </span>
                  <Badge variant={achievement.unlocked ? "default" : "outline"} className="text-xs">
                    +{achievement.points} pts
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Players
            </CardTitle>
            <CardDescription>
              See how you stack up against other Eventory users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.user_id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  entry.user_id === user.id ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    index === 2 ? "bg-amber-600 text-white" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {entry.username}
                      {entry.user_id === user.id && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {entry.level} • {entry.badges.length} achievements
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-primary">{entry.total_points}</div>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
              
              {leaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No leaderboard data available yet.
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => fetchLeaderboard(20)}
                className="w-full"
              >
                Refresh Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationDashboard;
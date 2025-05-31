"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Target, Trophy, Zap } from "lucide-react";

type Game = {
  topic: string;
  score: number | null;
  gameType: string;
  createdAt: string;
};

type UserStatsProps = {
  user: {
    name: string | null;
    image: string | null;
    totalPoints: number;
    quizzesTaken: number;
    averageScore: number | null;
    bestScore: number | null;
    totalCorrect: number;
    totalQuestions: number;
    winStreak: number;
    bestStreak: number;
    level: number;
    experience: number;
    lastQuizDate: string | null;
    games: Game[];
  };
};

export function UserStats({ user }: UserStatsProps) {
  // Calculate XP progress to next level
  const xpForCurrentLevel = Math.pow((user.level - 1) * 10, 2);
  const xpForNextLevel = Math.pow(user.level * 10, 2);
  const xpProgress = ((user.experience - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="space-y-8">
      {/* Level Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={user.image || "https://www.gravatar.com/avatar/?d=mp"}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                Level {user.level} • {Math.round(xpProgress)}% to Level {user.level + 1}
              </p>
            </div>
          </div>
        </div>
        <Progress value={xpProgress} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
            <Trophy className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.bestScore?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Highest quiz score achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.winStreak} Games</div>
            <p className="text-xs text-muted-foreground">
              Best: {user.bestStreak} games
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="w-4 h-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.totalQuestions > 0
                ? ((user.totalCorrect / user.totalQuestions) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {user.totalCorrect} correct out of {user.totalQuestions}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your last 5 quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.games.map((game) => (
                <div key={game.createdAt} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{game.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {game.gameType} • {new Date(game.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {game.score ? `${game.score.toFixed(1)}%` : 'In Progress'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your quiz performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Quizzes Taken</p>
                <p className="text-sm font-medium">{user.quizzesTaken}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-sm font-medium">{user.averageScore?.toFixed(1)}%</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Experience Points</p>
                <p className="text-sm font-medium">{user.experience.toLocaleString()} XP</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Last Quiz</p>
                <p className="text-sm font-medium">
                  {user.lastQuizDate
                    ? new Date(user.lastQuizDate).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
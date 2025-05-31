"use client";

import { useState } from "react";
import { UserStats } from "@/components/UserStats";
import { UserSettings } from "@/components/UserSettings";
import { ChartBar, Settings } from "lucide-react";

type Game = {
  topic: string;
  score: number | null;
  gameType: string;
  createdAt: string;
};

type DashboardTabsProps = {
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    bio: string | null;
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

export function DashboardTabs({ user }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "settings">("stats");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <div className="bg-card rounded-lg p-4 space-y-2">
            <button
              onClick={() => setActiveTab("stats")}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === "stats"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <ChartBar className="w-5 h-5" />
              <span>Statistics</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "stats" ? (
            <UserStats user={user} />
          ) : (
            <UserSettings user={user} />
          )}
        </div>
      </div>
    </div>
  );
} 
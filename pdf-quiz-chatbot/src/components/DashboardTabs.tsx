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
    <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Dashboard</h2>
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col space-y-4 md:space-y-6">
        {/* Navigation - Horizontal on mobile, Sidebar on desktop */}
        <div className="md:w-64 md:shrink-0">
          <div className="bg-card rounded-lg p-2 md:p-4 flex md:flex-col gap-2">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start space-x-2 px-3 md:px-4 py-2 rounded-md transition-colors ${
                activeTab === "stats"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <ChartBar className="w-5 h-5" />
              <span className="hidden md:inline">Statistics</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start space-x-2 px-3 md:px-4 py-2 rounded-md transition-colors ${
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:inline">Settings</span>
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
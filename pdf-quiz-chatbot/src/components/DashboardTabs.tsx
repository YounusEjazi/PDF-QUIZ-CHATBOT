"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStats } from "@/components/UserStats";
import { UserSettingsTab } from "@/components/UserSettingsTab";

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
    averageScore: number;
    bestScore: number;
    totalCorrect: number;
    totalQuestions: number;
    winStreak: number;
    bestStreak: number;
    level: number;
    experience: number;
    lastQuizDate: string | null;
    games: Array<{
      topic: string;
      score: number;
      gameType: string;
      createdAt: string;
    }>;
  };
  initialTab?: "stats" | "settings";
};

export function DashboardTabs({ user, initialTab = "stats" }: DashboardTabsProps) {
  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger 
          value="stats" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Stats
        </TabsTrigger>
        <TabsTrigger 
          value="settings"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stats" className="space-y-4 mt-0">
        <UserStats user={user} />
      </TabsContent>

      <TabsContent value="settings" className="mt-0">
        <UserSettingsTab user={user} />
      </TabsContent>
    </Tabs>
  );
} 
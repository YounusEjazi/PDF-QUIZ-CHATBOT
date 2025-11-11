"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Zap, 
  Award,
  BookOpen,
  Clock,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { motion as m } from "framer-motion";

type PersonalInsights = {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalPoints: number;
  winStreak: number;
  bestStreak: number;
  studyTime: number;
  level: number;
  experience: number;
  recentTopics: string[];
  improvementRate: number;
};

type Props = {
  insights: PersonalInsights;
};

const PersonalInsightsCard = ({ insights }: Props) => {
  const {
    totalQuizzes,
    averageScore,
    bestScore,
    totalPoints,
    winStreak,
    bestStreak,
    studyTime,
    level,
    experience,
    recentTopics,
    improvementRate
  } = insights;

  // Calculate experience progress for next level
  const experienceToNextLevel = Math.min(100, (experience % 100));
  const nextLevel = level + 1;

  // Format study time
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get performance color based on average score
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-green-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50",
      "border border-indigo-200/50 dark:border-indigo-800/50",
      "hover:shadow-xl hover:shadow-indigo-500/25",
      "h-full flex flex-col"
    )}>
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-4 right-4 w-16 h-16 bg-indigo-400 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-purple-400 rounded-full blur-lg animate-pulse animation-delay-1000" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-indigo-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-purple-200 dark:to-indigo-300">
            Your Learning Journey
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Personal insights and progress tracking
          </CardDescription>
        </div>
        <div className="relative">
          <Brain 
            size={32} 
            strokeWidth={2.5}
            className="text-indigo-600 dark:text-indigo-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          <Zap 
            size={16} 
            className="absolute -top-1 -right-1 text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" 
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10 h-full flex flex-col min-h-0">
        {/* Level Progress */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Level {level}
              </span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {experienceToNextLevel}/100 XP
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <m.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${experienceToNextLevel}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </m.div>

        {/* Key Stats Grid */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-1 mb-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg Score</span>
            </div>
            <div className={cn("text-sm font-bold", getPerformanceColor(averageScore))}>
              {averageScore.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Best Score</span>
            </div>
            <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
              {bestScore.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-1 mb-1">
              <BookOpen className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Quizzes</span>
            </div>
            <div className="text-sm font-bold text-green-600 dark:text-green-400">
              {totalQuizzes}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Study Time</span>
            </div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {formatStudyTime(studyTime)}
            </div>
          </div>
        </m.div>

        {/* Streak Information */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg p-2 sm:p-3 border border-orange-200/50 dark:border-orange-800/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Current Streak
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                {winStreak}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Best: {bestStreak}
              </div>
            </div>
          </div>
        </m.div>

        {/* Recent Topics */}
        {recentTopics.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-2 flex-1 min-h-0"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Recent Topics
              </span>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {recentTopics.slice(0, 3).map((topic, index) => (
                <m.span
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="px-1 py-0.5 sm:px-2 sm:py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[9px] sm:text-xs rounded-full border border-indigo-200 dark:border-indigo-800 max-w-full break-words overflow-wrap-anywhere"
                  style={{ wordBreak: 'break-word' as any }}
                >
                  {topic}
                </m.span>
              ))}
            </div>
          </m.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInsightsCard;

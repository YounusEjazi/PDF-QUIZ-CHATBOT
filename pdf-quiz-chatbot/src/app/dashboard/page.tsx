import HistoryCard from "@/components/dashboard/HistoryCard";
import ChatbotUI from "@/components/dashboard/ChatbotUI";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { getAuthSession } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import React from "react";
import { LogOut, Settings, User, MessageSquare, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PersonalInsightsCard from "@/components/dashboard/PersonalInsightsCard";
import { Metadata } from "next";
import { prisma } from "@/lib/db/db";

export const metadata: Metadata = {
  title: "Dashboard | PDF Quiz Chatbot",
  description: "View your quiz history and start new quizzes",
};

type Props = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

const Dashboard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  // Get user's personal data for insights
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      totalPoints: true,
      quizzesTaken: true,
      averageScore: true,
      bestScore: true,
      totalCorrect: true,
      totalQuestions: true,
      winStreak: true,
      bestStreak: true,
      studyTime: true,
      level: true,
      experience: true,
    }
  });

  // Get user's recent quiz topics
  const recentGames = await prisma.game.findMany({
    where: { userId: session.user.id },
    select: { topic: true },
    orderBy: { timeStarted: 'desc' },
    take: 5,
    distinct: ['topic']
  });

  // Calculate improvement rate (mock calculation for now)
  const improvementRate = user?.averageScore ? Math.min(20, user.averageScore * 0.1) : 0;

  const personalInsights = {
    totalQuizzes: user?.quizzesTaken || 0,
    averageScore: user?.averageScore || 0,
    bestScore: user?.bestScore || 0,
    totalPoints: user?.totalPoints || 0,
    winStreak: user?.winStreak || 0,
    bestStreak: user?.bestStreak || 0,
    studyTime: user?.studyTime || 0,
    level: user?.level || 1,
    experience: user?.experience || 0,
    recentTopics: recentGames.map(game => game.topic),
    improvementRate
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden p-4 sm:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      {/* Top Navigation Bar */}
      <nav className="relative mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-slate-100 dark:via-purple-200 dark:to-slate-100">
          Dashboard
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/feedback">
            <span className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] border border-blue-500/30">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden sm:inline">Feedback</span>
            </span>
          </Link>
          <Link href="/about">
            <span className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all rounded-lg sm:rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-lg hover:shadow-slate-500/25 hover:scale-[1.02] active:scale-[0.98] border border-slate-600/30">
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden sm:inline">What is this</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative space-y-6">
        {/* Quick Actions - Top Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ">
              <QuizMeCard />
            </div>
          </div>
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ">
              <HistoryCard />
            </div>
          </div>
        </div>

        {/* Chatbot - Middle Row */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ">
            <ChatbotUI />
          </div>
        </div>

        {/* Activity and Topics - Bottom Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group relative h-[500px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl h-full">
              <PersonalInsightsCard insights={personalInsights} />
            </div>
          </div>
          <div className="group relative h-[500px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl h-full">
              <RecentActivityCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
